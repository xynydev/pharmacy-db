<script lang="ts">
	import { authClient } from '$lib/authClient';
	import { Button, TextFieldOutlined, Card, Icon, Select } from 'm3-svelte';

	import { icons as iconify } from '@iconify-json/mdi';
	const { icons } = iconify;

	let inviteCode = $state('');

	let errors = $state({
		signUp: null,
		signInPasskey: null
	});

	const signUp = async () => {
		const res = await fetch('/api/auth/sign-in/anonymous', {
			method: 'POST',
			body: JSON.stringify({
				inviteCode: inviteCode
			})
		});
		if (!res.ok) {
			const error = await res.json();
			console.log(error);
			errors.signUp = error;
		} else {
			errors.signUp = null;
			window.location.href = '/account';
		}
	};

	const signInPasskey = async () => {
		const { data, error } = await authClient.signIn.passkey();
		if (error) {
			errors.signInPasskey = error;
		} else {
			errors.signInPasskey = null;
			window.location.href = '/';
		}
	};

	$effect(() => {
		authClient.getSession().then((session) => {
			if (session?.data) {
				window.location.href = '/account';
			}
		});
	});
</script>

<div class="flex min-h-dvh flex-col items-center">
	{@render invite()}
</div>

{#snippet invite()}
	<div class="flex w-m max-w-full flex-col items-center gap-2 p-4">
		<div class="flex flex-row flex-wrap items-center gap-2">
			<TextFieldOutlined label="Invite code" bind:value={inviteCode} />
			<Button onclick={signUp}>Sign up</Button>
		</div>
		{#if errors.signUp}
			<p class="text-error m3-font-body-medium">
				Error signing up with invite code: {errors.signUp.message}
			</p>
		{/if}
		<div class="mt-10 flex flex-col gap-3">
			<p>OR: use a pre-existing passkey to sign in</p>
			<Button onclick={signInPasskey}>Sign in (passkey)</Button>
			{#if errors.signInPasskey}
				<p class="text-error m3-font-body-medium">
					Error signing in with passkey: {errors.signInPasskey.message}
				</p>
			{/if}
		</div>
	</div>
{/snippet}
