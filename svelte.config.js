import preprocess from 'svelte-preprocess';
import cloudflare from "@sveltejs/adapter-cloudflare";
import staticAdapter from '@sveltejs/adapter-static';
let embed = false;
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: embed ? staticAdapter({
			fallback: 'optin.html'
		}) :  cloudflare(),

		// hydrate the <div id="svelte"> element in src/app.html
		inlineStyleThreshold: embed ? 102400 : 0,
		target: '#svelte',
		files: {
			assets: 'static',
			lib: 'src/lib',
			routes: embed ? 'src/embeds' : 'src/routes',
			template: embed ? 'src/embed.html' :'src/app.html'
		},
	},

	preprocess: [
		preprocess({
			postcss: true
		})
	]
};

export default config;
