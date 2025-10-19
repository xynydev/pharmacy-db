<script lang="ts">
	let { report }: { report: '++' | '+' | '-' | '?' } = $props();
</script>

{#if report === '++'}
	<div
		class="flex size-10 flex-row items-center justify-center rounded-full bg-excellent-bg text-excellent-fg"
	>
		++
	</div>
{:else if report === '+'}
	<div
		class="flex size-10 flex-row items-center justify-center rounded-full bg-good-bg text-good-fg"
	>
		+
	</div>
{:else if report === '-'}
	<div class="flex size-10 flex-row items-center justify-center rounded-full bg-bad-bg text-bad-fg">
		-
	</div>
{:else if report === '?'}
	<div
		class="flex size-10 flex-row items-center justify-center rounded-full bg-unknown-bg text-unknown-fg"
	>
		?
	</div>
{/if}
