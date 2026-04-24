import { useCallback, useMemo, useState } from "react";
import type { NexusEvent } from "../../data/eventTypes";
import type {
	ColumnDef,
	FilterState,
	SortDirection,
	SortState,
} from "./DataGrid.types";

type UseDataGridReturn<T> = {
	/** Columns currently shown in the grid. */
	visibleColumns: ColumnDef<T>[];
	/** Rows for the active page after filtering and sorting are applied. */
	paginatedRows: T[];
	/** Total number of rows after filtering (before pagination). */
	totalRows: number;
	/** Total number of available pages for the current filter set and page size. */
	totalPages: number;
	/** 1-based current page index shown in the grid. */
	currentPage: number;
	/** Number of rows shown per page. */
	pageSize: number;
	/** Active sort key and direction. */
	sortState: SortState;
	/** Current column filter values keyed by event field. */
	filterState: FilterState;
	/** Count of non-empty filters currently applied. */
	activeFilterCount: number;
	/** Sets the active sort key and cycles direction asc -> desc -> null. */
	setSort: (key: keyof T) => void;
	/** Updates a single filter value by column key. */
	setFilter: (key: keyof T, value: string) => void;
	/** Clears all active filters. */
	clearFilters: () => void;
	/** Sets the current page (clamped to valid bounds). */
	setPage: (page: number) => void;
	/** Sets rows per page and returns to the first page. */
	setPageSize: (size: number) => void;
	/** Toggles whether a column is visible in the grid. */
	toggleColumnVisibility: (key: keyof T) => void;
};

const SEVERITY_ORDER: Record<NexusEvent["severity"], number> = {
	low: 1,
	medium: 2,
	high: 3,
	critical: 4,
};

const STATUS_ORDER: Record<NexusEvent["status"], number> = {
	open: 1,
	investigating: 2,
	closed: 3,
	redacted: 4,
};

function getComparableValue<T extends NexusEvent>(
	row: T,
	key: keyof T,
): string | number {
	const raw = row[key];

	if (key === "severity" && typeof raw === "string") {
		return (
			SEVERITY_ORDER[raw as NexusEvent["severity"]] ??
			Number.MAX_SAFE_INTEGER
		);
	}

	if (key === "status" && typeof raw === "string") {
		return (
			STATUS_ORDER[raw as NexusEvent["status"]] ?? Number.MAX_SAFE_INTEGER
		);
	}

	if (typeof raw === "number") {
		return raw;
	}

	return String(raw ?? "").toLowerCase();
}

function compareRows<T extends NexusEvent>(
	a: T,
	b: T,
	key: keyof T,
	direction: Exclude<SortDirection, null>,
): number {
	const left = getComparableValue(a, key);
	const right = getComparableValue(b, key);

	let comparison = 0;

	if (typeof left === "number" && typeof right === "number") {
		comparison = left - right;
	} else {
		comparison = String(left).localeCompare(String(right));
	}

	return direction === "asc" ? comparison : -comparison;
}

export function useDataGrid<T extends NexusEvent>(
	data: T[],
	columns: ColumnDef<T>[],
): UseDataGridReturn<T> {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSizeState] = useState(10);
	const [sortState, setSortState] = useState<SortState>({
		key: null,
		direction: null,
	});
	const [filterState, setFilterState] = useState<FilterState>({});
	const [columnVisibility, setColumnVisibility] = useState<
		Partial<Record<keyof T, boolean>>
	>(() => {
		const initialState: Partial<Record<keyof T, boolean>> = {};

		for (const column of columns) {
			initialState[column.key] = column.visible;
		}

		return initialState;
	});

	const visibleColumns = useMemo(
		() =>
			columns.filter((column) => {
				const overrideVisibility = columnVisibility[column.key];
				return overrideVisibility ?? column.visible;
			}),
		[columns, columnVisibility],
	);

	const filteredAndSortedRows = useMemo(() => {
		const filtered = data.filter((row) => {
			for (const [rawKey, rawFilterValue] of Object.entries(
				filterState,
			)) {
				const filterValue = rawFilterValue?.trim().toLowerCase();
				if (!filterValue) {
					continue;
				}

				const key = rawKey as keyof T;
				const column = columns.find(
					(candidate) => candidate.key === key,
				);
				if (!column?.filterable) {
					continue;
				}

				const value = String(row[key] ?? "").toLowerCase();

				if (column.filterType === "select") {
					if (value !== filterValue) {
						return false;
					}
					continue;
				}

				if (!value.includes(filterValue)) {
					return false;
				}
			}

			return true;
		});

		if (!sortState.key || !sortState.direction) {
			return filtered;
		}

		const key = sortState.key as keyof T;
		return filtered.slice().sort((a, b) => {
			return compareRows(
				a,
				b,
				key,
				sortState.direction as "asc" | "desc",
			);
		});
	}, [columns, data, filterState, sortState.direction, sortState.key]);

	const totalRows = filteredAndSortedRows.length;
	const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

	const paginatedRows = useMemo(() => {
		const safeCurrentPage = Math.min(currentPage, totalPages);
		const start = (safeCurrentPage - 1) * pageSize;
		const end = start + pageSize;

		return filteredAndSortedRows.slice(start, end);
	}, [currentPage, filteredAndSortedRows, pageSize, totalPages]);

	const activeFilterCount = useMemo(() => {
		return Object.values(filterState).filter((value) => value?.trim())
			.length;
	}, [filterState]);

	const setSort = useCallback((key: keyof T): void => {
		setSortState((previous) => {
			const previousKey = previous.key as keyof T | null;

			if (previousKey !== key) {
				return {
					key: key as keyof NexusEvent,
					direction: "asc",
				};
			}

			if (previous.direction === "asc") {
				return {
					key: key as keyof NexusEvent,
					direction: "desc",
				};
			}

			if (previous.direction === "desc") {
				return {
					key: null,
					direction: null,
				};
			}

			return {
				key: key as keyof NexusEvent,
				direction: "asc",
			};
		});
		setCurrentPage(1);
	}, []);

	const setFilter = useCallback((key: keyof T, value: string): void => {
		setFilterState((previous) => {
			const normalizedKey = key as keyof NexusEvent;
			if (previous[normalizedKey] === value) {
				return previous;
			}

			return {
				...previous,
				[normalizedKey]: value,
			};
		});
		setCurrentPage(1);
	}, []);

	const clearFilters = useCallback((): void => {
		setFilterState({});
		setCurrentPage(1);
	}, []);

	const setPage = useCallback(
		(page: number): void => {
			const safePage = Number.isFinite(page) ? Math.trunc(page) : 1;
			const clampedPage = Math.min(Math.max(safePage, 1), totalPages);
			setCurrentPage(clampedPage);
		},
		[totalPages],
	);

	const setPageSize = useCallback((size: number): void => {
		const safeSize = Number.isFinite(size) ? Math.trunc(size) : 10;
		const normalizedSize = Math.max(1, safeSize);
		setPageSizeState(normalizedSize);
		setCurrentPage(1);
	}, []);

	const toggleColumnVisibility = useCallback(
		(key: keyof T): void => {
			setColumnVisibility((previous) => {
				const column = columns.find((item) => item.key === key);
				const currentVisibility =
					previous[key] ?? column?.visible ?? true;

				return {
					...previous,
					[key]: !currentVisibility,
				};
			});
		},
		[columns],
	);

	return {
		visibleColumns,
		paginatedRows,
		totalRows,
		totalPages,
		currentPage,
		pageSize,
		sortState,
		filterState,
		activeFilterCount,
		setSort,
		setFilter,
		clearFilters,
		setPage,
		setPageSize,
		toggleColumnVisibility,
	};
}
