import { describe, it as test } from 'node:test';
import assert from 'node:assert/strict';
import { heroAbilities } from '../src/lib/data/heroAbilities';
import { getDotaPatchForTimestamp, getDotaPatchRangeBounds } from '../src/lib/data/dotaPatchRanges';
import { heroData } from '../src/lib/data/heroData';
import { heroMap } from '../src/lib/data/heroMap';
import { itemMap } from '../src/lib/data/itemMap';
import { abilityNames } from '../src/lib/data/abilityNames';

describe('7.42 reference data', () => {
	test('patch filters split 7.41 and 7.42 without overlapping', () => {
		const start = Date.parse('2026-11-18T00:00:00Z') / 1000;
		assert.equal(getDotaPatchRangeBounds('7.41').end, start - 1);
		assert.deepEqual(getDotaPatchRangeBounds('7.42'), { start, end: null });
		assert.equal(getDotaPatchForTimestamp(start - 1)?.version, '7.41');
		assert.equal(getDotaPatchForTimestamp(start)?.version, '7.42');
	});

	test('new equipment and historical items can be displayed', () => {
		for (const [id, name] of [
			[1942, 'Bloodslinger'],
			[1955, 'Caduceus'],
			[1946, 'Starforge'],
			[1880, 'Red Ledger'],
			[1953, 'Sabatons of Mordiggian']
		] as const) {
			assert.equal(itemMap.get(id)?.name, name);
			assert.match(itemMap.get(id)?.img, /^https:\/\/.+\.png$/);
		}
		assert.equal(itemMap.get(0)?.name, 'Empty');
		assert.equal(itemMap.get(7)?.name, 'Javelin');
		assert.equal(itemMap.get(1440)?.name, 'Black Grimoire (Warlock)');
	});

	test('hero metadata stays usable and zero attributes survive generation', () => {
		assert.equal(heroData.find((hero) => hero.id === 1)?.base_health, 200);
		assert.equal(heroData.find((hero) => hero.id === 19)?.base_agi, 0);
		assert.equal(heroData.find((hero) => hero.id === 19)?.agi_gain, 0);
		for (const hero of heroData) {
			assert.equal(heroMap.get(hero.id)?.name, hero.localized_name);
			assert.equal(Number.isFinite(hero.base_health), true);
		}
		assert.equal(abilityNames[5003], 'Mana Break');
		assert.equal(heroAbilities.npc_dota_hero_antimage.talents.length, 8);
		assert.equal(
			heroAbilities.npc_dota_hero_antimage.talents[0].name,
			'special_bonus_unique_antimage_counterspell_reflect_duration'
		);
	});
});
