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

	import { reportNameToData } from '$lib/reportHelpers';

	import { haversineDistance } from '$lib/geoHelpers';

	let { data }: PageProps = $props();
	let { pharmacies } = data;

	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let searchParams = new SvelteURLSearchParams(page.url.searchParams);
	// let searchParams = $derived(page.url.searchParams);

	let query = $derived(searchParams.get('q') || '');

	// let query = $state('');

	let filter = $state(
		searchParams.get('filter') !== null
			? JSON.parse(searchParams.get('filter'))
			: {
					quality: {
						Excellent: false,
						Good: false,
						Bad: false,
						Unknown: false
					}
				}
	);

	let pharmacySheetOpen = $derived(searchParams.get('pharmacy') !== null);
	let selectedPharmacy: (typeof pharmacies)[0] | null = $derived(
		searchParams.get('pharmacy')
			? (pharmacies.find((pharmacy) => pharmacy.id.toString() === searchParams.get('pharmacy')) ??
					null)
			: null
	);

	$effect(() => {
		searchParams.set('q', query);
		searchParams.set('filter', JSON.stringify(filter));
		if (pharmacySheetOpen && selectedPharmacy) {
			searchParams.set('pharmacy', selectedPharmacy.id.toString());
		} else {
			searchParams.delete('pharmacy');
		}
		/* eslint svelte/no-navigation-without-resolve: "off" */
		goto('?' + searchParams.toString(), { replaceState: true, keepFocus: true });
	});

	let pharmacyReportOpen = $state(false);

	let pos = $state({ lat: 0, lon: 0 });

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
			keys: ['name', 'brand', 'address']
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
				.map((key) => reportNameToData(key.toLowerCase()));
			return categories.includes(pharmacy.reports.latest);
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
		<Button variant="outlined" iconType="full" size="m" onclick={geolocate}>
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
