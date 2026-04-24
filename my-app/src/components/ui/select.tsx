import * as React from "react";
import { cn } from "../../lib/utils";

interface SelectProps
	extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
	onValueChange?: (value: string) => void;
}

// forwardRef lets callers hold a ref to the underlying <select> — needed for
// programmatic focus (e.g. focusing the first invalid field on form submit).
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ className, onValueChange, ...props }, ref) => {
		return (
			<select
				ref={ref}
				className={cn("ui-select", className)}
				onChange={(event) => onValueChange?.(event.target.value)}
				{...props}
			/>
		);
	},
);

Select.displayName = "Select";

export function SelectItem({
	className,
	...props
}: React.OptionHTMLAttributes<HTMLOptionElement>) {
	return <option className={cn("ui-select-item", className)} {...props} />;
}
