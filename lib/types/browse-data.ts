// Schema information from API
export interface SchemaInfo {
  schema_name: string;
  catalog: string | null;
}

export interface SchemaListResponse {
  schemas: SchemaInfo[];
}

// Table information from API
export interface TableInfo {
  table_name: string;
  table_type: "TABLE" | "VIEW";
  schema_name: string;
}

export interface TableListResponse {
  tables: TableInfo[];
}

// Column information from API
export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  ordinal_position: number;
  character_maximum_length: number | null;
}

// Table detail response from API
export interface TableDetailResponse {
  schema_name: string;
  table_name: string;
  table_type: "TABLE" | "VIEW";
  columns: ColumnInfo[];
}

// Preview data response from API
export interface PreviewDataResponse {
  schema_name: string;
  table_name: string;
  columns: string[];
  data: Record<string, unknown>[];
  row_count: number;
  total_rows: number | null;
  offset: number;
  limit: number;
  has_more: boolean;
}
