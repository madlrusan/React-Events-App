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
import { DataGrid } from "./components/DataGrid/DataGrid";

function Dashboard() {
	const {
		data: events = [],
		isLoading,
		error,
		isError,
		refetch,
	} = useNexusEventsQuery();
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

	const handleEditEvent = (eventItem: (typeof events)[number]) => {
		const nextStatus =
			eventItem.status === "open"
				? "investigating"
				: eventItem.status === "investigating"
					? "closed"
					: eventItem.status;

		editEventMutation.mutate({
			...eventItem,
			status: nextStatus,
		});
	};

	return (
		<div>
			<h1>NEXUS Dashboard</h1>
			<p>
				{isError
					? ((error as Error)?.message ?? "Unable to load events.")
					: `Total events: ${events.length}`}
			</p>
			<button
				onClick={handleCreateEvent}
				disabled={addEventMutation.isPending}
			>
				{addEventMutation.isPending ? "Creating..." : "Add Event"}
			</button>
			<DataGrid
				data={events}
				isLoading={isLoading}
				isError={isError}
				onRetry={() => {
					void refetch();
				}}
				onEditEvent={handleEditEvent}
			/>
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
