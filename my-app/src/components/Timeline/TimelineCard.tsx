import { format, parseISO } from "date-fns";
import type { NexusEvent } from "../../data/eventTypes";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

type TimelineCardProps = {
	event: NexusEvent;
	cardRef: (node: HTMLElement | null) => void;
	isSelected: boolean;
	onFocus: () => void;
};

const SEVERITY_DOT_CLASS: Record<NexusEvent["severity"], string> = {
	low: "nx-severity-low",
	medium: "nx-severity-medium",
	high: "nx-severity-high",
	critical: "nx-severity-critical",
};

export function TimelineCard({
	event,
	cardRef,
	isSelected,
	onFocus,
}: TimelineCardProps) {
	return (
		<article
			ref={cardRef}
			role="article"
			aria-label={`${event.title}, ${event.category}, ${event.severity}, reported by ${event.agent}`}
			tabIndex={-1}
			onFocus={onFocus}
			className={cn(
				"nx-timeline-card",
				isSelected && "nx-timeline-card--selected",
			)}
		>
			<header className="nx-timeline-card-header">
				<h4 className="nx-timeline-card-title">{event.title}</h4>
				<time className="nx-timeline-card-time" dateTime={event.date}>
					{format(parseISO(event.date), "HH:mm")}
				</time>
			</header>
			<div className="nx-timeline-card-meta">
				<Badge variant="secondary">{event.category}</Badge>
				<span className="nx-timeline-card-severity">
					<span
						aria-hidden="true"
						className={cn(
							"nx-timeline-card-severity-dot",
							SEVERITY_DOT_CLASS[event.severity],
						)}
					/>
					{event.severity}
				</span>
				<span className="nx-timeline-card-agent">{event.agent}</span>
			</div>
			<p
				className="line-clamp-2 nx-timeline-card-description"
				style={{
					display: "-webkit-box",
					WebkitBoxOrient: "vertical",
					WebkitLineClamp: 2,
					overflow: "hidden",
				}}
			>
				{event.description}
			</p>
		</article>
	);
}
