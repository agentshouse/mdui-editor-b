import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { storageBoundary } from './scripts/storage-boundary';
import tailwind from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({base:'./',publicDir:'.build/public',plugins:[storageBoundary(),react(),tailwind()],resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},test:{environment:'jsdom',include:['tests/**/*.test.{ts,tsx}','src/plate/**/*.test.{ts,tsx}']},build:{modulePreload:{polyfill:false},rollupOptions:{output:{inlineDynamicImports:true}}}});
