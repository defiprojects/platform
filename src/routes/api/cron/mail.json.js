import { convertOptinString } from '$lib/optin';
const init = { headers: { Authorization: `Bearer ${import.meta.env.VITE_SECRET_UPSTASH_TOKEN}` } };

export async function post({ request }) {
	// Only authorized calls to prevent spamming
	if (
		request.headers.get('Authorization') !==
		`Bearer ${import.meta.env.VITE_SECRET_SNOWFLAKES_BEARER_TOKEN}`
	) {
		return {
			body: {
				status: 'forbidden'
			}
		};
	}

	// Get all mail receivers
	const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saterday'];
	const d = new Date();
	let day = d.getUTCDay();
	let hours = d.getUTCHours();
	let minutes = d.getUTCMinutes();
	let dayMinutesSinceMidnight = hours * 60 + minutes;

	let mailReceivers = await fetch('https://eu1-present-bull-34198.upstash.io/', {
		method: 'POST',
		body: JSON.stringify([
			'ZRANGEBYSCORE',
			`mail:${days[day]}`,
			dayMinutesSinceMidnight - 2,
			dayMinutesSinceMidnight + 2
			// For easy testing, comment the two lines above and uncomment the two under
			// "-inf",
			// "+inf"
		]),
		...init
	});
	mailReceivers = await mailReceivers.json();

	if (!mailReceivers.result.length) return { body: { status: 'no mail receivers, job done' } };

	// Get all notifications
	const now = new Date();
	const utcMilllisecondsSinceEpoch = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
	const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000);
	const utcSecondsSinceEpoch7DaysAgo = utcSecondsSinceEpoch - 7 * 60 * 60 * 24;

	let notifications = await fetch('https://eu1-present-bull-34198.upstash.io/', {
		method: 'POST',
		body: JSON.stringify(['ZRANGEBYSCORE', 'notifications', utcSecondsSinceEpoch7DaysAgo, '+inf']),
		...init
	});

	notifications = await notifications.json();

	// No notifications, return empty array
	if (!notifications.result.length)
		return { body: { status: 'Mail job done, no email needed to be sent' } };

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

	notifications = notifications.map((notification) => {
		// Most performant way to parse all notifications
		return Object.fromEntries(
			[...Array(Math.ceil(notification.result.length / 2))].map((_) =>
				notification.result.splice(0, 2)
			)
		);
	});

	// Loop through mailreceivers and get profile before filtering notifications and sending mail
	mailReceivers.result.map(async (receiver, index) => {
		let mailNotifications = notifications;
		let subscriptions = await fetch('https://eu1-present-bull-34198.upstash.io/', {
			method: 'POST',
			body: JSON.stringify(['HGETALL', `u:${receiver.toLowerCase()}`]),
			...init
		});
		subscriptions = await subscriptions.json();
		const domainOptins = Object.fromEntries(
			subscriptions.result
				.map((key, index) => {
					if (index % 2 === 0 && key.startsWith('d:')) {
						return [key.slice(2), convertOptinString(subscriptions.result[index + 1])];
					} else if (index % 2 === 0 && ['positions', 'email'].includes(key)) {
						return [key, subscriptions.result[index + 1]];
					}
				})
				.filter((entry) => !!entry)
		);
		let positions = JSON.parse(domainOptins.positions);
		let email = domainOptins.email;

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
		delete domainOptins.email;

		if (Object.keys(domainOptins).length) {
			mailNotifications = mailNotifications.filter((notification) => {
				return (
					Object.keys(domainOptins).includes(notification.domain) &&
					domainOptins[notification.domain][notification.type] !== 'decline'
				);
			});

			mailNotifications = mailNotifications.reduce((domainNotificationsMap, notification) => {
				domainNotificationsMap[notification.domain] = domainNotificationsMap[notification.domain]
					? domainNotificationsMap[notification.domain].concat([notification])
					: [notification];
				return domainNotificationsMap;
			}, {});

			mailNotifications = Object.keys(mailNotifications).map((domain) => {
				return { name: domain, notifications: mailNotifications[domain] };
			});
			console.log(JSON.stringify(mailNotifications));
			await sendEmail(email, mailNotifications, 'd-f524c9dfec27447e90b3516cc4a12ffd');
		}
	});

    let adminEmail = `${import.meta.env.VITE_SECRET_ADMIN_EMAIL}`
    await sendEmail(adminEmail, mailReceivers.result, 'd-13aab6800853418885e2286a37fdc10a')

	return {
		body: {
			status: "Mail job done"
		}
	};
}

async function sendEmail(to, payload, template_id) {
	const email = await fetch('https://api.sendgrid.com/v3/mail/send', {
		body: JSON.stringify({
			from: {
				email: 'charif@snowflakes.network'
			},
			personalizations: [
				{
					to: [
						{
							email: to
						}
					],
					dynamic_template_data: {
						domains: payload
					}
				}
			],
			template_id: template_id
		}),
		headers: {
			Authorization: `Bearer ${import.meta.env.VITE_SECRET_SENDGRID_TOKEN}`,
			'Content-Type': 'application/json'
		},
		method: 'POST'
	});
	return email;
}
