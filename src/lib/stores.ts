import { writable } from 'svelte/store';

function setWalletAddress() {
	const { subscribe, set } = writable(0);

	
	return {
		subscribe,
		save: (address) => set(address),
		reset: () => set(0)
	};
}

function setUser() {
	const { subscribe, set } = writable(0);

	return {
		subscribe,
		save: (user) => set(user),
		reset: () => set(0)
	};
}

export const walletAddress = setWalletAddress();
export const user = setUser();
