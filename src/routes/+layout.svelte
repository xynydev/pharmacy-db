<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { NavCMLXItem } from 'm3-svelte';
	import { icons as iconify } from '@iconify-json/mdi';
	import type { IconifyIcon } from '@iconify/types';

	const { icons } = iconify;

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="grid min-h-dvh grid-cols-1 grid-rows-[1fr_auto] x:grid-cols-[auto_1fr]">
	<div class="min-h-full x:col-start-2 x:col-end-2">
		<header class="w-full bg-surface-container-low p-4">
			<h1 class="m3-font-title-large">Pharmacy Database</h1>
		</header>
		<main class="p-4">
			{@render children?.()}
		</main>
	</div>
	<div
		class="sticky bottom-0 flex w-full bg-surface-container-low x:col-start-1 x:col-end-1 x:row-start-1"
	>
		<nav
			class="flex min-w-dvw flex-row justify-around gap-2 p-2 x:min-h-dvh x:min-w-32 x:flex-col x:justify-start"
		>
			<NavCMLXItem
				variant="auto"
				text="List"
				icon={icons['format-list-bulleted-type'] as IconifyIcon}
				selected={page.url.pathname === '/'}
				href="/"
			/>
			<NavCMLXItem
				variant="auto"
				text="Map"
				icon={icons['map'] as IconifyIcon}
				selected={false}
				href="/"
			/>
		</nav>
	</div>
</div>
