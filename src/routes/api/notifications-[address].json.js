import { convertOptinString } from '$lib/optin';

const init = { headers: { Authorization: `Bearer ${import.meta.env.VITE_SECRET_UPSTASH_TOKEN}` } };

export async function get({ params }) {
	const now = new Date();
	const utcMilllisecondsSinceEpoch = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
	const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000);
	const utcSecondsSinceEpoch7DaysAgo = utcSecondsSinceEpoch - 7 * 60 * 60 * 24;

	let subscriptions = await fetch('https://eu1-present-bull-34198.upstash.io/', {
		method: 'POST',
		body: JSON.stringify(['HGETALL', `u:${params.address.toLowerCase()}`]),
		...init
	});

	if (!subscriptions.ok) return { body: { status: 'upstash issue' } };
	subscriptions = await subscriptions.json();
	if (!subscriptions.result.length) return { body: { status: 'no profile' } };

	const domainOptins = Object.fromEntries(
		subscriptions.result
			.map((key, index) => {
				if (index % 2 === 0 && key.startsWith('d:')) {
					return [key.slice(2), convertOptinString(subscriptions.result[index + 1])];
				} else if (index % 2 === 0 && key === 'positions') {
					return [key, subscriptions.result[index + 1]];
				}
			})
			.filter((entry) => !!entry)
	);
	let positions = JSON.parse(domainOptins.positions);
	if (positions) {
		positions = positions.reduce((walletPositions, coinPair) => {
			if (walletPositions[coinPair[0]]) {
				walletPositions[coinPair[0]] + coinPair[1];
			} else {
				walletPositions[coinPair[0]] = coinPair[1];
			}
			return walletPositions;
		}, {});
	}
	delete domainOptins.positions;
	// Check if profile has subscriptions, if not return empty
	if (!Object.keys(domainOptins).length) return { body: [] };

	let notifications = await fetch('https://eu1-present-bull-34198.upstash.io/', {
		method: 'POST',
		body: JSON.stringify(['ZRANGEBYSCORE', 'notifications', utcSecondsSinceEpoch7DaysAgo, '+inf']),
		...init
	});

	notifications = await notifications.json();

	// No notifications, return empty array
	if (!notifications.result.length) return { body: [] };

	let commands = [];
	notifications.result.map((pushSignature) => {
		// TODO: check cache before pushing the hgetall command
		commands.push(['HGETALL', `p:${pushSignature}`]);
	});
	notifications = await fetch('https://eu1-present-bull-34198.upstash.io/pipeline', {
		method: 'POST',
		body: JSON.stringify(commands),
		...init
	});
	notifications = await notifications.json();

	notifications = notifications
		.map((notification) => {
			// Most performant way to parse all notifications
			return Object.fromEntries(
				[...Array(Math.ceil(notification.result.length / 2))].map((_) => notification.result.splice(0, 2))
			);
		})
		.filter((notification) => {
			return (
				Object.keys(domainOptins).includes(notification.domain) &&
				domainOptins[notification.domain][notification.type] !== 'decline'
			);
		});

	notifications = notifications.reduce((domainNotificationsMap, notification) => {
		domainNotificationsMap[notification.domain] = domainNotificationsMap[notification.domain]
			? domainNotificationsMap[notification.domain].concat([notification])
			: [notification];
		return domainNotificationsMap;
	}, {});

	return {
		body: {
			notifications: notifications,
			positions: positions
		}
	};
}
