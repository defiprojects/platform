<script>
	import { onMount } from 'svelte';
	import { Bundle, Decline, Instant } from '$lib/icons';
	import { convertOptinString } from '$lib/optin';
	import { toast } from '@zerodevx/svelte-toast';
	import { walletAddress } from '$lib/stores';
	import { formatUSD } from '$lib/util';

	let subscriptions = {};
	let walletPositions = {};
	let showNoSubscriptions;
	let notificationTypes = ['🚨', '👤', '🚀', '🗳', '📢'];
	let notificationTypeMap = {
		'📢': 'General',
		'🚨': 'Security',
		'🗳': 'Vote',
		'🚀': 'Launch',
		'👤': 'Personal'
	};

	onMount(async () => {
		await getSubscriptions();
		showNoSubscriptions = true;
	});

	async function getSubscriptions() {
		let rawSubscriptions = await Moralis.Cloud.run('getSubscriptions', {
			address: $walletAddress
		});
		rawSubscriptions.positions && rawSubscriptions.positions.reduce((walletPositions, coinPair) => {
			if (walletPositions[coinPair[0]]) {
				walletPositions[coinPair[0]] + coinPair[1];
			} else {
				walletPositions[coinPair[0]] = coinPair[1];
			}
			return walletPositions;
		}, walletPositions);
		delete rawSubscriptions.positions;
		for (const [domain, optinString] of Object.entries(rawSubscriptions)) {
			subscriptions[domain] = convertOptinString(optinString);
		}
	}

	async function updateNotificationLevel(domain, type, level) {
		subscriptions[domain][type] = level;
		await Moralis.Cloud.run('updateSubscription', {
			address: $walletAddress,
			domain: domain,
			optin: Object.keys(subscriptions[domain])
				.map((type) => {
					return `${notificationTypeMap[type].charAt(0)}${subscriptions[domain][type].charAt(0)}`;
				})
				.join('')
				.toLowerCase()
		}).then(() => toast.push('Subscription saved'));
	}
</script>

<div
	class="col-span-10 m-4 p-6 bg-white border-2 border-sky-200 border-b-sky-400 shadow shadow-sky-200 rounded-2xl"
>
	<h1 class="text-3xl font-bold text-sky-900 mb-2">Subscriptions</h1>
	<p class="ml-1 text-sky-900">
		Decide which type of notifications you want to receive instantly, decline or bundle in a nice
		overview you receive on they days you selected in your notification profile.
	</p>
	<div class="flex flex-wrap w-full">
		{#if Object.keys(subscriptions).length}
			{#each Object.keys(subscriptions).sort((a, b) => (walletPositions[a] || 0) < (walletPositions[b] || 0)) as domain}
				<div
					class="m-2 flex flex-col items-center border-2 border-b-4 border-sky-200 border-b-sky-300 rounded-xl shadow"
				>
					<div class="flex items-center mt-3">
						<img class="h-5" src="/domain/{domain}.png" alt="" />
						<h2 class="text-sky-800 text-xl ml-1 capitalize">
							{domain}
						</h2>
					</div>
					<span class="text-sky-600 text-sm mb-2" class:opacity-0={!walletPositions[domain]}
						>{formatUSD(walletPositions[domain])} in wallet</span
					>

					<div class="mx-4 mb-3 flex flex-wrap flex-col justify-around items-center">
						{#each notificationTypes as notificationType}
							{#if subscriptions[domain][notificationType]}
								<div class="flex flex-col items-center">
									<p class="mt-1 mb-1 text-left leading-24 text-sky-900">
										{notificationType}
										{notificationTypeMap[notificationType]} notifications
									</p>
									<fieldset class="mb-2">
										<div class="switch-toggle flex items-center text-sky-700">
											{#each ['instant', 'bundle', 'decline'] as notificationLevel}
												<input
													name="{domain}-notification-level-{notificationType}"
													type="radio"
													checked={subscriptions[domain][notificationType] === notificationLevel}
													bind:group={subscriptions[domain][notificationType]}
													value={notificationLevel}
												/>
												<label
													on:click={() =>
														updateNotificationLevel(domain, notificationType, notificationLevel)}
													for="{domain}-notification-level-{notificationType}"
													class="{notificationLevel} flex items-center bg-sky-200 text-sm border-white border-y-2 capitalize"
													class:active-sub={subscriptions[domain][notificationType] ===
														notificationLevel}
												>
													{#if notificationLevel === 'bundle'}
														<Bundle />
													{:else if notificationLevel === 'decline'}
														<Decline />
													{:else if notificationLevel === 'instant'}
														<Instant />
													{/if}
													{notificationLevel}
												</label>
											{/each}
										</div>
									</fieldset>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		{:else if !showNoSubscriptions}
			<p class="animate-pulse w-full mt-48 mb-60 text-center text-sky-700">
				Fetching your subscriptions
			</p>
		{:else}
			<p class="w-full mt-48 mb-60 text-center text-sky-700">
				You got no subscriptions
			</p>
		{/if}
	</div>
</div>
