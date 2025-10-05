<script lang="ts">
	import { TextField } from 'm3-svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { pharmacies } = data;

	let query = $state('');

	let filteredPharmacies = $derived.by(() => {
		return pharmacies.filter(
			(pharmacy) =>
				pharmacy.name.toLowerCase().includes(query.toLowerCase()) ||
				pharmacy.address?.toLowerCase().includes(query.toLowerCase())
		);
	});
</script>

<div class="w-full">
	<TextField label="Search" bind:value={query} />
</div>
<div class="flex flex-col gap-4">
	{#each filteredPharmacies as pharmacy}
		<div class="flex flex-col gap-1">
			<h2 class="m3-font-title-medium">{pharmacy.name}</h2>
			<p class="m3-font-body-medium">{pharmacy.address}</p>
		</div>
	{/each}
</div>
