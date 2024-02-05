import { BASE_URL, STRATZ_KEY } from '$env/static/private';
//import matchDetails from '$lib/data/match-details.json';
import { type MatchDetails } from './matchDetails.type';

export const load = async ({ params }) => {
	const fetchMatchData = async () => {
		const res = await fetch(BASE_URL + `/api/matches/${params.id}`);
		return await res.json();
	};

	const matchDetails: MatchDetails = await fetch(
		`https://api.stratz.com/api/v1/match/${params.id}/breakdown`,
		{
			headers: { Authorization: `Bearer ${STRATZ_KEY}` }
		}
	).then((res) => {
		console.log(res);
		return res.json();
	});

	console.log(matchDetails);

	const matchData = await fetchMatchData();

	const abilityId = await fetch(
		`https://raw.githubusercontent.com/odota/dotaconstants/master/build/ability_ids.json`
	).then((res) => res.json());

	const abilityData = await fetch(
		`https://raw.githubusercontent.com/odota/dotaconstants/master/build/abilities.json`
	).then((res) => res.json());

	return {
		matchData,
		matchDetails
	};
};
