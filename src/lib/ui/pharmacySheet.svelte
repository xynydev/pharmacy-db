<script lang="ts">
	import { BottomSheet, Button, Card } from 'm3-svelte';
	import ReportQualityIcon from '$lib/ui/reportQualityIcon.svelte';
	import PharmacyCardContents from '$lib/ui/pharmacyCardContents.svelte';

	/* eslint svelte/no-unused-props: ["error", { "allowUnusedNestedProperties": true }] */
	let {
		open,
		onClose,
		makeReport,
		pharmacy
	}: {
		open: boolean;
		onClose: () => void;
		makeReport: () => void;
		pharmacy:
			| {
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
			  }
			| undefined;
	} = $props();

	let reports:
		| Array<{
				id: number;
				pharmacyId: number | null;
				userId: number | null;
				time: Date;
				report: '++' | '+' | '-';
				extraInfo: string | null;
		  }>
		| undefined = $state(undefined);

	$effect(() => {
		reports = undefined;
		fetch(`/api/getReports?pharmacyId=${pharmacy?.id}`).then((res) => {
			res.json().then((data) => {
				reports = data;
			});
		});
	});
</script>

{#if open && pharmacy}
	<BottomSheet close={() => onClose()}>
		<div class="flex min-h-[50dvh] flex-col gap-2 px-2">
			<PharmacyCardContents {pharmacy} onReport={() => makeReport()}></PharmacyCardContents>
			<div class="flex flex-col p-2">
				{#if pharmacy.description}
					<p class="m3-font-body-medium">
						{pharmacy.description}
					</p>
					<div class="my-2"></div>
				{/if}
				{#if pharmacy.url}
					<a
						class="underline m3-font-body-medium"
						href={pharmacy.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{pharmacy.url}
					</a>
				{/if}
				{#if pharmacy.phone}
					<p class="m3-font-body-medium">
						{pharmacy.phone}
					</p>
				{/if}
				{#if pharmacy.email}
					<p class="m3-font-body-medium">
						{pharmacy.email}
					</p>
				{/if}
			</div>
			<div class="flex flex-col gap-2">
				{#if reports}
					{#if reports.length > 0}
						{#each reports as report (report.id)}
							<Card variant="outlined">
								<div class="flex flex-row items-center gap-5">
									<ReportQualityIcon report={report.report} />
									<p class="m3-font-body-medium">{new Date(report.time).toLocaleString('se')}</p>
								</div>
								{#if report.extraInfo}
									<p class="mt-2 p-2 m3-font-body-medium">
										{report.extraInfo}
									</p>
								{/if}
							</Card>
						{/each}
					{:else}
						<p>No reports found.</p>
					{/if}
				{:else}
					<p>Loading...</p>
				{/if}
			</div>
		</div>
	</BottomSheet>
{/if}
