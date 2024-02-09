<script lang="ts">
	export let name: string, role: number, id: number, team: string;

	const getColour = (role: number, team: string) => {
		if (team === 'radiant') {
			switch (role) {
				case 1:
					return '#3476FF';
				case 2:
					return '#67FFC0';
				case 3:
					return '#F3F00C';
				case 4:
					return '#FF6C00';
				case 5:
					return '#C83CC8';
			}
		} else {
			switch (role) {
				case 1:
					return '#FE87C3';
				case 2:
					return '#A2B548';
				case 3:
					return '#66D9F7';
				case 4:
					return '#008422';
				case 5:
					return '#A56A00';
			}
		}
	};

	const getBasis = (role: number) => {
		switch (role) {
			case 1:
				return '45%';
			case 2:
				return '42%';
			case 3:
				return '34%';
			case 4:
				return '49%';
			case 5:
				return '49%';
		}
	};

	const basis = getBasis(role);
	const colour = getColour(role, team);
	console.log(colour);
</script>

<div class="flex flex-col items-center justify-center">
	<div class="font-bold text-xl font-dota tracking-wide" style="--text-color: {colour}" id="title">
		{name}
	</div>
	<div
		class="bg-gradient-to-br from-green-900 via-green-950 to-green-900 w-full flex gap-1 pl-1 pr-2 items-center"
	>
		<img src={`/roles/pos${role}.svg`} class="h-7" alt="pos3" />
		<div class="flex h-6 w-full flex-col bg-black p-[2px] gap-[1px]">
			<div class="flex w-full grow h-2/3">
				<div class="bg-[#7EF63C] grow flex">
					<div
						style="flex-basis: {basis}"
						class={`border-r-black border-r-[1px] border-opacity-20`}
					/>
					<div
						style="flex-basis: {basis}"
						class={`border-r-black border-r-[1px] border-opacity-20`}
					/>
				</div>
			</div>
			<div class="flex w-full grow h-1/3">
				<div class="bg-blue-500 grow" />
			</div>
		</div>
		<div class="text-xl text-bold" id="level">
			{role}
		</div>
	</div>
</div>

<style>
	#title {
		color: var(--text-color);
		text-shadow:
			1px 0 0 #000,
			0 -1px 0 #000,
			0 1px 0 #000,
			-1px 0 0 #000;
	}

	#level {
		text-shadow:
			2px 0 0 #000,
			0 -2px 0 #000,
			0 2px 0 #000,
			-2px 0 0 #000;
	}
</style>
