import {
	cloneElement,
	createContext,
	isValidElement,
	useContext,
	useEffect,
	useRef,
	useState,
	type MouseEvent,
	type ReactElement,
	type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

type DropdownContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
	const context = useContext(DropdownContext);
	if (!context) {
		throw new Error(
			"DropdownMenu components must be used within DropdownMenu",
		);
	}
	return context;
}

export function DropdownMenu({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function onPointerDown(event: globalThis.MouseEvent) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}

		document.addEventListener("mousedown", onPointerDown);
		return () => {
			document.removeEventListener("mousedown", onPointerDown);
		};
	}, []);

	return (
		<DropdownContext.Provider value={{ open, setOpen }}>
			<div className="ui-dropdown" ref={containerRef}>
				{children}
			</div>
		</DropdownContext.Provider>
	);
}

export function DropdownMenuTrigger({
	children,
	className,
	asChild = false,
}: {
	children: ReactNode;
	className?: string;
	asChild?: boolean;
}) {
	const { open, setOpen } = useDropdownContext();

	const handleClick = (event: MouseEvent<HTMLElement>) => {
		if (
			isValidElement(children) &&
			typeof (children.props as { onClick?: unknown }).onClick ===
				"function"
		) {
			(
				children.props as {
					onClick: (event: MouseEvent<HTMLElement>) => void;
				}
			).onClick(event);
		}

		setOpen(!open);
	};

	if (asChild && isValidElement(children)) {
		return cloneElement(
			children as ReactElement<{
				className?: string;
				onClick?: (event: MouseEvent<HTMLElement>) => void;
				"aria-expanded"?: boolean;
			}>,
			{
				className: cn(
					(children.props as { className?: string }).className,
					className,
				),
				onClick: handleClick,
				"aria-expanded": open,
			},
		);
	}

	return (
		<button
			type="button"
			className={cn(className)}
			onClick={handleClick}
			aria-expanded={open}
		>
			{children}
		</button>
	);
}

export function DropdownMenuContent({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const { open } = useDropdownContext();

	if (!open) {
		return null;
	}

	return (
		<div className={cn("ui-dropdown-content", className)}>{children}</div>
	);
}

type DropdownMenuCheckboxItemProps = {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
	children: ReactNode;
};

export function DropdownMenuCheckboxItem({
	checked,
	onCheckedChange,
	disabled = false,
	children,
}: DropdownMenuCheckboxItemProps) {
	return (
		<label className={cn("ui-dropdown-item", disabled && "is-disabled")}>
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				onChange={(event) => onCheckedChange(event.target.checked)}
			/>
			<span>{children}</span>
		</label>
	);
}
