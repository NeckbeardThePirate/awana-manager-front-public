import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
	plugins: [
		react(),
		tailwindcss(),
		// Only include cloudflare plugin when not in test mode
		...(mode !== 'test' ? [cloudflare()] : [])
	],
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		globals: true,
	},
}));