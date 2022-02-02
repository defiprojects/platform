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

		const signature = await signer.signMessage(`Save notifications settings: ${JSON.stringify(settings)}`);
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
					<p class="mt-2 leading-24 text-sky-900">
						{notificationType}
						{notificationSetting[notificationType].text} notifications
					</p>
					<fieldset class="mb-1">
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
									on:click={() => (notificationSetting[notificationType].setting = notificationLevel)}
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
				class="rounded-md mt-3 text-sky-50 bg-sky-500 hover:border-b-2 hover:translate-y-1 transition-100 py-1 w-[220px] border-2 border-sky-600 border-b-4 border-b-sky-700"
				on:click={saveNotificationSettings}
			>
				Save notification settings
			</button>
		</div>
	</div>
</div>
