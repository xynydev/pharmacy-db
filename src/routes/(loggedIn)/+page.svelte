<script lang="ts">
	import Fuse from 'fuse.js';
	import { TextField } from 'm3-svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { pharmacies } = data;

	let query = $state('');

	const fuse = new Fuse(pharmacies, {
		keys: ['name', 'address']
	});

	let filteredPharmacies = $derived.by(() => {
		if (query === '') {
			return pharmacies;
		}
		return fuse.search(query).map((result) => result.item);
	});
</script>

<div class="w-full">
	<TextField label="Search" bind:value={query} />
</div>
<div class="flex flex-col gap-4">
	{#each filteredPharmacies as pharmacy (pharmacy.id)}
		<div class="flex flex-col gap-1">
			<h2 class="m3-font-title-medium">{pharmacy.name}</h2>
			<p class="m3-font-body-medium">{pharmacy.address}</p>
		</div>
	{/each}
</div>
