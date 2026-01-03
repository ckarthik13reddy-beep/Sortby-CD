"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { Loader2, AlertCircle } from "lucide-react";
import { getTablePreview, getTableDetails } from "@/lib/backend/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DataTablePreview } from "./DataTablePreview";

interface TableDataViewProps {
  datasourceId: string;
  schema: string;
  table: string;
}

export function TableDataView({
  datasourceId,
  schema,
  table,
}: TableDataViewProps) {
  // Pagination state in URL
  const [page, setPage] = useQueryState("page", { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState("pageSize", {
    defaultValue: "50",
  });

  const currentPage = parseInt(page) || 1;
  const currentPageSize = parseInt(pageSize) || 50;
  const offset = (currentPage - 1) * currentPageSize;

  // Fetch table details (columns)
  const {
    data: tableDetails,
    isLoading: detailsLoading,
    error: detailsError,
  } = useQuery({
    queryKey: ["tableDetails", datasourceId, schema, table],
    queryFn: () => getTableDetails(datasourceId, schema, table),
  });

  // Fetch preview data
  const {
    data: previewData,
    isLoading: previewLoading,
    error: previewError,
  } = useQuery({
    queryKey: [
      "tablePreview",
      datasourceId,
      schema,
      table,
      offset,
      currentPageSize,
    ],
    queryFn: () =>
      getTablePreview(datasourceId, schema, table, {
        offset,
        limit: currentPageSize,
      }),
  });

  const isLoading = detailsLoading || previewLoading;
  const error = detailsError || previewError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Failed to load table data</p>
              <p className="text-sm">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handlePageChange = (newPage: number) => {
    setPage(String(newPage));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(String(newSize));
    setPage("1"); // Reset to first page
  };

  const totalRows = previewData?.total_rows ?? 0;
  const pageCount = Math.ceil(totalRows / currentPageSize) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {table}
          <span className="text-xs px-2 py-0.5 bg-muted rounded-full font-normal">
            {tableDetails?.table_type}
          </span>
        </CardTitle>
        <CardDescription>
          {tableDetails?.columns.length || 0} columns
          {totalRows > 0 && ` | ${totalRows.toLocaleString()} total rows`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTablePreview
          data={previewData?.data || []}
          columns={tableDetails?.columns || []}
          pageCount={pageCount}
          currentPage={currentPage}
          pageSize={currentPageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          totalRows={totalRows}
        />
      </CardContent>
    </Card>
  );
}
