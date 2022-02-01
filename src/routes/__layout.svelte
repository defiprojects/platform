<script>
	import '../app.css';
	import { Footer, Header } from '$lib/components';
	import { page } from '$app/stores';
</script>

{#if ~$page.url.pathname.indexOf('/optin')}
	<slot />
{:else}
	<div class="page">
		<Header />

		<main class="container relative mx-auto mt-2 z-50">
			<div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="bg-sky-50 overflow-hidden rounded-2xl border-2 border-b-4 border-sky-200 border-b-sky-300 shadow shadow-sky-300">
					<slot />
				</div>
			</div>
		</main>

		<Footer />
	</div>
{/if}

<style>
	.container {
		min-height: calc(100vh - 350px);
	}

	.page {
		width: 100vw;
		height: 100%;
		min-height: 100vh;
		background: linear-gradient(to bottom, #0ea5e9 10%, #bae6fd 100%);
	}
</style>
