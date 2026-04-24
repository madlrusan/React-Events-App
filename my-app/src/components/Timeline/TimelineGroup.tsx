import { format, parseISO } from "date-fns";
import type { NexusEvent } from "../../data/eventTypes";
import { Badge } from "../ui/badge";
import { TimelineCard } from "./TimelineCard";

type TimelineGroupProps = {
	date: string;
	events: NexusEvent[];
	groupRef: (node: HTMLElement | null) => void;
	cardRefs: Array<(node: HTMLElement | null) => void>;
	onCardFocus: (cardIndex: number) => void;
	onCardClick: (event: NexusEvent) => void;
	isSelected?: boolean;
	selectedEventId: string | null;
};

export function TimelineGroup({
	date,
	events,
	groupRef,
	cardRefs,
	onCardFocus,
	onCardClick,
	isSelected = false,
	selectedEventId,
}: TimelineGroupProps) {
	const formattedDate = format(parseISO(date), "EEEE, dd MMMM yyyy");

	return (
		<section
			role="group"
			aria-label={`Events on ${formattedDate}, ${events.length} events`}
			className="nx-timeline-group"
		>
			<div className="nx-timeline-group-header-wrap">
				<button
					type="button"
					ref={groupRef}
					tabIndex={-1}
					className="nx-timeline-group-header"
				>
					<span>{formattedDate}</span>
					<Badge variant="outline">{events.length}</Badge>
				</button>
			</div>
			<div className="nx-timeline-group-cards">
				{events.map((eventItem, cardIndex) => (
					<TimelineCard
						key={eventItem.id}
						event={eventItem}
						cardRef={cardRefs[cardIndex]}
						onFocus={() => onCardFocus(cardIndex)}
						onClick={() => onCardClick(eventItem)}
						isSelected={
							isSelected && selectedEventId === eventItem.id
						}
					/>
				))}
			</div>
		</section>
	);
}
