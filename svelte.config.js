import preprocess from 'svelte-preprocess';
import cloudflare from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: cloudflare(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		files: {
			assets: 'static',
			lib: 'src/lib'
		}
	},

	preprocess: [
		preprocess({
			postcss: true
		})
	]
};

export default config;
