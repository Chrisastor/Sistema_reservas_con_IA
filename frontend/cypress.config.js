import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // La URL base de tu frontend (Vite)
    baseUrl: 'http://localhost:5173',
    
    // Permite que iframes externos no rompan el test
    chromeWebSecurity: false,
    
    // Timeout un poco más largo por si el PC es lento
    defaultCommandTimeout: 10000,

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});