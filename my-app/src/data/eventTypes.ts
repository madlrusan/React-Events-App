export type EventCategory =
	| "sighting"
	| "signal"
	| "contact"
	| "anomaly"
	| "classified";

export type EventSeverity = "low" | "medium" | "high" | "critical";

export type EventStatus = "open" | "investigating" | "closed" | "redacted";

export interface NexusEvent {
	id: string;
	title: string;
	date: string;
	category: EventCategory;
	severity: EventSeverity;
	agent: string;
	location: string;
	coordinates?: string;
	status: EventStatus;
	description: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
	"sighting",
	"signal",
	"contact",
	"anomaly",
	"classified",
];

export const EVENT_SEVERITIES: EventSeverity[] = [
	"low",
	"medium",
	"high",
	"critical",
];

export const EVENT_STATUSES: EventStatus[] = [
	"open",
	"investigating",
	"closed",
	"redacted",
];
