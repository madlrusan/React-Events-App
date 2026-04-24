import * as React from "react";
import { cn } from "../../lib/utils";

type AlertVariant = "default" | "destructive";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: AlertVariant;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
	({ className, variant = "default", ...props }, ref) => {
		return (
			<div
				ref={ref}
				role="alert"
				className={cn("ui-alert", `ui-alert--${variant}`, className)}
				{...props}
			/>
		);
	},
);

Alert.displayName = "Alert";

export function AlertDescription({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("ui-alert-desc", className)} {...props} />;
}
