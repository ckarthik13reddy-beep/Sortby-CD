"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Layers, ChevronRight, Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getSchemas } from "@/lib/backend/api";
import type { SchemaInfo } from "@/types/browse-data";

interface SchemaListProps {
  datasourceId: string;
  onSchemaSelect: (schema: string) => void;
}

export function SchemaList({ datasourceId, onSchemaSelect }: SchemaListProps) {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["schemas", datasourceId],
    queryFn: () => getSchemas(datasourceId),
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
        <p className="text-destructive">Failed to load schemas</p>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  const schemas = response?.schemas || [];

  if (schemas.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Schemas Found</h2>
        <p className="text-muted-foreground">
          This data source doesn&apos;t have any schemas available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Select a Schema ({schemas.length})
      </h2>
      <div className="grid gap-3">
        {schemas.map((schema: SchemaInfo) => (
          <Card
            key={schema.schema_name}
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSchemaSelect(schema.schema_name)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{schema.schema_name}</p>
                  {schema.catalog && (
                    <p className="text-sm text-muted-foreground">
                      Catalog: {schema.catalog}
                    </p>
                  )}
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
