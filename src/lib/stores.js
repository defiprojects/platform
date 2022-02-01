import { writable } from 'svelte/store';

function setWalletAddress() {
	const { subscribe, set } = writable(0);

	return {
		subscribe,
		save: (address) => set(address),
		reset: () => set('')
	};
}

function setUser() {
	const { subscribe, set } = writable(0);

	return {
		subscribe,
		save: (user) => set(user),
		reset: () => set('')
	};
}

export const walletAddress = setWalletAddress();
export const user = setUser();