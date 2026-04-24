import { format, parseISO } from "date-fns";
import {
	AlertCircle,
	ChevronDown,
	ChevronUp,
	ChevronsUpDown,
	Pencil,
	SearchX,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { NexusEvent } from "../../data/eventTypes";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";
import { ColumnToggle } from "./ColumnToggle";
import { DataGridSkeleton } from "./DataGridSkeleton";
import { FilterRow } from "./FilterRow";
import type { ColumnDef } from "./DataGrid.types";
import { useDataGrid } from "./useDataGrid";
import "./DataGrid.css";

type DataGridProps = {
	data: NexusEvent[];
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
	onEditEvent: (event: NexusEvent) => void;
};

const COLUMNS: ColumnDef<NexusEvent>[] = [
	{
		key: "id",
		label: "ID",
		visible: true,
		sortable: true,
		filterable: true,
		filterType: "text",
	},
	{
		key: "title",
		label: "Title",
		visible: true,
		sortable: true,
		filterable: true,
		filterType: "text",
	},
	{
		key: "date",
		label: "Date",
		visible: true,
		sortable: true,
		filterable: true,
		filterType: "text",
	},
	{
		key: "category",
		label: "Category",
		visible: true,
		sortable: true,
		filterable: true,
		filterType: "select",
	},
	{
		key: "severity",
		label: "Severity",
		visible: true,
		sortable: true,
		filterable: true,
		filterType: "select",
	},
	{
		key: "agent",
		label: "Agent",
		visible: true,
		sortable: true,
		filterable: true,
		filterType: "text",
	},
	{
		key: "location",
		label: "Location",
		visible: true,
		sortable: true,
		filterable: true,
		filterType: "text",
	},
	{
		key: "coordinates",
		label: "Coordinates",
		visible: false,
		sortable: true,
		filterable: true,
		filterType: "text",
	},
	{
		key: "status",
		label: "Status",
		visible: true,
		sortable: true,
		filterable: true,
		filterType: "select",
	},
	{
		key: "description",
		label: "Description",
		visible: false,
		sortable: false,
		filterable: true,
		filterType: "text",
	},
];

function getSortIcon(isActive: boolean, direction: "asc" | "desc" | null) {
	if (!isActive || !direction) {
		return <ChevronsUpDown size={14} aria-hidden="true" />;
	}

	if (direction === "asc") {
		return <ChevronUp size={14} aria-hidden="true" />;
	}

	return <ChevronDown size={14} aria-hidden="true" />;
}

function renderSeverityBadge(severity: NexusEvent["severity"]) {
	if (severity === "low") {
		return <Badge variant="secondary">{severity}</Badge>;
	}

	if (severity === "medium") {
		return (
			<Badge variant="outline" className="nx-badge-warm">
				{severity}
			</Badge>
		);
	}

	if (severity === "high") {
		return (
			<Badge variant="outline" className="nx-badge-orange">
				{severity}
			</Badge>
		);
	}

	return <Badge variant="destructive">{severity}</Badge>;
}

function renderStatusBadge(status: NexusEvent["status"]) {
	if (status === "open") {
		return <Badge variant="outline">{status}</Badge>;
	}

	if (status === "investigating") {
		return <Badge variant="secondary">{status}</Badge>;
	}

	if (status === "closed") {
		return <Badge>{status}</Badge>;
	}

	return <Badge variant="destructive">{status}</Badge>;
}

function renderCellValue(eventItem: NexusEvent, key: keyof NexusEvent) {
	if (key === "severity") {
		return renderSeverityBadge(eventItem.severity);
	}

	if (key === "status") {
		return renderStatusBadge(eventItem.status);
	}

	if (key === "date") {
		return format(parseISO(eventItem.date), "dd MMM yyyy HH:mm");
	}

	return eventItem[key] ?? "-";
}

export function DataGrid({
	data,
	isLoading,
	isError,
	onRetry,
	onEditEvent,
}: DataGridProps) {
	const [isFilterRowVisible, setFilterRowVisible] = useState(false);

	const {
		visibleColumns,
		paginatedRows,
		totalRows,
		totalPages,
		currentPage,
		sortState,
		filterState,
		activeFilterCount,
		setSort,
		setFilter,
		clearFilters,
		setPage,
		toggleColumnVisibility,
	} = useDataGrid(data, COLUMNS);

	const skeletonColumns = useMemo(
		() => COLUMNS.filter((column) => column.visible),
		[],
	);

	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					<AlertCircle size={16} aria-hidden="true" />
					Failed to load incidents.
				</AlertDescription>
				<Button variant="destructive" size="sm" onClick={onRetry}>
					Retry
				</Button>
			</Alert>
		);
	}

	if (isLoading) {
		return (
			<div className="nx-grid">
				<DataGridSkeleton columns={skeletonColumns} />
			</div>
		);
	}

	return (
		<div className="nx-grid">
			<div className="nx-grid-toolbar">
				<div className="nx-grid-toolbar-actions">
					<ColumnToggle
						columns={COLUMNS}
						visibleColumns={visibleColumns}
						toggleColumnVisibility={toggleColumnVisibility}
					/>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setFilterRowVisible((previous) => !previous)
						}
					>
						Filters
						{activeFilterCount > 0 ? (
							<Badge variant="secondary">
								{activeFilterCount}
							</Badge>
						) : null}
					</Button>
				</div>
				<div className="nx-grid-toolbar-pagination">
					<span className="nx-grid-page-meta">
						Page {currentPage} of {totalPages} · {totalRows} results
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage(currentPage - 1)}
						disabled={currentPage <= 1}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage(currentPage + 1)}
						disabled={currentPage >= totalPages}
					>
						Next
					</Button>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						{visibleColumns.map((column) => {
							const isSortedColumn = sortState.key === column.key;

							return (
								<TableHead key={String(column.key)}>
									{column.sortable ? (
										<button
											type="button"
											className="nx-sort-button"
											onClick={() => setSort(column.key)}
										>
											{column.label}
											{getSortIcon(
												isSortedColumn,
												isSortedColumn
													? sortState.direction
													: null,
											)}
										</button>
									) : (
										column.label
									)}
								</TableHead>
							);
						})}
						<TableHead>Actions</TableHead>
					</TableRow>
					{isFilterRowVisible ? (
						<FilterRow
							visibleColumns={visibleColumns}
							filterState={filterState}
							setFilter={setFilter}
						/>
					) : null}
				</TableHeader>
				<TableBody>
					{paginatedRows.length === 0 ? (
						<TableRow>
							<TableCell colSpan={visibleColumns.length + 1}>
								<div className="nx-grid-empty">
									<SearchX size={20} aria-hidden="true" />
									<h3>No incidents match your filters</h3>
									<Button
										variant="secondary"
										size="sm"
										onClick={clearFilters}
									>
										Clear filters
									</Button>
								</div>
							</TableCell>
						</TableRow>
					) : (
						paginatedRows.map((eventItem) => (
							<TableRow key={eventItem.id}>
								{visibleColumns.map((column) => (
									<TableCell
										key={`${eventItem.id}-${String(column.key)}`}
									>
										{renderCellValue(eventItem, column.key)}
									</TableCell>
								))}
								<TableCell>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => onEditEvent(eventItem)}
										aria-label={`Edit ${eventItem.title}`}
									>
										<Pencil size={16} aria-hidden="true" />
									</Button>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
