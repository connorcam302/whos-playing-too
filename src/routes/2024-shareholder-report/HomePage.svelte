<script>
	import Ticker from './Ticker.svelte';

	const stats = {
		matches_played: {
			'2021': 5831,
			'2022': 4022,
			'2023': 4947,
			'2024': 3232
		},
		win_rate: {
			'2021': 50.48,
			'2022': 49.55,
			'2023': 52.1,
			'2024': 53.45
		},
		avg_kills: {
			'2021': 7.21,
			'2022': 7.98,
			'2023': 7.69,
			'2024': 7.78
		},
		avg_deaths: {
			'2021': 7.22,
			'2022': 7.5,
			'2023': 7.55,
			'2024': 7.04
		},
		avg_assists: {
			'2021': 14.08,
			'2022': 14.52,
			'2023': 15.41,
			'2024': 15.69
		},
		average_impact: {
			'2021': 77.14,
			'2022': 80.33,
			'2023': 81.47,
			'2024': 86.45
		}
	};
</script>

<div
	class="flex max-w-screen-sm flex-col items-center justify-center gap-4 text-center md:max-w-screen-lg"
>
	<div class="pb-8 text-center text-4xl">Welcome to the 2024 whos-playing shareholder report.</div>
	<div class="max-w-screen-md text-lg">
		A lot of dota was played this year by the 22 members of the discord, however our numbers are
		down, potentially due to a poor Q4, however the quality of dota being played is at an all time
		high. This could potentially be due to a rise of smurf activity and reduction in solo queue,
		shareholders will see irrespective of origin.
	</div>

	<div class="flex flex-wrap items-center justify-center gap-2">
		<Ticker stat={stats.matches_played} name={'Matches Played'} />
		<Ticker stat={stats.win_rate} name={'Win Rate'} />
		<Ticker stat={stats.average_impact} name={'Average Impact'} />
		<Ticker stat={stats.avg_kills} name={'Average Kills'} />
		<Ticker stat={stats.avg_deaths} name={'Average Deaths'} reverse />
		<Ticker stat={stats.avg_assists} name={'Average Assists'} />
	</div>
	<div class="max-w-screen-md text-lg">
		With the collective metrics out of the way, lets proceed into the matches that, for various
		reasons, stood out most.
	</div>
</div>
