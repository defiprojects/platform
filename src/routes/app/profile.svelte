<script>
	import { Clock, Email } from '$lib/icons';
	import { onMount } from 'svelte';
	import SveltyPicker from 'svelty-picker';
	import { toast } from '@zerodevx/svelte-toast';
	import { walletAddress, user } from '$lib/stores';
	import * as yup from 'yup';
	import { convertTimestampToUTCMinutes, convertUTCMinutesToTimestamp, urlBase64ToUint8Array } from '$lib/util';

	const applicationServerPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

	let profileSchema = yup.object().shape({
		monday: yup.bool(),
		tuesday: yup.bool(),
		wednesday: yup.bool(),
		thursday: yup.bool(),
		friday: yup.bool(),
		saterday: yup.bool(),
		sunday: yup.bool(),
		email: yup.string().email().nullable(),
		mailTime: yup.number().min(0).max(1440).integer().nullable()
	});

	let weekdays = {
		monday: true,
		tuesday: true,
		wednesday: true,
		thursday: true,
		friday: false,
		saterday: false,
		sunday: false
	};

	let email, emailToggle, mailTime, webPush, webToggle, webPushTime, webPushEnabled, telegram;

	onMount(() => {
		if ($user) {
			email = $user.get('email');
			mailTime = convertUTCMinutesToTimestamp($user.get('mailTime'));
			emailToggle = !!email;
			Object.keys(profileSchema.fields).map((profileKey) => {
				if (profileKey in weekdays) {
					weekdays[profileKey] = $user.get(profileKey);
				}
			});
		}
	});

	async function saveProfile() {
		const profile = {
			monday: weekdays.monday,
			tuesday: weekdays.tuesday,
			wednesday: weekdays.wednesday,
			thursday: weekdays.thursday,
			friday: weekdays.friday,
			saterday: weekdays.saterday,
			sunday: weekdays.sunday,
			email: emailToggle ? email : null,
			mailTime: emailToggle ? convertTimestampToUTCMinutes(mailTime) : null
		};

		await profileSchema
			.validate(profile)
			.then(async () => {
				Object.keys(profileSchema.fields).map((profileKey) => {
					$user.set(profileKey, profile[profileKey]);
				});
				await $user.save().then(async () => {
					toast.push('Profile saved');
					await Moralis.Cloud.run('putUser', { ...profile, address: $walletAddress });
				});
			})
			.catch((err) => {
				switch (err.errors[0]) {
					case 'email must be a valid email':
						toast.push('Invalid email', {
							theme: {
								'--toastColor': 'red',
								'--toastBarBackground': 'red',
								'--toastBackground': '#FECDD3'
							}
						});
						break;
				}
			});
	}

	async function deleteProfile() {
		Object.keys(profileSchema.fields).map((profileKey) => {
			$user.unset(profileKey);
		});

		await $user.save().then(async () => {
			toast.push('Profile deleted', {
				theme: {
					'--toastColor': '#BE123C',
					'--toastBarBackground': '#BE123C',
					'--toastBackground': '#FECDD3'
				}
			});
			await Moralis.Cloud.run('deleteUser', { address: $walletAddress });
		});
	}
</script>

<svelte:head>
	<title>Snowflakes.network | Profile</title>
</svelte:head>

<div
	class="col-span-10 m-4 p-6 border-2 border-sky-200 border-b-sky-400 shadow shadow-sky-200 rounded-2xl bg-white overflow-hidden"
>
	<form class="">
		<h1 class="text-3xl font-bold text-sky-900">Notification Profile</h1>

		<div class="pl-1 pt-3">
			<fieldset>
				<legend class="font-medium text-sky-900">Which days would you want to receive notifications?</legend>
				<div class="ml-2 mt-2 border-t border-sky-200 divide-y divide-sky-200">
					{#each Object.keys(weekdays) as weekday}
						<div class="relative flex items-start py-2">
							<div class="min-w-0 flex-1">
								<label for={weekday} class="text-sm text-sky-700 capitalize">{weekday}</label>
							</div>
							<button
								type="button"
								class="bg-sky-200 ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
								role="switch"
								on:click={() => (weekdays[weekday] = !weekdays[weekday])}
								class:active-bg={weekdays[weekday]}
							>
								<span
									aria-hidden="true"
									class:active-toggle={weekdays[weekday]}
									class="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
								/>
							</button>
						</div>
					{/each}
				</div>
			</fieldset>
		</div>
		<div class="pl-1 pt-3 divide-y divide-sky-200">
			<div>
				<h2 class="text-base font-medium text-sky-900">How do you want to be notified?</h2>
			</div>
			<ul class="ml-2 mt-2 divide-y divide-sky-200">
				<li class="py-2 flex items-center justify-between">
					<div class="flex flex-col">
						<p class="text-sm font-medium text-sky-900" id="privacy-option-1-label">Email notifications</p>
						<p class="text-sm text-sky-700" id="privacy-option-1-description">
							We send aggregated notifications summary emails at the time you want
						</p>
						{#if emailToggle}
							<div class="mt-4 ml-2">
								<label for="email" class="block text-sm font-medium text-sky-700">Email</label>
								<div class="mt-1 relative rounded-md shadow-sm">
									<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Email />
									</div>
									<input
										type="email"
										name="email"
										id="email"
										bind:value={email}
										class="focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 text-sky-900 sm:text-sm border-sky-300 rounded-md"
										placeholder="you@example.com"
									/>
								</div>
							</div>
							<div class="mt-4 ml-2">
								<label for="mailtime" class="block text-sm font-medium text-sky-700">Prefered mail time</label>
								<div class="mt-1 relative rounded-md shadow-sm">
									<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Clock />
									</div>
									<SveltyPicker
										inputClasses="max-w-[95px] text-sky-900 pl-10 mt-1 block w-full border border-sky-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
										mode="time"
										format="hh:ii"
										placeholder="19:15"
										bind:value={mailTime}
									/>
								</div>
							</div>
						{/if}
					</div>
					<button
						type="button"
						class="bg-sky-200 ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
						role="switch"
						on:click={() => (emailToggle = !emailToggle)}
						class:active-bg={emailToggle}
						aria-checked="true"
						aria-labelledby="privacy-option-1-label"
						aria-describedby="privacy-option-1-description"
					>
						<span
							aria-hidden="true"
							class:active-toggle={emailToggle}
							class="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
						/>
					</button>
				</li>
				<li class="py-4 flex items-center justify-between">
					<div class="flex flex-col">
						<p class="text-sm font-medium text-sky-900" id="privacy-option-2-label">Web push notifications</p>
						<p class="text-sm text-sky-700" id="privacy-option-2-description">
							We send an aggregated notifications summary by web push at the time you want
						</p>
					</div>
					<span class="text-sm text-sky-700">Coming soon</span>
				</li>
				<li class="py-4 flex items-center justify-between">
					<div class="flex flex-col">
						<p class="text-sm font-medium text-sky-900" id="privacy-option-3-label">Telegram notifications</p>
						<p class="text-sm text-sky-700" id="privacy-option-3-description">
							We send aggregated notifications telegram message at the time you want
						</p>
					</div>
					<span class="text-sm text-sky-700">Coming soon</span>
				</li>
			</ul>
		</div>
		<div class="py-4 flex justify-end">
			<button
				on:click|preventDefault={deleteProfile}
				class="bg-rose-500 border-2 border-b-4 border-rose-600 mr-4 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:border-b-2 hover:translate-y-px transition-100"
			>
				Delete profile
			</button>
			<button
				on:click|preventDefault={saveProfile}
				class="bg-sky-500 border-2 border-b-4 border-sky-600 hover:border-b-2 hover:translate-y-px transition-100 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white"
			>
				Save profile
			</button>
		</div>
	</form>
</div>

<style>
	.active-toggle {
		transform: translateX(1.25rem);
	}

	.active-bg {
		--tw-bg-opacity: 1;
		background-color: rgb(14 165 233 / var(--tw-bg-opacity));
	}
</style>
