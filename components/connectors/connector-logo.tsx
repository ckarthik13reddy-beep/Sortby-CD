"use client"

interface ConnectorLogoProps {
  name: string
  className?: string
}

export function ConnectorLogo({ name, className = "w-10 h-10" }: ConnectorLogoProps) {
  // Using simple-icons CDN for official brand logos
  const logoUrls: Record<string, string> = {
    postgres: "https://cdn.simpleicons.org/postgresql/4169E1",
    bigquery: "https://cdn.simpleicons.org/googlebigquery/669DF6",
    snowflake: "https://cdn.simpleicons.org/snowflake/29B5E8",
    databricks: "https://cdn.simpleicons.org/databricks/FF3621",
    mysql: "https://cdn.simpleicons.org/mysql/4479A1",
    sqlserver: "https://cdn.simpleicons.org/microsoftsqlserver/CC2927",
    supabase: "https://cdn.simpleicons.org/supabase/3FCF8E",
    vertica: "https://cdn.simpleicons.org/vertica/003366",
    "google-drive": "https://cdn.simpleicons.org/googledrive/4285F4",
    onedrive: "https://cdn.simpleicons.org/microsoftonedrive/0078D4",
    sharepoint: "https://cdn.simpleicons.org/microsoftsharepoint/0078D4",
    "google-ads": "https://cdn.simpleicons.org/googleads/4285F4",
    "meta-ads": "https://cdn.simpleicons.org/meta/0081FB",
  }

  // For MCP, use a placeholder since it's not a widely recognized brand
  if (name === "mcp") {
    return (
      <div className={`${className} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold text-xs">MCP</span>
      </div>
    )
  }

  const logoUrl = logoUrls[name]

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={className}
        style={{ objectFit: "contain" }}
      />
    )
  }

  // Fallback for logos not found
  return (
    <div className={`${className} bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl font-bold`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
