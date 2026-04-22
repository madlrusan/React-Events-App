// Seeded randomness keeps generated data deterministic across refreshes and HMR.
import {
	EVENT_CATEGORIES,
	EVENT_SEVERITIES,
	EVENT_STATUSES,
	type EventCategory,
	type EventSeverity,
	type EventStatus,
	type NexusEvent,
} from "./eventTypes";

type LocationEntry = {
	name: string;
	coordinates: string;
};

const AGENTS = [
	"Agent Reyes",
	"Agent Nakamura",
	"Agent Morgan",
	"Agent Khatri",
	"Agent Vasquez",
	"Agent Osei",
	"Agent Novak",
	"Agent Ibrahim",
	"Agent Sato",
	"Agent Doyle",
];

const LOCATIONS: LocationEntry[] = [
	{ name: "Reykjavik Monitoring Node", coordinates: "64.1466, -21.9426" },
	{ name: "Svalbard Listening Array", coordinates: "78.2232, 15.6469" },
	{ name: "Atacama Relay Station", coordinates: "-23.5505, -69.3000" },
	{ name: "Sahara Grid Delta", coordinates: "23.4162, 25.6628" },
	{ name: "Lima Coastal Observatory", coordinates: "-12.0464, -77.0428" },
	{ name: "Cape Town Deep Scan", coordinates: "-33.9249, 18.4241" },
	{ name: "Patagonia Sector Outpost", coordinates: "-50.9423, -73.4068" },
	{ name: "Istanbul Junction Hub", coordinates: "41.0082, 28.9784" },
	{ name: "Kyoto Archive Annex", coordinates: "35.0116, 135.7681" },
	{ name: "Bangalore Signal Vault", coordinates: "12.9716, 77.5946" },
	{ name: "Wellington Offshore Node", coordinates: "-41.2865, 174.7762" },
	{ name: "Anchorage Polar Station", coordinates: "61.2181, -149.9003" },
	{ name: "Nairobi Skywatch Platform", coordinates: "-1.2921, 36.8219" },
	{ name: "Seoul Subgrid 3", coordinates: "37.5665, 126.9780" },
	{ name: "Berlin Cipher Facility", coordinates: "52.5200, 13.4050" },
	{ name: "Toronto East Perimeter", coordinates: "43.6532, -79.3832" },
	{ name: "Honolulu Pacific Gate", coordinates: "21.3069, -157.8583" },
	{ name: "Cairo Delta Vault", coordinates: "30.0444, 31.2357" },
	{ name: "Bucharest Signal Cross", coordinates: "44.4268, 26.1025" },
	{ name: "Antarctic Ice Shelf Beacon", coordinates: "-77.8419, 166.6863" },
];

const TITLE_FRAGMENTS: Record<EventCategory, string[]> = {
	sighting: [
		"Unscheduled Visual Contact",
		"Anomalous Airframe Sighting",
		"Perimeter Shadow Movement",
		"Uncataloged Surface Trace",
	],
	signal: [
		"Unidentified Signal",
		"Narrowband Echo Burst",
		"Encrypted Uplink Artifact",
		"Long-Range Frequency Spike",
	],
	contact: [
		"Direct Contact Attempt",
		"Unauthorized Transmission Response",
		"Bi-Directional Channel Opened",
		"Handshake Sequence Detected",
	],
	anomaly: [
		"Anomalous Reading",
		"Temporal Distortion Marker",
		"Magnetic Drift Irregularity",
		"Subsurface Resonance Event",
	],
	classified: [
		"Redacted Incident Record",
		"Black File Activation",
		"Compartmentalized Operation",
		"Restricted Intelligence Flag",
	],
};

const TITLE_CONTEXT = [
	"Sector 7",
	"Sector 12",
	"Zone K",
	"Black Site 4",
	"Corridor 9",
	"Grid Theta",
	"Node 3",
	"Perimeter West",
	"Vault Sigma",
	"Orbit Track C",
];

function randomInt(rand: () => number, maxExclusive: number): number {
	return Math.floor(rand() * maxExclusive);
}

function pickOne<T>(items: readonly T[], rand: () => number): T {
	return items[randomInt(rand, items.length)] as T;
}

function weightedSeverity(rand: () => number): EventSeverity {
	const roll = rand();
	if (roll < 0.4) return EVENT_SEVERITIES[0];
	if (roll < 0.72) return EVENT_SEVERITIES[1];
	if (roll < 0.92) return EVENT_SEVERITIES[2];
	return EVENT_SEVERITIES[3];
}

function weightedStatus(rand: () => number): EventStatus {
	const roll = rand();
	if (roll < 0.44) return EVENT_STATUSES[0];
	if (roll < 0.75) return EVENT_STATUSES[1];
	if (roll < 0.93) return EVENT_STATUSES[2];
	return EVENT_STATUSES[3];
}

export function seededRandom(seed: number): () => number {
	let state = seed >>> 0;

	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 0x100000000;
	};
}

export function generateTitle(
	category: EventCategory,
	rand: () => number,
): string {
	const primary = pickOne(TITLE_FRAGMENTS[category], rand);
	const context = pickOne(TITLE_CONTEXT, rand);
	return `${primary} - ${context}`;
}

export function generateDescription(
	category: EventCategory,
	rand: () => number,
): string {
	const openings: Record<EventCategory, string[]> = {
		sighting: [
			"Observers reported a fast-moving object crossing monitored airspace without a known transponder signature.",
			"Field optics captured a silhouette that does not match registered aircraft or atmospheric artifacts.",
		],
		signal: [
			"A repeating transmission pattern emerged across reserved channels with no known source identifier.",
			"Passive receivers detected a structured burst signal that appears intentionally encoded.",
		],
		contact: [
			"An inbound communication sequence acknowledged our probe packet and replied out of protocol.",
			"Operators confirmed an interactive exchange on a channel previously considered inert.",
		],
		anomaly: [
			"Sensor arrays recorded a localized variance that exceeded baseline tolerances.",
			"Cross-domain telemetry indicates a non-random disturbance in environmental readings.",
		],
		classified: [
			"This incident has been compartmentalized and key operational details are restricted.",
			"Clearance controls were elevated after a sensitive trigger event in the reporting pipeline.",
		],
	};

	const middles = [
		"Initial triage recommends controlled observation and limited disclosure.",
		"Verification teams are correlating this event with archived records from adjacent regions.",
		"Multiple subsystems confirmed the pattern before automatic escalation.",
		"No immediate civilian impact was identified, but monitoring has been increased.",
	];

	const endings = [
		"Further analysis is pending command review.",
		"A follow-up report is scheduled after secondary validation.",
		"Containment and documentation protocols remain active.",
		"Regional teams have been advised to maintain elevated readiness.",
	];

	const sentenceOne = pickOne(openings[category], rand);
	const sentenceTwo = pickOne(middles, rand);
	const includeThirdSentence = rand() > 0.35;

	if (!includeThirdSentence) {
		return `${sentenceOne} ${sentenceTwo}`;
	}

	return `${sentenceOne} ${sentenceTwo} ${pickOne(endings, rand)}`;
}

function uniqueDayOffsets(
	rand: () => number,
	amount: number,
	maxDay: number,
): number[] {
	const offsets = new Set<number>();
	while (offsets.size < amount) {
		offsets.add(randomInt(rand, maxDay));
	}
	return [...offsets];
}

function buildIsoDate(dayOffset: number, rand: () => number): string {
	const msPerDay = 24 * 60 * 60 * 1000;
	const now = new Date();
	const todayUtcStart = Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate(),
	);
	const timestamp =
		todayUtcStart - dayOffset * msPerDay + Math.floor(rand() * msPerDay);
	return new Date(timestamp).toISOString();
}

function createEvent(
	index: number,
	dayOffset: number,
	rand: () => number,
): NexusEvent {
	const category = pickOne(EVENT_CATEGORIES, rand);
	const location = pickOne(LOCATIONS, rand);

	return {
		id: `NX-${String(index + 1).padStart(4, "0")}`,
		title: generateTitle(category, rand),
		date: buildIsoDate(dayOffset, rand),
		category,
		severity: weightedSeverity(rand),
		agent: pickOne(AGENTS, rand),
		location: location.name,
		coordinates: rand() > 0.2 ? location.coordinates : undefined,
		status: weightedStatus(rand),
		description: generateDescription(category, rand),
	};
}

export function generateMockEvents(count = 180): NexusEvent[] {
	const rand = seededRandom(42);
	const maxDays = 60;
	const guaranteedDenseDays = uniqueDayOffsets(rand, 10, maxDays);
	const events: NexusEvent[] = [];

	for (const dayOffset of guaranteedDenseDays) {
		for (let i = 0; i < 5; i += 1) {
			events.push(createEvent(events.length, dayOffset, rand));
		}
	}

	while (events.length < count) {
		const randomDayOffset = randomInt(rand, maxDays);
		events.push(createEvent(events.length, randomDayOffset, rand));
	}

	return events.toSorted((a, b) => b.date.localeCompare(a.date));
}

export const MOCK_EVENTS = generateMockEvents();
