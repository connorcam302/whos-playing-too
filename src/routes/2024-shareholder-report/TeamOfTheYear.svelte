<script lang="ts">
	export let toty;
	import tippy from 'sveltejs-tippy';
</script>

<div class="flex flex-wrap items-center justify-center gap-4">
	<div id="carry-border" class="card p-1">
		<div class="card bg-[#191f40] p-4">
			<div class="flex flex-col gap-2">
				<div class="relative w-40">
					<img src={toty.carry.avatarfull} class="h-40 w-40" />
					<div class="absolute right-0 top-0 rounded-bl-2xl bg-[#191f40] p-2 text-4xl">
						{toty.carry.overall}
					</div>
				</div>
				<div class="text-center text-4xl">{toty.carry.username}</div>
				<div class="flex justify-between gap-2 text-lg">
					<div
						use:tippy={{
							content: `Matches Played`,
							placement: 'bottom',
							theme: 'dark'
						}}
					>
						MTC: {toty.carry.matches}
					</div>
					<div
						use:tippy={{
							content: `Average Impact`,
							placement: 'bottom',
							theme: 'dark'
						}}
					>
						IMP: {toty.carry.avgImpact}
					</div>
				</div>
				<div
					class="flex items-center justify-center gap-2 text-lg"
					use:tippy={{
						content: `Win Rate`,
						placement: 'bottom',
						theme: 'dark'
					}}
				>
					W/R: {toty.carry.winRate}
				</div>
			</div>
		</div>
	</div>
	<div id="mid-border" class="card p-1">
		<div class="card bg-[#153136] p-4">
			<div class="flex flex-col gap-2">
				<div class="relative w-40">
					<img src={toty.mid.avatarfull} class="h-40 w-40" />
					<div class="absolute right-0 top-0 rounded-bl-2xl bg-[#153136] p-2 text-4xl">
						{toty.mid.overall}
					</div>
				</div>
				<div class="text-center text-4xl">{toty.mid.username}</div>
				<div class="flex justify-between gap-2 text-lg">
					<div
						use:tippy={{
							content: `Matches Played`,
							placement: 'bottom',
							theme: 'dark'
						}}
					>
						MTC: {toty.mid.matches}
					</div>
					<div
						use:tippy={{
							content: `Average Impact`,
							placement: 'bottom',
							theme: 'dark'
						}}
					>
						IMP: {toty.mid.avgImpact}
					</div>
				</div>
				<div
					class="flex items-center justify-center gap-2 text-lg"
					use:tippy={{
						content: `Win Rate`,
						placement: 'bottom',
						theme: 'dark'
					}}
				>
					W/R: {toty.mid.winRate}
				</div>
			</div>
		</div>
	</div>
	<div id="offlane-border" class="card p-1">
		<div class="card bg-[#4f3009] p-4">
			<div class="flex flex-col gap-2">
				<div class="relative w-40">
					<img src={toty.offlane.avatarfull} class="h-40 w-40" />
					<div class="absolute right-0 top-0 rounded-bl-2xl bg-[#4f3009] p-2 text-4xl">
						{toty.offlane.overall}
					</div>
				</div>
				<div class="text-center text-4xl">{toty.offlane.username}</div>
				<div class="flex justify-between gap-2 text-lg">
					<div
						use:tippy={{
							content: `Matches Played`,
							placement: 'bottom',
							theme: 'dark'
						}}
					>
						MTC: {toty.offlane.matches}
					</div>
					<div
						use:tippy={{
							content: `Average Impact`,
							placement: 'bottom',
							theme: 'dark'
						}}
					>
						IMP: {toty.offlane.avgImpact}
					</div>
				</div>
				<div
					class="flex items-center justify-center gap-2 text-lg"
					use:tippy={{
						content: `Win Rate`,
						placement: 'bottom',
						theme: 'dark'
					}}
				>
					W/R: {toty.offlane.winRate}
				</div>
			</div>
		</div>
	</div>
	<div id="soft-border" class="card p-1">
		<div class="card bg-[#421419] p-4">
			<div class="flex flex-col gap-2">
				<div class="relative w-40">
					<img src={toty.soft.avatarfull} class="h-40 w-40" />
					<div class="absolute right-0 top-0 rounded-bl-2xl bg-[#421419] p-2 text-4xl">
						{toty.soft.overall}
					</div>
				</div>
				<div class="text-center text-4xl">{toty.soft.username}</div>
				<div class="flex justify-between gap-2 text-lg">
					<div
						use:tippy={{
							content: `Matches Played`,
							placement: 'bottom',
							theme: 'dark'
						}}
					>
						MTC: {toty.soft.matches}
					</div>
					<div
						use:tippy={{
							content: `Average Impact`,
							placement: 'bottom',
							theme: 'dark'
						}}
					>
						IMP: {toty.soft.avgImpact}
					</div>
				</div>
				<div
					class="flex items-center justify-center gap-2 text-lg"
					use:tippy={{
						content: `Win Rate`,
						placement: 'bottom',
						theme: 'dark'
					}}
				>
					W/R: {toty.soft.winRate}
				</div>
			</div>
		</div>
	</div>
	<div id="hard-border" class="card p-1">
		<div class="card bg-[#154d36] p-4">
			<div class="flex flex-col gap-2">
				<div class="relative w-40">
					<img src={toty.hard.avatarfull} class="h-40 w-40" />
					<div class="absolute right-0 top-0 rounded-bl-2xl bg-[#154d36] p-2 text-4xl">
						{toty.hard.overall}
					</div>
				</div>
				<div class="text-center text-4xl">{toty.hard.username}</div>
				<div class="flex justify-between gap-2 text-lg">
					<div
						use:tippy={{
							content: `Matches Played`,
							placement: 'bottom',
							theme: 'dark'
						}}
					>
						MTC: {toty.hard.matches}
					</div>
					<div
						use:tippy={{
							content: `Average Impact`,
							placement: 'bottom',
							theme: 'dark'
						}}
					>
						IMP: {toty.hard.avgImpact}
					</div>
				</div>
				<div
					class="flex items-center justify-center gap-2 text-lg"
					use:tippy={{
						content: `Win Rate`,
						placement: 'bottom',
						theme: 'dark'
					}}
				>
					W/R: {toty.hard.winRate}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.card {
		border-radius: 10px/30%;
	}

	#carry-border {
		background: linear-gradient(135deg, #4555a9, #1b224a, #4458bd);
		background-size: 200% 200%;
		animation: gradientAnimation 5s ease infinite; /* Smooth gradient animation */
	}

	#mid-border {
		background: linear-gradient(135deg, #2d6a75, #1a3e45, #3eaec2);
		background-size: 200% 200%;
		animation: gradientAnimation 5s ease infinite; /* Smooth gradient animation */
	}

	#offlane-border {
		background: linear-gradient(135deg, #c47716, #57360d, #f7971e);
		background-size: 200% 200%;
		animation: gradientAnimation 5s ease infinite; /* Smooth gradient animation */
	}

	#soft-border {
		background: linear-gradient(135deg, #c14755, #69161f, #fa485d);
		background-size: 200% 200%;
		animation: gradientAnimation 5s ease infinite; /* Smooth gradient animation */
	}

	#hard-border {
		background: linear-gradient(135deg, #3b9c75, #144230, #59ebb0);
		background-size: 200% 200%;
		animation: gradientAnimation 5s ease infinite; /* Smooth gradient animation */
	}

	.gradient-box {
		width: 300px; /* Adjust as needed */
		height: 200px; /* Adjust as needed */
		border-radius: 15px; /* Rounded corners */
		display: flex;
		align-items: center;
		justify-content: center;
		color: white; /* Text color */
		font-size: 20px; /* Adjust as needed */
		text-align: center;
		background: linear-gradient(135deg, #c47716, #2d6a75, #c14755, #4555a9, #3b9c75);
		background-size: 300% 300%;
		animation: gradientAnimation 5s ease infinite; /* Smooth gradient animation */
	}
	@keyframes gradientAnimation {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	sample {
		background: linear-gradient(135deg, #c47716, #2d6a75, #c14755, #4555a9, #3b9c75);
	}
</style>
