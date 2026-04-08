import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default {
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
};
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
