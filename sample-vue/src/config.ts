export const config = {
  getApiBaseUrl: (): string => {
    const defaultApiUrl = import.meta.env.DEV
      ? 'http://localhost:5432'
      : 'https://ui-sample-api-net1020251207105113-f3agbrhgfndybwbe.westeurope-01.azurewebsites.net';
    return import.meta.env.VITE_API_BASE_URL || defaultApiUrl;
  }
};
