<script lang="ts">
	type Player = {
		id: number;
		username: string;
		kills?: number;
		deaths?: number;
		assists?: number;
		gpm?: number;
		xpm?: number;
		impact?: number;
		lastHits?: number;
		heroDamage?: number;
		winLoss?: number;
		hero?: {
			id: number;
			name: string;
			img: string;
		};
	};
	export let data: Player[] = [
			{ id: -1, username: 'PLAYER 1', kills: 999 },
			{ id: -1, username: 'PLAYER 1', kills: 999 },
			{ id: -1, username: 'PLAYER 1', kills: 999 }
		],
		title: string = 'RECORD TITLE',
		type: string = 'kills';
	console.log(type, data);
</script>

{#if type == 'winLoss'}
	<div
		class="bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 py-2 px-4 rounded-xl"
	>
		<div>{title}</div>
		<div class="flex flex-col">
			<div class="flex flex-row justify-between">
				<div>{data[0].username}</div>
				<div>{data[0][type]}</div>
			</div>
			<div class="flex flex-row justify-between">
				<div>{data[1].username}</div>
				<div>{data[1][type]}</div>
			</div>
			<div class="flex flex-row justify-between">
				<div>{data[2].username}</div>
				<div>{data[2][type]}</div>
			</div>
		</div>
	</div>
{:else}
	<div
		class="bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 rounded-xl"
	>
		<div
			class={`bg-cover bg-center bg-no-repeat rounded-xl min-h-28`}
			style={`background-image: url('${data[0].hero.img}')`}
		>
			<div class="flex bg-black bg-opacity-65 py-2 px-4 rounded-xl min-h-28">
				<div class="grow">
					<div class="text-2xl font-bold text-center font-display">{title}</div>
					<div class="flex-1 grow" />
					<div class="flex flex-row justify-between">
						<div>{data[0].username}</div>
						<div>{data[0][type]}</div>
					</div>
				</div>
			</div>
		</div>
		<div class="flex flex-row justify-between">
			<div>{data[1].username}</div>
			<div>{data[1][type]}</div>
		</div>
		<div class="flex flex-row justify-between">
			<div>{data[2].username}</div>
			<div>{data[2][type]}</div>
		</div>
	</div>
{/if}
