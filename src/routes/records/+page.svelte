<script lang="ts">
	import { getRoleIcon, toTime } from '$lib/functions';

	interface Record {
		title: string;
		recordTitle: string;
		records: RecordData[];
	}

	interface RecordData {
		record: number;
		data: Data;
	}

	interface Data {
		id: number;
		username: string;
		smurf: boolean;
		kills: number;
		deaths: number;
		assists: number;
		matchId: number;
		hero: Hero;
		impact: number;
		role: number;
		duration: number;
		startTime: number;
	}

	interface Hero {
		id: number;
		name: string;
		img: string;
	}

	export let data: { playerList: any[]; url: string; records: Record[] };

	const { records } = data;
	console.log(data);
</script>

<svelte:head>
	<title>whos-playing | Records</title>
</svelte:head>

<div class="flex items-center justify-center">
	<div class="flex flex-col gap-4">
		{#each records as recordSet}
			<div class="flex flex-col items-center gap-4">
				<div class="flex flex-col items-center gap-2">
					<div class="text-3xl">{recordSet.title}</div>
				</div>
				<div class="flex grow flex-col items-center justify-start gap-4">
					<table class="w-full">
						<tbody>
							{#each recordSet.records as record, i}
								<tr>
									<td class="w-6 text-center">{i + 1}</td>
									<td class=" w-24 text-center"
										>{record.data.username}
										<span class="italic text-indigo-400">{record.data.smurf ? 'S' : ''}</span>
									</td>
									<td class="w-16 text-center">{record.record}</td>
									<td class="w-16 text-center">{toTime(record.data.duration)}</td>
									<td class="text-center">
										<img src={record.data.hero.img} alt={record.data.hero.name} class="w-16" />
									</td>
									<td class="w-8 text-center">
										<img
											src={getRoleIcon(record.data.role)}
											alt={`position ${record.data.role}`}
											class="h-7"
											style="color: 'red'"
										/>
									</td>
									<td class="w-8 text-center text-green-400">{record.data.kills}</td>
									<td class="w-8 text-center text-red-400">{record.data.deaths}</td>
									<td class="w-8 text-center text-cyan-300">{record.data.assists}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/each}
	</div>
</div>
