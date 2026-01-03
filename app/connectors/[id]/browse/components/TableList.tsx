"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Table2, Eye, ChevronRight, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getTables } from "@/lib/backend/api";
import type { TableInfo } from "@/types/browse-data";

interface TableListProps {
  datasourceId: string;
  schema: string;
  onTableSelect: (table: string) => void;
}

export function TableList({
  datasourceId,
  schema,
  onTableSelect,
}: TableListProps) {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tables", datasourceId, schema],
    queryFn: () => getTables(datasourceId, schema),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load tables</p>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  const tables = response?.tables || [];

  if (tables.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Tables Found</h2>
        <p className="text-muted-foreground">
          The schema &quot;{schema}&quot; doesn&apos;t have any tables or views.
        </p>
      </div>
    );
  }

  const tableCount = tables.filter((t) => t.table_type === "TABLE").length;
  const viewCount = tables.filter((t) => t.table_type === "VIEW").length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Tables in {schema}</h2>
        <p className="text-sm text-muted-foreground">
          {tableCount} table{tableCount !== 1 ? "s" : ""}
          {viewCount > 0 &&
            `, ${viewCount} view${viewCount !== 1 ? "s" : ""}`}
        </p>
      </div>
      <div className="grid gap-3">
        {tables.map((table: TableInfo) => (
          <Card
            key={table.table_name}
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onTableSelect(table.table_name)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  {table.table_type === "VIEW" ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <Table2 className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{table.table_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {table.table_type}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
