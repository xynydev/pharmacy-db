<script lang="ts">
	import { authClient } from '$lib/authClient';
	import { Button, TextFieldOutlined, Card } from 'm3-svelte';

	let inviteCode = $state('');

	let errors = $state({
		signUp: null,
		addPasskey: null,
		signInPasskey: null,
		deletePasskey: null
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
			window.location.href = '/login';
		}
	};
	const addPasskey = async () => {
		const { data, error } = await authClient.passkey.addPasskey({
			name: 'Pharmacy Database Passkey'
		});
		if (error) {
			errors.addPasskey = error;
		} else {
			errors.addPasskey = null;
			window.location.href = '/login';
		}
	};
	const signInPasskey = async () => {
		const { data, error } = await authClient.signIn.passkey();
		if (error) {
			errors.signInPasskey = error;
		} else {
			errors.signInPasskey = null;
			window.location.href = '/login';
		}
	};
	const deletePasskey = async (id: string) => {
		const { data, error } = await authClient.passkey.deletePasskey({ id });
		if (error) {
			errors.deletePasskey = error;
		} else {
			errors.deletePasskey = null;
			window.location.href = '/login';
		}
	};
	const signOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = '/login';
				}
			}
		});
	};

	let session = $state();
	let passkeys = $state();
	$effect(() => {
		session = authClient.getSession();
		passkeys = authClient.passkey.listUserPasskeys();
	});
</script>

<div class="flex min-h-dvh flex-col items-center">
	{#await session}
		<p>Loading...</p>
	{:then session}
		{#await passkeys}
			<p>Loading...</p>
		{:then passkeys}
			{#if !session?.data}
				{@render invite()}
			{:else}
				{@render loggedIn(passkeys)}
			{/if}
		{/await}
	{/await}
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

{#snippet loggedIn(passkeys)}
	<header class="w-full bg-surface-container-low p-4">
		<a href="/">
			<h1 class="m3-font-title-large">Pharmacy Database</h1>
		</a>
	</header>
	<div class="flex w-m max-w-full flex-col p-4">
		<h2 class="my-2 m3-font-title-large">Logged in</h2>
		<p class="m3-font-body-medium">
			You can now use the <a href="/" class="underline">database</a> and submit reports.
		</p>
		<h3 class="mt-4 mb-2 m3-font-title-medium">Passkeys</h3>
		<div class="grid grid-cols-1 gap-2 m:grid-cols-[1fr_auto]">
			<p class="my-2 m3-font-body-medium">
				Passkeys are a secure way to store your access to the pharmacy database. Invite codes can be
				used only once, but when you set up a passkey you will always have access.
			</p>
			<Button variant="tonal" onclick={addPasskey}>Add Passkey</Button>
		</div>
		{#if errors.addPasskey}
			<p class="text-error m3-font-body-medium">
				Error adding passkey: {errors.addPasskey.message}
			</p>
		{/if}
		<hr class="my-4" />
		{#if passkeys.data.length > 0}
			<ul class="flex flex-col gap-2">
				{#each passkeys.data as passkey (passkey.id)}
					<li>
						<Card variant="outlined">
							<div class="grid grid-cols-[1fr_auto]">
								<h4 class="m3-font-title-small">{passkey.name}</h4>
								<p class="col-start-1 m3-font-body-small">
									Created {new Date(passkey.createdAt).toLocaleString()}
								</p>
								<div class="col-start-2 row-span-2 row-start-1">
									<Button variant="tonal" onclick={() => deletePasskey(passkey.id)}>Delete</Button>
								</div>
							</div>
						</Card>
					</li>
				{/each}
			</ul>
			{#if errors.deletePasskey}
				<p class="text-error m3-font-body-medium">
					Error deleting passkey: {errors.deletePasskey.message}
				</p>
			{/if}
		{:else}
			<p class="italic m3-font-body-small">No passkeys found</p>
		{/if}
		<hr class="my-4" />
		<Button onclick={signOut}>Log out</Button>
	</div>
{/snippet}
