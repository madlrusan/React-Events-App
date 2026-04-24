import type { NexusEvent } from "../data/eventTypes";

export type MockServiceConfig = {
	shouldFail?: boolean;
	delay?: number;
};

export type MockEventsServiceCallbacks = {
	getEvents: () => NexusEvent[];
	onAddEvent: (eventItem: NexusEvent) => void;
	onEditEvent: (eventItem: NexusEvent) => void;
};

const GET_ALL_DELAY_MS = 1200;
const MUTATION_DELAY_MS = 600;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function createServiceApi(callbacks: MockEventsServiceCallbacks) {
	return {
		async getAll(config: MockServiceConfig = {}): Promise<NexusEvent[]> {
			// TanStack Query expects async query functions. Wrapping synchronous context state
			// in Promises keeps loading/error/success states realistic and easy to test.
			await sleep(config.delay ?? GET_ALL_DELAY_MS);

			if (config.shouldFail) {
				throw new Error("NEXUS: Unable to reach server.");
			}

			return callbacks.getEvents();
		},

		async addEvent(eventItem: Omit<NexusEvent, "id">): Promise<NexusEvent> {
			await sleep(MUTATION_DELAY_MS);

			const createdEvent: NexusEvent = {
				...eventItem,
				id: crypto.randomUUID(),
			};

			callbacks.onAddEvent(createdEvent);
			return createdEvent;
		},

		async editEvent(eventItem: NexusEvent): Promise<NexusEvent> {
			await sleep(MUTATION_DELAY_MS);
			callbacks.onEditEvent(eventItem);
			return eventItem;
		},
	};
}

// Approach 1 (recommended): callback-based factory.
// Why this is preferred: no global mutable state, easier test isolation, and explicit dependencies.
export function createMockEventsService(callbacks: MockEventsServiceCallbacks) {
	return createServiceApi(callbacks);
}
