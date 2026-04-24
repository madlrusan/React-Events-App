import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

export type ToastOptions = {
	title: string;
	description?: string;
	variant?: "default" | "destructive";
};

type ToastEntry = ToastOptions & { id: string };

// ── Module-level singleton store ───────────────────────────────────────────
// Kept outside React so toast() can be called from anywhere (mutation callbacks,
// utility functions, etc.) without a hook or context.

let toastStore: ToastEntry[] = [];
const toastListeners = new Set<(entries: ToastEntry[]) => void>();

function notifyListeners() {
	const snapshot = [...toastStore];
	toastListeners.forEach((l) => l(snapshot));
}

const TOAST_DURATION_MS = 4000;

/** Imperatively show a toast notification from anywhere in the app. */
export function toast(options: ToastOptions) {
	const id = crypto.randomUUID();
	toastStore = [...toastStore, { ...options, id }];
	notifyListeners();

	setTimeout(() => {
		toastStore = toastStore.filter((t) => t.id !== id);
		notifyListeners();
	}, TOAST_DURATION_MS);
}

// ── Internal hook ──────────────────────────────────────────────────────────

function useToastStore(): ToastEntry[] {
	const [entries, setEntries] = React.useState<ToastEntry[]>(() => toastStore);

	React.useEffect(() => {
		// Sync on mount in case toasts were added before this component mounted.
		setEntries([...toastStore]);
		toastListeners.add(setEntries);
		return () => {
			toastListeners.delete(setEntries);
		};
	}, []);

	return entries;
}

// ── Toaster ────────────────────────────────────────────────────────────────

/**
 * Renders active toasts in a fixed portal overlay.
 * Place `<Toaster />` once near the root of your app (e.g. in App.tsx).
 */
export function Toaster() {
	const entries = useToastStore();

	return createPortal(
		<div className="ui-toaster" aria-live="polite" aria-atomic="false">
			{entries.map((entry) => (
				<div
					key={entry.id}
					role="status"
					className={cn(
						"ui-toast",
						entry.variant === "destructive" && "ui-toast--destructive",
					)}
				>
					<p className="ui-toast-title">{entry.title}</p>
					{entry.description && (
						<p className="ui-toast-desc">{entry.description}</p>
					)}
				</div>
			))}
		</div>,
		document.body,
	);
}
