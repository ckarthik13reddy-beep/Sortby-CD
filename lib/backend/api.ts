/**
 * API client for backend - Vanna 2.0
 */

import { appConfig } from './config';

// Use centralized config for API URL
const API_BASE_URL = appConfig.apiUrl;

export interface ChatRequest {
  question: string;
  execute_query?: boolean;
}

export interface ChartConfig {
  chart_type: 'card' | 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'table';
  x_axis: string | null;
  y_axes: string[];
  title: string;
  description?: string;
}

export interface ChatResponse {
  success: boolean;
  question: string;
  sql?: string;
  data?: Array<Record<string, unknown>>;
  columns?: string[];
  row_count?: number;
  chart_config?: ChartConfig;
  error?: string;
  timestamp?: string;
}

// Vanna 2.0 SSE Event Types
export interface StatusBarUpdate {
  type: 'status_bar_update';
  status: 'idle' | 'working' | 'error';
  message: string;
  detail?: string;
  timestamp?: string;
}

export interface TaskUpdate {
  type: 'task_tracker_update';
  operation: 'add_task' | 'update_task' | 'complete_task';
  task?: {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress?: number;
  };
  task_id?: string;
  status?: string;
  timestamp?: string;
}

export interface ToolCall {
  type: 'tool_call';
  tool_name: string;
  args: Record<string, unknown>;
  timestamp?: string;
}

export interface ToolResult {
  type: 'tool_result';
  tool_name: string;
  result: unknown;
  timestamp?: string;
}

export interface TextMessage {
  type: 'text';
  content: string;
  text?: string;
  markdown?: boolean;
  timestamp?: string;
}

export interface ChatInputUpdate {
  type: 'chat_input_update';
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  focus?: boolean;
  timestamp?: string;
}

export interface ErrorEvent {
  type: 'error';
  error: string;
  error_type?: string;
  timestamp?: string;
}

export interface CompleteEvent {
  type: 'complete';
}

export type SSEEvent =
  | StatusBarUpdate
  | TaskUpdate
  | ToolCall
  | ToolResult
  | TextMessage
  | ChatInputUpdate
  | ErrorEvent
  | CompleteEvent;

export interface AutoTrainResponse {
  success: boolean;
  message?: string;
  results?: Array<{
    type: string;
    result: {
      success: boolean;
      message?: string;
      error?: string;
    };
  }>;
  total_operations?: number;
}

export interface Dashboard {
  id?: string;
  name: string;
  dashboard_name?: string; // Backend field name
  description?: string;
  views?: DashboardView[];
  created_at?: string;
  updated_at?: string;
}

// Plotly configuration structure from backend
export interface PlotlyConfig {
  data: PlotlyTrace[];
  layout: Partial<PlotlyLayout>;
  config: Partial<PlotlyChartConfig>;
}

export interface PlotlyTrace {
  type?: string;
  x?: Array<string | number>;
  y?: Array<number>;
  name?: string;
  marker?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PlotlyLayout {
  title?: string | { text?: string };
  xaxis?: { title?: string | { text?: string } };
  yaxis?: { title?: string | { text?: string } };
  [key: string]: unknown;
}

export interface PlotlyChartConfig {
  responsive?: boolean;
  displayModeBar?: boolean;
  [key: string]: unknown;
}

// Vega-Lite encoding channel definition
export interface VegaLiteEncodingChannel {
  field: string;
  type: string;
  title?: string;
}

// Vega-Lite encoding specification
export interface VegaLiteEncoding {
  x?: VegaLiteEncodingChannel | null;
  y?: VegaLiteEncodingChannel | null;
  theta?: VegaLiteEncodingChannel | null;
  color?: VegaLiteEncodingChannel | null;
}

// Dashboard View with Vega-Lite specification (new format)
export interface DashboardView {
  view_id: string;
  sql: string;
  title: string;
  question: string | null;
  mark: string;
  encoding: VegaLiteEncoding;
  data: Array<Record<string, unknown>>;
  created_at: string;
  // Deprecated - kept for backward compatibility during migration
  chart_type?: string;
  plotly_config?: PlotlyConfig;
}

// Request type for adding a view - follows Vega-Lite spec format
export interface AddViewRequest {
  sql: string;
  question?: string;
  title?: string;
  mark: string;
  encoding: Record<string, unknown>;
  data: Record<string, unknown>[]; // Flat array of data values
}

// Response from getDashboardViews
export interface DashboardViewsResponse {
  success: boolean;
  dashboard_id: string;
  dashboard_name: string;
  views: DashboardView[];
  error?: string;
}

// Vanna 2.0 API Types (nested response format)
export interface VannaV2Chunk {
  rich?: {
    id: string;
    type: 'user-message' | 'assistant-message' | 'text' | 'completion' | 'error' |
          'status_bar_update' | 'task_tracker_update' | 'chat_input_update' | string;
    lifecycle?: 'create' | 'update' | 'replace' | 'remove';
    data: {
      content?: string;
      sender?: 'user' | 'assistant';
      message?: string;
      status?: string;
      markdown?: boolean;
      [key: string]: unknown;
    };
    children?: unknown[];
    timestamp?: string;
    visible?: boolean;
    interactive?: boolean;
  };
  simple?: {
    text?: string;
    status?: string;
  };
  conversation_id?: string;
  request_id?: string;
}

export interface VannaV2Request {
  message: string;
  conversation_id: string;
  request_id: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send a chat query using SSE streaming for progressive updates
 *
 * @param request - The chat request
 * @param accessToken - JWT access token for authentication
 * @param onEvent - Callback for each SSE event
 */
export async function chatQueryStream(
  request: ChatRequest,
  onEvent: (event: SSEEvent) => void,
  accessToken?: string
): Promise<void> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/chat/query`, {
    method: 'POST',
    headers,
    credentials: 'include', // Include cookies for Vanna authentication
    body: JSON.stringify({
      question: request.question,
      execute_query: request.execute_query ?? true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorData.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No reader available');
  }

  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || line.startsWith(':')) continue;

        if (line.startsWith('data:')) {
          try {
            const event: SSEEvent = JSON.parse(line.substring(5).trim());
            // Event already has proper type field from backend
            onEvent(event);
          } catch (error) {
            console.error('Error parsing SSE data:', error, line);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Send a chat query using simple non-streaming API
 *
 * @param request - The chat request
 * @param accessToken - JWT access token for authentication
 */
export async function chatQuerySimple(
  request: ChatRequest,
  accessToken?: string
): Promise<ChatResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/chat/query-simple`, {
    method: 'POST',
    headers,
    credentials: 'include', // Include cookies for Vanna authentication
    body: JSON.stringify({
      question: request.question,
      execute_query: request.execute_query ?? true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorData.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data: ChatResponse = await response.json();

  if (!data.success && data.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Legacy function for backward compatibility
 * Now uses the simple non-streaming endpoint
 */
export async function chatQuery(
  request: ChatRequest,
  accessToken?: string
): Promise<ChatResponse> {
  return chatQuerySimple(request, accessToken);
}

/**
 * Generate a unique ID for conversations or requests
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Send a chat query using Vanna 2.0 SSE streaming API
 *
 * @param request - The chat request with question and optional IDs
 * @param onChunk - Callback for each SSE chunk
 * @param accessToken - JWT access token for authentication
 */
export async function chatQueryStreamV2(
  request: {
    question: string;
    conversation_id?: string;
    request_id?: string;
  },
  onChunk: (chunk: VannaV2Chunk) => void,
  accessToken?: string
): Promise<void> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Generate IDs if not provided (session-only)
  const conversationId = request.conversation_id || generateId();
  const requestId = request.request_id || generateId();

  const response = await fetch(`${API_BASE_URL}/api/vanna/v2/chat_sse`, {
    method: 'POST',
    headers,
    credentials: 'include', // Include cookies for Vanna authentication
    body: JSON.stringify({
      message: request.question,
      conversation_id: conversationId,
      request_id: requestId,
      metadata: {}
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorData.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No reader available');
  }

  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || line.startsWith(':')) continue;

        if (line.startsWith('data:')) {
          const data = line.substring(5).trim();

          // Check for completion signal
          if (data === '[DONE]') {
            return;
          }

          try {
            const chunk: VannaV2Chunk = JSON.parse(data);
            onChunk(chunk);
          } catch (error) {
            console.error('Error parsing SSE chunk:', error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Trigger auto-training of the model
 *
 * @param accessToken - Optional JWT access token for authentication
 */
export async function autoTrain(accessToken?: string): Promise<AutoTrainResponse> {
  const headers: HeadersInit = {};

  // Add authorization header if token is provided
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/auto-train`, {
    method: 'POST',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Check backend health
 *
 * @param accessToken - Optional JWT access token for authentication
 */
export async function checkHealth(accessToken?: string): Promise<{ status: string }> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/health`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Create a new dashboard
 */
export async function createDashboard(dashboard: Dashboard, accessToken?: string): Promise<Dashboard> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const payload = {
    dashboard_name: dashboard.name,
  };

  console.log('Creating dashboard with payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;

    try {
      const errorData = JSON.parse(text);
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errors = errorData.detail.map((err: { msg: string }) => err.msg).join(', ');
        errorMessage = errors;
      } else {
        errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
      }
    } catch {
      errorMessage = text || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get all dashboards
 */
export async function getDashboards(accessToken?: string): Promise<Dashboard[]> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get a specific dashboard by ID
 */
export async function getDashboard(dashboardId: string, accessToken?: string): Promise<Dashboard> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard/${dashboardId}`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Update a dashboard
 */
export async function updateDashboard(
  dashboardId: string,
  dashboard: Partial<Dashboard>,
  accessToken?: string
): Promise<Dashboard> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard/${dashboardId}`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(dashboard),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Delete a dashboard
 */
export async function deleteDashboard(dashboardId: string, accessToken?: string): Promise<void> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard/${dashboardId}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

/**
 * Get dashboard views - returns clean flattened structure from backend
 */
export async function getDashboardViews(
  dashboardId: string,
  accessToken?: string
): Promise<DashboardViewsResponse> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard/${dashboardId}/views`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data: DashboardViewsResponse = await response.json();
  return data;
}

/**
 * Add a view to a dashboard
 */
export async function addDashboardView(
  dashboardId: string,
  view: AddViewRequest,
  accessToken?: string
): Promise<DashboardView> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard/${dashboardId}/views`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(view),
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get a specific view
 */
export async function getDashboardView(
  dashboardId: string,
  viewId: string,
  accessToken?: string
): Promise<DashboardView> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard/${dashboardId}/views/${viewId}`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Update a view
 */
export async function updateDashboardView(
  dashboardId: string,
  viewId: string,
  view: AddViewRequest,
  accessToken?: string
): Promise<DashboardView> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard/${dashboardId}/views/${viewId}`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(view),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Delete a view
 */
export async function deleteDashboardView(
  dashboardId: string,
  viewId: string,
  accessToken?: string
): Promise<void> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard/${dashboardId}/views/${viewId}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

/**
 * Batch add multiple views
 */
export async function batchAddDashboardViews(
  dashboardId: string,
  views: AddViewRequest[],
  accessToken?: string
): Promise<DashboardView[]> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard/${dashboardId}/views/batch`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(views),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Clear all views from a dashboard
 */
export async function clearDashboardViews(
  dashboardId: string,
  accessToken?: string
): Promise<void> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/dashboard/${dashboardId}/views`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// ============================================
// Data Sources API
// ============================================

export interface DataSource {
  id: string;
  name: string;
  connector_type: string;
  is_default: boolean;
  is_active: boolean;
  description?: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ConnectorMetadata {
  type: string;
  display_name: string;
  implemented: boolean;
  description: string;
}

export interface ConnectorsResponse {
  connectors: ConnectorMetadata[];
}

export interface TestConnectionRequest {
  connector_type: string;
  config: Record<string, unknown>;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  version?: string;
  connector_type: string;
}

export interface CreateDataSourceRequest {
  name: string;
  connector_type: string;
  is_default?: boolean;
  is_active?: boolean;
  description?: string;
  config: Record<string, unknown>;
}

export interface UpdateDataSourceRequest {
  name?: string;
  is_default?: boolean;
  is_active?: boolean;
  description?: string;
  config?: Record<string, unknown>;
}

// Synapse-specific config
export interface SynapseConfig {
  server: string;
  database: string;
  username: string;
  password: string;
  driver?: string;
  port?: number;
  max_rows?: number;
}

// PostgreSQL-specific config
export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  max_rows?: number;
}

/**
 * Get available database connectors
 */
export async function getConnectors(accessToken?: string): Promise<ConnectorsResponse> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/datasources/connectors`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Test a database connection without saving
 */
export async function testDataSourceConnection(
  request: TestConnectionRequest,
  accessToken?: string
): Promise<TestConnectionResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/datasources/test`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Create a new data source
 */
export async function createDataSource(
  request: CreateDataSourceRequest,
  accessToken?: string
): Promise<DataSource> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/datasources`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get all data sources
 */
export async function getDataSources(
  activeOnly: boolean = false,
  accessToken?: string
): Promise<DataSource[]> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = `${API_BASE_URL}/api/datasources?active_only=${activeOnly}`;
  const response = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get a specific data source by ID
 */
export async function getDataSource(
  id: string,
  accessToken?: string
): Promise<DataSource> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/datasources/${id}`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Update a data source
 */
export async function updateDataSource(
  id: string,
  request: UpdateDataSourceRequest,
  accessToken?: string
): Promise<DataSource> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/datasources/${id}`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Delete a data source
 */
export async function deleteDataSource(
  id: string,
  accessToken?: string
): Promise<void> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/datasources/${id}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }
}

// ============================================
// Unified AI Agent API
// ============================================

export interface UnifiedChatRequest {
  message: string;
  dashboard_id?: string;
  view_id?: string;
  conversation_id?: string;
}

export interface UnifiedChatResponse {
  success: boolean;
  message: string;
  operation: string;
  routing_confidence?: string;
  conversation_id?: string;
  error?: string;
  timestamp?: string;
}

/**
 * Send a message to the unified AI agent
 */
export async function unifiedAgentChat(
  request: UnifiedChatRequest,
  accessToken?: string
): Promise<UnifiedChatResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorData.error || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// ============================================
// Browse Data API
// ============================================

import type {
  SchemaListResponse,
  TableListResponse,
  TableDetailResponse,
  PreviewDataResponse,
} from "@/types/browse-data";

/**
 * Get all schemas for a data source
 */
export async function getSchemas(
  datasourceId: string,
  accessToken?: string
): Promise<SchemaListResponse> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/datasources/${datasourceId}/schemas`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get tables for a schema in a data source
 */
export async function getTables(
  datasourceId: string,
  schema: string,
  accessToken?: string
): Promise<TableListResponse> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/datasources/${datasourceId}/schemas/${encodeURIComponent(schema)}/tables`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get table details including columns
 */
export async function getTableDetails(
  datasourceId: string,
  schema: string,
  table: string,
  accessToken?: string
): Promise<TableDetailResponse> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/datasources/${datasourceId}/schemas/${encodeURIComponent(schema)}/tables/${encodeURIComponent(table)}`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get preview data for a table with pagination
 */
export async function getTablePreview(
  datasourceId: string,
  schema: string,
  table: string,
  options?: { offset?: number; limit?: number },
  accessToken?: string
): Promise<PreviewDataResponse> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const params = new URLSearchParams();
  if (options?.offset !== undefined) {
    params.set("offset", String(options.offset));
  }
  if (options?.limit !== undefined) {
    params.set("limit", String(options.limit));
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/datasources/${datasourceId}/schemas/${encodeURIComponent(schema)}/tables/${encodeURIComponent(table)}/preview${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}