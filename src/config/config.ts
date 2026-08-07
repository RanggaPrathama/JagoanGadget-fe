

export const config = {
    appTitle: import.meta.env.VITE_APP_TITLE || 'Jagoan Gadget',
    nodeEnv: import.meta.env.NODE_ENV || 'development',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:2000/api',
    // Mock backend: default ON. Set VITE_MOCK_BACKEND=false when the real API is wired.
    mockBackend: import.meta.env.VITE_MOCK_BACKEND !== 'false'
}