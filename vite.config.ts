import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill process.env for compatibility if needed, 
    // though migrating to import.meta.env is better.
    'process.env': {}
  }
});