import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
	RouterProvider,
	createBrowserRouter,
	useParams,
	Link,
} from "react-router-dom";
import { parseISO, format } from "date-fns";
import { EventProvider, useEventContext, useOpenForm, useCloseForm } from "./context/EventContext";
import {
	useDeleteEventMutation,
	useNexusEventsQuery,
} from "./hooks/useEventQueries";
import { queryClient } from "./lib/queryClient";
import { DataGrid } from "./components/DataGrid/DataGrid";
import { EventForm } from "./components/EventForm/EventForm";
import { Toaster } from "./components/ui/toast";
import { AppHeader } from "./components/Layout/AppHeader";
import { TimelinePage } from "./routes/TimelinePage";

function Dashboard() {
	const {
		data: events = [],
		isLoading,
		error,
		isError,
		refetch,
	} = useNexusEventsQuery();
	const deleteEventMutation = useDeleteEventMutation();
	const { state } = useEventContext();
	const openForm = useOpenForm();
	const closeForm = useCloseForm();
	const addEventTriggerRef = React.useRef<HTMLButtonElement>(null);

	const handleDeleteEvent = (eventItem: (typeof events)[number]) => {
		deleteEventMutation.mutate(eventItem.id);
	};

	const openCount = events.filter((e) => e.status === "open").length;
	const criticalCount = events.filter((e) => e.severity === "critical").length;

	return (
		<div className="nx-dashboard">
			<AppHeader
				actions={
					<button
						ref={addEventTriggerRef}
						className="ui-btn ui-btn--default"
						onClick={() => openForm()}
					>
						+ Add Event
					</button>
				}
			/>

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
						onEditEvent={(eventItem) => openForm(eventItem)}
					onDeleteEvent={handleDeleteEvent}
					/>
				</section>

				<section className="nx-section">
					<div className="nx-section-header">
						<h2 className="nx-section-title">Recent Timeline</h2>
						<Link to="/timeline" className="nx-section-link">View all →</Link>
					</div>
					<ul className="nx-timeline-summary">
						{isLoading
							? Array.from({ length: 5 }).map((_, i) => (
								<li key={i} className="nx-timeline-summary-row nx-timeline-summary-row--skeleton" />
							))
							: events
								.slice()
								.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
								.slice(0, 5)
								.map((e) => (
									<li key={e.id} className="nx-timeline-summary-row">
										<span className={`nx-summary-dot nx-summary-dot--${e.severity}`} aria-hidden="true" />
										<span className="nx-summary-title">{e.title}</span>
										<span className="nx-summary-category">{e.category}</span>
										<time className="nx-summary-date" dateTime={e.date}>
											{format(parseISO(e.date), "dd MMM yyyy")}
										</time>
									</li>
								))
						}
					</ul>
				</section>
			</main>

			<EventForm
				open={state.isFormOpen}
				onClose={closeForm}
				editingEvent={state.editingEvent}
				triggerRef={addEventTriggerRef}
			/>
			<Toaster />
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
		path: "/timeline",
		element: <TimelinePage />,
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
