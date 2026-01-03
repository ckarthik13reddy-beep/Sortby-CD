"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { ColumnInfo } from "@/types/browse-data";

interface DataTablePreviewProps {
  data: Record<string, unknown>[];
  columns: ColumnInfo[];
  pageCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  totalRows: number;
}

export function DataTablePreview({
  data,
  columns,
  pageCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalRows,
}: DataTablePreviewProps) {
  // Generate column definitions from ColumnInfo
  const tableColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    return columns.map((col) => ({
      id: col.column_name,
      accessorKey: col.column_name,
      header: () => (
        <div className="flex flex-col py-1">
          <span className="font-medium">{col.column_name}</span>
          <span className="text-xs text-muted-foreground font-normal">
            {col.data_type}
            {col.is_nullable && " (nullable)"}
          </span>
        </div>
      ),
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === null || value === undefined) {
          return <span className="text-muted-foreground italic">NULL</span>;
        }
        if (typeof value === "boolean") {
          return (
            <span
              className={value ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
            >
              {value ? "true" : "false"}
            </span>
          );
        }
        if (typeof value === "object") {
          return (
            <span className="font-mono text-xs">
              {JSON.stringify(value).slice(0, 50)}
              {JSON.stringify(value).length > 50 ? "..." : ""}
            </span>
          );
        }
        const stringValue = String(value);
        if (stringValue.length > 100) {
          return (
            <span title={stringValue}>{stringValue.slice(0, 100)}...</span>
          );
        }
        return stringValue;
      },
    }));
  }, [columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    pageCount,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
  });

  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);

  return (
    <div className="space-y-4">
      {/* Data Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap bg-muted/50"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap max-w-[300px] truncate"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="text-sm text-muted-foreground">
          {totalRows > 0 ? (
            <>
              Showing {startRow.toLocaleString()} to {endRow.toLocaleString()}{" "}
              of {totalRows.toLocaleString()} rows
            </>
          ) : (
            "No rows to display"
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {[25, 50, 100, 200].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-3 min-w-[100px] text-center">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= pageCount}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(pageCount)}
              disabled={currentPage >= pageCount}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
