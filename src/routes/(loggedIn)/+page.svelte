<script lang="ts">
	import Fuse from 'fuse.js';
	import { TextFieldOutlined, Card } from 'm3-svelte';

	import PharmacySheet from '$lib/ui/pharmacySheet.svelte';
	import PharmacyReport from '$lib/ui/pharmacyReport.svelte';
	import ReportQualityIcon from '$lib/ui/reportQualityIcon.svelte';

	import type { PageProps } from './$types';
	import PharmacyCardContents from '$lib/ui/pharmacyCardContents.svelte';

	let { data }: PageProps = $props();
	let { pharmacies } = data;

	let query = $state('');

	let pharmacySheetOpen = $state(false);
	let selectedPharmacy: (typeof pharmacies)[0] | undefined = $state(undefined);

	let pharmacyReportOpen = $state(false);

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

<div class="mb-4 w-full">
	<TextFieldOutlined label="Search" bind:value={query} />
	<div>
		<p>Service quality guide</p>
		<ul class="flex flex-col gap-2">
			<li class="flex flex-row items-center gap-2">
				<ReportQualityIcon report="++" /> Excellent: service was fast and friendly, no needless waiting
				or uncertainty
			</li>
			<li class="flex flex-row items-center gap-2">
				<ReportQualityIcon report="+" /> Good: the prescription was dispensed, but service was not perfect
			</li>
			<li class="flex flex-row items-center gap-2">
				<ReportQualityIcon report="-" /> Bad: dispensing of prescription was denied
			</li>
			<li class="flex flex-row items-center gap-2">
				<ReportQualityIcon report="?" /> Unknown: no data available
			</li>
		</ul>
	</div>
</div>
<div class="flex flex-col gap-4">
	{#each filteredPharmacies as pharmacy (pharmacy.id)}
		<Card
			variant="outlined"
			onclick={() => {
				pharmacySheetOpen = true;
				selectedPharmacy = pharmacy;
			}}
		>
			<PharmacyCardContents
				{pharmacy}
				onReport={(e) => {
					e.stopPropagation();
					selectedPharmacy = pharmacy;
					pharmacyReportOpen = true;
				}}
			/>
		</Card>
	{/each}
</div>

<PharmacySheet
	open={pharmacySheetOpen}
	onClose={() => (pharmacySheetOpen = false)}
	makeReport={() => (pharmacyReportOpen = true)}
	pharmacy={selectedPharmacy}
/>
<PharmacyReport
	open={pharmacyReportOpen}
	pharmacy={selectedPharmacy}
	onClose={() => (pharmacyReportOpen = false)}
/>
