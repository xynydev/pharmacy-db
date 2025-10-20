<script lang="ts">
	import Fuse from 'fuse.js';
	import { TextFieldOutlined, Card, ConnectedButtons, TogglePrimitive } from 'm3-svelte';

	import PharmacySheet from '$lib/ui/pharmacySheet.svelte';
	import PharmacyReport from '$lib/ui/pharmacyReport.svelte';
	import ReportQualityIcon from '$lib/ui/reportQualityIcon.svelte';

	import type { PageProps } from './$types';
	import PharmacyCardContents from '$lib/ui/pharmacyCardContents.svelte';

	let { data }: PageProps = $props();
	let { pharmacies } = data;

	let query = $state('');

	let filter = $state({
		quality: {
			Excellent: false,
			Good: false,
			Bad: false,
			Unknown: false
		}
	});
	$inspect(filter);

	let pharmacySheetOpen = $state(false);
	let selectedPharmacy: (typeof pharmacies)[0] | undefined = $state(undefined);

	let pharmacyReportOpen = $state(false);

	const fuse = new Fuse(pharmacies, {
		keys: ['name', 'address']
	});

	let filteredPharmacies = $derived.by(() => {
		const fuseResults = query === '' ? pharmacies : fuse.search(query).map((result) => result.item);
		const filtered = fuseResults.filter((pharmacy) => {
			if (
				!filter.quality.Excellent &&
				!filter.quality.Good &&
				!filter.quality.Bad &&
				!filter.quality.Unknown
			) {
				return true;
			}
			const categories = Object.keys(filter.quality)
				.filter((key) => filter.quality[key])
				.map((key) => key.toLowerCase());
			const mainReport =
				pharmacy.reports.excellent + pharmacy.reports.good + pharmacy.reports.bad > 0
					? Object.keys(pharmacy.reports).find(
							(key) =>
								pharmacy.reports[key as keyof typeof pharmacy.reports] ===
								Math.max(pharmacy.reports.excellent, pharmacy.reports.good, pharmacy.reports.bad)
						)
					: 'unknown';
			console.log(mainReport);
			return categories.includes(mainReport);
		});
		return filtered;
	});
</script>

<div class="mb-4 w-full">
	<TextFieldOutlined label="Search" bind:value={query} />
	<details class="p-2">
		<summary>Service quality guide</summary>
		<ul class="flex flex-col gap-2 p-4">
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
	</details>
	<div class="flex flex-row">
		<div class="flex flex-col gap-2">
			<p>Filter by service quality:</p>
			<ConnectedButtons>
				<TogglePrimitive bind:toggle={filter.quality.Excellent}>Excellent</TogglePrimitive>
				<TogglePrimitive bind:toggle={filter.quality.Good}>Good</TogglePrimitive>
				<TogglePrimitive bind:toggle={filter.quality.Bad}>Bad</TogglePrimitive>
				<TogglePrimitive bind:toggle={filter.quality.Unknown}>Unknown</TogglePrimitive>
			</ConnectedButtons>
		</div>
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
