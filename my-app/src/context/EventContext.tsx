/* eslint-disable react-refresh/only-export-components */
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useReducer,
	type ReactNode,
} from "react";
import { MOCK_EVENTS } from "../data/mockEvents";
import type { NexusEvent } from "../data/eventTypes";
import { createMockEventsService } from "../services/mockEventsService";

export interface EventState {
	events: NexusEvent[];
	selectedEventId: string | null;
	editingEvent: NexusEvent | null;
	isFormOpen: boolean;
}

export type EventAction =
	| { type: "ADD_EVENT"; payload: NexusEvent }
	| { type: "EDIT_EVENT"; payload: NexusEvent }
	| { type: "SELECT_EVENT"; payload: string | null }
	| { type: "OPEN_FORM"; payload?: NexusEvent }
	| { type: "CLOSE_FORM" };

const initialState: EventState = {
	events: MOCK_EVENTS,
	selectedEventId: null,
	editingEvent: null,
	isFormOpen: false,
};

export function eventReducer(
	state: EventState,
	action: EventAction,
): EventState {
	switch (action.type) {
		case "ADD_EVENT": {
			const nextEvents = [...state.events, action.payload].toSorted(
				(a, b) => b.date.localeCompare(a.date),
			);

			return {
				...state,
				events: nextEvents,
				selectedEventId: action.payload.id,
				editingEvent: null,
				isFormOpen: false,
			};
		}
		case "EDIT_EVENT": {
			const nextEvents = state.events
				.map((eventItem) =>
					eventItem.id === action.payload.id
						? action.payload
						: eventItem,
				)
				.toSorted((a, b) => b.date.localeCompare(a.date));

			return {
				...state,
				events: nextEvents,
				selectedEventId: action.payload.id,
				editingEvent: null,
				isFormOpen: false,
			};
		}
		case "SELECT_EVENT":
			return {
				...state,
				selectedEventId: action.payload,
			};
		case "OPEN_FORM":
			return {
				...state,
				isFormOpen: true,
				editingEvent: action.payload ?? null,
				selectedEventId: action.payload?.id ?? state.selectedEventId,
			};
		case "CLOSE_FORM":
			return {
				...state,
				isFormOpen: false,
				editingEvent: null,
			};
		default:
			return state;
	}
}

type EventContextValue = {
	state: EventState;
	dispatch: React.Dispatch<EventAction>;
	service: ReturnType<typeof createMockEventsService>;
};

const defaultContextValue: EventContextValue = {
	state: {
		events: [],
		selectedEventId: null,
		editingEvent: null,
		isFormOpen: false,
	},
	dispatch: (action) => {
		void action;
		throw new Error("EventContext dispatch called outside EventProvider");
	},
	service: {
		getAll: async () => {
			throw new Error("Event service called outside EventProvider");
		},
		addEvent: async () => {
			throw new Error("Event service called outside EventProvider");
		},
		editEvent: async () => {
			throw new Error("Event service called outside EventProvider");
		},
	},
};

const EventContext = createContext<EventContextValue>(defaultContextValue);

export function EventProvider({ children }: { children: ReactNode }) {
	// useReducer is preferred here because multiple related fields change together.
	// Actions like OPEN_FORM, ADD_EVENT, and EDIT_EVENT update coordinated state atomically.
	const [state, dispatch] = useReducer(eventReducer, initialState);

	const service = useMemo(
		() =>
			createMockEventsService({
				getEvents: () => state.events,
				onAddEvent: (eventItem) => {
					dispatch({ type: "ADD_EVENT", payload: eventItem });
				},
				onEditEvent: (eventItem) => {
					dispatch({ type: "EDIT_EVENT", payload: eventItem });
				},
			}),
		[state.events, dispatch],
	);

	const value = useMemo(
		() => ({
			state,
			dispatch,
			service,
		}),
		[state, dispatch, service],
	);

	return (
		<EventContext.Provider value={value}>{children}</EventContext.Provider>
	);
}

export function useEventContext(): EventContextValue {
	const context = useContext(EventContext);

	if (context === defaultContextValue) {
		throw new Error("useEventContext must be used within an EventProvider");
	}

	return context;
}

export function useMockEventsService(): ReturnType<
	typeof createMockEventsService
> {
	const { service } = useEventContext();
	return service;
}

export function useAddEvent(): (eventItem: NexusEvent) => void {
	const { dispatch } = useEventContext();

	return useCallback(
		(eventItem: NexusEvent) => {
			dispatch({ type: "ADD_EVENT", payload: eventItem });
		},
		[dispatch],
	);
}

export function useEditEvent(): (eventItem: NexusEvent) => void {
	const { dispatch } = useEventContext();

	return useCallback(
		(eventItem: NexusEvent) => {
			dispatch({ type: "EDIT_EVENT", payload: eventItem });
		},
		[dispatch],
	);
}

export function useSelectEvent(): (eventId: string | null) => void {
	const { dispatch } = useEventContext();

	return useCallback(
		(eventId: string | null) => {
			dispatch({ type: "SELECT_EVENT", payload: eventId });
		},
		[dispatch],
	);
}

export function useOpenForm(): (eventItem?: NexusEvent) => void {
	const { dispatch } = useEventContext();

	return useCallback(
		(eventItem?: NexusEvent) => {
			dispatch({ type: "OPEN_FORM", payload: eventItem });
		},
		[dispatch],
	);
}

export function useCloseForm(): () => void {
	const { dispatch } = useEventContext();

	return useCallback(() => {
		dispatch({ type: "CLOSE_FORM" });
	}, [dispatch]);
}
