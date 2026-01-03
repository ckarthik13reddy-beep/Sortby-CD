"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Loader2, ArrowLeft, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/sidebar";
import { getDataSource } from "@/lib/backend/api";
import type { DataSource } from "@/lib/backend/api";
import {
  BrowseBreadcrumb,
  SchemaList,
  TableList,
  TableDataView,
} from "./components";

export default function BrowseDataPage() {
  const params = useParams();
  const datasourceId = params.id as string;

  // URL state management with nuqs
  const [schema, setSchema] = useQueryState("schema");
  const [table, setTable] = useQueryState("table");

  // Local state
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDataSource = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const ds = await getDataSource(datasourceId);
      setDataSource(ds);
    } catch (err) {
      console.error("Error loading datasource:", err);
      setError(err instanceof Error ? err.message : "Failed to load data source");
    } finally {
      setLoading(false);
    }
  }, [datasourceId]);

  useEffect(() => {
    loadDataSource();
  }, [loadDataSource]);

  const handleSchemaSelect = (schemaName: string) => {
    setSchema(schemaName);
    setTable(null);
  };

  const handleTableSelect = (tableName: string) => {
    setTable(tableName);
  };

  const handleBreadcrumbNavigate = (level: "root" | "schema" | "table") => {
    switch (level) {
      case "root":
        setSchema(null);
        setTable(null);
        break;
      case "schema":
        setTable(null);
        break;
    }
  };

  // Determine current view level
  const getCurrentView = () => {
    if (schema && table) return "data";
    if (schema) return "tables";
    return "schemas";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/datasources")}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-muted-foreground">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="text-destructive">{error}</div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold truncate">
                      Browse Data - {dataSource?.name}
                    </h1>
                    <BrowseBreadcrumb
                      schema={schema}
                      table={table}
                      onNavigate={handleBreadcrumbNavigate}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Error state */}
            {error && !loading && (
              <div className="text-center py-12 border rounded-lg bg-destructive/10">
                <Database className="h-12 w-12 mx-auto text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-destructive">
                  Error Loading Data Source
                </h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => router.push("/datasources")}>
                  Back to Data Sources
                </Button>
              </div>
            )}

            {/* Content based on navigation level */}
            {!loading && !error && (
              <>
                {getCurrentView() === "schemas" && (
                  <SchemaList
                    datasourceId={datasourceId}
                    onSchemaSelect={handleSchemaSelect}
                  />
                )}

                {getCurrentView() === "tables" && schema && (
                  <TableList
                    datasourceId={datasourceId}
                    schema={schema}
                    onTableSelect={handleTableSelect}
                  />
                )}

                {getCurrentView() === "data" && schema && table && (
                  <TableDataView
                    datasourceId={datasourceId}
                    schema={schema}
                    table={table}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
