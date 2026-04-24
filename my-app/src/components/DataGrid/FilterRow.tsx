import { useEffect, useState } from "react";
import {
	EVENT_CATEGORIES,
	EVENT_SEVERITIES,
	EVENT_STATUSES,
	type NexusEvent,
} from "../../data/eventTypes";
import { useDebounce } from "../../lib/useDebounce";
import { Input } from "../ui/input";
import { Select, SelectItem } from "../ui/select";
import { TableHead, TableRow } from "../ui/table";
import type { ColumnDef, FilterState } from "./DataGrid.types";

type FilterRowProps = {
	visibleColumns: ColumnDef<NexusEvent>[];
	filterState: FilterState;
	setFilter: (key: keyof NexusEvent, value: string) => void;
};

type TextFilterCellProps = {
	columnKey: keyof NexusEvent;
	value: string;
	setFilter: (key: keyof NexusEvent, value: string) => void;
};

function TextFilterCell({ columnKey, value, setFilter }: TextFilterCellProps) {
	const [localValue, setLocalValue] = useState(value);
	const debouncedValue = useDebounce(localValue, 300);

	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	useEffect(() => {
		setFilter(columnKey, debouncedValue);
	}, [columnKey, debouncedValue, setFilter]);

	return (
		<Input
			value={localValue}
			onChange={(event) => setLocalValue(event.target.value)}
			placeholder="Filter..."
			aria-label={`Filter ${String(columnKey)}`}
		/>
	);
}

function getSelectOptions(key: keyof NexusEvent): string[] {
	if (key === "category") {
		return EVENT_CATEGORIES;
	}

	if (key === "severity") {
		return EVENT_SEVERITIES;
	}

	if (key === "status") {
		return EVENT_STATUSES;
	}

	return [];
}

export function FilterRow({
	visibleColumns,
	filterState,
	setFilter,
}: FilterRowProps) {
	return (
		<TableRow>
			{visibleColumns.map((column) => {
				if (!column.filterable) {
					return <TableHead key={`filter-${String(column.key)}`} />;
				}

				const value = filterState[column.key as keyof NexusEvent] ?? "";

				return (
					<TableHead key={`filter-${String(column.key)}`}>
						{column.filterType === "select" ? (
							<Select
								value={value}
								onValueChange={(nextValue) =>
									setFilter(
										column.key as keyof NexusEvent,
										nextValue,
									)
								}
								aria-label={`Filter ${column.label}`}
							>
								<SelectItem value="">All</SelectItem>
								{getSelectOptions(
									column.key as keyof NexusEvent,
								).map((option) => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</Select>
						) : (
							<TextFilterCell
								columnKey={column.key as keyof NexusEvent}
								value={value}
								setFilter={setFilter}
							/>
						)}
					</TableHead>
				);
			})}
			<TableHead />
		</TableRow>
	);
}
