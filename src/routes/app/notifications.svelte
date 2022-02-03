<script>
	import { onMount } from 'svelte';
	import { formatUSD } from '$lib/util';
	import { walletAddress } from '$lib/stores';

	let notifications = {},
		walletPositions = {},
		showNoNotifications;

	onMount(async () => {
		let result = await fetch(`/api/notifications-${$walletAddress}.json`);
		if (result.ok) {
			const resp = await result.json();
			notifications = resp.notifications || {};
			walletPositions = resp.positions || {};
		}
		showNoNotifications = !Object.keys(notifications).length;
	});
</script>

<svelte:head>
	<title>Snowflakes.network | Notifications</title>
</svelte:head>

<section aria-labelledby="timeline-title" class="col-span-10">
	{#if Object.keys(notifications).length}
		<table class="w-full font-sans mt-3">
			<tr>
				<td align="center">
					<table class="w-600 sm:w-full">
						<tr>
							<td class="w-full px-4 text-left">
								<table class="w-full">
									<tr>
										<td class="w-full sm:w-full sm:inline-block">
											<table class="w-full">
												{#each Object.keys(notifications).sort((a, b) => (walletPositions[b] || 0) - (walletPositions[a] || 0)) as domain}
													<tr>
														<td>
															<div
																class="pt-4 px-4 bg-white border-2 border-sky-200 border-b-sky-300 shadow shadow-sky-200 rounded-xl"
															>
																<h2 class="flex items-center m-0 mb-4 text-xl leading-24">
																	<img class="mr-1 h-5" src="/domain/{domain}.png" alt="" />
																	<a
																		href="https://{domain}"
																		target="_blank"
																		rel="noopener noreferrer"
																		class="text-sky-800 hover:text-sky-700 no-underline transition-colors duration-300 capitalize"
																	>
																		{domain}</a
																	>
																	<span class:hidden={!walletPositions[domain]} class="text-sky-600 text-sm mt-1 ml-2"
																		>{formatUSD(walletPositions[domain])} in wallet</span
																	>
																</h2>
																<ul class="m-0 pl-1">
																	{#each notifications[domain] as notification}
																		<li class="flex">
																			<a
																				href={notification.link}
																				class="text-sky-700 hover:text-sky-500 no-underline transition-colors duration-300"
																			>
																				<h6 class="m-0 p-0 font-medium text-base">
																					{notification.type}
																					{notification.title}
																				</h6>
																				<p class="mb-4 ml-1 text-sky-800 hover:text-sky-600">
																					{notification.text}
																				</p>
																			</a>
																		</li>
																	{/each}
																</ul>
															</div>
														</td>
													</tr>
													<tr>
														<td class="h-4" />
													</tr>
												{/each}
											</table>
										</td>
									</tr>
								</table>
							</td>
						</tr>
						<tr class="text-sky-800 text-sm text-center">
							<b>🚨 security</b> <b class="mx-3">🚀 Launch</b> <b>🗳️ Vote</b>
							<b class="mx-3">👤 personal</b> <b>📢 general</b>
						</tr>
						<br />
					</table>
				</td>
			</tr>
		</table>
	{:else if !showNoNotifications}
		<p class="animate-pulse mt-32 text-center text-sky-700">Fetching notifications from the last 7 days</p>
	{:else}
		<p class="w-full mt-32 mb-32 text-center text-sky-700">You got no notifications</p>
	{/if}
</section>
