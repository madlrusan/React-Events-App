import type { NexusEvent } from "../../data/eventTypes";

export type ColumnDef<T> = {
	key: keyof T;
	label: string;
	visible: boolean;
	sortable?: boolean;
	filterable?: boolean;
	filterType?: "text" | "select";
};

export type SortDirection = "asc" | "desc" | null;

export type SortState = {
	key: keyof NexusEvent | null;
	direction: SortDirection;
};

export type FilterState = Partial<Record<keyof NexusEvent, string>>;
