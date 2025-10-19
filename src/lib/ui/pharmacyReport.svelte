<script lang="ts">
	import { Dialog, Button, Select, TextFieldOutlinedMultiline } from 'm3-svelte';
	import ReportQualityIcon from '$lib/ui/reportQualityIcon.svelte';

	let {
		open,
		onClose,
		pharmacy
	}: {
		open: boolean;
		onClose: () => void;
		pharmacy: { name: string; address: string; id: number } | undefined;
	} = $props();

	let quality: '++' | '+' | '-' | '' = $state('');
	let note = $state('');

	const qualityText = {
		'++': 'Excellent',
		'+': 'Good',
		'-': 'Bad'
	};

	$effect(() => {
		if (pharmacy) {
			quality = '';
		}
	});

	async function submitReport() {
		if (!pharmacy) return;
		if (!quality) {
			alert('Please select the service quality');
			return;
		}

		if (
			confirm(
				`Are you sure you want to report ${pharmacy.name} (${pharmacy.address}) as having ${qualityText[quality]} service?`
			)
		) {
			const report = {
				pharmacyId: pharmacy.id,
				report: quality,
				extraInfo: note
			};

			const res = await fetch('/api/sendReport', {
				method: 'POST',
				body: JSON.stringify(report)
			});
			if (!res.ok) {
				const data = await res.text();

				alert('Failed to send report: ' + data);
				return;
			}

			onClose();
		}
	}
</script>

{#if pharmacy}
	<div class="reportDialogContainer">
		<Dialog headline="Make a new report" bind:open onclose={onClose}>
			<div class="flex min-w-[80dvw] flex-col gap-5 text-on-background x:min-w-[50dvw]">
				<div>
					<h3 class="m3-font-title-medium">Selected pharmacy</h3>
					<p>{pharmacy.name}</p>
					<p>{pharmacy.address}</p>
				</div>
				<hr class="opacity-25" />
				<form class="flex flex-col gap-2">
					<p>Service quality evaluation</p>
					<ul class="flex flex-col gap-2">
						<li class="flex flex-row items-center gap-2">
							<ReportQualityIcon report="++" /> Excellent: service was fast and friendly, no needless
							waiting or uncertainty
						</li>
						<li class="flex flex-row items-center gap-2">
							<ReportQualityIcon report="+" /> Good: the prescription was dispensed, but service was
							not perfect
						</li>
						<li class="flex flex-row items-center gap-2">
							<ReportQualityIcon report="-" /> Bad: dispensing of prescription was denied
						</li>
					</ul>
					<Select
						label="Service quality"
						options={[
							{ text: 'Excellent', value: '++' },
							{ text: 'Good', value: '+' },
							{ text: 'Bad', value: '-' }
						]}
						bind:value={quality}
						width="1rem"
					/>
					<TextFieldOutlinedMultiline label="Extra comment (optional)" bind:value={note}
					></TextFieldOutlinedMultiline>
				</form>
			</div>

			{#snippet buttons()}
				<Button onclick={submitReport}>Submit</Button>
			{/snippet}
		</Dialog>
	</div>
{/if}

<style>
	:global(.reportDialogContainer dialog) {
		max-width: 100dvw !important;
	}
</style>
