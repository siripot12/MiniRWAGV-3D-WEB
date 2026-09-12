import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ base: '/MiniRWAGV-3D-WEB/', plugins: [react()], build: { chunkSizeWarningLimit: 1500 }, server: { port: 5173, strictPort: true } });
