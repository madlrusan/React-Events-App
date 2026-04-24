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
import { Timeline } from "./components/Timeline/Timeline";

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

	const openCount = events.filter((e) => e.status === "open").length;
	const criticalCount = events.filter((e) => e.severity === "critical").length;

	return (
		<div className="nx-dashboard">
			<header className="nx-header">
				<div className="nx-header-brand">
					<span className="nx-header-icon" aria-hidden="true">◈</span>
					<div className="nx-header-text">
						<span className="nx-header-title">NEXUS</span>
						<span className="nx-header-subtitle">Anomaly &amp; Incident Response</span>
					</div>
				</div>
				<button
					className="ui-btn ui-btn--default"
					onClick={handleCreateEvent}
					disabled={addEventMutation.isPending}
				>
					{addEventMutation.isPending ? "Creating…" : "+ Add Event"}
				</button>
			</header>

			<div className="nx-stats-bar">
				<div className="nx-stat">
					<span className="nx-stat-value">{isLoading ? "—" : events.length}</span>
					<span className="nx-stat-label">Total Events</span>
				</div>
				<div className="nx-stat">
					<span className={`nx-stat-value${openCount > 0 ? " nx-stat-value--warn" : ""}`}>
						{isLoading ? "—" : openCount}
					</span>
					<span className="nx-stat-label">Open</span>
				</div>
				<div className="nx-stat">
					<span className={`nx-stat-value${criticalCount > 0 ? " nx-stat-value--danger" : ""}`}>
						{isLoading ? "—" : criticalCount}
					</span>
					<span className="nx-stat-label">Critical</span>
				</div>
				{isError && (
					<div className="nx-stat">
						<span className="nx-stat-value nx-stat-value--danger">!</span>
						<span className="nx-stat-label">
							{(error as Error)?.message ?? "Load error"}
						</span>
					</div>
				)}
			</div>

			<main className="nx-main">
				<section className="nx-section">
					<div className="nx-section-header">
						<h2 className="nx-section-title">Incidents</h2>
					</div>
					<DataGrid
						data={events}
						isLoading={isLoading}
						isError={isError}
						onRetry={() => {
							void refetch();
						}}
						onEditEvent={handleEditEvent}
					/>
				</section>

				<section className="nx-section">
					<div className="nx-section-header">
						<h2 className="nx-section-title">Timeline</h2>
					</div>
					<Timeline events={events} selectedEventId={null} />
				</section>
			</main>
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
