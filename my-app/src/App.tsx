import { QueryClientProvider } from "@tanstack/react-query";
import {
	RouterProvider,
	createBrowserRouter,
	useParams,
} from "react-router-dom";
import { EventProvider } from "./context/EventContext";
import {
	useAddEventMutation,
	useEditEventMutation,
	useNexusEventsQuery,
} from "./hooks/useEventQueries";
import { queryClient } from "./lib/queryClient";

function Dashboard() {
	const { data: events = [], isLoading, error } = useNexusEventsQuery();
	const addEventMutation = useAddEventMutation();
	const editEventMutation = useEditEventMutation();

	const handleCreateEvent = () => {
		addEventMutation.mutate({
			title: "Incoming anomaly ping",
			date: new Date().toISOString(),
			category: "anomaly",
			severity: "medium",
			agent: "AUTO-NODE",
			location: "Sector 7",
			status: "open",
			description: "Generated from TanStack Query mutation hook.",
		});
	};

	const handleCloseFirstEvent = () => {
		const firstEvent = events[0];

		if (!firstEvent) {
			return;
		}

		editEventMutation.mutate({
			...firstEvent,
			status: "closed",
		});
	};

	if (isLoading) {
		return <h1>NEXUS Dashboard loading events...</h1>;
	}

	if (error) {
		return <h1>{(error as Error).message}</h1>;
	}

	return (
		<div>
			<h1>NEXUS Dashboard</h1>
			<p>Total events: {events.length}</p>
			<button
				onClick={handleCreateEvent}
				disabled={addEventMutation.isPending}
			>
				{addEventMutation.isPending ? "Creating..." : "Add Event"}
			</button>
			<button
				onClick={handleCloseFirstEvent}
				disabled={editEventMutation.isPending || events.length === 0}
			>
				{editEventMutation.isPending
					? "Saving..."
					: "Close First Event"}
			</button>
		</div>
	);
}

function EventDetail() {
	const { id } = useParams();

	return <h1>Event {id} (placeholder)</h1>;
}

// Centralizing route definitions keeps URL structure explicit and easy to evolve.
const router = createBrowserRouter([
	{
		path: "/",
		element: <Dashboard />,
	},
	{
		path: "/events/:id",
		element: <EventDetail />,
	},
]);

function App() {
	return (
		// Provider order ensures all routed screens can share the same query cache.
		<QueryClientProvider client={queryClient}>
			<EventProvider>
				<RouterProvider router={router} />
			</EventProvider>
		</QueryClientProvider>
	);
}

export default App;
