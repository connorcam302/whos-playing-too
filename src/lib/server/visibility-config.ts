// Add player IDs here to keep their profile and match appearances, but exclude them from aggregate surfaces.
// [Sighboys, Pona]
export const hiddenFromAggregatePlayerIds: number[] = [18, 14];

export const isHiddenFromAggregates = (playerId: number) =>
	hiddenFromAggregatePlayerIds.includes(playerId);
