<script>
	import { Analytics, Profile, Push, Integrations, Notifications, Subscriptions } from '$lib/icons';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores';

	const toastOptions = {};

	const routes = ['profile', 'subscriptions', 'notifications', 'integrations', 'push', 'analytics'];

	onMount(() => {
		if (browser) {
			if (!$user) {
				goto('/');
			}
		}
	});
</script>

<div class="lg:grid lg:grid-cols-12">
	<SvelteToast {toastOptions} />
	<aside class="py-4 col-span-2">
		<nav class="space-y-0">
			{#each routes as route}
				<a
					href="/app/{route}"
					class:active-menu-item={$page.url.pathname === `/app/${route}`}
					class="border-transparent text-sky-700 hover:bg-sky-100 hover:border-sky-500 hover:border-l-2 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
					aria-current="page"
				>
					{#if route === 'profile'}
						<Profile />
					{:else if route === 'subscriptions'}
						<Subscriptions />
					{:else if route === 'notifications'}
						<Notifications />
					{:else if route === 'integrations'}
						<Integrations />
					{:else if route === 'push'}
						<Push />
					{:else if route === 'analytics'}
						<Analytics />
					{/if}
					<span class="truncate capitalize"> {route} </span>
				</a>
			{/each}
		</nav>
	</aside>

	<slot />
</div>

<style>
	:root {
		--toastBackground: #0ea5e9;
		--toastColor: #fff;
		--toastBoxShadow: #075985;
		--toastBarBackground: #38bdf8;
		--toastWidth: 12rem;
		--toastContainerTop: auto;
		--toastContainerBottom: 2rem;
	}

	.active-menu-item {
		--tw-border-opacity: 1;
		border-color: rgb(14 165 233 / var(--tw-border-opacity));
		--tw-text-opacity: 1;
		color: rgb(12 74 110 / var(--tw-text-opacity));
		--tw-bg-opacity: 1;
		background-color: rgb(224 242 254 / var(--tw-bg-opacity));
	}
</style>
