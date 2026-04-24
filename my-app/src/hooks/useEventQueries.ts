import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMockEventsService } from "../context/EventContext";
import type { NexusEvent } from "../data/eventTypes";
import type { MockServiceConfig } from "../services/mockEventsService";

export const eventQueryKeys = {
	all: ["events"] as const,
};

export function useNexusEventsQuery(config?: MockServiceConfig) {
	const service = useMockEventsService();

	return useQuery({
		queryKey: [
			...eventQueryKeys.all,
			config?.shouldFail ?? false,
			config?.delay ?? null,
		],
		queryFn: () => service.getAll(config),
	});
}

export function useAddEventMutation() {
	const service = useMockEventsService();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (eventItem: Omit<NexusEvent, "id">) =>
			service.addEvent(eventItem),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: eventQueryKeys.all,
			});
		},
	});
}

export function useEditEventMutation() {
	const service = useMockEventsService();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (eventItem: NexusEvent) => service.editEvent(eventItem),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: eventQueryKeys.all,
			});
		},
	});
}

export function useDeleteEventMutation() {
	const service = useMockEventsService();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => service.deleteEvent(id),
		onSuccess: (_, id) => {
			queryClient.setQueriesData<NexusEvent[]>(
				{ queryKey: eventQueryKeys.all },
				(old) => old?.filter((e) => e.id !== id) ?? [],
			);
		},
	});
}
