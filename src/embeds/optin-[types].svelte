<script>
	import { ethers } from 'ethers';
	import { Bundle, Decline, Instant } from '$lib/icons';
	import { page } from '$app/stores';

	let notificationLevels = ['instant', 'bundle', 'decline'];
	let notificationSetting = {
		'📢': { text: 'General', setting: 'bundle' },
		'🚨': { text: 'Security', setting: 'instant' },
		'🗳': { text: 'Vote', setting: 'bundle' },
		'🚀': { text: 'Launch', setting: 'bundle' },
		'👤': { text: 'Personall', setting: 'bundle' }
	};
	let notificationTypes = ['🚨', '👤', '🚀', '🗳', '📢'].filter((type) => {
		if (!~$page.params.types.indexOf(type)) {
			delete notificationSetting[type];
			return false;
		}
		return true;
	});

	async function saveNotificationSettings() {
		await ethereum.request({
			method: 'eth_requestAccounts'
		});
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const address = await signer.getAddress();

		let optinString = Object.values(notificationSetting)
			.map((notification) => {
				return `${notification.text.charAt(0)}${notification.setting.charAt(0)}`;
			})
			.join('')
			.toLowerCase();
		const settings = {
			domain: 'snowflakes.network',
			optin: optinString,
			address: address
		};

		const signature = await signer.signMessage(
			`Save notifications settings: ${JSON.stringify(settings)}`
		);
		settings.signature = signature;

		const options = {
			method: 'POST',
			body: JSON.stringify(settings),
			headers: {
				'Content-Type': 'application/json'
			}
		};

		fetch('/api/subscription.json', options)
			.then((res) => res.json())
			.then((res) => console.log(res));
	}
</script>

<div class="w-[260px] px-1 bg-white mx-auto">
	<div class="flex flex-col items-center justify-start w-full">
		<div class="flex flex-wrap justify-around items-left w-full ">
			{#each notificationTypes as notificationType}
				<div class="flex flex-col items-center mx-1">
					<p class="leading-24 text-sky-900">
						{notificationType}
						{notificationSetting[notificationType].text} notifications
					</p>
					<fieldset class="mb-2">
						<div class="switch-toggle flex items-center text-sky-700">
							{#each notificationLevels as notificationLevel}
								<input
									name="notification-level-{notificationType}"
									type="radio"
									checked={notificationSetting[notificationType].setting === notificationLevel}
									bind:group={notificationSetting[notificationType].setting}
									value={notificationLevel}
								/>
								<label
									on:click={() =>
										(notificationSetting[notificationType].setting = notificationLevel)}
									for="notification-level-{notificationType}"
									class="{notificationLevel} block bg-sky-200 text-sm border-white border-y-2 capitalize flex items-center transition-100"
									class:active-sub={notificationSetting[notificationType].setting === notificationLevel}
								>
									{#if notificationLevel === 'bundle'}
										<Bundle />
									{:else if notificationLevel === 'decline'}
										<Decline />
									{:else if notificationLevel === 'instant'}
										<Instant />
									{/if}
									{notificationLevel}
								</label>
							{/each}
						</div>
					</fieldset>
				</div>
			{/each}
			<button
				class="rounded-md mt-2 text-sky-50 bg-sky-500 hover:border-b-2 hover:translate-y-1 transition-100 py-1 w-[220px] border-2 border-sky-600 border-b-4 border-b-sky-700"
				on:click={saveNotificationSettings}
			>
				Save notification settings
			</button>
		</div>
	</div>
</div>

<style>
	@tailwind base;
	@tailwind utilities;

	div {
		line-height: 1.5;
		-webkit-text-size-adjust: 100%;
		-moz-tab-size: 4;
		tab-size: 4;
		font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
			'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
			'Segoe UI Symbol', 'Noto Color Emoji';
	}

	.switch-toggle {
		float: left;
	}
	.switch-toggle input {
		position: absolute;
		opacity: 0;
	}
	.switch-toggle input + label {
		padding: 5px;
		float: left;
		cursor: pointer;
		font-weight: light;
	}
	.switch-toggle input:checked + label {
		font-weight: normal;
	}

	.active-sub {
		--tw-text-opacity: 1;
		color: rgb(255 255 255 / var(--tw-text-opacity));
		--tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
		--tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
		box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
			var(--tw-shadow);
		border-width: 2px 2px 4px;
	}
	.bundle.active-sub {
		--tw-bg-opacity: 1;
		background-color: rgb(34 197 94 / var(--tw-bg-opacity));
		--tw-border-opacity: 1;
		border-color: rgb(21 128 61 / var(--tw-border-opacity));
		border-bottom-color: rgb(22 101 52 / var(--tw-border-opacity));
	}
	.decline {
		border-top-right-radius: 0.375rem;
		border-bottom-right-radius: 0.375rem;
	}

	.decline.active-sub {
		-tw-bg-opacity: 1;
		background-color: rgb(244 63 94 / var(--tw-bg-opacity));
		--tw-border-opacity: 1;
		border-bottom-color: rgb(159 18 57 / var(--tw-border-opacity));
		border-color: rgb(190 18 60 / var(--tw-border-opacity));
	}

	.instant {
		border-top-left-radius: 0.375rem;
		border-bottom-left-radius: 0.375rem;
	}

	.instant.active-sub {
		--tw-bg-opacity: 1;
		background-color: rgb(234 179 8 / var(--tw-bg-opacity));
		--tw-border-opacity: 1;
		border-bottom-color: rgb(133 77 14 / var(--tw-border-opacity));
		border-color: rgb(161 98 7 / var(--tw-border-opacity));
	}
</style>
