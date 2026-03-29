<script lang="ts">
	import ReportQualityIcon from '$lib/ui/reportQualityIcon.svelte';

	let {
		pharmacy
	}: {
		pharmacy: {
			reports: {
				excellent: number;
				good: number;
				bad: number;
				latest: string | undefined;
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
	} = $props();
</script>

<div class="absolute top-0 left-0 z-1000 -translate-x-1/2 -translate-y-1/2">
	<div class="card absolute top-0 left-0 -z-10 w-max pl-10">
		<div class="text">
			{pharmacy.name}
		</div>
	</div>
	<ReportQualityIcon report={pharmacy.reports.latest ?? '?'} />
</div>

<style>
	.card {
		background-color: hsl(0 0 100% / var(--show-text));
		border-radius: 2em;
	}
	.text {
		padding: 0.7em;
		opacity: var(--show-text);
		transition: opacity 500ms;
	}
</style>
