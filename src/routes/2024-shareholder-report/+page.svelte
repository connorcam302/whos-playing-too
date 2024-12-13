<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from '../$types';
	import HomePage from './HomePage.svelte';
	import IndividualRecords from './IndividualRecords.svelte';
	import MatchRecords from './MatchRecords.svelte';
	import OfTheYear from './OfTheYear.svelte';
	import PersonalReport from './PersonalReport.svelte';
	import StacksOfTheYear from './StacksOfTheYear.svelte';
	import MaterialSymbolsArrowForwardRounded from '~icons/material-symbols/arrow-forward-rounded';
	import MaterialSymbolsArrowBackRounded from '~icons/material-symbols/arrow-back-rounded';
	import { fade } from 'svelte/transition';

	export let data: PageData;

	$: currentPage = 'reports';

	const pages = ['home', 'oty', 'stack', 'matches', 'individual', 'reports'];

	const nextPage = () => {
		console.log(currentPage);
		window.scroll(0, window.scrollY - 90000000);
		currentPage = pages[pages.findIndex((page) => page === currentPage) + 1];
	};

	const previousPage = () => {
		console.log(currentPage);
		window.scroll(0, window.scrollY - 90000000);
		currentPage = pages[pages.findIndex((page) => page === currentPage) - 1];
	};
</script>

<div class="flex flex-col items-center justify-center px-4 text-center">
	<div class="flex flex-wrap items-center justify-center gap-4">
		<button
			on:click={() => (currentPage = 'home')}
			class={`w-40 rounded-xl ${
				currentPage !== 'home' ? 'bg-zinc-800' : 'bg-sky-700'
			} px-2 py-1 duration-300 hover:bg-sky-700 `}>Home</button
		>
		<button
			class={`w-40 rounded-xl ${
				currentPage !== 'oty' ? 'bg-zinc-800' : 'bg-sky-700'
			} px-2 py-1 duration-300 hover:bg-sky-700 `}
			on:click={() => (currentPage = 'oty')}>Of The Year</button
		>
		<button
			class={`w-40 rounded-xl ${
				currentPage !== 'stack' ? 'bg-zinc-800' : 'bg-sky-700'
			} px-2 py-1 duration-300 hover:bg-sky-700 `}
			on:click={() => (currentPage = 'stack')}>Stack Awards</button
		>
		<button
			class={`w-40 rounded-xl ${
				currentPage !== 'matches' ? 'bg-zinc-800' : 'bg-sky-700'
			} px-2 py-1 duration-300 hover:bg-sky-700 `}
			on:click={() => (currentPage = 'matches')}>Match Awards</button
		>
		<button
			class={`w-40 rounded-xl ${
				currentPage !== 'individual' ? 'bg-zinc-800' : 'bg-sky-700'
			} px-2 py-1 duration-300 hover:bg-sky-700 `}
			on:click={() => (currentPage = 'individual')}>Individual Awards</button
		>
		<button
			class={`w-40 rounded-xl ${
				currentPage !== 'reports' ? 'bg-zinc-800' : 'bg-sky-700'
			} px-2 py-1 duration-300 hover:bg-sky-700 `}
			on:click={() => (currentPage = 'reports')}>Report</button
		>
	</div>
	{#key currentPage}
		<div class="py-8" in:fade={{ delay: 120, duration: 250 }}>
			{#if currentPage === 'home'}
				<HomePage />
			{/if}
			{#if currentPage === 'matches'}
				<MatchRecords matches={data.matches} />
			{/if}
			{#if currentPage === 'oty'}
				<OfTheYear oty={data.oty} />
			{/if}
			{#if currentPage === 'stack'}
				<StacksOfTheYear stacks={data.stacks} />
			{/if}
			{#if currentPage === 'individual'}
				<IndividualRecords records={data.individualRecords} />
			{/if}
			{#if currentPage === 'reports'}
				<PersonalReport />
			{/if}
		</div>
	{/key}
	<div class="flex w-full max-w-screen-md justify-between">
		{#if currentPage !== 'home'}
			<button
				class="rounded-xl bg-zinc-800 p-2 text-2xl duration-300 hover:bg-sky-700"
				on:click={() => previousPage()}><MaterialSymbolsArrowBackRounded /></button
			>
		{:else}
			<button class="rounded-xl bg-zinc-800 p-2 text-2xl text-zinc-700" disabled
				><MaterialSymbolsArrowBackRounded /></button
			>
		{/if}
		{#if currentPage !== 'reports'}
			<button
				class="rounded-xl bg-zinc-800 p-2 text-2xl duration-300 hover:bg-sky-700"
				on:click={() => nextPage()}><MaterialSymbolsArrowForwardRounded /></button
			>
		{:else}
			<button class="rounded-xl bg-zinc-800 p-2 text-2xl text-zinc-700" disabled
				><MaterialSymbolsArrowForwardRounded /></button
			>
		{/if}
	</div>
</div>
