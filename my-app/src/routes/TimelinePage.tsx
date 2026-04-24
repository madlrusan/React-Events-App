import * as React from "react";
import { useNexusEventsQuery } from "../hooks/useEventQueries";
import { useEventContext, useOpenForm, useCloseForm } from "../context/EventContext";
import { Timeline } from "../components/Timeline/Timeline";
import { EventDetailModal } from "../components/Timeline/EventDetailModal";
import { EventForm } from "../components/EventForm/EventForm";
import { Toaster } from "../components/ui/toast";
import { AppHeader } from "../components/Layout/AppHeader";
import type { EventCategory, EventSeverity, NexusEvent } from "../data/eventTypes";
import { EVENT_CATEGORIES, EVENT_SEVERITIES } from "../data/eventTypes";

export function TimelinePage() {
	const { data: events = [], isLoading } = useNexusEventsQuery();
	const { state } = useEventContext();
	const openForm = useOpenForm();
	const closeForm = useCloseForm();
	const addEventTriggerRef = React.useRef<HTMLButtonElement>(null);

	const [selectedEvent, setSelectedEvent] = React.useState<NexusEvent | null>(null);

	const [search, setSearch] = React.useState("");
	const [category, setCategory] = React.useState<EventCategory | "">("");
	const [severity, setSeverity] = React.useState<EventSeverity | "">("");

	const filtered = React.useMemo(() => {
		return events.filter((e) => {
			if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
			if (category && e.category !== category) return false;
			if (severity && e.severity !== severity) return false;
			return true;
		});
	}, [events, search, category, severity]);

	const hasFilters = search !== "" || category !== "" || severity !== "";

	return (
		<div className="nx-dashboard">
			<AppHeader
				actions={
					<button
						ref={addEventTriggerRef}
						className="ui-btn ui-btn--default"
						onClick={() => openForm()}
					>
						+ Add Event
					</button>
				}
			/>
			<div className="nx-timeline-filters">
				<input
					type="search"
					className="nx-filter-input"
					placeholder="Search by title…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					aria-label="Search events by title"
				/>
				<select
					className="nx-filter-select"
					value={category}
					onChange={(e) => setCategory(e.target.value as EventCategory | "")}
					aria-label="Filter by category"
				>
					<option value="">All categories</option>
					{EVENT_CATEGORIES.map((c) => (
						<option key={c} value={c}>{c}</option>
					))}
				</select>
				<select
					className="nx-filter-select"
					value={severity}
					onChange={(e) => setSeverity(e.target.value as EventSeverity | "")}
					aria-label="Filter by severity"
				>
					<option value="">All severities</option>
					{EVENT_SEVERITIES.map((s) => (
						<option key={s} value={s}>{s}</option>
					))}
				</select>
				{hasFilters && (
					<button
						className="nx-filter-clear"
						onClick={() => { setSearch(""); setCategory(""); setSeverity(""); }}
					>
						Clear
					</button>
				)}
				<span className="nx-filter-count">
					{isLoading ? "—" : `${filtered.length} event${filtered.length !== 1 ? "s" : ""}`}
				</span>
			</div>
			<div className="nx-timeline-page-content">
				<Timeline
					events={filtered}
					selectedEventId={selectedEvent?.id ?? null}
					onEventClick={setSelectedEvent}
				/>
			</div>
			<EventDetailModal
				event={selectedEvent}
				open={selectedEvent !== null}
				onClose={() => setSelectedEvent(null)}
			/>
			<EventForm
				open={state.isFormOpen}
				onClose={closeForm}
				editingEvent={state.editingEvent}
				triggerRef={addEventTriggerRef}
			/>
			<Toaster />
		</div>
	);
}
