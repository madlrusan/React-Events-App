import * as React from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
}

export function Badge({
	className,
	variant = "default",
	...props
}: BadgeProps) {
	return (
		<span
			className={cn("ui-badge", `ui-badge--${variant}`, className)}
			{...props}
		/>
	);
}
