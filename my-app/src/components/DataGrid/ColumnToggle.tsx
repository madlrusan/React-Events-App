import type { NexusEvent } from "../../data/eventTypes";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { ColumnDef } from "./DataGrid.types";

type ColumnToggleProps = {
	columns: ColumnDef<NexusEvent>[];
	visibleColumns: ColumnDef<NexusEvent>[];
	toggleColumnVisibility: (key: keyof NexusEvent) => void;
};

export function ColumnToggle({
	columns,
	visibleColumns,
	toggleColumnVisibility,
}: ColumnToggleProps) {
	const visibleCount = visibleColumns.length;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm">
					Columns
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{columns.map((column) => {
					const isVisible = visibleColumns.some(
						(item) => item.key === column.key,
					);
					const isLastVisible = isVisible && visibleCount === 1;

					return (
						<DropdownMenuCheckboxItem
							key={String(column.key)}
							checked={isVisible}
							disabled={isLastVisible}
							onCheckedChange={() =>
								toggleColumnVisibility(
									column.key as keyof NexusEvent,
								)
							}
						>
							{column.label}
						</DropdownMenuCheckboxItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
