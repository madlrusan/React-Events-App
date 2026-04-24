import * as React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant =
	| "default"
	| "secondary"
	| "outline"
	| "destructive"
	| "ghost";
type ButtonSize = "default" | "sm" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "default", size = "default", ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={cn(
					"ui-btn",
					`ui-btn--${variant}`,
					`ui-btn--${size}`,
					className,
				)}
				{...props}
			/>
		);
	},
);

Button.displayName = "Button";
