"use client";

import {
  rowPaginationFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type Updater,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUrlParams } from "./use-url-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PAGESIZES } from "@/utils/pagination";

// Module level, not inside the component
export const features = tableFeatures({ rowPaginationFeature });

type DataTableProps<TData extends RowData> = {
  columns: ColumnDef<typeof features, TData>[];
  data: TData[];
  rowCount: number;
  page: number;
  perPage: number;
};

export function DataTable<TData extends RowData>({
  columns,
  data,
  rowCount,
  page,
  perPage,
}: DataTableProps<TData>) {
  const { push, searchParams } = useUrlParams();
  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize: perPage,
  };
  const pageSize = searchParams.get("perPage");
  const table = useTable({
    features,
    columns,
    data,
    manualPagination: true,
    rowCount,
    state: { pagination },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      const sizeChange = next.pageSize != perPage;
      push({
        page: sizeChange ? 1 : next.pageIndex + 1,
        perPage: next.pageSize,
      });
    },
  });

  return (
    <div className="space-y-4  rounded-xl p-2">
      <Table>
        <TableHeader className="font-semibold">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow className="font-bold" key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results found!.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2 justify-center">
          <span className="text-xs">Size</span>
          <Select onValueChange={(value) => table.setPageSize(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder={pageSize ?? 5} />
            </SelectTrigger>
            <SelectContent className="p-2">
              {PAGESIZES.map((item) => (
                <SelectItem key={item} value={item.toString()}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.max(table.getPageCount(), 1)} · {rowCount} rows
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
