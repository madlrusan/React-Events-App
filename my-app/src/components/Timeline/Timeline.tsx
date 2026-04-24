import { format, parseISO, startOfDay } from "date-fns";
import "./Timeline.css";
import { useEffect, useMemo, useRef } from "react";
import type { NexusEvent } from "../../data/eventTypes";
import { TimelineGroup } from "./TimelineGroup";
import { useTimelineKeyboard } from "./useTimelineKeyboard";

type TimelineProps = {
	events: NexusEvent[];
	selectedEventId: string | null;
};

type TimelineGroupModel = {
	date: string;
	events: NexusEvent[];
};

function compareByNewestDate(left: NexusEvent, right: NexusEvent): number {
	return parseISO(right.date).getTime() - parseISO(left.date).getTime();
}

function getCardAnnouncement(eventItem: NexusEvent): string {
	return `${eventItem.title}. Category: ${eventItem.category}. Severity: ${eventItem.severity}. Reported by ${eventItem.agent}.`;
}

export function Timeline({ events, selectedEventId }: TimelineProps) {
	const groupRefs = useRef<HTMLElement[]>([]);
	const cardRefs = useRef<HTMLElement[][]>([]);

	const grouped = useMemo<TimelineGroupModel[]>(() => {
		const groupedMap = new Map<string, NexusEvent[]>();

		for (const eventItem of events) {
			const key = startOfDay(parseISO(eventItem.date)).toISOString();
			const list = groupedMap.get(key);
			if (list) {
				list.push(eventItem);
			} else {
				groupedMap.set(key, [eventItem]);
			}
		}

		return Array.from(groupedMap.entries())
			.map(([date, dayEvents]) => ({
				date,
				events: dayEvents.slice().sort(compareByNewestDate),
			}))
			.sort(
				(left, right) =>
					parseISO(right.date).getTime() -
					parseISO(left.date).getTime(),
			);
	}, [events]);

	const { onKeyDown, focusedGroupIndex, focusedCardIndex } =
		useTimelineKeyboard(groupRefs, cardRefs);

	useEffect(() => {
		groupRefs.current = groupRefs.current.slice(0, grouped.length);
		cardRefs.current = grouped.map((groupItem, groupIndex) => {
			const existing = cardRefs.current[groupIndex] ?? [];
			return existing.slice(0, groupItem.events.length);
		});
	}, [grouped]);

	const announcement = useMemo(() => {
		if (grouped.length === 0) {
			return "No events available.";
		}

		const groupItem = grouped[focusedGroupIndex];
		if (!groupItem) {
			return "Timeline ready.";
		}

		if (focusedCardIndex === null) {
			const formattedDate = format(
				parseISO(groupItem.date),
				"EEEE, dd MMMM yyyy",
			);
			return `Group: ${formattedDate}. ${groupItem.events.length} events.`;
		}

		const cardItem = groupItem.events[focusedCardIndex];
		if (!cardItem) {
			return "Timeline ready.";
		}

		return getCardAnnouncement(cardItem);
	}, [focusedCardIndex, focusedGroupIndex, grouped]);

	if (grouped.length === 0) {
		return (
			<section aria-label="NEXUS Timeline" className="nx-timeline-empty">
				<p>No events available.</p>
			</section>
		);
	}

	return (
		<section
			className="nx-timeline"
			aria-label="NEXUS Timeline"
			onKeyDown={onKeyDown}
		>
			<p
				aria-live="polite"
				style={{
					position: "absolute",
					width: "1px",
					height: "1px",
					padding: 0,
					margin: "-1px",
					overflow: "hidden",
					clip: "rect(0, 0, 0, 0)",
					whiteSpace: "nowrap",
					border: 0,
				}}
			>
				{announcement}
			</p>
			{grouped.map((groupItem, groupIndex) => {
				const groupHasSelectedEvent = groupItem.events.some(
					(eventItem) => eventItem.id === selectedEventId,
				);

				return (
					<TimelineGroup
						key={groupItem.date}
						date={groupItem.date}
						events={groupItem.events}
						groupRef={(node) => {
							if (node) {
								groupRefs.current[groupIndex] = node;
							}
						}}
						cardRefs={groupItem.events.map((_, cardIndex) => {
							return (node) => {
								if (!cardRefs.current[groupIndex]) {
									cardRefs.current[groupIndex] = [];
								}
								if (node) {
									cardRefs.current[groupIndex][cardIndex] =
										node;
								}
							};
						})}
						onCardFocus={() => undefined}
						isSelected={groupHasSelectedEvent}
						selectedEventId={selectedEventId}
					/>
				);
			})}
		</section>
	);
}
