/**
 * Application configuration
 * Centralizes all app-level settings that can be configured via environment variables
 */

export const appConfig = {
  /**
   * Application name - used throughout the UI
   * Can be overridden with NEXT_PUBLIC_APP_NAME environment variable
   */
  name: process.env.NEXT_PUBLIC_APP_NAME || 'SortBy',

  /**
   * API base URL
   * Can be overridden with NEXT_PUBLIC_API_URL environment variable
   */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',

  /**
   * Get localStorage key with app prefix
   */
  getStorageKey: (key: string) => {
    const appName = (process.env.NEXT_PUBLIC_APP_NAME || 'SortBy')
      .toLowerCase()
      .replace(/\s+/g, '_');
    return `${appName}_${key}`;
  },
} as const;
