<script lang="ts">
	import { Button } from 'm3-svelte';
	import ReportQualityIcon from './reportQualityIcon.svelte';

	/* eslint svelte/no-unused-props: ["error", { "allowUnusedNestedProperties": true }] */
	const {
		pharmacy,
		onReport
	}: {
		pharmacy: {
			reports: {
				excellent: number;
				good: number;
				bad: number;
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
		};
		onReport: (e: Event) => void;
	} = $props();

	const reportTextToValue = {
		excellent: '++',
		good: '+',
		bad: '-'
	};

	const mainReport =
		pharmacy.reports.excellent + pharmacy.reports.good + pharmacy.reports.bad > 0
			? reportTextToValue[
					Object.keys(pharmacy.reports).find(
						(key) =>
							pharmacy.reports[key as keyof typeof pharmacy.reports] ===
							Math.max(pharmacy.reports.excellent, pharmacy.reports.good, pharmacy.reports.bad)
					) as keyof typeof reportTextToValue
				]
			: '?';
</script>

<div class="flex flex-row items-center gap-6">
	<ReportQualityIcon report={mainReport as '++' | '+' | '-' | '?'} />
	<div class="flex flex-col gap-1">
		<h2 class="m3-font-title-medium">{pharmacy.name}</h2>
		<p class="m3-font-body-medium">{pharmacy.address}</p>
	</div>
	<div class="ml-auto">
		<Button onclick={onReport}>Report</Button>
	</div>
</div>
