<script lang="ts">
	import Fuse from 'fuse.js';
	import {
		TextFieldOutlined,
		Card,
		ConnectedButtons,
		TogglePrimitive,
		Icon,
		Button
	} from 'm3-svelte';

	import { icons as iconify } from '@iconify-json/material-symbols';
	const { icons } = iconify;

	import PharmacySheet from '$lib/ui/pharmacySheet.svelte';
	import PharmacyReport from '$lib/ui/pharmacyReport.svelte';
	import ReportQualityIcon from '$lib/ui/reportQualityIcon.svelte';

	import type { PageProps } from './$types';
	import PharmacyCardContents from '$lib/ui/pharmacyCardContents.svelte';

	import { haversineDistance } from '$lib/geoHelpers';

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

	let pos = $state({ lat: 0, lon: 0 });

	let pharmacySheetOpen = $state(false);
	let selectedPharmacy: (typeof pharmacies)[0] | undefined = $state(undefined);

	let pharmacyReportOpen = $state(false);

	let filteredSortedPharmacies = $derived.by(() => {
		const sortedPharmacies =
			pos.lat === 0 && pos.lon === 0
				? pharmacies
				: pharmacies.sort((a, b) => {
						const distanceA = haversineDistance(
							[pos.lat, pos.lon],
							[parseFloat(a.lat), parseFloat(a.lon)]
						);
						const distanceB = haversineDistance(
							[pos.lat, pos.lon],
							[parseFloat(b.lat), parseFloat(b.lon)]
						);

						return distanceA - distanceB;
					});

		const fuse = new Fuse(sortedPharmacies, {
			keys: ['name', 'address']
		});

		const fuseResults =
			query === '' ? sortedPharmacies : fuse.search(query).map((result) => result.item);
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
			return categories.includes(mainReport);
		});
		return filtered;
	});

	function geolocate() {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				pos.lat = position.coords.latitude;
				pos.lon = position.coords.longitude;
			},
			(error) => {
				console.error(error);
			}
		);
	}
</script>

<div class="mb-4 w-full">
	<div class="flex flex-row items-center gap-3">
		<TextFieldOutlined label="Search" bind:value={query} />
		<Button variant="outlined" iconType="full" size="l" onclick={geolocate}>
			<Icon icon={icons['my-location']} />
		</Button>
	</div>
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
	{#each filteredSortedPharmacies as pharmacy (pharmacy.id)}
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
