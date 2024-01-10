export const getGameMode = (id: number) => {
	switch (id) {
		case 0:
			return 'Unknown';
		case 1:
			return 'All Pick';
		case 2:
			return 'Captains Mode';
		case 3:
			return 'Random Draft';
		case 4:
			return 'Single Draft';
		case 5:
			return 'All Random';
		case 6:
			return 'Intro';
		case 7:
			return 'Diretide';
		case 8:
			return 'Reverse Captains Mode';
		case 9:
			return 'Greeviling';
		case 10:
			return 'Tutorial';
		case 11:
			return 'Mid Only';
		case 12:
			return 'Least Played';
		case 13:
			return 'Limited Heroes';
		case 14:
			return 'Compendium Matchmaking';
		case 15:
			return 'Custom';
		case 16:
			return 'Captains Draft';
		case 17:
			return 'Balanced Draft';
		case 18:
			return 'Ability Draft';
		case 19:
			return 'Event';
		case 20:
			return 'All Random Deathmatch';
		case 21:
			return '1v1 Mid';
		case 22:
			return 'All Pick';
		case 23:
			return 'Turbo';
		case 24:
			return 'Mutation';
		case 25:
			return 'Coaches Challenge';
		case 26:
			return "Captain's Mode";
		case 27:
			return 'Greeviling';
		case 28:
			return 'Tutorial';
		case 29:
			return 'Mid Only';
		case 30:
			return 'Least Played';
		case 31:
			return 'Limited Heroes';
		case 32:
			return 'Compendium Matchmaking';
		case 33:
			return 'Custom';
		case 34:
			return "Captain's Draft";
		case 35:
			return 'Balanced Draft';
		case 36:
			return 'Ability Draft';
		case 37:
			return 'Event';
		case 38:
			return 'All Random Deathmatch';
		case 39:
			return '1v1 Mid';
		case 40:
			return 'All Draft';
		case 41:
			return 'Turbo';
		case 42:
			return 'Mutation';
		default:
			return 'Unknown';
	}
};

export const getLobbyType = (id: number) => {
	switch (id) {
		case 0:
			return 'Unranked';
		case 1:
			return 'Practice';
		case 2:
			return 'Tournament';
		case 3:
			return 'Tutorial';
		case 4:
			return 'Co-op with bots';
		case 5:
			return 'Team match';
		case 6:
			return 'Solo Queue';
		case 7:
			return 'Ranked';
		case 8:
			return 'Solo Mid 1v1';
		case 9:
			return 'Battle Cup';
		case 10:
			return 'Siltbreaker';
		case 11:
			return 'Siltbreaker (Act 2)';
		case 12:
			return 'Coliseum Battle';
		case 13:
			return 'Mutation';
		case 14:
			return 'Turbo';
		case 15:
			return 'The Underhollow';
		case 16:
			return 'Battle Royale';
		case 17:
			return 'M.U.D. DRAFT';
		default:
			return 'Unknown';
	}
};

export const calcImpact = (impact: number) => {
	if (impact > 200) {
		return 'S++';
	}
	if (impact > 140) {
		return 'S+';
	}
	if (impact > 130) {
		return 'S';
	}
	if (impact > 123) {
		return 'S-';
	}
	if (impact > 116) {
		return 'A+';
	}
	if (impact > 109) {
		return 'A';
	}
	if (impact > 102) {
		return 'A-';
	}
	if (impact > 95) {
		return 'B+';
	}
	if (impact > 88) {
		return 'B';
	}
	if (impact > 81) {
		return 'B-';
	}
	if (impact > 74) {
		return 'C+';
	}
	if (impact > 67) {
		return 'C';
	}
	if (impact > 60) {
		return 'C-';
	}
	if (impact > 53) {
		return 'D+';
	}
	if (impact > 46) {
		return 'D';
	}
	if (impact > 39) {
		return 'D-';
	}
	if (impact > 32) {
		return 'F+';
	}
	if (impact > 25) {
		return 'F';
	}
	if (impact <= 25) {
		return 'F-';
	} else {
		return 'Error';
	}
};

export const getRoleIcon = (role: number) => {
	if (role === 1) {
		return '/roles/pos1.png';
	}
	if (role === 2) {
		return '/roles/pos2.png';
	}
	if (role === 3) {
		return '/roles/pos3.png';
	}
	if (role === 4) {
		return '/roles/pos4.png';
	}
	if (role === 5) {
		return '/roles/pos5.png';
	}
};
