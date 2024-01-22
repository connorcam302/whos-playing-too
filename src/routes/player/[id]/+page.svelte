<script lang="ts">
	type SteamProfile = {
		avatar: string;
		avatarfull: string;
		avatarhash: string;
		avatarmedium: string;
		communityvisibilitystate: number;
		lastlogoff: number;
		loccountrycode: string;
		personaname: string;
		personastate: number;
		personastateflags: number;
		primaryclanid: string;
		profilestate: number;
		profileurl: string;
		steamid: string;
		timecreated: number;
	};
	type Player = {
		accountId: number;
		username: string;
		id: number;
	};

	export let data: { player: Player; steamData: SteamProfile };

	const { player, steamData } = data;

	console.log(data);
</script>

<div class="flex gap-2">
	<img src={steamData.avatarfull} alt="profilepicture" />
	<div class="flex flex-col justify-center">
		<div class="text-4xl">{player.username}</div>
		<div class="text-lg opacity-50">{steamData.personaname}</div>
	</div>
</div>
