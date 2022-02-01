<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { walletAddress, user } from '$lib/stores';
	import { toast } from '@zerodevx/svelte-toast';

	let showUserButton;
	let chainId;

	/* Moralis init code */
	onMount(() => {
		const serverUrl = 'https://rmirqunkdolb.usemoralis.com:2053/server';
		const appId = 'B14wbERL2tdI1L59zyduiKZXoJjBMgW1ai9KRghw';
		Moralis.start({ serverUrl, appId });
		user.save(Moralis.User.current());
		chainId = window.ethereum && window.ethereum.chainId;
		showUserButton = true;
		if (browser && window.ethereum) {
			window.ethereum.on('chainChanged', metamaskRefresh);
			window.ethereum.on('accountsChanged', metamaskRefresh);
		}
		// If refresh browser, get chainId
		if ($user) {
			metamaskRefresh();
		}
	});

	onDestroy(() => {
		if (browser && window.ethereum) {
			window.ethereum.removeListener('chainChanged', metamaskRefresh);
			window.ethereum.removeListener('accountsChanged', metamaskRefresh);
		}
	});

	async function metamaskRefresh(_resp) {
		chainId = await ethereum.request({ method: 'eth_chainId' });
		const accounts = await ethereum.request({ method: 'eth_accounts' });
		walletAddress.save(accounts[0]);
	}

	/* Authentication code */
	async function login(type = 'avax') {
		await Moralis.authenticate({
			signingMessage: 'Welcome to snowflakes.network',
			type: type
		})
			.then(async function () {
				try {
					if (type != 'sol') {
						chainId = await ethereum.request({ method: 'eth_chainId' });
						if (chainId !== '0xa86a') await switchNetwork();
						if (chainId !== '0xa86a') {
							toast.push('Use avalanche C-chain network', {
								theme: {
									'--toastColor': 'red',
									'--toastBarBackground': 'red',
									'--toastBackground': '#FECDD3'
								}
							});
							throw 'Use avalanche';
						}
						const accounts = await ethereum.request({ method: 'eth_accounts' });
						walletAddress.save(accounts[0]);
					} else {
						chainId = 'sol';
						const resp = await window.solana.connect();
						walletAddress.save(resp.publicKey.toString());
					}
				} catch (error) {
					return error;
				}
			})
			.catch(function (error) {
				console.log(error);
			});
		user.save(Moralis.User.current());
		goto('/app/profile', { replaceState: true });
	}

	async function logout() {
		await Moralis.User.logOut();
		chainId = null;
		user.reset();
		walletAddress.reset();
		goto('/', { replaceState: true });
	}

	const AVALANCHE_MAINNET_PARAMS = {
		chainId: '0xA86A',
		chainName: 'Avalanche Mainnet C-Chain',
		nativeCurrency: {
			name: 'Avalanche',
			symbol: 'AVAX',
			decimals: 18
		},
		rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
		blockExplorerUrls: ['https://snowtrace.io/']
	};

	async function switchNetwork() {
		await window.ethereum.request({
			method: 'wallet_addEthereumChain',
			params: [AVALANCHE_MAINNET_PARAMS]
		});
	}
</script>

<nav class="bg-sky-500 pt-2" aria-label="Global">
	<div class="max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8">
		<div class="flex justify-between h-16">
			<div class="flex items-center px-2 lg:px-0">
				<div class="flex-shrink-0 flex items-center">
					<a href="/">
						<img class="h-12 w-auto" src="/snowflakes.network.svg" alt="snowflakes.network" />
					</a>
				</div>
			</div>

			<div class="ml-4 flex items-center">
				<div class="ml-4 relative flex-shrink-0">
					{#if showUserButton}
						<div class="flex items-center">
							{#if !$user}
								<!-- <button
									type="button"
									class="hover:translate-y-px mr-4 flex justify-between items-center bg-sky-500 text-white border-2 px-2 py-1 border-white rounded flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-500 focus:ring-white"
									id="user-menu-button"
									aria-expanded="false"
									aria-haspopup="true"
									on:click|preventDefault={() => login('sol')}
								>
									<img
										class="my-1 mr-2"
										width="30"
										height="30"
										src="/phantom.svg"
										alt="Phantom wallet Login"
									/>
									<span>Phantom</span>
								</button> -->

								<button
									type="button"
									class="hover:translate-y-px flex justify-between items-center bg-sky-500 text-white border-2 px-2 py-1 border-white rounded flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-500 focus:ring-white"
									id="user-menu-button"
									aria-expanded="false"
									aria-haspopup="true"
									on:click|preventDefault={login}
								>
									<img
										class="my-1 mr-2"
										width="30"
										height="30"
										src="/metamask.svg"
										alt="Metamask wallet Login"
									/>
									<span>Metamask</span>
								</button>
							{:else if $page.url.pathname === '/'}
								<button
									type="button"
									class="hover:translate-y-px flex justify-between items-center bg-sky-500 text-white border-2 px-2 py-2 border-white rounded flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-500 focus:ring-white"
									id="user-menu-button"
									aria-expanded="false"
									aria-haspopup="true"
									on:click|preventDefault={() => goto('/app/profile', { replaceState: true })}
								>
									<img
										class="mr-2 bg-white rounded p-1"
										style="height: 30px; width: 30px"
										src="/{chainId}.svg"
										alt="Chain logo"
									/>
									<span>Go to app</span>
								</button>
							{:else}
								<button
									type="button"
									class="hover:translate-y-px flex justify-between items-center bg-sky-500 text-white border-2 px-2 py-2 border-white rounded flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-500 focus:ring-white"
									id="user-menu-button"
									aria-expanded="false"
									aria-haspopup="true"
									on:click|preventDefault={logout}
								>
									<img
										class="mr-2 bg-white rounded p-1"
										style="height: 30px; width: 30px"
										src="/{chainId}.svg"
										alt="Chain logo"
									/>
									<span
										>{$walletAddress && $walletAddress.substring(0, 5)}...{$walletAddress &&
											$walletAddress.slice(-5)} - <b>Log out</b></span
									>
								</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</nav>
