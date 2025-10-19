<script lang="ts">
	import { authClient } from '$lib/authClient';
	import { Button, TextFieldOutlined, Card, Select } from 'm3-svelte';

	let generatedCode: null | { code: string; expiresAt: Date } = $state(null);

	let roleChangeUserID = $state('');
	let roleChangeUserRole = $state('');
	let roleChangeMessage = $state(null);

	let errors = $state({
		addPasskey: null,
		deletePasskey: null,
		generateInviteCode: null,
		changeUserRole: null
	});

	const addPasskey = async () => {
		const { data, error } = await authClient.passkey.addPasskey({
			name: 'Pharmacy Database Passkey'
		});
		if (error) {
			errors.addPasskey = error;
		} else {
			errors.addPasskey = null;
			window.location.href = '/account';
		}
	};
	const deletePasskey = async (id: string) => {
		const { data, error } = await authClient.passkey.deletePasskey({ id });
		if (error) {
			errors.deletePasskey = error;
		} else {
			errors.deletePasskey = null;
			window.location.href = '/account';
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
	const generateInviteCode = async () => {
		const res = await fetch('/api/generateInviteCode', {
			method: 'POST'
		});
		if (res.ok) {
			const inviteCode = await res.json();
			generatedCode = { code: inviteCode.code, expiresAt: new Date(inviteCode.expiresAt) };
			errors.generateInviteCode = null;
		} else {
			errors.generateInviteCode = await res.text();
		}
	};
	const changeUserRole = async () => {
		const res = await fetch('/api/changeUserRole', {
			method: 'POST',
			body: JSON.stringify({
				userID: roleChangeUserID,
				role: roleChangeUserRole
			})
		});
		if (res.ok) {
			roleChangeMessage = await res.text();
			errors.changeUserRole = null;
		} else {
			roleChangeMessage = null;
			errors.changeUserRole = await res.text();
		}
	};
	const updatePharmacies = async () => {
		const res = await fetch('/api/updatePharmacies', {
			method: 'POST'
		});
		// if (res.ok) {
		// 	errors.updatePharmacies = null;
		// } else {
		// 	errors.updatePharmacies = await res.text();
		// }
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
			{#if session?.data}
				{@render loggedIn(session, passkeys)}
			{/if}
		{/await}
	{/await}
</div>

{#snippet loggedIn(session, passkeys)}
	<div class="flex w-m max-w-full flex-col p-4">
		<h2 class="my-2 m3-font-title-large">Logged in</h2>
		<p class="m3-font-body-medium">
			You can now use the <a href="/" class="underline">database</a> and submit reports.
		</p>
		<p class="mt-2 m3-font-body-small">user id: <code>{session.data.user.id}</code></p>
		<hr class="my-4" />
		<h3 class="mb-2 m3-font-title-medium">Passkeys</h3>
		<div class="mb-4 grid grid-cols-1 gap-2 m:mb-0 m:grid-cols-[1fr_auto]">
			<p class="m3-font-body-medium m:my-2">
				Passkeys are a secure way to keep your access to the pharmacy database. Invite codes can be
				used only once and sessions will expire after 7 days of no usage, but when you set up a
				passkey you will always have access to the site.
			</p>
			<Button variant="tonal" onclick={addPasskey}>Add Passkey</Button>
		</div>
		{#if errors.addPasskey}
			<p class="text-error m3-font-body-medium">
				Error adding passkey: {errors.addPasskey.message}
			</p>
		{/if}
		{#if passkeys.data.length > 0}
			<ul class="flex flex-col gap-2">
				{#each passkeys.data as passkey (passkey.id)}
					<li>
						<Card variant="outlined">
							<div class="grid grid-cols-[1fr_auto]">
								<h4 class="m3-font-title-small">{passkey.name}</h4>
								<p class="col-start-1 m3-font-body-small">
									Created {new Date(passkey.createdAt).toLocaleString('se')}
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
		{#if session.data.user.role !== 'user'}
			<h3 class="m3-font-title-medium">Administration</h3>
			<p class="m3-font-body-small">role: <code>{session.data.user.role}</code></p>
			<h4 class="mt-2 m3-font-title-medium">Invite codes</h4>

			<div class="mt-2 flex flex-col items-start gap-2 p-2">
				<Button variant="tonal" onclick={generateInviteCode}>Generate invite code</Button>
				{#if generatedCode}
					<Card variant="outlined">
						<p class="m3-font-body-small">
							Generated invite code: <code>{generatedCode.code}</code><br />
							Will expire on {generatedCode.expiresAt.toLocaleString('se')}
						</p>
					</Card>
				{/if}
				{#if errors.generateInviteCode}
					<p class="text-error m3-font-body-medium">
						Error generating invite code: {errors.generateInviteCode}
					</p>
				{/if}
			</div>
			{#if session.data.user.role === 'superadmin'}
				<h4 class="mt-2 m3-font-title-medium">Set user role</h4>
				<div class="flex flex-col gap-4 p-2">
					<div class="flex flex-row flex-wrap gap-2">
						<TextFieldOutlined label="user id" bind:value={roleChangeUserID} />
						<Select
							label="Role"
							options={[
								{ text: 'user', value: 'user' },
								{ text: 'admin', value: 'admin' },
								{ text: 'superadmin', value: 'superadmin' }
							]}
							bind:value={roleChangeUserRole}
						/>
					</div>
					<Button variant="tonal" onclick={changeUserRole}>Submit</Button>
					{#if errors.changeUserRole}
						<p class="text-error m3-font-body-medium">
							Error changing user role: {errors.changeUserRole}
						</p>
					{:else if roleChangeMessage}
						<p class="m3-font-body-medium">
							{roleChangeMessage}
						</p>
					{/if}
				</div>
				<h4 class="mt-2 m3-font-title-medium">Refresh pharmacy database</h4>
				<div class="flex flex-col gap-4 p-2">
					<Button variant="tonal" onclick={updatePharmacies}>Refresh pharmacy database</Button>
				</div>
			{/if}
			<hr class="my-4" />
		{/if}
		<Button onclick={signOut}>Log out</Button>
	</div>
{/snippet}
