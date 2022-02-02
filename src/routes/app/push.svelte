<script>
	import SveltyPicker from 'svelty-picker';
	import { toast } from '@zerodevx/svelte-toast';
	import { ethers } from 'ethers';
	import { onMount } from 'svelte';
	import { ArrowDown } from '$lib/icons';
	import { walletAddress } from '$lib/stores';

	let preview,
		notificationTypeShowMenu,
		domainSelectShowMenu,
		notificationTitle,
		notificiationLink,
		notificationText,
		verifiedDomains = [],
		selectedDomain,
		noVerifiedDomains,
		target;

	let notificationType = '📢';
	let notificationTypeMap = {
		'📢': { type: 'General', menuText: 'Use this for a general message to all' },
		'🚨': { type: 'Security', menuText: 'Immediately ask users to protect themselves' },
		'🗳': { type: 'Vote', menuText: 'Ask to vote for proposal' },
		'🚀': { type: 'Launch', menuText: 'Announce a new product' },
		'👤': { type: 'Personal', menuText: 'Push to user' }
	};

	onMount(async () => {
		verifiedDomains = await Moralis.Cloud.run('getVerifiedDomains', { address: $walletAddress });
		if (verifiedDomains.length) selectedDomain = verifiedDomains[0];
		noVerifiedDomains = !verifiedDomains.length;
	});

	async function schedulePush() {
		const now = new Date();
		const utcMilllisecondsSinceEpoch = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
		const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000);

		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();

		const push = {
			type: notificationType,
			title: notificationTitle,
			text: notificationText,
			link: notificiationLink,
			address: $walletAddress,
			domain: selectedDomain,
			target: target || 'all',
			utcSecondsEpoch: utcSecondsSinceEpoch
		};

		const signature = await signer.signMessage(`Save push: ${JSON.stringify(push)}`);
		push.signature = signature;

		const options = {
			method: 'POST',
			body: JSON.stringify(push),
			headers: {
				'Content-Type': 'application/json'
			}
		};

		await fetch('/api/push.json', options).then((resp) => {
			if (resp.ok) {
				toast.push('Notification saved');
				notificationTitle = '';
				notificationText = '';
				notificiationLink = '';
			} else {
				switch (resp.status) {
					case 401:
						toast.push('Not authorized', {
							theme: {
								'--toastColor': 'red',
								'--toastBarBackground': 'red',
								'--toastBackground': '#FECDD3'
							}
						});
				}
			}
		});
	}

	function setNotificationType(type) {
		notificationType = type;
		notificationTypeShowMenu = false;
	}

	function setDomain(domain) {
		selectedDomain = domain;
		domainSelectShowMenu = false;
	}
</script>

<form class="lg:col-span-10" action="#">
	{#if verifiedDomains.length}
		<div
			class="m-4 px-4 pt-5 bg-white overflow-hidden border-2 border-sky-200 border-b-sky-300 shadow shadow-sky-200 rounded-2xl"
		>
			<div class="ml-4 flex items-center">
				<span class="relative inline-flex">
					<button
						on:click|preventDefault={() => (preview = false)}
						class:bg-sky-500={!preview}
						class:bg-sky-400={preview}
						class:border-white={preview}
						class:border-sky-600={!preview}
						class:border-b-4={!preview}
						class:border-b-sky-700={!preview}
						class:border-x-2={!preview}
						class:font-medium={!preview}
						type="button"
						class="relative inline-flex items-center px-4 py-2 border-y-2 rounded-l-md text-sm text-white"
					>
						Write
					</button>
					<button
						type="button"
						on:click|preventDefault={() => (preview = true)}
						class:bg-sky-500={preview}
						class:bg-sky-400={!preview}
						class:border-white={!preview}
						class:border-sky-600={preview}
						class:border-b-4={preview}
						class:border-b-sky-700={preview}
						class:border-x-2={preview}
						class:font-medium={preview}
						class="mr-4 relative inline-flex items-center px-4 py-2 border-y-2 rounded-r-md text-sm text-white"
					>
						Preview
					</button>
				</span>

				<div>
					<div class="relative">
						<div class="inline-flex shadow-sm rounded-md divide-x divide-sky-600">
							<div class="relative z-0 inline-flex shadow-sm rounded-md divide-x divide-sky-700">
								<div
									on:click|preventDefault={() => (notificationTypeShowMenu = !notificationTypeShowMenu)}
									class="relative inline-flex items-center bg-sky-500 border-sky-600 border-2 border-b-4 py-2 pl-3 pr-4 rounded-l-md shadow-sm text-white"
								>
									<p style="width: 120px" class="ml-2.5 text-sm font-medium">
										{notificationType}
										{notificationTypeMap[notificationType].type}
									</p>
								</div>
								<button
									on:click|preventDefault={() => (notificationTypeShowMenu = !notificationTypeShowMenu)}
									class="relative inline-flex items-center bg-sky-500 border-sky-600 border-2 border-b-4 p-2 rounded-l-none rounded-r-md overflow-hidden text-sm font-medium text-white"
									aria-haspopup="listbox"
									aria-expanded="true"
									aria-labelledby="listbox-label"
								>
									<ArrowDown />
								</button>
							</div>
						</div>
						<ul
							class:opacity-100={notificationTypeShowMenu}
							class:opacity-0={!notificationTypeShowMenu}
							class:hidden={!notificationTypeShowMenu}
							class="transition ease-in duration-100 origin-top-right absolute z-10 right-0 w-50 rounded-md shadow-lg bg-white divide-y divide-sky-200 ring-1 ring-black ring-opacity-5 focus:outline-none"
						>
							{#each Object.keys(notificationTypeMap) as notificationMapType}
								<li
									class:hidden={notificationType === notificationMapType}
									on:click={() => setNotificationType(notificationMapType)}
									class="text-sky-900 cursor-default select-none relative p-2 text-sm hover:bg-sky-100"
									id="listbox-option-0"
									role="option"
								>
									<div class="flex flex-col">
										<div class="flex justify-between">
											<p class="font-normal">
												{notificationMapType}
												{notificationTypeMap[notificationMapType].type}
											</p>
										</div>
										<p class="text-sky-500 mt-2">
											{notificationTypeMap[notificationMapType].menuText}
										</p>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</div>
				{#if selectedDomain}
					<div class="ml-4">
						<div class="relative">
							<div class="inline-flex shadow-sm rounded-md divide-x divide-sky-600">
								<div class="relative z-0 inline-flex shadow-sm rounded-md divide-x divide-sky-700">
									<div
										on:click|preventDefault={() => (domainSelectShowMenu = !domainSelectShowMenu)}
										class="relative inline-flex items-center py-2 pl-3 pr-4 bg-sky-500 border-sky-600 border-2 rounded-l-md shadow-sm text-white"
										class:rounded-r-md={verifiedDomains.length < 2}
										class:border-b-4={verifiedDomains.length >= 2}
									>
										<img class="h-5" src="/domain/{selectedDomain}.png" alt="[logo]" />
										<p class="ml-1 text-left text-sm font-medium capitalize">
											{selectedDomain}
										</p>
									</div>
									<button
										on:click|preventDefault={() => (domainSelectShowMenu = !domainSelectShowMenu)}
										class="relative inline-flex items-center bg-sky-500 border-sky-600 border-2 border-b-4 p-2 rounded-l-none rounded-r-md text-sm font-medium text-white"
										aria-haspopup="listbox"
										aria-expanded="true"
										aria-labelledby="listbox-label"
										class:hidden={verifiedDomains.length < 2}
									>
										<ArrowDown />
									</button>
								</div>
							</div>
							<ul
								class:opacity-100={domainSelectShowMenu}
								class:opacity-0={!domainSelectShowMenu}
								class:hidden={!domainSelectShowMenu}
								class="transition ease-in duration-100 origin-top-right absolute z-10 right-0 w-50 rounded-md shadow-lg bg-white divide-y divide-sky-200 ring-1 ring-black ring-opacity-5 focus:outline-none"
							>
								{#each verifiedDomains as domain}
									<li
										class:hidden={selectedDomain === domain}
										on:click={() => setDomain(domain)}
										class="text-sky-900 cursor-default select-none relative p-4 text-sm hover:bg-sky-100"
									>
										<div class="flex flex-col">
											<div class="flex">
												<img class="h-5 mr-2" src="/domain/{domain}.png" alt="" />
												<p class="font-normal">{domain}</p>
											</div>
										</div>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{/if}
			</div>
			<div>
				{#if !preview}
					<div class="px-4 py-3 space-y-3">
						<div class="grid grid-cols-3 gap-6">
							<div class="col-span-3 sm:col-span-2">
								<label for="notification-link" class="block text-sm font-medium text-sky-700"> Push link </label>
								<div class="mt-1 flex rounded-md shadow-sm">
									<span
										class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-sky-300 bg-sky-50 text-sky-500 text-sm"
									>
										https://
									</span>
									<input
										bind:value={notificiationLink}
										type="text"
										name="notification-link"
										id="notification-link"
										class="focus:ring-sky-500 focus:border-sky-500 text-sky-800 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-sky-300"
										placeholder="www.example.com"
									/>
								</div>
							</div>
						</div>
						<div class="grid grid-cols-3 gap-6">
							<div class="col-span-3 sm:col-span-2">
								<label for="notification-title" class="block text-sm font-medium text-sky-700"> Push title </label>
								<div class="mt-1 flex rounded-md shadow-sm">
									<input
										bind:value={notificationTitle}
										type="text"
										name="notification-title"
										id="notification-title"
										class="focus:ring-sky-500 text-sky-800 focus:border-sky-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-sky-300"
										placeholder="Push title"
									/>
								</div>
							</div>
						</div>

						<div>
							<label for="notification-text" class="block text-sm font-medium text-sky-700"> Push message </label>
							<div class="mt-1">
								<textarea
									bind:value={notificationText}
									id="notification-text"
									name="notification-text"
									rows="3"
									class="shadow-sm focus:ring-sky-500 text-sky-800 focus:border-sky-500 mt-1 block w-full sm:text-sm border border-sky-300 rounded-md"
									placeholder="Push message"
								/>
							</div>
						</div>
					</div>
				{:else}
					<div class="bg-sky-50 rounded-2xl">
						<table class="w-full font-sans mt-4">
							<tr>
								<td align="center">
									<table class="w-600 sm:w-full">
										<tr>
											<td class="w-full p-12 text-left">
												<table class="w-full">
													<tr>
														<td class="w-full sm:w-full sm:inline-block">
															<table class="w-full">
																<td class="pt-4 px-4 bg-white shadow rounded-2xl">
																	<ul class="m-0 pl-1">
																		<li class="flex">
																			<a
																				href={notificiationLink}
																				class="text-sky-700 hover:text-sky-500 no-underline transition-colors duration-300"
																			>
																				<h6 class="m-0 p-0 font-medium text-base">
																					{notificationType}
																					{notificationTitle ? notificationTitle : 'Notification title'}
																				</h6>
																				<p class="mb-4 ml-1 text-sky-800 hover:text-sky-600">
																					{notificationText ? notificationText : 'Notification text'}
																				</p>
																			</a>
																		</li>
																	</ul>
																</td>
															</table>
														</td>
													</tr>
												</table>
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</div>
				{/if}
			</div>
			<div class="flex bg-white px-4 py-4 justify-end">
				<button
					on:click|preventDefault={() => schedulePush()}
					class="mt-6 max-h-10 inline-flex items-center px-4 py-2 border-2 border-b-4 border-sky-600 hover:border-b-2 hover:translate-y-px text-sm font-medium rounded-md shadow-sm text-white bg-sky-500"
				>
					Send push
				</button>
			</div>
		</div>
	{:else if !noVerifiedDomains}
		<p class="animate-pulse w-full mt-48 mb-60 text-center text-sky-700">Fetching your verifiedDomains</p>
	{:else}
		<p class="w-full mt-48 mb-60 text-center text-sky-700">You got no verified domain, please verify a domain first</p>
	{/if}
</form>
