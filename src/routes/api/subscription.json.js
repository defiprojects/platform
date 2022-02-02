import { ethers } from 'ethers';
import { convertOptinString } from '$lib/optin';

const init = { headers: { Authorization: `Bearer ${import.meta.env.VITE_SECRET_UPSTASH_TOKEN}` } };

export async function post({ request }) {
	const { signature, ...notficiationSettings } = await request.json();
	const signerAddress = await ethers.utils.verifyMessage(
		`Save notifications settings: ${JSON.stringify(notficiationSettings)}`,
		signature
	);

	if (signerAddress === notficiationSettings.address) {
		let commands = [
			[
				'HSET',
				`u:${notficiationSettings.address.toLowerCase()}`,
				`d:${notficiationSettings.domain}`,
				notficiationSettings.optin
			]
		];

		notficiationSettings.optin.split(/(..)/g).map((optin) => {
			if (optin.length === 2)
				commands.push(['SADD', `${optin}:${notficiationSettings.domain}`, notficiationSettings.address.toLowerCase()]);
		});

		await fetch('https://eu1-present-bull-34198.upstash.io/pipeline', {
			method: 'POST',
			body: JSON.stringify(commands),
			...init
		});
	}

	return {
		body: {
			status: `verified: ${signerAddress === notficiationSettings.address}`
		}
	};
}
