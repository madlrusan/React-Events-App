import * as React from "react";
import { cn } from "../../lib/utils";

export const Table = React.forwardRef<
	HTMLTableElement,
	React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
	return (
		<div className="ui-table-wrap">
			<table ref={ref} className={cn("ui-table", className)} {...props} />
		</div>
	);
});

Table.displayName = "Table";

export const TableHeader = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
	return (
		<thead
			ref={ref}
			className={cn("ui-table-head", className)}
			{...props}
		/>
	);
});

TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
	return (
		<tbody
			ref={ref}
			className={cn("ui-table-body", className)}
			{...props}
		/>
	);
});

TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<
	HTMLTableRowElement,
	React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => {
	return (
		<tr ref={ref} className={cn("ui-table-row", className)} {...props} />
	);
});

TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
	HTMLTableCellElement,
	React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
	return <th ref={ref} className={cn("ui-table-th", className)} {...props} />;
});

TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
	return <td ref={ref} className={cn("ui-table-td", className)} {...props} />;
});

TableCell.displayName = "TableCell";
