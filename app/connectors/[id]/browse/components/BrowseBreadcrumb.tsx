"use client";

import { ChevronRight, Database, Layers, Table2 } from "lucide-react";

interface BrowseBreadcrumbProps {
  schema: string | null;
  table: string | null;
  onNavigate: (level: "root" | "schema" | "table") => void;
}

export function BrowseBreadcrumb({
  schema,
  table,
  onNavigate,
}: BrowseBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
      <button
        onClick={() => onNavigate("root")}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Database className="h-4 w-4" />
        <span>Schemas</span>
      </button>

      {schema && (
        <>
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={() => onNavigate("schema")}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Layers className="h-4 w-4" />
            <span>{schema}</span>
          </button>
        </>
      )}

      {table && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="flex items-center gap-1 text-foreground">
            <Table2 className="h-4 w-4" />
            <span>{table}</span>
          </span>
        </>
      )}
    </nav>
  );
}
