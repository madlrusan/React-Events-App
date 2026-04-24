import type { NexusEvent } from "../../data/eventTypes";
import { Skeleton } from "../ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";
import type { ColumnDef } from "./DataGrid.types";

type DataGridSkeletonProps = {
	columns: ColumnDef<NexusEvent>[];
};

export function DataGridSkeleton({ columns }: DataGridSkeletonProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					{columns.map((column) => (
						<TableHead key={String(column.key)}>
							{column.label}
						</TableHead>
					))}
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: 5 }).map((_, rowIndex) => (
					<TableRow key={`skeleton-${rowIndex}`}>
						{columns.map((column) => (
							<TableCell
								key={`${String(column.key)}-${rowIndex}`}
							>
								<Skeleton style={{ height: "0.95rem" }} />
							</TableCell>
						))}
						<TableCell>
							<Skeleton style={{ height: "0.95rem" }} />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
