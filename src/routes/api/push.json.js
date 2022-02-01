import { ethers } from 'ethers';

const init = { headers: { Authorization: `Bearer ${import.meta.env.VITE_SECRET_UPSTASH_TOKEN}` } };

export async function post({ request }) {
	const { signature, ...push } = await request.json();
	const signerAddress = await ethers.utils.verifyMessage(
		`Save push: ${JSON.stringify(push)}`,
		signature
	);
	if (signerAddress === push.address) {
		const sevenDaysAgoInSeconds = 7 * 24 * 60 * 60;
		let commands = [['ZADD', `notifications`, 'NX', push.utcSecondsEpoch, signature]];

		let commandPushHash = ['HSET', `p:${signature}`];

		for (const [key, value] of Object.entries(push)) {
			commandPushHash.push(key, value);
		}

		commands = commands
			.concat([commandPushHash])
			.concat([['EXPIRE', `p:${signature}`, sevenDaysAgoInSeconds]]);

		let resp = await fetch('https://eu1-present-bull-34198.upstash.io/pipeline', {
			method: 'POST',
			body: JSON.stringify(commands),
			...init
		});
		const { result } = await resp.json();
	}
	return {
		body: {
			status: `verified: ${signerAddress === push.address}`
		}
	};
}
