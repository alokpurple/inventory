// This is the base environment file
// It gets REPLACED by environment.development.ts (local) or environment.prod.ts (production)
// If you see this file being used, the build configuration might be wrong
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080', // Safe fallback default
  };