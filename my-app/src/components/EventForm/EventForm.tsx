import * as React from "react";
import { isValid as isDateValid, parseISO, format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../ui/dialog";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogFooter,
	AlertDialogAction,
	AlertDialogCancel,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Select, SelectItem } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "../ui/toast";
import { FormField } from "./FormField";
import { useEventForm } from "./useEventForm";
import type { FormValues } from "./useEventForm";
import { useEventContext } from "../../context/EventContext";
import {
	EVENT_CATEGORIES,
	EVENT_SEVERITIES,
	type NexusEvent,
} from "../../data/eventTypes";
import "./EventForm.css";

// ── Types ──────────────────────────────────────────────────────────────────

type EventFormProps = {
	open: boolean;
	onClose: () => void;
	editingEvent?: NexusEvent | null;
	/** The button/element that triggered the dialog. Focus is returned here on
	 *  close so keyboard/screen-reader users can resume where they left off. */
	triggerRef?: React.RefObject<HTMLElement | null>;
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Convert an ISO date string (e.g. "2025-04-24T10:30:00.000Z") to the
 * "YYYY-MM-DDTHH:mm" format required by <input type="datetime-local">.
 */
function toDateTimeLocalValue(isoString: string): string {
	if (!isoString) return isoString;
	try {
		const parsed = parseISO(isoString);
		return isDateValid(parsed) ? format(parsed, "yyyy-MM-dd'T'HH:mm") : isoString;
	} catch {
		return isoString;
	}
}

// ── Public component ───────────────────────────────────────────────────────

/**
 * EventForm — Dialog modal for adding and editing NEXUS events.
 *
 * Structure: EventForm is a thin shell that renders EventFormBody only while
 * `open` is true. This guarantees useEventForm always mounts with the current
 * editingEvent values and unmounts cleanly on close (no stale state).
 *
 * If editingEvent can change while the dialog is open (e.g. user navigates
 * between events), key this component by editingEvent?.id from the parent so
 * the form state resets between edits.
 */
export function EventForm({
	open,
	onClose,
	editingEvent,
	triggerRef,
}: EventFormProps) {
	function handleClose() {
		onClose();
		// Return focus to the element that opened the dialog. This is critical for
		// keyboard users so they don't lose their position in the page after the
		// modal closes.
		triggerRef?.current?.focus();
	}

	// Render nothing (unmount form state) while the dialog is closed.
	if (!open) return null;

	return (
		<EventFormBody
			// Key by event ID so the form state resets when switching between events.
			key={editingEvent?.id ?? "new"}
			onClose={handleClose}
			editingEvent={editingEvent}
		/>
	);
}

// ── Internal form body ─────────────────────────────────────────────────────

type EventFormBodyProps = {
	onClose: () => void;
	editingEvent?: NexusEvent | null;
};

// Field order matches the visible layout. Used to find the first invalid field
// for programmatic focus.
const FIELD_ORDER: ReadonlyArray<keyof FormValues> = [
	"title",
	"date",
	"category",
	"severity",
	"agent",
	"location",
	"description",
] as const;

function EventFormBody({ onClose, editingEvent }: EventFormBodyProps) {
	const { service } = useEventContext();
	const queryClient = useQueryClient();

	const [showDiscard, setShowDiscard] = React.useState(false);

	// Normalise the date to datetime-local format so the <input> displays it correctly.
	const normalizedEvent = React.useMemo(
		() =>
			editingEvent
				? { ...editingEvent, date: toDateTimeLocalValue(editingEvent.date) }
				: undefined,
		// editingEvent is stable for the lifetime of EventFormBody (keyed by id).
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const { values, errors, isDirty, handleChange, validate } =
		useEventForm(normalizedEvent);

	// ── Field refs ─────────────────────────────────────────────────────────
	// One ref per field so we can programmatically focus the first invalid one.
	const titleRef = React.useRef<HTMLInputElement>(null);
	const dateRef = React.useRef<HTMLInputElement>(null);
	const categoryRef = React.useRef<HTMLSelectElement>(null);
	const severityRef = React.useRef<HTMLSelectElement>(null);
	const agentRef = React.useRef<HTMLInputElement>(null);
	const locationRef = React.useRef<HTMLInputElement>(null);
	const descriptionRef = React.useRef<HTMLTextAreaElement>(null);

	// Map field key → ref for O(1) access during focus-on-error logic.
	const fieldRefs: Record<
		keyof FormValues,
		React.RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>
	> = {
		title: titleRef,
		date: dateRef,
		category: categoryRef,
		severity: severityRef,
		agent: agentRef,
		location: locationRef,
		description: descriptionRef,
	};

	// ── Cancel / close helpers ─────────────────────────────────────────────

	function handleCancel() {
		if (isDirty) {
			// Surface the discard-changes prompt rather than silently discarding work.
			setShowDiscard(true);
		} else {
			onClose();
		}
	}

	// Intercept the dialog's Escape key so we can apply the same dirty-check
	// logic as the Cancel button instead of closing immediately.
	function handleEscapeKeyDown(e: KeyboardEvent) {
		// Prevent DialogContent's built-in close so we control the outcome.
		e.preventDefault();
		handleCancel();
	}

	// ── Mutations ──────────────────────────────────────────────────────────

	// addEvent: service internally dispatches ADD_EVENT to context (via the
	// onAddEvent callback wired in EventProvider), then we invalidate the query.
	const addMutation = useMutation({
		mutationFn: (data: Omit<NexusEvent, "id">) => service.addEvent(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["events"] });
			toast({
				title: "NEXUS updated.",
				description: "Report logged successfully.",
			});
			onClose();
		},
		onError: () => {
			toast({
				title: "NEXUS error.",
				description: "Could not save report.",
				variant: "destructive",
			});
		},
	});

	// editEvent: same pattern — service dispatches EDIT_EVENT via callback.
	const editMutation = useMutation({
		mutationFn: (data: NexusEvent) => service.editEvent(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["events"] });
			toast({
				title: "NEXUS updated.",
				description: "Report logged successfully.",
			});
			onClose();
		},
		onError: () => {
			toast({
				title: "NEXUS error.",
				description: "Could not save report.",
				variant: "destructive",
			});
		},
	});

	const isPending = addMutation.isPending || editMutation.isPending;

	// ── Submit ─────────────────────────────────────────────────────────────

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		// validate() updates the errors state (batched by React — we can't read
		// the updated errors synchronously in this same event handler).
		const isValid = validate();

		if (!isValid) {
			// Accessibility: focus the first invalid field immediately.
			//   • Screen-reader users hear the error announced by the field's
			//     aria-describedby without having to navigate the whole form.
			//   • Sighted users don't have to hunt visually for the highlighted field.
			//
			// We re-derive which field is first-invalid from the current values
			// rather than reading the just-set errors state, because React batches
			// the setState call inside validate() — the state won't be updated until
			// the next render.
			const firstError = findFirstInvalidField();
			if (firstError !== null) {
				fieldRefs[firstError].current?.focus();
			}
			return;
		}

		const base = {
			title: values.title.trim(),
			date: values.date,
			category: values.category as NexusEvent["category"],
			severity: values.severity as NexusEvent["severity"],
			agent: values.agent.trim(),
			location: values.location.trim(),
			description: values.description.trim(),
			status: editingEvent?.status ?? ("open" as NexusEvent["status"]),
		};

		if (editingEvent) {
			editMutation.mutate({ ...base, id: editingEvent.id });
		} else {
			addMutation.mutate(base);
		}
	}

	/**
	 * Mirror the required-field rules from useEventForm so we can locate the
	 * first invalid field synchronously (errors state is a React-batched update
	 * and won't be readable until the next render cycle).
	 */
	function findFirstInvalidField(): keyof FormValues | null {
		for (const field of FIELD_ORDER) {
			switch (field) {
				case "title":
					if (!values.title.trim()) return "title";
					break;
				case "date":
					if (
						!values.date.trim() ||
						!isDateValid(parseISO(values.date))
					)
						return "date";
					break;
				case "category":
					if (!values.category) return "category";
					break;
				case "severity":
					if (!values.severity) return "severity";
					break;
				case "agent":
					if (!values.agent.trim()) return "agent";
					break;
				// location and description are not required — skip.
				default:
					break;
			}
		}
		return null;
	}

	// ── IDs ────────────────────────────────────────────────────────────────

	const DIALOG_TITLE_ID = "event-form-dialog-title";
	const DISCARD_TITLE_ID = "event-form-discard-title";

	// ── Render ─────────────────────────────────────────────────────────────

	return (
		<>
			<Dialog
				open
				onOpenChange={(isOpen) => {
					if (!isOpen) handleCancel();
				}}
			>
				<DialogContent
					aria-labelledby={DIALOG_TITLE_ID}
					onEscapeKeyDown={handleEscapeKeyDown}
				>
					<DialogHeader>
						<DialogTitle id={DIALOG_TITLE_ID}>
							{editingEvent ? "Edit Report" : "File New Report"}
						</DialogTitle>
					</DialogHeader>

					<form
						onSubmit={handleSubmit}
						noValidate
						className="nx-event-form"
						aria-busy={isPending}
					>
						<div className="nx-event-form-fields">
							{/* 1. Title */}
							<FormField
								label="Title"
								htmlFor="ef-title"
								error={errors.title}
							>
								<Input
									id="ef-title"
									ref={titleRef}
									autoFocus
									value={values.title}
									onChange={(e) => handleChange("title", e.target.value)}
									placeholder="Brief description of the incident"
								/>
							</FormField>

							{/* 2. Date */}
							<FormField
								label="Date"
								htmlFor="ef-date"
								error={errors.date}
							>
								<Input
									id="ef-date"
									ref={dateRef}
									type="datetime-local"
									value={values.date}
									onChange={(e) => handleChange("date", e.target.value)}
								/>
							</FormField>

							{/* 3. Category */}
							<FormField
								label="Category"
								htmlFor="ef-category"
								error={errors.category}
							>
								<Select
									id="ef-category"
									ref={categoryRef}
									value={values.category}
									onValueChange={(v) =>
										handleChange(
											"category",
											v as NexusEvent["category"] | "",
										)
									}
								>
									<SelectItem value="">Select category…</SelectItem>
									{EVENT_CATEGORIES.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</Select>
							</FormField>

							{/* 4. Severity — low → critical order (as defined in EVENT_SEVERITIES) */}
							<FormField
								label="Severity"
								htmlFor="ef-severity"
								error={errors.severity}
							>
								<Select
									id="ef-severity"
									ref={severityRef}
									value={values.severity}
									onValueChange={(v) =>
										handleChange(
											"severity",
											v as NexusEvent["severity"] | "",
										)
									}
								>
									<SelectItem value="">Select severity…</SelectItem>
									{EVENT_SEVERITIES.map((sev) => (
										<SelectItem key={sev} value={sev}>
											{sev}
										</SelectItem>
									))}
								</Select>
							</FormField>

							{/* 5. Agent */}
							<FormField
								label="Agent"
								htmlFor="ef-agent"
								error={errors.agent}
							>
								<Input
									id="ef-agent"
									ref={agentRef}
									value={values.agent}
									onChange={(e) => handleChange("agent", e.target.value)}
									placeholder="Reporting agent identifier"
								/>
							</FormField>

							{/* 6. Location */}
							<FormField
								label="Location"
								htmlFor="ef-location"
								error={errors.location}
							>
								<Input
									id="ef-location"
									ref={locationRef}
									value={values.location}
									onChange={(e) => handleChange("location", e.target.value)}
									placeholder="Incident location"
								/>
							</FormField>

							{/* 7. Description */}
							<FormField
								label="Description"
								htmlFor="ef-description"
								error={errors.description}
							>
								<Textarea
									id="ef-description"
									ref={descriptionRef}
									value={values.description}
									onChange={(e) =>
										handleChange("description", e.target.value)
									}
									rows={4}
									placeholder="Full incident description…"
								/>
							</FormField>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending
									? "Saving…"
									: editingEvent
										? "Save Changes"
										: "File Report"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Discard-changes confirmation — shown when Cancel is clicked (or Escape
			    pressed) on a dirty form. Explicit choice beats silent data loss. */}
			<AlertDialog
				open={showDiscard}
				onOpenChange={(isOpen) => {
					if (!isOpen) setShowDiscard(false);
				}}
			>
				<AlertDialogContent aria-labelledby={DISCARD_TITLE_ID}>
					<AlertDialogHeader>
						<AlertDialogTitle id={DISCARD_TITLE_ID}>
							Discard changes?
						</AlertDialogTitle>
					</AlertDialogHeader>
					<AlertDialogFooter>
						{/* Safe action first — receives focus when the dialog opens. */}
						<AlertDialogCancel
							onClick={() => setShowDiscard(false)}
						>
							Keep editing
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								setShowDiscard(false);
								onClose();
							}}
						>
							Discard
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
