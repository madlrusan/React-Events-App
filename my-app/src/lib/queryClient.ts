import { QueryClient } from "@tanstack/react-query";

// One shared client gives every route consistent cache and retry behavior.
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60,
			retry: 1,
		},
	},
});
