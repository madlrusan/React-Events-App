import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

// ── Context ────────────────────────────────────────────────────────────────

type DialogContextValue = {
	open: boolean;
	onClose: () => void;
};

const DialogContext = React.createContext<DialogContextValue>({
	open: false,
	onClose: () => {},
});

// ── Dialog ─────────────────────────────────────────────────────────────────

type DialogProps = {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
	const onClose = React.useCallback(() => {
		onOpenChange?.(false);
	}, [onOpenChange]);

	const value = React.useMemo(() => ({ open, onClose }), [open, onClose]);

	return (
		<DialogContext.Provider value={value}>{children}</DialogContext.Provider>
	);
}

// ── DialogContent ──────────────────────────────────────────────────────────

type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & {
	/**
	 * Called when the user presses Escape. When provided, the dialog does NOT
	 * auto-close — the handler is fully responsible for deciding what happens
	 * (e.g. showing a "discard changes?" prompt first).
	 */
	onEscapeKeyDown?: (e: KeyboardEvent) => void;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export function DialogContent({
	className,
	onEscapeKeyDown,
	onClick,
	children,
	...props
}: DialogContentProps) {
	const { open, onClose } = React.useContext(DialogContext);
	const contentRef = React.useRef<HTMLDivElement>(null);

	// Move focus into the dialog when it opens so keyboard users land inside it.
	React.useEffect(() => {
		if (!open || !contentRef.current) return;
		const firstFocusable = contentRef.current.querySelector<HTMLElement>(
			'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
		);
		firstFocusable?.focus();
	}, [open]);

	// Prevent body scroll while the dialog is open.
	React.useEffect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [open]);

	// Escape key handling. If onEscapeKeyDown is provided the dialog will NOT
	// auto-close — that lets the caller intercept (e.g. dirty-form check).
	React.useEffect(() => {
		if (!open) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			if (onEscapeKeyDown) {
				onEscapeKeyDown(e);
			} else {
				onClose();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, onEscapeKeyDown, onClose]);

	// Focus trap — keep Tab cycling inside the dialog. Skip when focus is
	// outside this dialog's subtree (e.g. a nested AlertDialog took over).
	React.useEffect(() => {
		if (!open || !contentRef.current) return;
		const el = contentRef.current;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;
			// If focus left this dialog (nested portal/modal), don't interfere.
			if (!el.contains(document.activeElement)) return;

			const focusable = Array.from(
				el.querySelectorAll<HTMLElement>(
					'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
				),
			).filter((node) => !node.closest('[aria-hidden="true"]'));

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
		<div className="ui-dialog-overlay" onClick={onClose}>
			<div
				ref={contentRef}
				role="dialog"
				aria-modal="true"
				className={cn("ui-dialog-content", className)}
				{...props}
				onClick={(e) => {
					// Stop click from bubbling to the overlay (which closes the dialog).
					e.stopPropagation();
					onClick?.(e);
				}}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

// ── Layout sub-components ──────────────────────────────────────────────────

export function DialogHeader({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("ui-dialog-header", className)} {...props} />;
}

export function DialogTitle({
	className,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
	return <h2 className={cn("ui-dialog-title", className)} {...props} />;
}

export function DialogFooter({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("ui-dialog-footer", className)} {...props} />;
}
