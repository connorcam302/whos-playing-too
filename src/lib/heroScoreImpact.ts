import { getBetaImpact, type BetaImpactInput } from '$lib/impact-beta';

export type HeroScoreImpactRow = BetaImpactInput & {
	heroId: number;
	duration: number;
};

// Keep stored legacy impact untouched. Every scoring consumer uses the same
// per-match beta calculation, and unavailable beta scores never become zeroes.
export const withBetaHeroImpact = <T extends HeroScoreImpactRow>(rows: T[]) =>
	rows.flatMap((row) => {
		const beta = getBetaImpact(row, row.duration);
		return beta === null ? [] : [{ ...row, impact: beta.impact }];
	});
