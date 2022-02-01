<script>
	import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import { walletAddress } from '$lib/stores';

	let projects = [];
	let projectDomain;
	let noDomains;

	onMount(async () => {
		projects = await getDomains();
		if (!projects.length) noDomains = true;
	});

	async function getDomains() {
		let allProjects = await Moralis.Cloud.run('getDomains', { address: $walletAddress });
		return allProjects
			.map((domain, index) => {
				if (index % 2 === 0) {
					return { domain: domain, admins: allProjects[index + 1] };
				}
			})
			.filter((entry) => !!entry);
	}

	function extractHostname(href) {
		var l = document.createElement('a');
		l.href = href.startsWith('http') ? href : `https://${href}`;
		return l.hostname;
	}

	async function addProject() {
		let project = await Moralis.Cloud.run('addDomain', {
			address: $walletAddress,
			projectDomain: extractHostname(projectDomain)
		});
		projects = projects.concat(project);
		toast.push('Domain added');
		projectDomain = '';
	}

	async function verifyDomain(domain) {
		let result = await Moralis.Cloud.run('verifyDomain', {
			address: $walletAddress,
			projectDomain: domain
		});

		if (!Array.isArray(result) && result.error) {
			toast.push('No TXT records found', {
				theme: {
					'--toastColor': 'red',
					'--toastBarBackground': 'red',
					'--toastBackground': '#FECDD3'
				}
			});
		} else {
			if (result.length) {
				toast.push('Domain verified');
				await getDomains();
			} else {
				toast.push('Domain not yet verified, please wait or try later again', {
					theme: {
						'--toastBarBackground': 'yellow'
					}
				});
			}
		}
	}
</script>

<svelte:head>
	<title>Snowflakes.network | Integrations</title>
</svelte:head>

<div class="col-span-10">
	<div>
		<form action="#" method="POST">
			<div
				class="m-4 shadow border-2 border-sky-200 border-b-sky-300 shadow-sky-200 rounded-2xl sm:overflow-hidden"
			>
				<div class="p-6 bg-white space-y-4">
					<div>
						<h3 class="text-lg leading-6 font-medium text-sky-800">
							How to integrate snowflakes to your domain
						</h3>
						<p class="mt-2 text-sm text-sky-700">
							1. Add TXT record(s) to your root domain host's DNS records in the following way:
						</p>

						<div class="mt-3 flex flex-col">
							<div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
								<div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
									<div
										class="overflow-hidden border border-sky-200 border-b-sky-300 shadow shadow-sky-200 rounded-lg"
									>
										<table class="min-w-full divide-y divide-sky-200">
											<thead class="bg-sky-700">
												<tr>
													<th
														scope="col"
														class="px-6 py-3 text-center text-xs font-medium text-sky-50 uppercase tracking-wider"
													>
														Type
													</th>
													<th
														scope="col"
														class="px-6 py-3 text-center text-xs font-medium text-sky-50 uppercase tracking-wider"
													>
														Value
													</th>
												</tr>
											</thead>
											<tbody>
												<tr class="bg-white">
													<td
														class="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-sky-800"
													>
														TXT
													</td>
													<td class="px-6 py-4 whitespace-nowrap text-sm text-center text-sky-800">
														snowflakes-network-member={$walletAddress}
													</td>
												</tr>
											</tbody>
											<tbody>
												<tr class="bg-sky-50">
													<td
														class="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-sky-800"
													>
														TXT
													</td>
													<td class="px-6 py-4 whitespace-nowrap text-sm text-center text-sky-800">
														<i
															>Optional other team member wallet address (add a TXT record per team
															member)</i
														>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>

					<p class="mt-2 text-sm text-sky-700">
						2. Fill in the project domain (<u>without subdomain</u>) and click the
						<b>Add integration</b>
						button <br />
					</p>
					<div class="grid grid-cols-3 gap-3">
						<div class="col-span-3 sm:col-span-2">
							<label for="project-domain" class="block text-sm font-medium text-sky-700">
								Project domain
							</label>
							<div class="mt-1 flex rounded-md">
								<div class="mt-1 md:flex rounded-md">
									<div class="flex">
										<span
											class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-sky-300 bg-sky-50 text-sky-500 text-sm"
										>
											https://
										</span>
										<input
											type="text"
											bind:value={projectDomain}
											name="project-domain"
											id="project-domain"
											class="w-1000 text-sky-700 focus:ring-sky-500 focus:border-sky-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-sky-300"
											placeholder="yourproject.com"
										/>
									</div>
									<button
										on:click|preventDefault={addProject}
										class="md:ml-4 md:mt-0 mt-4 inline-flex justify-center py-2 px-4 border-2 border-b-4 border-sky-600 hover:border-b-2 hover:translate-y-px shadow-sm text-sm font-medium rounded-md text-white bg-sky-500"
									>
										Add integration
									</button>
								</div>
							</div>
						</div>
					</div>
					<p class="mt-2 text-sm text-sky-700">
						4. Wait till your TXT records are validated or keep pressing <b
							>Trigger domain verify
						</b>
						button <br />
						5. Start sending notifications!
					</p>
				</div>
			</div>
		</form>

		{#if projects.length > 0}
			<div class="m-4 flex flex-col">
				<div class="-my-2 overflow-x-auto">
					<div class="py-2 align-middle inline-block min-w-full">
						<div
							class="overflow-hidden border-2 border-sky-200 border-b-sky-300 shadow shadow-sky-200 rounded-lg"
						>
							<table class="min-w-full divide-y divide-sky-200">
								<thead class="bg-sky-700">
									<tr>
										<th
											scope="col"
											class="px-6 py-3 text-left text-xs font-medium text-sky-50 uppercase tracking-wider"
										>
											Domain
										</th>
										<th
											scope="col"
											class="text-right px-8 py-3 text-xs font-medium text-sky-50 uppercase tracking-wider"
										>
											Status
										</th>
										<th
											scope="col"
											class="py-3 text-xs font-medium text-sky-50 uppercase tracking-wider"
										/>
									</tr>
								</thead>
								<tbody class="bg-white divide-y divide-sky-200">
									{#each projects.sort((a, b) => a.admins < b.admins) as project}
										<tr>
											<td class="px-6 py-4 whitespace-nowrap">
												<div class="flex items-center">
													<div>
														<div class="flex text-sm text-sky-500 capitalize">
															<img class="h-5 mr-1" src="/domain/{project.domain}.png" alt="" />
															{project.domain}
														</div>
													</div>
												</div>
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-right">
												{#if project.admins > 0}
													<span
														class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800"
													>
														Verified
													</span>
												{:else}
													<span
														class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-200 text-sky-800"
													>
														Pending
													</span>
												{/if}
											</td>
											<td>
												{#if project.admins > 0}
													<span class="hidden" />
												{:else}
													<div class="text-right mr-4 flex-shrink-0">
														<button
															class="inline-flex justify-center py-2 px-4 border-2 border-b-4 border-sky-600 hover:border-b-2 hover:translate-y-px shadow-sm text-sm font-medium rounded-md text-sky-50 bg-sky-500"
															on:click={verifyDomain(project.domain)}>Trigger domain verify</button
														>
													</div>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		{:else if !noDomains}
			<p class="animate-pulse w-full mt-12 mb-12 text-center text-sky-700">
				Check for domain integrations
			</p>
		{:else}
			<p class="w-full mt-12 mb-12 text-center text-sky-700">
				You have added no domains
			</p>
		{/if}
	</div>
</div>
