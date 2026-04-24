import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

// ── Context ────────────────────────────────────────────────────────────────

type AlertDialogContextValue = {
	open: boolean;
	onClose: () => void;
};

const AlertDialogContext = React.createContext<AlertDialogContextValue>({
	open: false,
	onClose: () => {},
});

// ── AlertDialog ────────────────────────────────────────────────────────────

type AlertDialogProps = {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
};

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
	const onClose = React.useCallback(() => {
		onOpenChange?.(false);
	}, [onOpenChange]);

	const value = React.useMemo(() => ({ open, onClose }), [open, onClose]);

	return (
		<AlertDialogContext.Provider value={value}>
			{children}
		</AlertDialogContext.Provider>
	);
}

// ── AlertDialogContent ─────────────────────────────────────────────────────

type AlertDialogContentProps = React.HTMLAttributes<HTMLDivElement>;

export function AlertDialogContent({
	className,
	children,
	...props
}: AlertDialogContentProps) {
	const { open } = React.useContext(AlertDialogContext);
	const contentRef = React.useRef<HTMLDivElement>(null);
	// Track what was focused before the alert dialog opened so we can restore
	// focus when the dialog closes (e.g. "Keep editing" → return to cancel btn).
	const previousFocusRef = React.useRef<Element | null>(null);

	React.useEffect(() => {
		if (open) {
			previousFocusRef.current = document.activeElement;
			const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
				'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
			);
			firstFocusable?.focus();
		} else {
			// Restore focus to wherever it was before the dialog opened.
			// For the "Discard" path, the EventForm will have already called
			// triggerRef.focus() synchronously; the element in previousFocusRef
			// will be detached from the DOM by then, so this call is a no-op. ✓
			if (previousFocusRef.current instanceof HTMLElement) {
				previousFocusRef.current.focus();
			}
		}
	}, [open]);

	// Focus trap — keep Tab inside the alert dialog.
	React.useEffect(() => {
		if (!open || !contentRef.current) return;
		const el = contentRef.current;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;
			if (!el.contains(document.activeElement)) return;

			const focusable = Array.from(
				el.querySelectorAll<HTMLElement>(
					'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
				),
			);
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open]);

	if (!open) return null;

	return createPortal(
		// Overlay: intentionally not clickable-to-dismiss — the user must
		// explicitly choose "Discard" or "Keep editing".
		<div className="ui-alert-dialog-overlay">
			<div
				ref={contentRef}
				role="alertdialog"
				aria-modal="true"
				className={cn("ui-alert-dialog-content", className)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

// ── Layout sub-components ──────────────────────────────────────────────────

export function AlertDialogHeader({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("ui-alert-dialog-header", className)} {...props} />;
}

export function AlertDialogTitle({
	className,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h2 className={cn("ui-alert-dialog-title", className)} {...props} />
	);
}

export function AlertDialogFooter({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn("ui-alert-dialog-footer", className)} {...props} />
	);
}

export function AlertDialogCancel({
	className,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={cn("ui-btn ui-btn--secondary ui-btn--default", className)}
			{...props}
		/>
	);
}

export function AlertDialogAction({
	className,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={cn("ui-btn ui-btn--destructive ui-btn--default", className)}
			{...props}
		/>
	);
}
