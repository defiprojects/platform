<script>
	import { onMount } from 'svelte';
	import { walletAddress } from '$lib/stores';

	let noDomainsAnalytics,
		domains = [];

	onMount(async () => {
		domains = await Moralis.Cloud.run('getAnalytics', { address: $walletAddress });
		if (!domains.length) noDomainsAnalytics = true;
	});
</script>

<div
	class="col-span-10 m-4 p-6 bg-white border-2 border-sky-200 border-b-sky-300 shadow shadow-sky-200 rounded-2xl overflow-hidden"
>
	<h1 class="text-3xl font-bold text-sky-900 mb-2">Analytics</h1>
	{#if domains.length}
		{#each domains as domain}
			<div class="flex items-center justify-start w-full leading-24 mb-2">
				<img class="h-5 mr-1" src="/domain/{domain.domain}.png" alt="" />
				<h2 class="text-sky-800 capitalize">{domain.domain}</h2>
			</div>
			<div>
				<dl
					class="mb-4 grid grid-cols-1 rounded-lg bg-white overflow-hidden shadow border border-sky-200 md:grid-cols-3 md:divide-y-0 md:divide-x"
				>
					<div class="px-4 py-5 sm:p-6">
						<dt class="text-base font-normal text-sky-900">Instant subscribers</dt>
						<dd class="mt-1 flex justify-between items-baseline md:block lg:flex">
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								🚨 {domain.analytics.map((point, index) => point.result)[0]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								👤 {domain.analytics.map((point, index) => point.result)[3]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								🚀 {domain.analytics.map((point, index) => point.result)[6]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								🗳️ {domain.analytics.map((point, index) => point.result)[9]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								📢 {domain.analytics.map((point, index) => point.result)[12]}
							</div>
						</dd>
					</div>

					<div class="px-4 py-5 sm:p-6">
						<dt class="text-base font-normal text-sky-900">Bundle subscribers</dt>
						<dd class="mt-1 flex justify-between items-baseline md:block lg:flex">
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								🚨 {domain.analytics.map((point, index) => point.result)[1]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								👤 {domain.analytics.map((point, index) => point.result)[4]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								🚀 {domain.analytics.map((point, index) => point.result)[7]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								🗳️ {domain.analytics.map((point, index) => point.result)[10]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								📢 {domain.analytics.map((point, index) => point.result)[13]}
							</div>
						</dd>
					</div>

					<div class="px-4 py-5 sm:p-6">
						<dt class="text-base font-normal text-sky-900">Decline</dt>
						<dd class="mt-1 flex justify-between items-baseline md:block lg:flex">
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								🚨 {domain.analytics.map((point, index) => point.result)[2]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								👤 {domain.analytics.map((point, index) => point.result)[5]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								🚀 {domain.analytics.map((point, index) => point.result)[8]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								🗳️ {domain.analytics.map((point, index) => point.result)[11]}
							</div>
							<div class="flex items-baseline text-2xl font-semibold text-sky-600">
								📢 {domain.analytics.map((point, index) => point.result)[14]}
							</div>
						</dd>
					</div>
				</dl>
			</div>
		{/each}
	{:else if !noDomainsAnalytics}
		<p class="animate-pulse w-full mt-12 mb-12 text-center text-sky-700">Fetching your premium domain analytics</p>
	{:else}
		<p class="w-full mt-12 mb-12 text-center text-sky-700">You got no premium domain analytics</p>
	{/if}
</div>
