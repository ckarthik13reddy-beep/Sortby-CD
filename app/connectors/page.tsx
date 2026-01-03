"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Database,
  Plus,
  Search,
  Loader2,
  Server,
  Cloud,
  Mountain,
  Boxes,
  AlertCircle,
  X,
  Star,
  Trash2,
  Eye,
  Check,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ConnectorLogo } from "@/components/connectors/connector-logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DataSource,
  ConnectorMetadata,
  getConnectors,
  getDataSources,
  createDataSource,
  updateDataSource,
  deleteDataSource,
  testDataSourceConnection,
} from "@/lib/backend/api";

// Map connector types to UI icons
const getConnectorIcon = (type: string): React.ReactNode => {
  switch (type) {
    case "synapse":
      return <Server className="h-8 w-8" />;
    case "postgres":
      return <Database className="h-8 w-8" />;
    case "postgresql":
      return <Database className="h-8 w-8" />;
    case "mysql":
      return <Database className="h-8 w-8" />;
    case "mssql":
      return <Server className="h-8 w-8" />;
    case "snowflake":
      return <Mountain className="h-8 w-8" />;
    case "bigquery":
      return <Cloud className="h-8 w-8" />;
    case "oracle":
      return <Boxes className="h-8 w-8" />;
    default:
      return <Database className="h-8 w-8" />;
  }
};

// Fallback connectors for UI
const fallbackConnectors = [
  {
    type: "postgres",
    display_name: "PostgreSQL",
    description: "Connect to PostgreSQL database",
    implemented: true,
  },
  {
    type: "mysql",
    display_name: "MySQL",
    description: "MySQL database connector",
    implemented: false,
  },
  {
    type: "snowflake",
    display_name: "Snowflake",
    description: "Snowflake data warehouse",
    implemented: false,
  },
  {
    type: "bigquery",
    display_name: "BigQuery",
    description: "Google BigQuery",
    implemented: false,
  },
];

type TestStatus = "idle" | "testing" | "success" | "error";

export default function ConnectorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [connectors, setConnectors] = useState<ConnectorMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [selectedConnector, setSelectedConnector] = useState<ConnectorMetadata | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState<string>("");

  // View mode: 'browse' or 'connections'
  const [viewMode, setViewMode] = useState<"browse" | "connections">("browse");

  // Form data
  const [formData, setFormData] = useState({
    displayName: "",
    description: "",
    isDefault: true,
  });

  // PostgreSQL config
  const [postgresConfig, setPostgresConfig] = useState({
    host: "",
    port: 5432,
    database: "",
    username: "",
    password: "",
    max_rows: 1000,
  });

  // Synapse config
  const [synapseConfig, setSynapseConfig] = useState({
    server: "",
    database: "",
    username: "",
    password: "",
    driver: "ODBC Driver 18 for SQL Server",
    max_rows: 1000,
  });

  // Load data sources and connectors
  const loadData = useCallback(async () => {
    if (!session?.idToken) return;

    try {
      setLoading(true);
      setError(null);

      const accessToken = session.idToken;

      // Load connectors and data sources
      const [connectorsRes, dataSourcesRes] = await Promise.all([
        getConnectors(accessToken).catch(() => ({ connectors: fallbackConnectors })),
        getDataSources(accessToken).catch(() => []),
      ]);

      const connectorsList = connectorsRes?.connectors || fallbackConnectors;
      setConnectors(Array.isArray(connectorsList) ? connectorsList : fallbackConnectors);
      setDataSources(Array.isArray(dataSourcesRes) ? dataSourcesRes : []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data sources");
      setConnectors(fallbackConnectors);
    } finally {
      setLoading(false);
    }
  }, [session?.idToken]);

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status, loadData]);

  // Handle connector selection
  const handleConnectorClick = (connector: ConnectorMetadata) => {
    if (connector.implemented) {
      setSelectedConnector(connector);
      setShowConnectionDialog(true);
      setTestStatus("idle");
      setTestMessage("");
      setFormData({
        displayName: "",
        description: "",
        isDefault: dataSources.length === 0,
      });
      setPostgresConfig({
        host: "",
        port: 5432,
        database: "",
        username: "",
        password: "",
        max_rows: 1000,
      });
      setSynapseConfig({
        server: "",
        database: "",
        username: "",
        password: "",
        driver: "ODBC Driver 18 for SQL Server",
        max_rows: 1000,
      });
    }
  };

  // Get config based on connector type
  const getConfig = () => {
    if (!selectedConnector) return {};
    
    switch (selectedConnector.type) {
      case "postgres":
      case "postgresql":
        return postgresConfig;
      case "synapse":
        return synapseConfig;
      default:
        return {};
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    if (!selectedConnector || !session?.idToken) return;

    setTestStatus("testing");
    setTestMessage("");

    try {
      const result = await testDataSourceConnection(
        {
          connector_type: selectedConnector.type,
          config: getConfig(),
        },
        session.idToken
      );

      if (result.success) {
        setTestStatus("success");
        setTestMessage(result.message + (result.version ? ` (${result.version})` : ""));
      } else {
        setTestStatus("error");
        setTestMessage(result.message);
      }
    } catch (err) {
      setTestStatus("error");
      setTestMessage(err instanceof Error ? err.message : "Connection test failed");
    }
  };

  // Create connection
  const handleConnect = async () => {
    if (!selectedConnector || !formData.displayName || !session?.idToken) return;

    setIsConnecting(true);
    try {
      await createDataSource(
        {
          name: formData.displayName,
          connector_type: selectedConnector.type,
          description: formData.description || undefined,
          is_default: formData.isDefault,
          is_active: true,
          config: getConfig(),
        },
        session.idToken
      );

      setShowConnectionDialog(false);
      await loadData();
      setViewMode("connections");
    } catch (err) {
      console.error("Error creating data source:", err);
      setError(err instanceof Error ? err.message : "Failed to create data source");
    } finally {
      setIsConnecting(false);
    }
  };

  // Set default data source
  const handleSetDefault = async (id: string) => {
    if (!session?.idToken) return;

    try {
      await updateDataSource(id, { is_default: true }, session.idToken);
      await loadData();
    } catch (err) {
      console.error("Error setting default:", err);
      setError(err instanceof Error ? err.message : "Failed to set default");
    }
  };

  // Delete data source
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete data source "${name}"? This cannot be undone.`)) return;
    if (!session?.idToken) return;

    try {
      await deleteDataSource(id, session.idToken);
      await loadData();
    } catch (err) {
      console.error("Error deleting data source:", err);
      setError(err instanceof Error ? err.message : "Failed to delete data source");
    }
  };

  // Filter connectors
  const filteredConnectors = connectors.filter((c) =>
    c.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading state
  if (status === "loading") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  // Redirect to login
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="border-b bg-white dark:bg-gray-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Data Connectors</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {viewMode === "browse"
                    ? "Browse and connect to data sources"
                    : "Manage your active connections"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "browse" ? "default" : "outline"}
                onClick={() => setViewMode("browse")}
              >
                Browse Connectors
              </Button>
              <Button
                variant={viewMode === "connections" ? "default" : "outline"}
                onClick={() => setViewMode("connections")}
              >
                My Connections ({dataSources.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-red-600 dark:text-red-400">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : viewMode === "browse" ? (
            <>
              {/* Search */}
              <div className="mb-6 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search connectors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Empty State */}
              {filteredConnectors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Database className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No connectors found</p>
                </div>
              ) : (
                /* Connectors Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredConnectors.map((connector) => (
                    <Card
                      key={connector.type}
                      className={`p-6 hover:shadow-lg transition-all cursor-pointer group ${
                        connector.implemented
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50 dark:bg-gray-900/50 opacity-60"
                      }`}
                      onClick={() => handleConnectorClick(connector)}
                    >
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ConnectorLogo name={connector.type} size={40} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {connector.display_name}
                          </h3>
                          {connector.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {connector.description}
                            </p>
                          )}
                          {!connector.implemented && (
                            <span className="inline-block mt-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Connections List */
            <>
              {dataSources.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <HardDrive className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No connections yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Connect to a data source to get started
                  </p>
                  <Button onClick={() => setViewMode("browse")} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Connectors
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dataSources.map((ds) => (
                    <Card key={ds.id} className="p-6 bg-white dark:bg-gray-900">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                            {getConnectorIcon(ds.connector_type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{ds.name}</h3>
                              {ds.is_default && (
                                <span className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                  <Star className="h-3 w-3" />
                                  Default
                                </span>
                              )}
                              {!ds.is_active && (
                                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {connectors.find((c) => c.type === ds.connector_type)
                                ?.display_name || ds.connector_type}
                            </p>
                            {ds.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {ds.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              Created: {new Date(ds.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/connectors/${ds.id}/browse`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Browse
                          </Button>
                          {!ds.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(ds.id)}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(ds.id, ds.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Connection Dialog */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Connect to {selectedConnector?.display_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Connection Name*</Label>
              <Input
                id="displayName"
                placeholder="e.g., Production DB"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Connector-specific fields */}
            {selectedConnector?.type === "postgres" ||
            selectedConnector?.type === "postgresql" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Host*</Label>
                    <Input
                      placeholder="localhost"
                      value={postgresConfig.host}
                      onChange={(e) =>
                        setPostgresConfig({ ...postgresConfig, host: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Port*</Label>
                    <Input
                      type="number"
                      placeholder="5432"
                      value={postgresConfig.port}
                      onChange={(e) =>
                        setPostgresConfig({
                          ...postgresConfig,
                          port: parseInt(e.target.value) || 5432,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Database*</Label>
                  <Input
                    placeholder="mydb"
                    value={postgresConfig.database}
                    onChange={(e) =>
                      setPostgresConfig({ ...postgresConfig, database: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username*</Label>
                  <Input
                    placeholder="postgres"
                    value={postgresConfig.username}
                    onChange={(e) =>
                      setPostgresConfig({ ...postgresConfig, username: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password*</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={postgresConfig.password}
                    onChange={(e) =>
                      setPostgresConfig({ ...postgresConfig, password: e.target.value })
                    }
                  />
                </div>
              </>
            ) : selectedConnector?.type === "synapse" ? (
              <>
                <div className="space-y-2">
                  <Label>Server*</Label>
                  <Input
                    placeholder="myserver.database.windows.net"
                    value={synapseConfig.server}
                    onChange={(e) =>
                      setSynapseConfig({ ...synapseConfig, server: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Database*</Label>
                  <Input
                    placeholder="mydb"
                    value={synapseConfig.database}
                    onChange={(e) =>
                      setSynapseConfig({ ...synapseConfig, database: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username*</Label>
                  <Input
                    placeholder="admin"
                    value={synapseConfig.username}
                    onChange={(e) =>
                      setSynapseConfig({ ...synapseConfig, username: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password*</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={synapseConfig.password}
                    onChange={(e) =>
                      setSynapseConfig({ ...synapseConfig, password: e.target.value })
                    }
                  />
                </div>
              </>
            ) : null}

            {/* Test Connection */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testStatus === "testing"}
                className="w-full"
              >
                {testStatus === "testing" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>Test Connection</>
                )}
              </Button>

              {testStatus === "success" && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {testMessage}
                  </span>
                </div>
              )}

              {testStatus === "error" && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {testMessage}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConnectionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!formData.displayName || isConnecting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
