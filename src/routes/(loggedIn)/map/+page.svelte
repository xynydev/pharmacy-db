<script lang="ts">
	import PharmacySheet from '$lib/ui/pharmacySheet.svelte';
	import PharmacyReport from '$lib/ui/pharmacyReport.svelte';
	import ReportQualityIcon from '$lib/ui/reportQualityIcon.svelte';
	import { reportNameToData } from '$lib/reportHelpers';

	import { ConnectedButtons, TogglePrimitive } from 'm3-svelte';

	import { mount } from 'svelte';

	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let { data }: PageProps = $props();
	let {
		pharmacies
	}: {
		pharmacies: {
			reports: {
				excellent: number;
				good: number;
				bad: number;
				latest: '++' | '+' | '-' | undefined;
			};
			id: number;
			lat: string;
			lon: string;
			country: 'Finland';
			name: string;
			brand: string | null;
			description: string | null;
			address: string | null;
			email: string | null;
			phone: string | null;
			opening_hours: string | null;
			url: string | null;
		}[];
	} = data;

	let searchParams = new SvelteURLSearchParams(page.url.searchParams);
	let pharmacySheetOpen = $derived(searchParams.get('pharmacy') !== null);
	let pharmacyReportOpen = $state(false);
	let selectedPharmacy: (typeof pharmacies)[0] | null = $derived(
		searchParams.get('pharmacy')
			? (pharmacies.find((pharmacy) => pharmacy.id.toString() === searchParams.get('pharmacy')) ??
					null)
			: null
	);
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

	$effect(() => {
		searchParams.set('filter', JSON.stringify(filter));
		if (filter) {
			const markers = document.querySelectorAll('.marker');
			for (const marker of markers) {
				const show = (() => {
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
						.map((key) => reportNameToData(key.toLowerCase()) ?? 'undefined');

					return categories.includes(marker.dataset.quality);
				})();
				if (show) {
					marker.style.display = 'block';
				} else {
					marker.style.display = 'none';
				}
			}
		}

		if (pharmacySheetOpen && selectedPharmacy) {
			searchParams.set('pharmacy', selectedPharmacy.id.toString());
		} else {
			searchParams.delete('pharmacy');
		}
		/* eslint svelte/no-navigation-without-resolve: "off" */
		goto('?' + searchParams.toString(), { replaceState: true, keepFocus: true });
	});

	function renderMap(node) {
		const map = new maplibregl.Map({
			style: 'https://tiles.openfreemap.org/styles/liberty',
			center: [26, 65],
			zoom: 4,
			container: 'map'
		});

		map.on('load', async () => {
			map.addControl(
				new maplibregl.GeolocateControl({
					positionOptions: {
						enableHighAccuracy: true
					},
					trackUserLocation: false
				})
			);

			pharmacies.forEach((pharmacy) => {
				const el = document.createElement('div');
				el.className = 'marker';
				el.style.zIndex = '1000'; // so that it goes on top of geolocation and remains clickable
				el.dataset.quality = pharmacy.reports.latest;
				const show = (() => {
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
				})();
				if (show) {
					el.style.display = 'block';
				} else {
					el.style.display = 'none';
				}

				mount(ReportQualityIcon, {
					target: el,
					props: {
						report: pharmacy.reports.latest ?? '?'
					}
				});

				el.addEventListener('click', () => {
					pharmacySheetOpen = true;
					selectedPharmacy = pharmacy;
				});

				const marker = new maplibregl.Marker({
					element: el
				});
				marker.setLngLat([parseFloat(pharmacy.lon), parseFloat(pharmacy.lat)]);
				// marker.setPopup(new maplibregl.Popup().setHTML(`<h3>${pharmacy.name}</h3>`));

				marker.addTo(map);
			});
		});
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-row gap-2">
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
	<div use:renderMap class="h-[80svh] w-full" id="map"></div>
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
