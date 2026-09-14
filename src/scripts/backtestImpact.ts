import 'dotenv/config';
import postgres from 'postgres';
import { writeFileSync } from 'node:fs';
import { getBetaImpact, IMPACT_BETA_VERSION, type BetaImpactInput } from '../lib/impact-beta';
import frozen from '../lib/impact-beta-calibration.json';
import { calcImpact } from '../lib/functions';

// Read-only historical audit. Calibration uses earlier matches; later matches
// are held out. No match records or original scores are updated.
const main = async () => {
	const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
	try {
		const result = await sql`
			with recent as (
				select * from matches where start_time >= (select max(start_time) from matches) - 63072000
				and duration >= 1200 and game_mode = 22 and lobby in (0,7)
			), teams as (
				select md.match_id, md.team, case when count(distinct md.player_id) = 5 then sum(md.kills) end as kills
				from match_data md inner join recent m on m.id = md.match_id group by md.match_id, md.team
			)
			select md.match_id as "matchId", m.start_time as "startTime", m.duration,
			md.role, md.hero_id as "heroId", md.kills, md.deaths, md.assists,
			md.last_hits as "lastHits", md.hero_damage as "heroDamage", md.tower_damage as "towerDamage",
			md.impact, md.team = m.winner as won, t.kills as "teamKills"
			from match_data md inner join recent m on md.match_id = m.id
			inner join accounts a on md.player_id = a.account_id
			left join teams t on t.match_id = md.match_id and t.team = md.team
			where not a.smurf and md.role between 1 and 5 order by m.start_time, md.match_id
		`;
		const rows = result.map((row) =>
			Object.fromEntries(
				Object.entries(row).map(([key, value]) => [
					key,
					value === null || key === 'won' ? value : Number(value)
				])
			)
		) as (BetaImpactInput & {
			matchId: number;
			startTime: number;
			duration: number;
			impact: number;
			won: boolean;
		})[];
		const valid = rows.filter((row) => getBetaImpact(row, row.duration, {}, [1, 1, 1, 1, 1]));
		const times = [...new Set(valid.map((row) => row.startTime))];
		const recalibrate = process.argv.includes('--calibrate');
		const cutoff = recalibrate
			? times[Math.floor(times.length * 0.8)]
			: Date.parse(frozen.cutoff) / 1000;
		const train = valid.filter((row) => row.startTime < cutoff);
		const holdout = valid.filter((row) => row.startTime >= cutoff);
		const quantile = (values: number[], fraction: number) => {
			const sorted = [...values].sort((a, b) => a - b);
			return sorted[Math.floor((sorted.length - 1) * fraction)] ?? 0;
		};
		const targetMedian = quantile(
			train.map((row) => row.impact),
			0.5
		);
		const roleScales = recalibrate
			? [1, 2, 3, 4, 5].map((role) => {
					const sample = train.filter((row) => row.role === role);
					if (sample.length < 100) throw new Error(`Too few training samples for role ${role}`);
					const median = quantile(
						sample.map((row) => getBetaImpact(row, row.duration, {}, [1, 1, 1, 1, 1])!.impact),
						0.5
					);
					if (!median) throw new Error(`Zero median for role ${role}`);
					return Number((targetMedian / median).toFixed(6));
				})
			: frozen.roleScales;
		const calibration = {
			version: IMPACT_BETA_VERSION,
			roleScales,
			targetMedian,
			trainingMatches: new Set(train.map((row) => row.matchId)).size,
			trainingRows: train.length,
			cutoff: new Date(cutoff * 1000).toISOString()
		};
		if (recalibrate)
			writeFileSync(
				'src/lib/impact-beta-calibration.json',
				JSON.stringify(calibration, null, 2) + '\n'
			);
		const summarize = (sample: typeof rows) => {
			const old = sample.map((row) => row.impact);
			const beta = sample.map((row) => getBetaImpact(row, row.duration, {}, roleScales)!.impact);
			const grades = (scores: number[]) =>
				Object.fromEntries(
					['S', 'A', 'B', 'C', 'D', 'F'].map((grade) => [
						grade,
						Number(
							(
								(100 * scores.filter((score) => calcImpact(score).startsWith(grade)).length) /
								(scores.length || 1)
							).toFixed(1)
						)
					])
				);
			return {
				rows: sample.length,
				original: {
					median: quantile(old, 0.5),
					p90: quantile(old, 0.9),
					p99: quantile(old, 0.99),
					grades: grades(old)
				},
				beta: {
					median: quantile(beta, 0.5),
					p90: quantile(beta, 0.9),
					p99: quantile(beta, 0.99),
					grades: grades(beta)
				}
			};
		};
		const report = {
			calibration,
			holdoutMatches: new Set(holdout.map((row) => row.matchId)).size,
			coverage: {
				total: valid.length,
				heroDamage: valid.filter((r) => r.heroDamage !== null).length,
				towerDamage: valid.filter((r) => r.towerDamage !== null).length,
				teamKills: valid.filter((r) => r.teamKills !== null).length,
				healing: 0
			},
			overall: summarize(holdout),
			byRole: [1, 2, 3, 4, 5].map((role) => ({
				role,
				...summarize(holdout.filter((r) => r.role === role))
			})),
			byDuration: [
				[1200, 2400],
				[2400, 3600],
				[3600, Infinity]
			].map(([from, to]) => ({
				minutes: `${from / 60}-${to / 60}`,
				...summarize(holdout.filter((r) => r.duration >= from && r.duration < to))
			})),
			byOutcome: [true, false].map((won) => ({
				won,
				...summarize(holdout.filter((r) => r.won === won))
			}))
		};
		writeFileSync('docs/impact-beta-backtest.json', JSON.stringify(report, null, 2) + '\n');
		console.log(JSON.stringify(report));
	} finally {
		await sql.end();
	}
};
await main();
