import { writable } from 'svelte/store';

function setWalletAddress() {
	const { subscribe, set } = writable('');

	return {
		subscribe,
		save: (address: string) => set(address),
		reset: () => set('')
	};
}

function setUser() {
	const { subscribe, set } = writable('');

	return {
		subscribe,
		save: (user: string) => set(user),
		reset: () => set('')
	};
}

export const walletAddress = setWalletAddress();
export const user = setUser();
