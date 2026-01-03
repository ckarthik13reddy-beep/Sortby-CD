# Backend Integration Guide

## Overview
This document describes the backend integration completed and steps remaining to fully connect the UI to the backend API.

## ✅ Completed Steps

### 1. Backend Analysis
- **Backend Tech Stack**: Next.js 15.5.6, React 19, @assistant-ui/react, AWS Cognito Auth
- **API Base**: Configured via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`)
- **Authentication**: NextAuth with AWS Cognito (Google federated)
- **Main API File**: 1447 lines with 30+ functions in `lib/backend/api.ts`

### 2. Files Copied from Backend
```
✅ lib/backend/api.ts - Complete API client with all endpoints
✅ lib/backend/config.ts - App configuration
✅ lib/types/browse-data.ts - Browse data types
✅ lib/types/data-table.ts - Data table types
✅ lib/types/team.ts - Team types
✅ app/api/auth/[...nextauth]/route.ts - NextAuth handler
✅ app/login/auth-config.ts - Cognito auth configuration
✅ app/chat/lib/runtime-provider.tsx - Chat streaming provider
✅ app/chat/components/thread.tsx - Chat UI with @assistant-ui/react
✅ app/chat/components/markdown-text.tsx - Markdown renderer
✅ lib/auth-provider.tsx - SessionProvider wrapper
✅ types/next-auth.d.ts - NextAuth type extensions
```

### 3. Dependencies Installed
```bash
npm install --legacy-peer-deps @assistant-ui/react @tanstack/react-query
```

### 4. Environment Variables Updated
`.env.local` now includes:
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `COGNITO_CLIENT_ID` - AWS Cognito client ID
- `COGNITO_DOMAIN` - Cognito hosted UI domain
- `COGNITO_ISSUER` - Cognito issuer URL
- `NEXTAUTH_SECRET` - NextAuth encryption key
- `NEXTAUTH_URL` - Frontend URL
- `NEXT_PUBLIC_APP_NAME` - Application name

### 5. Layout Updated
- Added `AuthProvider` wrapping entire app in `app/layout.tsx`
- Authentication session now available via `useSession()` hook

### 6. Chat Integration Complete
- Replaced old chat with `@assistant-ui/react` streaming chat
- Uses `chatQueryStreamV2` API endpoint
- Full SSE (Server-Sent Events) streaming support
- Authenticates with `session.idToken`

## 🔄 Backend API Functions Available

### Chat APIs
- `chatQueryStreamV2(request, onChunk, accessToken)` - SSE streaming chat
- `chatQueryStream(request, onEvent, accessToken)` - Original SSE stream
- `chatQuerySimple(request, accessToken)` - Non-streaming chat
- `unifiedAgentChat(request, accessToken)` - Unified agent endpoint

### Dashboard APIs
- `getDashboards(accessToken)` - List all dashboards
- `createDashboard(dashboard, accessToken)` - Create dashboard
- `getDashboard(dashboardId, accessToken)` - Get single dashboard
- `updateDashboard(dashboardId, updates, accessToken)` - Update dashboard
- `deleteDashboard(dashboardId, accessToken)` - Delete dashboard
- `getDashboardViews(dashboardId, accessToken)` - Get dashboard views/charts
- `addDashboardView(dashboardId, view, accessToken)` - Add chart to dashboard
- `updateDashboardView(dashboardId, viewId, view, accessToken)` - Update chart
- `deleteDashboardView(dashboardId, viewId, accessToken)` - Remove chart
- `batchAddDashboardViews(dashboardId, views, accessToken)` - Add multiple charts
- `clearDashboardViews(dashboardId, accessToken)` - Clear all charts

### Data Source (Connector) APIs
- `getConnectors(accessToken)` - List available connector types
- `getDataSources(accessToken)` - List configured data sources
- `getDataSource(datasourceId, accessToken)` - Get single data source
- `createDataSource(datasource, accessToken)` - Create data source connection
- `updateDataSource(datasourceId, updates, accessToken)` - Update data source
- `deleteDataSource(datasourceId, accessToken)` - Delete data source
- `testDataSourceConnection(datasource, accessToken)` - Test connection

### Browse Data APIs
- `getSchemas(datasourceId, accessToken)` - List schemas in data source
- `getTables(datasourceId, schema, accessToken)` - List tables in schema
- `getTableDetails(datasourceId, schema, table, accessToken)` - Get table columns
- `getTablePreview(datasourceId, schema, table, options, accessToken)` - Preview table data

### Training APIs
- `autoTrain(accessToken)` - Auto-train AI on data source
- `checkHealth(accessToken)` - Health check endpoint

## 📋 Remaining Integration Tasks

### Task 1: Dashboard Page Integration
**File**: `app/dashboard/page.tsx`

**Current State**: Uses Zustand store with local state

**Changes Needed**:
```typescript
import { useSession } from "next-auth/react";
import { getDashboards, createDashboard, deleteDashboard } from "@/lib/backend/api";

// Replace local state with API calls
const { data: session } = useSession();
const accessToken = session?.idToken;

// On mount, fetch dashboards
useEffect(() => {
  if (accessToken) {
    getDashboards(accessToken).then(setDashboards);
  }
}, [accessToken]);

// Create dashboard
const handleCreate = async () => {
  const dashboard = await createDashboard({ name, description }, accessToken);
  // Update state
};
```

### Task 2: Dashboard Detail Page Integration
**File**: `app/dashboard/[dashboardId]/page.tsx`

**Changes Needed**:
```typescript
import { getDashboard, getDashboardViews, addDashboardView } from "@/lib/backend/api";

// Fetch dashboard and charts
useEffect(() => {
  if (accessToken && dashboardId) {
    getDashboard(dashboardId, accessToken).then(setDashboard);
    getDashboardViews(dashboardId, accessToken).then(setCharts);
  }
}, [accessToken, dashboardId]);
```

### Task 3: Connectors Page Integration
**File**: `app/connectors/page.tsx`

**Current State**: Static connector cards

**Changes Needed**:
```typescript
import { getDataSources, getConnectors, createDataSource } from "@/lib/backend/api";

// Fetch configured data sources
useEffect(() => {
  if (accessToken) {
    getDataSources(accessToken).then(setDataSources);
    getConnectors(accessToken).then(setAvailableConnectors);
  }
}, [accessToken]);

// Add connection dialog with form
const handleConnect = async (config) => {
  await createDataSource(config, accessToken);
};
```

### Task 4: Add Browse Data Feature
**New File**: `app/connectors/[id]/browse/page.tsx`

**Implementation**: Copy from backend's `src/app/datasources/[id]/browse/page.tsx`

**Features**:
- Schema browser
- Table list
- Table details with columns
- Data preview with pagination

**Components to Copy**:
```
src/app/datasources/[id]/browse/components/SchemaList.tsx
src/app/datasources/[id]/browse/components/TableList.tsx
src/app/datasources/[id]/browse/components/TableDataView.tsx
src/app/datasources/[id]/browse/components/DataTablePreview.tsx
src/app/datasources/[id]/browse/components/BrowseBreadcrumb.tsx
```

### Task 5: Add Training Feature
**New File**: `app/settings/training/page.tsx`

**Implementation**:
```typescript
import { autoTrain } from "@/lib/backend/api";

const handleAutoTrain = async () => {
  setLoading(true);
  try {
    const result = await autoTrain(accessToken);
    showSuccess(`Trained on ${result.count} items`);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Task 6: Authentication Guards
**Files**: All page components

**Add to each page**:
```typescript
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const { data: session, status } = useSession();
const router = useRouter();

useEffect(() => {
  if (status === "unauthenticated") {
    router.push("/login");
  }
}, [status, router]);

if (status === "loading") {
  return <LoadingSpinner />;
}
```

### Task 7: Features Without Backend (Keep UI-Only)

These features don't have backend APIs yet. Add TODO comments:

**Files to Mark**:
- `app/notebooks/page.tsx` - Add: `// TODO: Backend API integration pending`
- `app/files/page.tsx` - Add: `// TODO: Backend API integration pending`
- `app/team/[teamId]/*` - Add: `// TODO: Backend API integration pending`
- `app/settings/semantic-layer/page.tsx` - Add: `// TODO: Backend API integration pending`
- `app/agents/page.tsx` - Add: `// TODO: Backend API integration pending`

## 🔧 Configuration Required

### Backend API Server
The frontend expects a backend API server running at `NEXT_PUBLIC_API_URL` with these endpoints:

**Base URL**: `http://localhost:8000` (configurable)

**Endpoints**:
```
POST /api/ai/chat - Chat with streaming response
POST /api/chat/query - Original chat endpoint
POST /api/chat/query-simple - Non-streaming chat

GET /api/dashboards - List dashboards
POST /api/dashboards - Create dashboard
GET /api/dashboards/{id} - Get dashboard
PUT /api/dashboards/{id} - Update dashboard
DELETE /api/dashboards/{id} - Delete dashboard
GET /api/dashboards/{id}/views - Get dashboard charts
POST /api/dashboards/{id}/views - Add chart
PUT /api/dashboards/{id}/views/{viewId} - Update chart
DELETE /api/dashboards/{id}/views/{viewId} - Delete chart

GET /api/datasources - List data sources
POST /api/datasources - Create data source
GET /api/datasources/{id} - Get data source
PUT /api/datasources/{id} - Update data source
DELETE /api/datasources/{id} - Delete data source
POST /api/datasources/test-connection - Test connection

GET /api/datasources/{id}/schemas - List schemas
GET /api/datasources/{id}/schemas/{schema}/tables - List tables
GET /api/datasources/{id}/schemas/{schema}/tables/{table} - Table details
GET /api/datasources/{id}/schemas/{schema}/tables/{table}/preview - Preview data

POST /api/auto-train - Auto-train AI
GET /api/health - Health check
```

### AWS Cognito Setup
1. Create Cognito User Pool
2. Create App Client (public client, no secret needed)
3. Configure Google as identity provider
4. Set up hosted UI domain
5. Add callback URL: `http://localhost:3000/api/auth/callback/cognito`
6. Copy credentials to `.env.local`

## 🚀 Testing Plan

### 1. Authentication Test
```bash
# Start app
npm run dev

# Navigate to http://localhost:3000
# Should redirect to Cognito login
# Login with Google
# Should redirect back to app with session
```

### 2. Chat Test
```bash
# Ensure backend API is running at NEXT_PUBLIC_API_URL
# Go to /chat
# Type a question
# Verify streaming response appears
# Check Network tab for SSE connection
```

### 3. Dashboard Test
```bash
# Go to /dashboard
# Click "Create Dashboard"
# Verify API call to POST /api/dashboards
# Verify dashboard appears in list
```

### 4. Connectors Test
```bash
# Go to /connectors
# Verify configured data sources load
# Click "Connect New Source"
# Test connection
# Create data source
```

## 📦 Quick Integration Commands

```bash
# Copy backend browse feature
cp -r /Users/karthikreddy/vanna-backend-analysis/src/app/datasources/[id]/browse app/connectors/[id]/

# Install any missing UI components from backend
cp -r /Users/karthikreddy/vanna-backend-analysis/src/components/ui/* components/ui/

# Copy training page
mkdir -p app/settings/training
cp /Users/karthikreddy/vanna-backend-analysis/src/app/training/page.tsx app/settings/training/

# Test the build
npm run build
```

## 🐛 Troubleshooting

### Error: "fetch failed" or "ECONNREFUSED"
- Backend API not running at `NEXT_PUBLIC_API_URL`
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Start backend API server

### Error: "Unauthorized" or 401
- Not logged in
- Invalid Cognito configuration
- Check `.env.local` Cognito settings
- Verify callback URL in Cognito console

### Error: "Module not found @assistant-ui/react"
```bash
npm install --legacy-peer-deps @assistant-ui/react
```

### Error: Build fails with type errors
- Check TypeScript errors: `npm run lint`
- May need to upgrade React types or Next.js version

## 📄 Next Steps

1. **Configure AWS Cognito** - Set up authentication
2. **Start Backend API** - Ensure it's running at port 8000
3. **Update Dashboard Page** - Integrate getDashboards API
4. **Update Connectors Page** - Integrate getDataSources API
5. **Copy Browse Feature** - Add data browsing capability
6. **Add Auth Guards** - Protect all routes
7. **Test Everything** - Full end-to-end testing
8. **Deploy** - Push to production

## 🔗 Useful Links

- Backend Repo: https://github.com/VinayakRamavath/vanna-integ-fe
- UI Repo: https://github.com/ckarthik13reddy-beep/Sortby-CD
- NextAuth Docs: https://next-auth.js.org
- @assistant-ui/react: https://www.assistant-ui.com
- AWS Cognito: https://aws.amazon.com/cognito

## 📝 Notes

- Current UI is on Next.js 14 / React 18
- Backend is on Next.js 15 / React 19
- Consider upgrading UI to match backend versions
- Some features (notebooks, files, team, semantic layer) are UI-only currently
- All backend APIs use Bearer token authentication with Cognito ID token
