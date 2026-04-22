import { QueryClientProvider } from "@tanstack/react-query";
import {
	RouterProvider,
	createBrowserRouter,
	useParams,
} from "react-router-dom";
import { queryClient } from "./lib/queryClient";

function Dashboard() {
	return <h1>NEXUS Dashboard (placeholder)</h1>;
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
			<RouterProvider router={router} />
		</QueryClientProvider>
	);
}

export default App;
