import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig(({ mode }) => {
	const plugins = [tailwindcss(), sveltekit()];

	if (mode === 'dev') {
		// Enable plugin only during dev
		// (it's needed for DB access in dev, but breaks builds currently)
		plugins.push(cloudflare());
	}

	return {
		plugins
	};
});
