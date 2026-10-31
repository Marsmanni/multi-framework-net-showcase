/**
 * Application configuration based on environment
 */
export const config = {
  /**
   * Get the API base URL from environment variables
   * Falls back to localhost if not set
   */
  getApiBaseUrl: (): string => {
    return import.meta.env.VITE_API_BASE_URL || 'https://localhost:7654';
  }
};
