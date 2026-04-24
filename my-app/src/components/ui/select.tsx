import type { OptionHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface SelectProps extends Omit<
	SelectHTMLAttributes<HTMLSelectElement>,
	"onChange"
> {
	onValueChange?: (value: string) => void;
}

export function Select({ className, onValueChange, ...props }: SelectProps) {
	return (
		<select
			className={cn("ui-select", className)}
			onChange={(event) => onValueChange?.(event.target.value)}
			{...props}
		/>
	);
}

export function SelectItem({
	className,
	...props
}: OptionHTMLAttributes<HTMLOptionElement>) {
	return <option className={cn("ui-select-item", className)} {...props} />;
}
