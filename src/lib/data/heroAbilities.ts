export const heroAbilities = {
    npc_dota_hero_antimage: {
        abilities: [
            'antimage_mana_break',
            'antimage_blink',
            'antimage_counterspell',
            'antimage_counterspell_ally',
            'antimage_persectur',
            'antimage_mana_void'
        ],
        talents: [
            {
                name: 'special_bonus_hp_regen_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_antimage_manavoid_aoe',
                level: 1
            },
            {
                name: 'special_bonus_unique_antimage_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_antimage_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_antimage_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_antimage_8',
                level: 3
            },
            {
                name: 'special_bonus_unique_antimage_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_antimage_2',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'antimage_magebanes_mirror',
                icon: 'ricochet',
                color: 'Purple',
                gradient_id: 1,
                title: "Magebane's Mirror",
                description:
                    'Counterspell and Counterspell Ally reflect spells back at their caster instead of just blocking.'
            },
            {
                id: 1,
                name: 'antimage_mana_thirst',
                icon: 'mana',
                color: 'Blue',
                gradient_id: 3,
                title: 'Mana Thirst',
                description: 'Anti-Mage gains damage when his enemies are at low mana.'
            }
        ]
    },
    npc_dota_hero_axe: {
        abilities: [
            'axe_berserkers_call',
            'axe_battle_hunger',
            'axe_counter_helix',
            'generic_hidden',
            'generic_hidden',
            'axe_culling_blade',
            'axe_coat_of_blood'
        ],
        talents: [
            {
                name: 'special_bonus_unique_axe_culling_blade_speed_duration',
                level: 1
            },
            {
                name: 'special_bonus_unique_axe_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_axe_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_axe_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_axe_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_axe_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_axe_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_axe',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'axe_one_man_army',
                icon: 'strength',
                color: 'Red',
                gradient_id: 0,
                title: 'One Man Army',
                description: "Axe gains Strength based on his armor as long as he's away from his allies.",
                abilities: ['axe_one_man_army']
            },
            {
                id: 1,
                name: 'axe_call_out',
                icon: 'armor',
                color: 'Red',
                gradient_id: 2,
                title: 'Call Out',
                description:
                    "Berserker's Call gives attacking enemies more attack speed and Axe more armor for the duration."
            }
        ]
    },
    npc_dota_hero_bane: {
        abilities: [
            'bane_enfeeble',
            'bane_brain_sap',
            'bane_nightmare',
            'generic_hidden',
            'generic_hidden',
            'bane_fiends_grip',
            'bane_nightmare_end',
            'bane_ichor_of_nyctasha'
        ],
        talents: [
            {
                name: 'special_bonus_unique_bane_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_bane_11',
                level: 1
            },
            {
                name: 'special_bonus_unique_bane_10',
                level: 2
            },
            {
                name: 'special_bonus_unique_bane_9',
                level: 2
            },
            {
                name: 'special_bonus_unique_bane_5',
                level: 3
            },
            {
                name: 'special_bonus_movement_speed_30',
                level: 3
            },
            {
                name: 'special_bonus_unique_bane_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_bane_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'bane_dream_stalker',
                icon: 'damage',
                color: 'Gray',
                gradient_id: 0,
                title: 'Dream Stalker',
                description: 'Bane has increased attack speed when attacking Nightmared units.'
            },
            {
                id: 1,
                name: 'bane_sleepwalk',
                icon: 'movement',
                color: 'Purple',
                gradient_id: 1,
                title: 'Sleepwalk',
                description: "Nightmared units walk in Bane's chosen direction."
            }
        ]
    },
    npc_dota_hero_bloodseeker: {
        abilities: [
            'bloodseeker_bloodrage',
            'bloodseeker_blood_bath',
            'bloodseeker_thirst',
            'bloodseeker_blood_mist',
            'bloodseeker_sanguivore',
            'bloodseeker_rupture'
        ],
        talents: [
            {
                name: 'special_bonus_unique_bloodseeker_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_bloodseeker_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_bloodseeker_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_bloodseeker_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_bloodseeker_3',
                level: 3
            },
            {
                name: 'special_bonus_spell_lifesteal_15',
                level: 3
            },
            {
                name: 'special_bonus_unique_bloodseeker_rupture_charges',
                level: 4
            },
            {
                name: 'special_bonus_unique_bloodseeker_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'bloodseeker_arterial_spray',
                icon: 'movement',
                color: 'Red',
                gradient_id: 1,
                title: 'Arterial Spray',
                description: 'Ruptured units are pushed when attacked by Bloodseeker.'
            },
            {
                id: 1,
                name: 'bloodseeker_bloodrush',
                icon: 'speed',
                color: 'Gray',
                gradient_id: 1,
                title: 'Bloodrush',
                description: 'Bloodseeker can supercharge the movement speed from Thirst temporarily.'
            }
        ]
    },
    npc_dota_hero_crystal_maiden: {
        abilities: [
            'crystal_maiden_crystal_nova',
            'crystal_maiden_frostbite',
            'crystal_maiden_brilliance_aura',
            'crystal_maiden_crystal_clone',
            'crystal_maiden_blueheart_floe',
            'crystal_maiden_freezing_field',
            'crystal_maiden_freezing_field_stop'
        ],
        talents: [
            {
                name: 'special_bonus_hp_200',
                level: 1
            },
            {
                name: 'special_bonus_unique_crystal_maiden_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_crystal_maiden_frostbite_castrange',
                level: 2
            },
            {
                name: 'special_bonus_unique_crystal_maiden_5',
                level: 2
            },
            {
                name: 'special_bonus_attack_speed_225',
                level: 3
            },
            {
                name: 'special_bonus_unique_crystal_maiden_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_crystal_maiden_1',
                level: 4
            },
            {
                name: 'special_bonus_unique_crystal_maiden_2',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'crystal_maiden_frozen_expanse',
                icon: 'area_of_effect',
                color: 'Gray',
                gradient_id: 1,
                title: 'Frozen Expanse',
                description:
                    "Freezing Field also passively increases Crystal Maiden's cast range and area of effect."
            },
            {
                id: 1,
                name: 'crystal_maiden_cold_comfort',
                icon: 'mana',
                color: 'Blue',
                gradient_id: 2,
                title: 'Cold Comfort',
                description:
                    "Crystal Maiden restores her allies' Mana when casting spells. Increases innate Mana Regen Amplification."
            }
        ]
    },
    npc_dota_hero_drow_ranger: {
        abilities: [
            'drow_ranger_frost_arrows',
            'drow_ranger_wave_of_silence',
            'drow_ranger_multishot',
            'drow_ranger_glacier',
            'drow_ranger_trueshot',
            'drow_ranger_marksmanship'
        ],
        talents: [
            {
                name: 'special_bonus_unique_drow_ranger_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_drow_ranger_2',
                level: 1
            },
            {
                name: 'special_bonus_attack_range_75',
                level: 2
            },
            {
                name: 'special_bonus_unique_drow_ranger_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_drow_ranger_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_drow_ranger_gust_selfmovespeed',
                level: 3
            },
            {
                name: 'special_bonus_unique_drow_ranger_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_drow_ranger_8',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'drow_ranger_high_ground',
                icon: 'damage',
                color: 'Gray',
                gradient_id: 1,
                title: 'Vantage Point',
                description: 'Drow deals 20% more damage when attacking from high ground.',
                abilities: ['drow_ranger_vantage_point']
            },
            {
                id: 1,
                name: 'drow_ranger_sidestep',
                icon: 'multi_arrow',
                color: 'Blue',
                gradient_id: 1,
                title: 'Sidestep',
                description: 'Drow can move slowly and use items while casting Multishot.'
            }
        ]
    },
    npc_dota_hero_earthshaker: {
        abilities: [
            'earthshaker_fissure',
            'earthshaker_enchant_totem',
            'earthshaker_aftershock',
            'generic_hidden',
            'generic_hidden',
            'earthshaker_echo_slam',
            'earthshaker_spirit_cairn'
        ],
        talents: [
            {
                name: 'special_bonus_attack_base_damage_30',
                level: 1
            },
            {
                name: 'special_bonus_unique_earthshaker_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_earthshaker_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_earthshaker_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_earthshaker_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_earthshaker_totem_damage',
                level: 3
            },
            {
                name: 'special_bonus_unique_earthshaker_echo_cd',
                level: 4
            },
            {
                name: 'special_bonus_unique_earthshaker',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'earthshaker_tectonic_buildup',
                icon: 'area_of_effect',
                color: 'Red',
                gradient_id: 1,
                title: 'Tectonic Buildup',
                description: 'Aftershock radius is increased by 50 every 10 hero levels.'
            },
            {
                id: 1,
                name: 'earthshaker_slugger',
                icon: 'movement',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Slugger',
                description:
                    "Enemies killed with Enchant Totem or Earthshaker's other abilities are sent flying, dealing damage to enemies they hit.",
                abilities: ['earthshaker_slugger']
            }
        ]
    },
    npc_dota_hero_juggernaut: {
        abilities: [
            'juggernaut_blade_fury',
            'juggernaut_healing_ward',
            'juggernaut_blade_dance',
            'juggernaut_swift_slash',
            'juggernaut_duelist',
            'juggernaut_omni_slash'
        ],
        talents: [
            {
                name: 'special_bonus_unique_juggernaut_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_juggernaut_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_juggernaut_healing_ward_heal',
                level: 2
            },
            {
                name: 'special_bonus_unique_juggernaut_blade_fury_movespeed',
                level: 2
            },
            {
                name: 'special_bonus_unique_juggernaut_blade_dance_lifesteal',
                level: 3
            },
            {
                name: 'special_bonus_unique_juggernaut_blade_fury_cooldown',
                level: 3
            },
            {
                name: 'special_bonus_unique_juggernaut_omnislash_duration',
                level: 4
            },
            {
                name: 'special_bonus_unique_juggernaut_2',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'juggernaut_bladestorm',
                icon: 'spinning',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Bladestorm',
                description: 'Blade Fury can now critically strike based on the level of Blade Dance.'
            },
            {
                id: 1,
                name: 'juggernaut_agigain',
                icon: 'agility',
                color: 'Red',
                gradient_id: 2,
                title: 'Bladeform',
                description:
                    "Juggernaut gains Agility and Movement Speed as long as he's not taking damage.",
                abilities: ['juggernaut_bladeform']
            }
        ]
    },
    npc_dota_hero_mirana: {
        abilities: [
            'mirana_starfall',
            'mirana_arrow',
            'mirana_leap',
            'mirana_selemenes_faithful',
            'generic_hidden',
            'generic_hidden'
        ],
        talents: [
            {
                name: 'special_bonus_unique_mirana_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_mirana_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_mirana_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_mirana_1',
                level: 2
            },
            {
                name: 'special_bonus_unique_mirana_4',
                level: 3
            },
            {
                name: 'special_bonus_20_crit_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_mirana_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_mirana_7',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'mirana_moonlight',
                icon: 'moon',
                color: 'Blue',
                gradient_id: 1,
                title: 'Moonlight Shadow',
                description: "Mirana's Ultimate grants allies invisiblity and movement speed.",
                abilities: ['mirana_invis']
            },
            {
                id: 1,
                name: 'mirana_sunlight',
                icon: 'sun',
                color: 'Gray',
                gradient_id: 3,
                title: 'Solar Flare',
                description:
                    "Mirana's Ultimate grants allies increasing attack speed and damage over time.",
                abilities: ['mirana_solar_flare']
            }
        ]
    },
    npc_dota_hero_nevermore: {
        abilities: [
            'nevermore_shadowraze1',
            'nevermore_shadowraze2',
            'nevermore_shadowraze3',
            'nevermore_frenzy',
            'nevermore_dark_lord',
            'nevermore_requiem',
            'nevermore_necromastery'
        ],
        talents: [
            {
                name: 'special_bonus_unique_nevermore_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_nevermore_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_nevermore_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_nevermore_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_nevermore_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_nevermore_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_nevermore_frenzy_castspeed',
                level: 4
            },
            {
                name: 'special_bonus_unique_nevermore_raze_procsattacks',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'nevermore_lasting_presence',
                icon: 'armor_broken',
                color: 'Gray',
                gradient_id: 0,
                title: 'Lasting Presence',
                description:
                    "Presence of the Dark Lord temporarily reduces more armor after nearby enemy heroes are killed. Every hero kill increases Necromastery's max souls by 1 until Shadow Fiend dies."
            },
            {
                id: 1,
                name: 'nevermore_shadowmire',
                icon: 'slow',
                color: 'Red',
                gradient_id: 0,
                title: 'Shadowmire',
                description: 'Shadowraze slows enemies.'
            }
        ]
    },
    npc_dota_hero_morphling: {
        abilities: [
            'morphling_waveform',
            'morphling_adaptive_strike_agi',
            'morphling_adaptive_strike_str',
            'morphling_morph_agi',
            'morphling_morph_str',
            'morphling_replicate',
            'morphling_morph_replicate',
            'morphling_morph',
            'morphling_accumulation'
        ],
        talents: [
            {
                name: 'special_bonus_magic_resistance_15',
                level: 1
            },
            {
                name: 'special_bonus_unique_morphling_1',
                level: 1
            },
            {
                name: 'special_bonus_unique_morphling_8',
                level: 2
            },
            {
                name: 'special_bonus_agility_15',
                level: 2
            },
            {
                name: 'special_bonus_unique_morphling_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_morphling_10',
                level: 3
            },
            {
                name: 'special_bonus_unique_morphling_waveform_cooldown',
                level: 4
            },
            {
                name: 'special_bonus_strength_35',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'morphling_agi',
                icon: 'agility',
                color: 'Green',
                gradient_id: 0,
                title: 'Ebb',
                description:
                    "Morphling's Primary Attribute is now Agility and Adaptive Strike pushes enemies.",
                abilities: ['morphling_ebb']
            },
            {
                id: 1,
                name: 'morphling_str',
                icon: 'strength',
                color: 'Red',
                gradient_id: 0,
                title: 'Flow',
                description:
                    "Morphling's Primary Attribute is now Strength and Attribute Shift can accelerate his cooldowns.",
                abilities: ['morphling_flow']
            }
        ]
    },
    npc_dota_hero_phantom_lancer: {
        abilities: [
            'phantom_lancer_spirit_lance',
            'phantom_lancer_doppelwalk',
            'phantom_lancer_phantom_edge',
            'phantom_lancer_illusory_armaments',
            'generic_hidden',
            'phantom_lancer_juxtapose'
        ],
        talents: [
            {
                name: 'special_bonus_unique_phantom_lancer_lance_damage',
                level: 1
            },
            {
                name: 'special_bonus_unique_phantom_lancer_phantom_rush_agility',
                level: 1
            },
            {
                name: 'special_bonus_unique_phantom_lancer_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_phantom_lancer_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_phantom_lancer',
                level: 3
            },
            {
                name: 'special_bonus_unique_phantom_lancer_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_phantom_lancer_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_phantom_lancer_illusory_armaments_dmg',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'phantom_lancer_convergence',
                icon: 'illusion',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Convergence',
                description:
                    "Doppelganger spawns additional illusions, with the amount depending on Phantom Lancer's current health."
            },
            {
                id: 1,
                name: 'phantom_lancer_divergence',
                icon: 'summons',
                color: 'Blue',
                gradient_id: 2,
                title: 'Divergence',
                description:
                    "Juxtapose Illusions spawn on random nearby units and deal more damage but can't be controlled."
            }
        ]
    },
    npc_dota_hero_puck: {
        abilities: [
            'puck_illusory_orb',
            'puck_waning_rift',
            'puck_phase_shift',
            'puck_ethereal_jaunt',
            'puck_puckish',
            'puck_dream_coil'
        ],
        talents: [
            {
                name: 'special_bonus_unique_puck_orb_damage',
                level: 1
            },
            {
                name: 'special_bonus_unique_puck_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_puck',
                level: 2
            },
            {
                name: 'special_bonus_unique_puck_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_puck_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_puck_coil_damage',
                level: 3
            },
            {
                name: 'special_bonus_unique_puck_5',
                level: 4
            },
            {
                name: 'special_bonus_unique_puck_rift_radius',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'puck_jostling_rift',
                icon: 'movement',
                color: 'Purple',
                gradient_id: 0,
                title: 'Jostling Rift',
                description: 'Waning Rift can push or pull targets.'
            },
            {
                id: 1,
                name: 'puck_curveball',
                icon: 'curve_ball',
                color: 'Blue',
                gradient_id: 2,
                title: 'Curveball',
                description:
                    "Puck's Illusory Orb can be curved in any direction, moves faster, and lasts longer."
            }
        ]
    },
    npc_dota_hero_pudge: {
        abilities: [
            'pudge_meat_hook',
            'pudge_rot',
            'pudge_flesh_heap',
            'pudge_eject',
            'pudge_innate_graft_flesh',
            'pudge_dismember'
        ],
        talents: [
            {
                name: 'special_bonus_armor_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_pudge_4',
                level: 1
            },
            {
                name: 'special_bonus_spell_lifesteal_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_pudge_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_pudge_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_pudge_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_pudge_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_pudge_1',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'pudge_fresh_meat',
                icon: 'meat',
                color: 'Green',
                gradient_id: 3,
                title: 'Fresh Meat',
                description: 'Dismember increases Strength when dealing damage to heroes.'
            },
            {
                id: 1,
                name: 'pudge_flayers_hook',
                icon: 'pudge_hook',
                color: 'Red',
                gradient_id: 0,
                title: "Flayer's Hook",
                description:
                    'Meat Hook deals bonus damage based on the distance pulled, but base damage is reduced.'
            }
        ]
    },
    npc_dota_hero_razor: {
        abilities: [
            'razor_plasma_field',
            'razor_static_link',
            'razor_storm_surge',
            'razor_unstable_current',
            'generic_hidden',
            'razor_eye_of_the_storm'
        ],
        talents: [
            {
                name: 'special_bonus_unique_razor_4',
                level: 1
            },
            {
                name: 'special_bonus_spell_lifesteal_10',
                level: 1
            },
            {
                name: 'special_bonus_unique_razor',
                level: 2
            },
            {
                name: 'special_bonus_strength_12',
                level: 2
            },
            {
                name: 'special_bonus_unique_razor_storm_surge_damage_and_slow',
                level: 3
            },
            {
                name: 'special_bonus_unique_razor_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_razor_plasmafield_second_ring',
                level: 4
            },
            {
                name: 'special_bonus_unique_razor_static_link_aspd',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'razor_thunderhead',
                icon: 'barrier',
                color: 'Gray',
                gradient_id: 0,
                title: 'Thunderhead',
                description:
                    "Storm Surge lightning strikes more often and hits all units within Eye of the Storm's area of effect when it is active."
            },
            {
                id: 1,
                name: 'razor_spellamp',
                icon: 'nuke',
                color: 'Blue',
                gradient_id: 0,
                title: 'Dynamo',
                description: 'Razor gains 1% spell amplification for every 20 points of attack damage.',
                abilities: ['razor_dynamo']
            }
        ]
    },
    npc_dota_hero_sand_king: {
        abilities: [
            'sandking_burrowstrike',
            'sandking_sand_storm',
            'sandking_scorpion_strike',
            'sandking_caustic_finale',
            'generic_hidden',
            'sandking_epicenter'
        ],
        talents: [
            {
                name: 'special_bonus_unique_sand_king_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_sand_king_burrowstrike_stun',
                level: 1
            },
            {
                name: 'special_bonus_unique_sand_king_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_sand_king_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_sand_king_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_sand_king_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_sand_king',
                level: 4
            },
            {
                name: 'special_bonus_unique_sand_king_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'sand_king_sandshroud',
                icon: 'vision',
                color: 'Gray',
                gradient_id: 3,
                title: 'Sandshroud',
                description:
                    'Sand Storm has increased radius and grants Sand King Invisibility while in it.'
            },
            {
                id: 1,
                name: 'sand_king_dust_devil',
                icon: 'speed',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Dust Devil',
                description: 'Sand Storm follows Sand King when he moves or Burrowstrikes.'
            }
        ]
    },
    npc_dota_hero_storm_spirit: {
        abilities: [
            'storm_spirit_static_remnant',
            'storm_spirit_electric_vortex',
            'storm_spirit_overload',
            'generic_hidden',
            'generic_hidden',
            'storm_spirit_ball_lightning',
            'storm_spirit_galvanized'
        ],
        talents: [
            {
                name: 'special_bonus_unique_storm_spirit_overload_aspd',
                level: 1
            },
            {
                name: 'special_bonus_mp_regen_150',
                level: 1
            },
            {
                name: 'special_bonus_hp_250',
                level: 2
            },
            {
                name: 'special_bonus_unique_storm_spirit_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_storm_spirit',
                level: 3
            },
            {
                name: 'special_bonus_unique_storm_spirit_8',
                level: 3
            },
            {
                name: 'special_bonus_unique_storm_spirit_7',
                level: 4
            },
            {
                name: 'special_bonus_unique_storm_spirit_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'storm_spirit_shock_collar',
                icon: 'nuke',
                color: 'Blue',
                gradient_id: 1,
                title: 'Shock Collar',
                description:
                    'Electric Vortex applies a debuff that triggers an Overload Charge if they attack.'
            },
            {
                id: 1,
                name: 'storm_spirit_static_slide',
                icon: 'movement',
                color: 'Gray',
                gradient_id: 3,
                title: 'Static Slide',
                description: 'Static Remnants spawn at Storm Spirit and move to the target position.'
            }
        ]
    },
    npc_dota_hero_sven: {
        abilities: [
            'sven_storm_bolt',
            'sven_great_cleave',
            'sven_warcry',
            'generic_hidden',
            'generic_hidden',
            'sven_gods_strength',
            'sven_vanquisher'
        ],
        talents: [
            {
                name: 'special_bonus_unique_sven_5',
                level: 1
            },
            {
                name: 'special_bonus_attack_speed_20',
                level: 1
            },
            {
                name: 'special_bonus_unique_sven_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_sven_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_sven_gods_strength_slow_resist',
                level: 3
            },
            {
                name: 'special_bonus_unique_sven_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_sven_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_sven_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'sven_heavy_plate',
                icon: 'armor',
                color: 'Blue',
                gradient_id: 0,
                title: 'Heavy Plate',
                description: 'Warcry provides a physical damage barrier.'
            },
            {
                id: 1,
                name: 'sven_strscaling',
                icon: 'strength',
                color: 'Red',
                gradient_id: 0,
                title: 'Wrath of God',
                description:
                    'Sven gains additional attack damage from Strength, but has decreased base damage.',
                abilities: ['sven_wrath_of_god']
            }
        ]
    },
    npc_dota_hero_tiny: {
        abilities: [
            'tiny_avalanche',
            'tiny_toss',
            'tiny_tree_grab',
            'tiny_tree_channel',
            'tiny_craggy_exterior',
            'tiny_grow',
            'tiny_toss_tree'
        ],
        talents: [
            {
                name: 'special_bonus_unique_tiny_4',
                level: 1
            },
            {
                name: 'special_bonus_strength_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_tiny_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_tiny',
                level: 2
            },
            {
                name: 'special_bonus_unique_tiny_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_tiny_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_tiny_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_tiny_2',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'tiny_crash_landing',
                icon: 'nuke',
                color: 'Gray',
                gradient_id: 2,
                title: 'Crash Landing',
                description:
                    'Tossed units slow and deal bonus damage to other targets at the Toss destination.'
            },
            {
                id: 1,
                name: 'tiny_insurmountable',
                icon: 'armor',
                color: 'Green',
                gradient_id: 4,
                title: 'Insurmountable',
                description: 'Tiny gains Status and Slow Resistance from Strength.',
                abilities: ['tiny_insurmountable']
            }
        ]
    },
    npc_dota_hero_vengefulspirit: {
        abilities: [
            'vengefulspirit_magic_missile',
            'vengefulspirit_wave_of_terror',
            'vengefulspirit_command_aura',
            'vengefulspirit_retribution',
            'generic_hidden',
            'vengefulspirit_nether_swap'
        ],
        talents: [
            {
                name: 'special_bonus_unique_vengeful_spirit_swap_damage',
                level: 1
            },
            {
                name: 'special_bonus_unique_vengeful_spirit_missile_castrange',
                level: 1
            },
            {
                name: 'special_bonus_unique_vengeful_spirit_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_vengeful_spirit_1',
                level: 2
            },
            {
                name: 'special_bonus_unique_vengeful_spirit_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_vengeful_spirit_wave_of_terror_steal',
                level: 3
            },
            {
                name: 'special_bonus_unique_vengeful_spirit_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_vengeful_spirit_9',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'vengefulspirit_avenging_missile',
                icon: 'nuke',
                color: 'Purple',
                gradient_id: 2,
                title: 'Avenging Missile',
                description: 'Magic Missile deals 0.75 bonus damage for every creep the enemy has killed.'
            },
            {
                id: 1,
                name: 'vvengefulspirit_melee',
                icon: 'fist',
                color: 'Blue',
                gradient_id: 1,
                title: 'Soul Strike',
                description: "Vengeful Spirit's ranged attacks behave as if they were melee attacks.",
                abilities: ['vengefulspirit_soul_strike']
            }
        ]
    },
    npc_dota_hero_windrunner: {
        abilities: [
            'windrunner_shackleshot',
            'windrunner_powershot',
            'windrunner_windrun',
            'windrunner_gale_force',
            'windrunner_focusfire_cancel',
            'windrunner_focusfire',
            'windrunner_easy_breezy'
        ],
        talents: [
            {
                name: 'special_bonus_unique_windranger_powershot_slow',
                level: 1
            },
            {
                name: 'special_bonus_unique_windranger_9',
                level: 1
            },
            {
                name: 'special_bonus_unique_windranger_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_windranger_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_windranger_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_windranger_8',
                level: 3
            },
            {
                name: 'special_bonus_unique_windranger_windrun_undispellable',
                level: 4
            },
            {
                name: 'special_bonus_unique_windranger_2',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'windrunner_tailwind',
                deprecated: 'true',
                icon: 'speed',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Tailwind',
                description:
                    'Windrun grants additional bonus movement speed to Windranger and nearby allies.'
            },
            {
                id: 1,
                name: 'windrunner_focusfire',
                icon: 'focus_fire',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Focus Fire',
                description: 'Focus Fire rapidly attacks a single target.'
            },
            {
                id: 2,
                name: 'windrunner_whirlwind',
                icon: 'multi_arrow',
                color: 'Green',
                gradient_id: 0,
                title: 'Whirlwind',
                description: 'Focus Fire randomly attacks enemies within range.'
            }
        ]
    },
    npc_dota_hero_zuus: {
        abilities: [
            'zuus_arc_lightning',
            'zuus_lightning_bolt',
            'zuus_heavenly_jump',
            'zuus_cloud',
            'zuus_lightning_hands',
            'zuus_thundergods_wrath',
            'zuus_static_field'
        ],
        talents: [
            {
                name: 'special_bonus_mp_regen_175',
                level: 1
            },
            {
                name: 'special_bonus_hp_200',
                level: 1
            },
            {
                name: 'special_bonus_unique_zeus_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_zeus',
                level: 2
            },
            {
                name: 'special_bonus_unique_zeus_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_zeus_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_zeus_5',
                level: 4
            },
            {
                name: 'special_bonus_unique_zeus_static_field_dmg',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'zuus_livewire',
                icon: 'range',
                color: 'Blue',
                gradient_id: 1,
                title: 'Livewire',
                description: 'Static Field deals more damage to nearby enemies.'
            },
            {
                id: 1,
                name: 'zuus_divine_rampage',
                icon: 'nuke',
                color: 'Gray',
                gradient_id: 3,
                title: 'Divine Rampage',
                description:
                    "When Thundergod's Wrath kills an enemy, it deals more damage to the other enemies."
            }
        ]
    },
    npc_dota_hero_kunkka: {
        abilities: [
            'kunkka_torrent',
            'kunkka_tidebringer',
            'kunkka_x_marks_the_spot',
            'kunkka_admirals_rum',
            'kunkka_tidal_wave',
            'kunkka_ghostship',
            'kunkka_return'
        ],
        talents: [
            {
                name: 'special_bonus_unique_kunkka_tidebringer_slow',
                level: 1
            },
            {
                name: 'special_bonus_unique_kunkka_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_kunkka_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_kunkka_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_kunkka_torrent_cooldown',
                level: 3
            },
            {
                name: 'special_bonus_unique_kunkka_rum',
                level: 3
            },
            {
                name: 'special_bonus_spell_aoe_100',
                level: 4
            },
            {
                name: 'special_bonus_unique_kunkka_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'kunkka_high_tide',
                icon: 'cooldown',
                color: 'Blue',
                gradient_id: 2,
                title: 'High Tide',
                description: 'Tidebringer cooldown is reduced per enemy hero it hits.'
            },
            {
                id: 1,
                name: 'kunkka_grog',
                icon: 'armor',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Grog Blossom',
                description:
                    "When X Marks the Spot returns its target, nearby allies gain Ghostship's improved Admiral's Rum buff."
            }
        ]
    },
    npc_dota_hero_lina: {
        abilities: [
            'lina_dragon_slave',
            'lina_light_strike_array',
            'lina_fiery_soul',
            'lina_flame_cloak',
            'lina_combustion',
            'lina_laguna_blade'
        ],
        talents: [
            {
                name: 'special_bonus_attack_damage_25',
                level: 1
            },
            {
                name: 'special_bonus_unique_lina_1',
                level: 1
            },
            {
                name: 'special_bonus_unique_lina_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_lina_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_lina_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_lina_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_lina_7',
                level: 4
            },
            {
                name: 'special_bonus_unique_lina_crit_debuff',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'lina_supercharge',
                icon: 'damage',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Thermal Runaway',
                description:
                    'Casting Laguna Blade temporarily supercharges Lina, granting her stacks of Fiery Soul.'
            },
            {
                id: 1,
                name: 'lina_dot',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 0,
                title: 'Slow Burn',
                description: "Lina's spells deal extra damage over time.",
                abilities: ['lina_slow_burn']
            }
        ]
    },
    npc_dota_hero_lich: {
        abilities: [
            'lich_frost_nova',
            'lich_frost_shield',
            'lich_sinister_gaze',
            'lich_ice_spire',
            'lich_death_charge',
            'lich_chain_frost'
        ],
        talents: [
            {
                name: 'special_bonus_unique_lich_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_lich_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_lich_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_lich_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_lich_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_lich_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_lich_1',
                level: 4
            },
            {
                name: 'special_bonus_unique_lich_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'lich_frostbound',
                icon: 'snowflake',
                color: 'Blue',
                gradient_id: 0,
                title: 'Frostbound',
                description:
                    'Chain Frost lingers on its last target if it fails to bounce and can bounce again if new targets become available.'
            },
            {
                id: 1,
                name: 'lich_growing_cold',
                icon: 'cooldown',
                color: 'Gray',
                gradient_id: 0,
                title: 'Growing Cold',
                description:
                    'When an enemy is killed by Chain Frost or while under the effect of Frost Shield, the duration of these abilities is extended.'
            }
        ]
    },
    npc_dota_hero_lion: {
        abilities: [
            'lion_impale',
            'lion_voodoo',
            'lion_mana_drain',
            'lion_to_hell_and_back',
            'generic_hidden',
            'lion_finger_of_death'
        ],
        talents: [
            {
                name: 'special_bonus_unique_lion_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_lion_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_lion_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_lion_11',
                level: 2
            },
            {
                name: 'special_bonus_unique_lion_8',
                level: 3
            },
            {
                name: 'special_bonus_unique_lion_10',
                level: 3
            },
            {
                name: 'special_bonus_unique_lion_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_lion_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'lion_essence_eater',
                icon: 'nuke',
                color: 'Purple',
                gradient_id: 2,
                title: 'Essence Eater',
                description: 'Mana Drain deals damage equal to 100% of mana stolen.'
            },
            {
                id: 1,
                name: 'lion_fist_of_death',
                icon: 'fist',
                color: 'Red',
                gradient_id: 2,
                title: 'Fist of Death',
                description: 'Lion gains a strong Melee cleaving attack after casting Finger of Death.'
            }
        ]
    },
    npc_dota_hero_shadow_shaman: {
        abilities: [
            'shadow_shaman_ether_shock',
            'shadow_shaman_voodoo',
            'shadow_shaman_shackles',
            'shadow_shaman_fowl_play',
            'generic_hidden',
            'shadow_shaman_mass_serpent_ward'
        ],
        talents: [
            {
                name: 'special_bonus_unique_shadow_shaman_6',
                level: 1
            },
            {
                name: 'special_bonus_mp_regen_175',
                level: 1
            },
            {
                name: 'special_bonus_unique_shadow_shaman_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_shadow_shaman_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_shadow_shaman_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_shadow_shaman_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_shadow_shaman_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_shadow_shaman_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'shadow_shaman_cluster_cluck',
                icon: 'chicken',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Cluster Cluck',
                description:
                    'Hex can turn allies into a flock of chickens, removing other negative effects.'
            },
            {
                id: 1,
                name: 'shadow_shaman_massive_serpent_ward',
                icon: 'snake',
                color: 'Red',
                gradient_id: 1,
                title: 'Massive Serpent Ward',
                description:
                    'Summons a single massive Serpent Ward with 10x damage and bounty values and 10x health.'
            }
        ]
    },
    npc_dota_hero_slardar: {
        abilities: [
            'slardar_sprint',
            'slardar_slithereen_crush',
            'slardar_bash',
            'slardar_seaborn_sentinel',
            'generic_hidden',
            'slardar_amplify_damage'
        ],
        talents: [
            {
                name: 'special_bonus_unique_slardar_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_slardar_slithereen_crush_stun',
                level: 1
            },
            {
                name: 'special_bonus_hp_300',
                level: 2
            },
            {
                name: 'special_bonus_unique_slardar_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_slardar',
                level: 3
            },
            {
                name: 'special_bonus_unique_slardar_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_slardar_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_slardar_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'slardar_leg_day',
                icon: 'speed',
                color: 'Red',
                gradient_id: 2,
                title: 'Leg Day',
                description:
                    'Slardar has slow resistance and even more movement speed at the beginning of Guardian Sprint.'
            },
            {
                id: 1,
                name: 'slardar_brineguard',
                icon: 'armor',
                color: 'Purple',
                gradient_id: 1,
                title: 'Brineguard',
                description: "Corrosive Haze increases Slardar's armor by 40% of the total armor reduced."
            }
        ]
    },
    npc_dota_hero_tidehunter: {
        abilities: [
            'tidehunter_gush',
            'tidehunter_kraken_shell',
            'tidehunter_anchor_smash',
            'tidehunter_dead_in_the_water',
            'generic_hidden',
            'tidehunter_ravage',
            'tidehunter_blubber'
        ],
        talents: [
            {
                name: 'special_bonus_unique_tidehunter_9',
                level: 1
            },
            {
                name: 'special_bonus_unique_tidehunter_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_tidehunter_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_tidehunter_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_tidehunter_10',
                level: 3
            },
            {
                name: 'special_bonus_unique_tidehunter',
                level: 3
            },
            {
                name: 'special_bonus_unique_tidehunter_7',
                level: 4
            },
            {
                name: 'special_bonus_unique_tidehunter_8',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'tidehunter_kraken_swell',
                icon: 'armor',
                color: 'Green',
                gradient_id: 2,
                title: 'Kraken Swell',
                description:
                    'Kraken Shell gains permanent Damage Block when an enemy hero dies under the effects of Anchor Smash.'
            },
            {
                id: 1,
                name: 'tidehunter_sizescale',
                icon: 'overshadow',
                color: 'Green',
                gradient_id: 0,
                title: 'Krill Eater',
                description: 'Tidehunter grows larger and gains extra bonuses per level.',
                abilities: ['tidehunter_krill_eater']
            }
        ]
    },
    npc_dota_hero_witch_doctor: {
        abilities: [
            'witch_doctor_paralyzing_cask',
            'witch_doctor_voodoo_restoration',
            'witch_doctor_maledict',
            'witch_doctor_voodoo_switcheroo',
            'witch_doctor_gris_gris',
            'witch_doctor_death_ward'
        ],
        talents: [
            {
                name: 'special_bonus_unique_witch_doctor_4',
                level: 1
            },
            {
                name: 'special_bonus_hp_200',
                level: 1
            },
            {
                name: 'special_bonus_unique_witch_doctor_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_witch_doctor_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_witch_doctor_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_witch_doctor_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_witch_doctor_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_witch_doctor_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'witch_doctor_headhunter',
                icon: 'ricochet',
                color: 'Gray',
                gradient_id: 3,
                title: 'Headhunter',
                description: 'Paralyzing Cask deals more damage each bounce.'
            },
            {
                id: 1,
                name: 'witch_doctor_voodoo_festeration',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 2,
                title: 'Voodoo Festeration',
                description: 'Voodoo Restoration deals damage to enemies and only heals Witch Doctor.'
            },
            {
                id: 2,
                name: 'witch_doctor_cleft_death',
                icon: 'death_ward',
                color: 'Purple',
                gradient_id: 0,
                title: 'Cleft Death',
                description: 'Death Ward attacks multiple targets with reduced damage.'
            }
        ]
    },
    npc_dota_hero_riki: {
        abilities: [
            'riki_smoke_screen',
            'riki_blink_strike',
            'riki_tricks_of_the_trade',
            'riki_innate_backstab',
            'generic_hidden',
            'riki_backstab'
        ],
        talents: [
            {
                name: 'special_bonus_unique_riki_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_riki_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_riki_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_riki_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_riki_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_riki_9',
                level: 3
            },
            {
                name: 'special_bonus_unique_riki_6',
                level: 4
            },
            {
                name: 'special_bonus_unique_riki_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'riki_contract_killer',
                icon: 'xp',
                color: 'Gray',
                gradient_id: 3,
                title: 'Contract Killer',
                description: 'Riki receives bonus experience for assists and kills.'
            },
            {
                id: 1,
                name: 'riki_exterminator',
                icon: 'agility',
                color: 'Purple',
                gradient_id: 2,
                title: 'Exterminator',
                description: 'Tricks of the Trade has 4.5x Agility Bonus when attacking non-hero units.'
            }
        ]
    },
    npc_dota_hero_enigma: {
        abilities: [
            'enigma_malefice',
            'enigma_demonic_conversion',
            'enigma_midnight_pulse',
            'enigma_gravity_well',
            'generic_hidden',
            'enigma_black_hole'
        ],
        talents: [
            {
                name: 'special_bonus_unique_enigma_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_enigma_6',
                level: 1
            },
            {
                name: 'special_bonus_hp_250',
                level: 2
            },
            {
                name: 'special_bonus_unique_enigma_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_enigma_9',
                level: 3
            },
            {
                name: 'special_bonus_unique_enigma_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_enigma_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_enigma',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'enigma_gravity',
                icon: 'slow',
                color: 'Gray',
                gradient_id: 3,
                title: 'Event Horizon',
                description: 'Units in a 600 radius moving away from Enigma have a 9% movespeed penalty.',
                abilities: ['enigma_event_horizon']
            },
            {
                id: 1,
                name: 'enigma_fragment',
                icon: 'summons',
                color: 'Purple',
                gradient_id: 0,
                title: 'Splitting Image',
                description: 'Enigma spawns Eidolons upon receiving damage.',
                abilities: ['enigma_splitting_image']
            }
        ]
    },
    npc_dota_hero_tinker: {
        abilities: [
            'tinker_laser',
            'tinker_march_of_the_machines',
            'tinker_defense_matrix',
            'tinker_warp_grenade',
            'tinker_keen_teleport',
            'tinker_rearm',
            'tinker_eureka'
        ],
        talents: [
            {
                name: 'special_bonus_unique_tinker_march_duration',
                level: 1
            },
            {
                name: 'special_bonus_mana_reduction_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_tinker_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_tinker',
                level: 2
            },
            {
                name: 'special_bonus_unique_tinker_defense_matrix_status_resistance',
                level: 3
            },
            {
                name: 'special_bonus_unique_tinker_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_tinker_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_tinker_rearm_magic_resistance',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'tinker_repair_bots',
                icon: 'healing',
                color: 'Blue',
                gradient_id: 2,
                title: 'Repair Bots',
                description:
                    'March of the Machines applies a non-stacking heal over time when passing through allied heroes.'
            },
            {
                id: 1,
                name: 'tinker_translocator',
                icon: 'movement',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Translocator',
                description:
                    'When a Self-Defense Matrix barrier on Tinker is fully absorbed, he blinks in a random forward direction.<br><br>DISPEL TYPE: Basic Dispel'
            }
        ]
    },
    npc_dota_hero_sniper: {
        abilities: [
            'sniper_shrapnel',
            'sniper_headshot',
            'sniper_take_aim',
            'sniper_concussive_grenade',
            'sniper_keen_scope',
            'sniper_assassinate'
        ],
        talents: [
            {
                name: 'special_bonus_unique_sniper_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_sniper_headshot_damage',
                level: 1
            },
            {
                name: 'special_bonus_attack_speed_30',
                level: 2
            },
            {
                name: 'special_bonus_unique_sniper_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_sniper_take_aim_armor',
                level: 3
            },
            {
                name: 'special_bonus_unique_sniper_shrapnel_damage',
                level: 3
            },
            {
                name: 'special_bonus_unique_sniper_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_sniper_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'sniper_ghillie_suit',
                icon: 'vision',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Ghillie Suit',
                description: "While Take Aim is active, Sniper's attacks do not reveal him from fog of war."
            },
            {
                id: 1,
                name: 'sniper_scattershot',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 0,
                title: 'Scattershot',
                description: 'Shrapnel slow and damage are increased, but duration is decreased.'
            }
        ]
    },
    npc_dota_hero_necrolyte: {
        abilities: [
            'necrolyte_death_pulse',
            'necrolyte_ghost_shroud',
            'necrolyte_heartstopper_aura',
            'necrolyte_death_seeker',
            'necrolyte_sadist',
            'necrolyte_reapers_scythe'
        ],
        talents: [
            {
                name: 'special_bonus_unique_necrophos_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_necrophos_heartstopper_regen_duration',
                level: 1
            },
            {
                name: 'special_bonus_unique_necrophos_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_necrophos_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_necrophos_sadist_heal_bonus',
                level: 3
            },
            {
                name: 'special_bonus_unique_necrophos_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_necrophos_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_necrophos',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'necrolyte_profane_potency',
                icon: 'area_of_effect',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Profane Potency',
                description: "Sadist also grants Necrophos' AoE abilities and items bonus Radius per kill."
            },
            {
                id: 1,
                name: 'necrolyte_rapid_decay',
                icon: 'speed',
                color: 'Green',
                gradient_id: 3,
                title: 'Rapid Decay',
                description: 'Ghost Shroud steals speed from his enemies.'
            }
        ]
    },
    npc_dota_hero_warlock: {
        abilities: [
            'warlock_fatal_bonds',
            'warlock_shadow_word',
            'warlock_upheaval',
            'warlock_eldritch_summoning',
            'generic_hidden',
            'warlock_rain_of_chaos'
        ],
        talents: [
            {
                name: 'special_bonus_unique_warlock_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_warlock_upheaval_aoe',
                level: 1
            },
            {
                name: 'special_bonus_unique_warlock_10',
                level: 2
            },
            {
                name: 'special_bonus_unique_warlock_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_warlock_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_warlock_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_warlock_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_warlock_1',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'warlock_golem',
                icon: 'summons',
                color: 'Red',
                gradient_id: 0,
                title: 'Champion of Gorroth',
                description:
                    "Chaotic Offering Golems deal more burn damage based on Warlock's health and mana regeneration."
            },
            {
                id: 1,
                name: 'warlock_grimoire',
                icon: 'xp',
                color: 'Gray',
                gradient_id: 3,
                title: 'Black Grimoire',
                description:
                    'Grants Warlock the item Black Grimoire, which can be consumed to gain experience for each kill Warlock participated in. Starts with 1 charge.',
                abilities: ['warlock_black_grimoire']
            }
        ]
    },
    npc_dota_hero_beastmaster: {
        abilities: [
            'beastmaster_wild_axes',
            'beastmaster_call_of_the_wild_boar',
            'beastmaster_call_of_the_wild_hawk',
            'beastmaster_inner_beast',
            'beastmaster_drums_of_slom',
            'beastmaster_primal_roar',
            'beastmaster_rugged'
        ],
        talents: [
            {
                name: 'special_bonus_unique_beastmaster_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_beastmaster_9',
                level: 1
            },
            {
                name: 'special_bonus_unique_beastmaster_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_beastmaster_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_beastmaster_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_beastmaster_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_beastmaster_wild_axe_cooldown',
                level: 4
            },
            {
                name: 'special_bonus_unique_beastmaster_7',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'beastmaster_wild_hunt',
                icon: 'summons',
                color: 'Red',
                gradient_id: 1,
                title: 'Wild Hunt',
                description: 'Beastmaster attacks faster when his units are nearby.'
            },
            {
                id: 1,
                name: 'beastmaster_beast_mode',
                icon: 'damage',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Beast Mode',
                description: 'Beastmaster can get a self attack speed and damage amplification boost.'
            }
        ]
    },
    npc_dota_hero_queenofpain: {
        abilities: [
            'queenofpain_shadow_strike',
            'queenofpain_blink',
            'queenofpain_scream_of_pain',
            'queenofpain_bondage',
            'generic_hidden',
            'queenofpain_sonic_wave'
        ],
        talents: [
            {
                name: 'special_bonus_unique_queen_of_pain_1',
                level: 1
            },
            {
                name: 'special_bonus_strength_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_queen_of_pain_4',
                level: 2
            },
            {
                name: 'special_bonus_attack_damage_30',
                level: 2
            },
            {
                name: 'special_bonus_unique_queen_of_pain_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_queen_of_pain_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_queen_of_pain_6',
                level: 4
            },
            {
                name: 'special_bonus_unique_queen_of_pain_7',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'queenofpain_lifesteal',
                icon: 'healing',
                color: 'Blue',
                gradient_id: 0,
                title: 'Succubus',
                description:
                    'Queen of Pain gains Spell Lifesteal that increases with proximity to her enemies.',
                abilities: ['queenofpain_succubus']
            },
            {
                id: 1,
                name: 'queenofpain_selfdmg',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 0,
                title: 'Masochist',
                description:
                    'Queen of Pain has bonus Spell Amplification but a percentage of her spell damage is reflected back to her.',
                abilities: ['queenofpain_masochist']
            }
        ]
    },
    npc_dota_hero_venomancer: {
        abilities: [
            'venomancer_venomous_gale',
            'venomancer_poison_sting',
            'venomancer_plague_ward',
            'venomancer_sepsis',
            'generic_hidden',
            'venomancer_noxious_plague'
        ],
        talents: [
            {
                name: 'special_bonus_unique_venomancer_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_venomancer_poisonsting_regen_reduction',
                level: 1
            },
            {
                name: 'special_bonus_unique_venomancer_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_venomancer_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_venomancer_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_venomancer_gale_plagueward',
                level: 3
            },
            {
                name: 'special_bonus_unique_venomancer_5',
                level: 4
            },
            {
                name: 'special_bonus_unique_venomancer',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'venomancer_patient_zero',
                icon: 'snot',
                color: 'Green',
                gradient_id: 0,
                title: 'Patient Zero',
                description: 'Noxious Plague spreads again.'
            },
            {
                id: 1,
                name: 'venomancer_plague_carrier',
                icon: 'summons',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Plague Carrier',
                description: 'Plague Wards can be attached to allies and have extra charges.'
            }
        ]
    },
    npc_dota_hero_faceless_void: {
        abilities: [
            'faceless_void_time_walk',
            'faceless_void_time_dilation',
            'faceless_void_time_lock',
            'faceless_void_time_walk_reverse',
            'faceless_void_distortion_field',
            'generic_hidden'
        ],
        talents: [
            {
                name: 'special_bonus_unique_faceless_void_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_faceless_void_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_faceless_void_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_faceless_void_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_faceless_void',
                level: 3
            },
            {
                name: 'special_bonus_unique_faceless_void_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_faceless_void_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_faceless_void_2',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'faceless_void_temporal_impunity',
                deprecated: 'true',
                icon: 'armor',
                color: 'Green',
                gradient_id: 0,
                title: 'Temporal Impunity',
                description: 'Prevents all damage for a short duration after casting Time Walk.'
            },
            {
                id: 1,
                name: 'faceless_void_chronosphere',
                icon: 'area_of_effect',
                color: 'Green',
                gradient_id: 0,
                title: 'Chronosphere',
                description: 'Faceless Void can cast Chronosphere , trapping enemies in a sphere.',
                abilities: ['faceless_void_chronosphere']
            },
            {
                id: 2,
                name: 'faceless_void_time_zone',
                icon: 'chrono_cube',
                color: 'Purple',
                gradient_id: 1,
                title: 'Time Zone',
                description:
                    'Faceless Void can cast Time Zone , dramatically slowing down enemies and speeding up allies in an area.',
                abilities: ['faceless_void_time_zone']
            }
        ]
    },
    npc_dota_hero_skeleton_king: {
        abilities: [
            'skeleton_king_hellfire_blast',
            'generic_hidden',
            'skeleton_king_mortal_strike',
            'skeleton_king_vampiric_spirit',
            'generic_hidden',
            'skeleton_king_reincarnation'
        ],
        talents: [
            {
                name: 'special_bonus_unique_wraith_king_2',
                level: 1
            },
            {
                name: 'special_bonus_unique_wraith_king_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_wraith_king_11',
                level: 2
            },
            {
                name: 'special_bonus_hp_400',
                level: 2
            },
            {
                name: 'special_bonus_cleave_35',
                level: 3
            },
            {
                name: 'special_bonus_attack_speed_70',
                level: 3
            },
            {
                name: 'special_bonus_unique_wraith_king_10',
                level: 4
            },
            {
                name: 'special_bonus_unique_wraith_king_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'skeleton_king_facet_bone_guard',
                icon: 'summons',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Bone Guard',
                description: 'Wraith King can summon skeletons to fight for him.',
                abilities: ['skeleton_king_bone_guard']
            },
            {
                id: 1,
                name: 'skeleton_king_facet_cursed_blade',
                icon: 'damage',
                color: 'Red',
                gradient_id: 0,
                title: 'Spectral Blade',
                description:
                    "Wraith King's attacks curse enemies, dealing additional damage after a delay.",
                abilities: ['skeleton_king_spectral_blade']
            }
        ]
    },
    npc_dota_hero_death_prophet: {
        abilities: [
            'death_prophet_carrion_swarm',
            'death_prophet_silence',
            'death_prophet_spirit_siphon',
            'death_prophet_witchcraft',
            'generic_hidden',
            'death_prophet_exorcism'
        ],
        talents: [
            {
                name: 'special_bonus_attack_speed_40',
                level: 1
            },
            {
                name: 'special_bonus_magic_resistance_12',
                level: 1
            },
            {
                name: 'special_bonus_unique_death_prophet_silence_aoe',
                level: 2
            },
            {
                name: 'special_bonus_unique_death_prophet_2',
                level: 2
            },
            {
                name: 'special_bonus_hp_400',
                level: 3
            },
            {
                name: 'special_bonus_unique_death_prophet_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_death_prophet_5',
                level: 4
            },
            {
                name: 'special_bonus_unique_death_prophet',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'death_prophet_suppress',
                icon: 'slow',
                color: 'Purple',
                gradient_id: 2,
                title: 'Suppress',
                description: 'Silenced enemies are also slowed.'
            },
            {
                id: 1,
                name: 'death_prophet_ghosts',
                icon: 'spirit',
                color: 'Green',
                gradient_id: 1,
                title: 'Spirit Collector',
                description: 'Hero deaths empower your next Exorcism.',
                abilities: ['death_prophet_spirit_collector']
            },
            {
                id: 2,
                name: 'death_prophet_delayed_damage',
                icon: 'healing',
                color: 'Red',
                gradient_id: 1,
                title: 'Mourning Ritual',
                description:
                    'Death Prophet delays a percentage of incoming damage, taking the damage in even intervals over a short duration.',
                abilities: ['death_prophet_mourning_ritual']
            }
        ]
    },
    npc_dota_hero_phantom_assassin: {
        abilities: [
            'phantom_assassin_stifling_dagger',
            'phantom_assassin_phantom_strike',
            'phantom_assassin_blur',
            'phantom_assassin_fan_of_knives',
            'phantom_assassin_immaterial',
            'phantom_assassin_coup_de_grace'
        ],
        talents: [
            {
                name: 'special_bonus_unique_phantom_assassin_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_phantom_assassin_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_phantom_assassin_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_phantom_assassin_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_phantom_assassin_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_phantom_assassin_strike_aspd',
                level: 3
            },
            {
                name: 'special_bonus_unique_phantom_assassin_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_phantom_assassin',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'phantom_assassin_veiled_one',
                icon: 'mana',
                color: 'Blue',
                gradient_id: 3,
                title: 'Veiled One',
                description:
                    'Blur is no longer dispelled when attacking and reduces mana costs during and after Blur.'
            },
            {
                id: 1,
                name: 'phantom_assassin_methodical',
                icon: 'damage',
                color: 'Gray',
                gradient_id: 0,
                title: 'Methodical',
                description:
                    'Coup de Grace procs every 6 attacks on the same hero or 4 attacks on non hero units.'
            }
        ]
    },
    npc_dota_hero_pugna: {
        abilities: [
            'pugna_nether_blast',
            'pugna_decrepify',
            'pugna_nether_ward',
            'pugna_oblivion_savant',
            'generic_hidden',
            'pugna_life_drain'
        ],
        talents: [
            {
                name: 'special_bonus_unique_pugna_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_pugna_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_pugna_decrepify_ally_movespeed',
                level: 2
            },
            {
                name: 'special_bonus_hp_350',
                level: 2
            },
            {
                name: 'special_bonus_unique_pugna_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_pugna_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_pugna_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_pugna_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'pugna_siphoning_ward',
                icon: 'healing',
                color: 'Green',
                gradient_id: 0,
                title: 'Siphoning Ward',
                description:
                    'Nether Ward restores mana and health to Pugna based on how much damage is dealt.'
            },
            {
                id: 1,
                name: 'pugna_rewards_of_ruin',
                icon: 'siege',
                color: 'Purple',
                gradient_id: 2,
                title: 'Rewards of Ruin',
                description: 'Pugna receives 1.25% spell amplification per destroyed tower.'
            }
        ]
    },
    npc_dota_hero_templar_assassin: {
        abilities: [
            'templar_assassin_refraction',
            'templar_assassin_meld',
            'templar_assassin_psi_blades',
            'templar_assassin_trap',
            'templar_assassin_trap_teleport',
            'templar_assassin_psionic_trap',
            'templar_assassin_third_eye'
        ],
        talents: [
            {
                name: 'special_bonus_unique_templar_assassin_refraction_damage',
                level: 1
            },
            {
                name: 'special_bonus_unique_templar_assassin_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_templar_assassin_refraction_disable_cast',
                level: 2
            },
            {
                name: 'special_bonus_unique_templar_assassin_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_templar_assassin_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_templar_assassin_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_templar_assassin_7',
                level: 4
            },
            {
                name: 'special_bonus_unique_templar_assassin',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'templar_assassin_voidblades',
                icon: 'ricochet',
                color: 'Gray',
                gradient_id: 3,
                title: 'Voidblades',
                description:
                    'Attacking a target with Meld also applies the bonus damage and debuff to enemies hit by the Psi Blades spill.'
            },
            {
                id: 1,
                name: 'templar_assassin_refractor',
                icon: 'damage',
                color: 'Purple',
                gradient_id: 0,
                title: 'Refractor',
                description: 'Refraction gains a damage charge every time a shield charge gets consumed.'
            }
        ]
    },
    npc_dota_hero_viper: {
        abilities: [
            'viper_poison_attack',
            'viper_nethertoxin',
            'viper_corrosive_skin',
            'viper_nose_dive',
            'viper_predator',
            'viper_viper_strike'
        ],
        talents: [
            {
                name: 'special_bonus_unique_viper_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_viper_1',
                level: 1
            },
            {
                name: 'special_bonus_unique_viper_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_viper_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_viper_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_viper_predator_damage',
                level: 3
            },
            {
                name: 'special_bonus_unique_viper_5',
                level: 4
            },
            {
                name: 'special_bonus_unique_viper_8',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'viper_poison_burst',
                icon: 'area_of_effect',
                color: 'Green',
                gradient_id: 0,
                title: 'Poison Burst',
                description:
                    'After Poison Attack stacks expire, enemies around the target take additional damage.'
            },
            {
                id: 1,
                name: 'viper_caustic_bath',
                icon: 'armor',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Caustic Bath',
                description: "Viper's Corrosive Skin effects are increased while he is in Nethertoxin."
            }
        ]
    },
    npc_dota_hero_luna: {
        abilities: [
            'luna_lucent_beam',
            'luna_lunar_orbit',
            'luna_moon_glaive',
            'luna_lunar_blessing',
            'generic_hidden',
            'luna_eclipse',
            'generic_hidden'
        ],
        talents: [
            {
                name: 'special_bonus_unique_luna_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_luna_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_luna_1',
                level: 2
            },
            {
                name: 'special_bonus_unique_luna_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_luna_8',
                level: 3
            },
            {
                name: 'special_bonus_unique_luna_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_luna_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_luna_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'luna_lunar_orbit',
                deprecated: 'true',
                icon: 'armor',
                color: 'Gray',
                gradient_id: 3,
                title: 'Lunar Orbit Facet',
                description: ''
            },
            {
                id: 1,
                name: 'luna_moonshield',
                icon: 'armor',
                color: 'Gray',
                gradient_id: 3,
                title: 'Moonshield',
                description: 'Lunar Orbit provide damage reduction while active.'
            },
            {
                id: 2,
                name: 'luna_moonstorm',
                icon: 'damage',
                color: 'Blue',
                gradient_id: 1,
                title: 'Moonstorm',
                description: 'Hitting enemies with Lucent Beams or Eclipse grants Luna bonus attack damage.'
            }
        ]
    },
    npc_dota_hero_dragon_knight: {
        abilities: [
            'dragon_knight_breathe_fire',
            'dragon_knight_dragon_tail',
            'dragon_knight_dragon_blood',
            'dragon_knight_fireball',
            'generic_hidden',
            'dragon_knight_elder_dragon_form',
            'dragon_knight_inherited_vigor'
        ],
        talents: [
            {
                name: 'special_bonus_attack_damage_15',
                level: 1
            },
            {
                name: 'special_bonus_unique_dragon_knight_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_dragon_knight_2',
                level: 2
            },
            {
                name: 'special_bonus_hp_300',
                level: 2
            },
            {
                name: 'special_bonus_unique_dragon_knight_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_dragon_knight_9',
                level: 3
            },
            {
                name: 'special_bonus_unique_dragon_knight',
                level: 4
            },
            {
                name: 'special_bonus_unique_dragon_knight_8',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'dragon_knight_fire_dragon',
                icon: 'dragon_fire',
                color: 'Red',
                gradient_id: 1,
                title: 'Fire Dragon',
                description:
                    'Dragon Knight has Splash Damage on his attacks that get stronger when in Elder Dragon Form.'
            },
            {
                id: 1,
                name: 'dragon_knight_corrosive_dragon',
                icon: 'dragon_poison',
                color: 'Green',
                gradient_id: 0,
                title: 'Corrosive Dragon',
                description:
                    'Dragon Knight has Corrosive Powers on his attacks that get stronger when in Elder Dragon Form.'
            },
            {
                id: 2,
                name: 'dragon_knight_frost_dragon',
                icon: 'dragon_frost',
                color: 'Blue',
                gradient_id: 0,
                title: 'Frost Dragon',
                description:
                    'Dragon Knight has Slow and Healing Reduction Effects on his attacks that get stronger when in Elder Dragon Form.'
            }
        ]
    },
    npc_dota_hero_dazzle: {
        abilities: [
            'dazzle_poison_touch',
            'dazzle_shallow_grave',
            'dazzle_shadow_wave',
            'dazzle_innate_weave',
            'generic_hidden',
            'dazzle_bad_juju'
        ],
        talents: [
            {
                name: 'special_bonus_unique_dazzle_poison_touch_attack_range_bonus',
                level: 1
            },
            {
                name: 'special_bonus_mp_regen_175',
                level: 1
            },
            {
                name: 'special_bonus_unique_dazzle_2',
                level: 2
            },
            {
                name: 'special_bonus_attack_speed_90',
                level: 2
            },
            {
                name: 'special_bonus_unique_dazzle_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_dazzle_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_dazzle_1',
                level: 4
            },
            {
                name: 'special_bonus_unique_dazzle_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'dazzle_facet_nothl_boon',
                icon: 'armor',
                color: 'Red',
                gradient_id: 1,
                title: 'Nothl Boon',
                description: "Dazzle's overhealing is converted into a barrier.",
                abilities: ['dazzle_nothl_boon']
            },
            {
                id: 1,
                name: 'dazzle_poison_bloom',
                icon: 'ricochet',
                color: 'Purple',
                gradient_id: 0,
                title: 'Poison Bloom',
                description: 'Dazzle can refresh and spread his Poison Touch when attacking enemies.'
            }
        ]
    },
    npc_dota_hero_rattletrap: {
        abilities: [
            'rattletrap_battery_assault',
            'rattletrap_power_cogs',
            'rattletrap_rocket_flare',
            'rattletrap_overclocking',
            'rattletrap_jetpack',
            'rattletrap_hookshot',
            'rattletrap_armor_power'
        ],
        talents: [
            {
                name: 'special_bonus_unique_clockwerk_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_clockwerk_9',
                level: 1
            },
            {
                name: 'special_bonus_unique_clockwerk_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_clockwerk_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_clockwerk_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_clockwerk_flare_damage',
                level: 3
            },
            {
                name: 'special_bonus_unique_clockwerk_6',
                level: 4
            },
            {
                name: 'special_bonus_unique_clockwerk',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'rattletrap_hookup',
                icon: 'cooldown',
                color: 'Gray',
                gradient_id: 2,
                title: 'Hookup',
                description:
                    'When hitting an ally, Hookshot has a larger impact radius, grants armor, and partially refunds its cooldown and manacost.'
            },
            {
                id: 1,
                name: 'rattletrap_expanded_armature',
                icon: 'area_of_effect',
                color: 'Red',
                gradient_id: 2,
                title: 'Expanded Armature',
                description: 'Power Cogs form in a larger radius.'
            }
        ]
    },
    npc_dota_hero_leshrac: {
        abilities: [
            'leshrac_split_earth',
            'leshrac_diabolic_edict',
            'leshrac_lightning_storm',
            'leshrac_greater_lightning_storm',
            'leshrac_defilement',
            'leshrac_pulse_nova'
        ],
        talents: [
            {
                name: 'special_bonus_mp_regen_150',
                level: 1
            },
            {
                name: 'special_bonus_armor_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_leshrac_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_leshrac_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_leshrac_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_leshrac_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_leshrac_pulse_nova_lightning',
                level: 4
            },
            {
                name: 'special_bonus_unique_leshrac_1',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'leshrac_attacks_mana',
                icon: 'mana',
                color: 'Blue',
                gradient_id: 1,
                title: 'Chronoptic Nourishment',
                description: "Leshrac's attacks restore mana.",
                abilities: ['leshrac_chronoptic_nourishment']
            },
            {
                id: 1,
                name: 'leshrac_misanthropy',
                icon: 'nuke',
                color: 'Purple',
                gradient_id: 0,
                title: 'Misanthropy',
                description: 'Diabolic Edict explosion rate increased but it no longer damages buildings.'
            }
        ]
    },
    npc_dota_hero_furion: {
        abilities: [
            'furion_sprout',
            'furion_teleportation',
            'furion_force_of_nature',
            'furion_curse_of_the_forest',
            'furion_spirit_of_the_forest',
            'furion_wrath_of_nature'
        ],
        talents: [
            {
                name: 'special_bonus_unique_furion_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_furion_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_furion_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_furion_teleportation_barrier',
                level: 2
            },
            {
                name: 'special_bonus_unique_furion_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_furion_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_furion_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_furion',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'furion_soothing_saplings',
                icon: 'healing',
                color: 'Green',
                gradient_id: 0,
                title: 'Soothing Saplings',
                description: 'Allies inside and nearby on the outside of Sprout are healed over time.'
            },
            {
                id: 1,
                name: 'furion_ironwood_treant',
                icon: 'siege',
                color: 'Blue',
                gradient_id: 2,
                title: 'Ironwood Treant',
                description:
                    "Nature's Call creates only 1 =1 =1 =1 Treant that has more health, more damage, increased vision, increased movement speed, and is Reinforced."
            }
        ]
    },
    npc_dota_hero_life_stealer: {
        abilities: [
            'generic_hidden',
            'life_stealer_open_wounds',
            'life_stealer_ghoul_frenzy',
            'life_stealer_feast',
            'generic_hidden',
            'life_stealer_infest',
            'life_stealer_consume'
        ],
        talents: [
            {
                name: 'special_bonus_unique_lifestealer_infest_damage',
                level: 1
            },
            {
                name: 'special_bonus_unique_lifestealer_2',
                level: 1
            },
            {
                name: 'special_bonus_unique_lifestealer_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_lifestealer_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_lifestealer_infest_target_bonus',
                level: 3
            },
            {
                name: 'special_bonus_unique_lifestealer_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_lifestealer_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_lifestealer',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'life_stealer_maxhp_gain',
                deprecated: 'true',
                icon: 'armor',
                color: 'Yellow',
                gradient_id: 3,
                title: 'Corpse Eater',
                description:
                    'Lifestealer gains 1 HP whenever he kills a creep, and 15 whenever he kills a hero.',
                abilities: ['life_stealer_corpse_eater']
            },
            {
                id: 1,
                name: 'life_stealer_rage',
                icon: 'lifestealer_rage',
                color: 'Yellow',
                gradient_id: 3,
                title: 'Rage',
                description:
                    'Lifestealer can cast Rage , becoming Debuff Immune and increasing magic resistance.',
                abilities: ['life_stealer_rage']
            },
            {
                id: 2,
                name: 'life_stealer_rage_dispell',
                icon: 'broken_chain',
                color: 'Red',
                gradient_id: 0,
                title: 'Unfettered',
                description:
                    'Lifestealer can cast Unfettered to dispel himself and become more resilient. Can cast while stunned.',
                abilities: ['life_stealer_unfettered']
            }
        ]
    },
    npc_dota_hero_dark_seer: {
        abilities: [
            'dark_seer_vacuum',
            'dark_seer_ion_shell',
            'dark_seer_surge',
            'dark_seer_normal_punch',
            'dark_seer_mental_fortitude',
            'dark_seer_wall_of_replica'
        ],
        talents: [
            {
                name: 'special_bonus_unique_dark_seer_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_dark_seer_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_dark_seer_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_dark_seer_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_dark_seer_13',
                level: 3
            },
            {
                name: 'special_bonus_unique_dark_seer',
                level: 3
            },
            {
                name: 'special_bonus_unique_dark_seer_14',
                level: 4
            },
            {
                name: 'special_bonus_unique_dark_seer_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'dark_seer_atkspd',
                icon: 'damage',
                color: 'Gray',
                gradient_id: 3,
                title: 'Quick Wit',
                description: 'Dark Seer also gains Attack Speed from Intelligence.',
                abilities: ['dark_seer_quick_wit']
            },
            {
                id: 1,
                name: 'dark_seer_movespd',
                icon: 'speed',
                color: 'Purple',
                gradient_id: 2,
                title: 'Heart of Battle',
                description: 'Dark Seer moves faster when near other heroes.',
                abilities: ['dark_seer_heart_of_battle']
            }
        ]
    },
    npc_dota_hero_clinkz: {
        abilities: [
            'clinkz_strafe',
            'clinkz_tar_bomb',
            'clinkz_death_pact',
            'clinkz_burning_barrage',
            'clinkz_burning_army',
            'clinkz_wind_walk',
            'clinkz_bone_and_arrow'
        ],
        talents: [
            {
                name: 'special_bonus_unique_clinkz_1',
                level: 1
            },
            {
                name: 'special_bonus_unique_clinkz_10',
                level: 1
            },
            {
                name: 'special_bonus_attack_range_75',
                level: 2
            },
            {
                name: 'special_bonus_unique_clinkz_9',
                level: 2
            },
            {
                name: 'special_bonus_unique_clinkz_8',
                level: 3
            },
            {
                name: 'special_bonus_unique_clinkz_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_clinkz_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_clinkz_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'clinkz_suppressive_fire',
                icon: 'no_vision',
                color: 'Gray',
                gradient_id: 3,
                title: 'Suppressive Fire',
                description: 'Strafe attacks cause enemies to miss more often.'
            },
            {
                id: 1,
                name: 'clinkz_engulfing_step',
                icon: 'teleport',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Engulfing Step',
                description: 'Death Pact teleports Clinkz towards his victim. Reduces Death Pact cooldown.'
            }
        ]
    },
    npc_dota_hero_omniknight: {
        abilities: [
            'omniknight_purification',
            'omniknight_martyr',
            'omniknight_hammer_of_purity',
            'omniknight_degen_aura',
            'generic_hidden',
            'omniknight_guardian_angel'
        ],
        talents: [
            {
                name: 'special_bonus_unique_omniknight_5',
                level: 1
            },
            {
                name: 'special_bonus_attack_base_damage_35',
                level: 1
            },
            {
                name: 'special_bonus_unique_omniknight_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_omniknight_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_omniknight_guardian_angel_duration',
                level: 3
            },
            {
                name: 'special_bonus_unique_omniknight_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_omniknight_1',
                level: 4
            },
            {
                name: 'special_bonus_unique_omniknight_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'omniknight_omnipresent',
                icon: 'damage',
                color: 'Gray',
                gradient_id: 3,
                title: 'Omnipresent',
                description: 'Omniknight deals more damage to heroes inside his Degen Aura.'
            },
            {
                id: 1,
                name: 'omniknight_dmgheals',
                icon: 'healing',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Healing Hammer',
                description: 'Ability damage done to enemies by Omniknight heals him over time.',
                abilities: ['omniknight_healing_hammer']
            }
        ]
    },
    npc_dota_hero_enchantress: {
        abilities: [
            'enchantress_impetus',
            'enchantress_enchant',
            'enchantress_natures_attendants',
            'enchantress_bunny_hop',
            'enchantress_little_friends',
            'enchantress_untouchable',
            'enchantress_rabblerouser'
        ],
        talents: [
            {
                name: 'special_bonus_unique_enchantress_enchant_armor',
                level: 1
            },
            {
                name: 'special_bonus_unique_enchantress_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_enchantress_enchant_attackspeed',
                level: 2
            },
            {
                name: 'special_bonus_unique_enchantress_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_enchantress_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_enchantress_enchant_health_damage',
                level: 3
            },
            {
                name: 'special_bonus_unique_enchantress_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_enchantress_2',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'enchantress_overprotective_wisps',
                icon: 'healing',
                color: 'Green',
                gradient_id: 0,
                title: 'Overprotective Wisps',
                description: 'Summon Healing Wisps upon receiving damage.'
            },
            {
                id: 1,
                name: 'enchantress_spellbound',
                icon: 'range',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Spellbound',
                description: 'Enchant and attacks on Enchanted targets have extra range.'
            }
        ]
    },
    npc_dota_hero_huskar: {
        abilities: [
            'huskar_inner_fire',
            'huskar_burning_spear',
            'huskar_berserkers_blood',
            'huskar_blood_magic',
            'generic_hidden',
            'huskar_life_break'
        ],
        talents: [
            {
                name: 'special_bonus_unique_huskar_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_huskar_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_huskar_2',
                level: 2
            },
            {
                name: 'special_bonus_lifesteal_15',
                level: 2
            },
            {
                name: 'special_bonus_unique_huskar_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_huskar_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_huskar',
                level: 4
            },
            {
                name: 'special_bonus_unique_huskar_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'huskar_bloodbath',
                icon: 'area_of_effect',
                color: 'Red',
                gradient_id: 0,
                title: 'Bloodbath',
                description: 'Life Break also slows enemies in a radius around the target.'
            },
            {
                id: 1,
                name: 'huskar_nothl_transfusion',
                icon: 'healing',
                color: 'Blue',
                gradient_id: 2,
                title: 'Nothl Transfusion',
                description: 'Life Break also heals friendly units in a radius around the target.'
            },
            {
                id: 2,
                name: 'huskar_nothl_conflagration',
                icon: 'damage',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Incendiary',
                description:
                    'Burning Spears also burns enemies for a percentage of their max health. Costs Max Health instead of Current Health. Reduces burn duration.'
            }
        ]
    },
    npc_dota_hero_night_stalker: {
        abilities: [
            'night_stalker_void',
            'night_stalker_crippling_fear',
            'night_stalker_hunter_in_the_night',
            'generic_hidden',
            'generic_hidden',
            'night_stalker_darkness',
            'night_stalker_heart_of_darkness'
        ],
        talents: [
            {
                name: 'special_bonus_unique_night_stalker_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_night_stalker_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_night_stalker_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_night_stalker_hunter_status_resist',
                level: 2
            },
            {
                name: 'special_bonus_unique_night_stalker_crippling_fear_damage',
                level: 3
            },
            {
                name: 'special_bonus_strength_20',
                level: 3
            },
            {
                name: 'special_bonus_unique_night_stalker_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_night_stalker',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'night_stalker_blinding_void',
                icon: 'no_vision',
                color: 'Blue',
                gradient_id: 0,
                title: 'Blinding Void',
                description:
                    'Enemies affected by Void do not share vision with their allies. Affected enemies take damage per second when they are not visible to their allies.'
            },
            {
                id: 1,
                name: 'night_stalker_dayswap',
                icon: 'moon',
                color: 'Gray',
                gradient_id: 0,
                title: 'Night Reign',
                description: 'The game now starts at night instead of day. Night is longer than day.',
                abilities: ['night_stalker_night_reign']
            }
        ]
    },
    npc_dota_hero_broodmother: {
        abilities: [
            'broodmother_insatiable_hunger',
            'broodmother_spin_web',
            'broodmother_incapacitating_bite',
            'broodmother_sticky_snare',
            'broodmother_spiders_milk',
            'broodmother_spawn_spiderlings'
        ],
        talents: [
            {
                name: 'special_bonus_unique_broodmother_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_broodmother_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_broodmother_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_broodmother_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_broodmother_2',
                level: 3
            },
            {
                name: 'special_bonus_attack_speed_35',
                level: 3
            },
            {
                name: 'special_bonus_unique_broodmother_1',
                level: 4
            },
            {
                name: 'special_bonus_unique_broodmother_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'broodmother_necrotic_webs',
                icon: 'debuff',
                color: 'Gray',
                gradient_id: 0,
                title: 'Necrotic Webs',
                description: 'Reduces health regeneration of enemies on webs.'
            },
            {
                id: 1,
                name: 'broodmother_feeding_frenzy',
                icon: 'summons',
                color: 'Red',
                gradient_id: 0,
                title: 'Feeding Frenzy',
                description: 'Insatiable Hunger also applies to nearby Spiderlings.'
            }
        ]
    },
    npc_dota_hero_bounty_hunter: {
        abilities: [
            'bounty_hunter_shuriken_toss',
            'bounty_hunter_jinada',
            'bounty_hunter_wind_walk',
            'bounty_hunter_wind_walk_ally',
            'bounty_hunter_big_game_hunter',
            'bounty_hunter_track'
        ],
        talents: [
            {
                name: 'special_bonus_unique_bounty_hunter_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_bounty_hunter_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_bounty_hunter_9',
                level: 2
            },
            {
                name: 'special_bonus_unique_bounty_hunter_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_bounty_hunter_8',
                level: 3
            },
            {
                name: 'special_bonus_unique_bounty_hunter',
                level: 3
            },
            {
                name: 'special_bonus_unique_bounty_hunter_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_bounty_hunter_jinada_no_cooldown',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'bounty_hunter_shuriken',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 0,
                title: 'Through and Through',
                description: 'Shuriken Toss applies its damage and slow to all enemies it passes through.'
            },
            {
                id: 1,
                name: 'bounty_hunter_mugging',
                icon: 'gold',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Cutpurse',
                description:
                    'Bounty Hunter steals gold when targeting enemy heroes with his abilities or items.',
                abilities: ['bounty_hunter_cutpurse']
            }
        ]
    },
    npc_dota_hero_weaver: {
        abilities: [
            'weaver_the_swarm',
            'weaver_shukuchi',
            'weaver_geminate_attack',
            'generic_hidden',
            'generic_hidden',
            'weaver_time_lapse',
            'weaver_rewoven'
        ],
        talents: [
            {
                name: 'special_bonus_unique_weaver_1',
                level: 1
            },
            {
                name: 'special_bonus_strength_7',
                level: 1
            },
            {
                name: 'special_bonus_mana_break_20',
                level: 2
            },
            {
                name: 'special_bonus_unique_weaver_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_weaver_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_weaver_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_weaver_6',
                level: 4
            },
            {
                name: 'special_bonus_unique_weaver_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'weaver_skitterstep',
                icon: 'speed',
                color: 'Red',
                gradient_id: 0,
                title: 'Skitterstep',
                description: 'Shukuchi movespeed increased and slows enemies when passing through them.'
            },
            {
                id: 1,
                name: 'weaver_hivemind',
                icon: 'xp',
                color: 'Blue',
                gradient_id: 1,
                title: 'Hivemind',
                description: 'Weaver gains experience when The Swarm beetles attack heroes.'
            }
        ]
    },
    npc_dota_hero_jakiro: {
        abilities: [
            'jakiro_dual_breath',
            'jakiro_ice_path',
            'generic_hidden',
            'generic_hidden',
            'jakiro_double_trouble',
            'jakiro_macropyre'
        ],
        talents: [
            {
                name: 'special_bonus_attack_range_150',
                level: 1
            },
            {
                name: 'special_bonus_unique_jakiro_dualbreath_slow',
                level: 1
            },
            {
                name: 'special_bonus_unique_jakiro_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_jakiro_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_jakiro',
                level: 3
            },
            {
                name: 'special_bonus_unique_jakiro_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_jakiro_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_jakiro_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'jakiro_fire',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 0,
                title: 'Liquid Fire',
                description:
                    'Jakiro can imbue his attacks with Attack Speed Slow and Damage over Time in an AoE.',
                abilities: ['jakiro_liquid_fire']
            },
            {
                id: 1,
                name: 'jakiro_ice',
                icon: 'snowflake',
                color: 'Blue',
                gradient_id: 1,
                title: 'Liquid Frost',
                description:
                    'Jakiro can imbue his attacks with Movement Speed Slow and a debuff that amplifies damage from his other spells.',
                abilities: ['jakiro_liquid_ice']
            }
        ]
    },
    npc_dota_hero_batrider: {
        abilities: [
            'batrider_sticky_napalm',
            'batrider_flamebreak',
            'batrider_firefly',
            'batrider_sticky_napalm_application_damage',
            'batrider_smoldering_resin',
            'batrider_flaming_lasso'
        ],
        talents: [
            {
                name: 'special_bonus_unique_batrider_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_batrider_3',
                level: 1
            },
            {
                name: 'special_bonus_movement_speed_20',
                level: 2
            },
            {
                name: 'special_bonus_unique_batrider_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_batrider_smoldering_resin_ticks',
                level: 3
            },
            {
                name: 'special_bonus_unique_batrider_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_batrider_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_batrider_2',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'batrider_buff_on_displacement',
                icon: 'speed',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Stoked',
                description: 'Batrider gains Move Speed and Spell Amplification when displacing enemies.',
                abilities: ['batrider_stoked']
            },
            {
                id: 1,
                name: 'batrider_arsonist',
                icon: 'siege',
                color: 'Red',
                gradient_id: 0,
                title: 'Arsonist',
                description: 'Sticky Napalm deals damage to structures.'
            }
        ]
    },
    npc_dota_hero_chen: {
        abilities: [
            'chen_penitence',
            'chen_holy_persuasion',
            'chen_divine_favor',
            'chen_summon_convert',
            'generic_hidden',
            'chen_hand_of_god'
        ],
        talents: [
            {
                name: 'special_bonus_unique_chen_11',
                level: 1
            },
            {
                name: 'special_bonus_unique_chen_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_chen_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_chen_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_chen_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_chen_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_chen_12',
                level: 4
            },
            {
                name: 'special_bonus_unique_chen_2',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'chen_centaur_convert',
                icon: 'area_of_effect',
                color: 'Blue',
                gradient_id: 3,
                title: 'Centaur Convert',
                description: 'Summon Convert calls forth either a Centaur Courser or Centaur Conqueror.'
            },
            {
                id: 1,
                name: 'chen_wolf_convert',
                icon: 'damage',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Wolf Convert',
                description: 'Summon Convert calls forth either a Giant Wolf or Alpha Wolf.'
            },
            {
                id: 2,
                name: 'chen_hellbear_convert',
                icon: 'slow',
                color: 'Red',
                gradient_id: 0,
                title: 'Hellbear Convert',
                description: 'Summon Convert calls forth either a Hellbear or Hellbear Smasher.'
            },
            {
                id: 3,
                name: 'chen_troll_convert',
                icon: 'summons',
                color: 'Green',
                gradient_id: 0,
                title: 'Troll Convert',
                description: 'Summon Convert calls forth either a Hill Troll or Dark Troll Summoner.'
            },
            {
                id: 4,
                name: 'chen_satyr_convert',
                icon: 'mana',
                color: 'Purple',
                gradient_id: 1,
                title: 'Satyr Convert',
                description: 'Summon Convert calls forth either a Satyr Mindstealer or Satyr Tormenter.'
            }
        ]
    },
    npc_dota_hero_spectre: {
        abilities: [
            'spectre_spectral_dagger',
            'spectre_desolate',
            'spectre_dispersion',
            'spectre_reality',
            'spectre_haunt',
            'spectre_haunt_single',
            'spectre_spectral'
        ],
        talents: [
            {
                name: 'special_bonus_unique_spectre',
                level: 1
            },
            {
                name: 'special_bonus_hp_regen_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_spectre_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_spectre_6',
                level: 2
            },
            {
                name: 'special_bonus_hp_350',
                level: 3
            },
            {
                name: 'special_bonus_unique_spectre_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_spectre_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_spectre_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'spectre_forsaken',
                icon: 'spectre',
                color: 'Gray',
                gradient_id: 0,
                title: 'Forsaken',
                description:
                    'Desolate can deal partial damage to enemies and is applied by Spectral Dagger.'
            },
            {
                id: 1,
                name: 'spectre_twist_the_knife',
                icon: 'nuke',
                color: 'Purple ',
                gradient_id: 2,
                title: 'Twist the Knife',
                description:
                    'Reality also casts Spectral Dagger on the target and has a decreased cooldown.'
            }
        ]
    },
    npc_dota_hero_doom_bringer: {
        abilities: [
            'doom_bringer_devour',
            'doom_bringer_scorched_earth',
            'doom_bringer_infernal_blade',
            'doom_bringer_empty1',
            'doom_bringer_empty2',
            'doom_bringer_doom',
            'doom_bringer_lvl_pain'
        ],
        talents: [
            {
                name: 'special_bonus_unique_doom_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_doom_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_doom_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_doom_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_doom_9',
                level: 3
            },
            {
                name: 'special_bonus_unique_doom_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_doom_10',
                level: 4
            },
            {
                name: 'special_bonus_unique_doom_11',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'doom_bringer_gluttony',
                icon: 'meat',
                color: 'Red',
                gradient_id: 0,
                title: 'Gluttony',
                description:
                    'Devour now has 2 charges and stolen creep abilities are upgraded by one level.'
            },
            {
                id: 1,
                name: 'doom_bringer_boost_selling',
                icon: 'gold',
                color: 'Yellow',
                gradient_id: 0,
                title: "Devil's Bargain",
                description:
                    'Doom can sell items for 90% of their value, but his buyback costs are increased by 20%.',
                abilities: ['doom_bringer_devils_bargain']
            },
            {
                id: 2,
                name: 'doom_bringer_impending_doom',
                icon: 'cooldown',
                color: 'Gray',
                gradient_id: 0,
                title: 'Impending Doom',
                description:
                    "Every 6.66 minutes, Doom's duration is increased by 0.66s. Doom DPS decreased."
            }
        ]
    },
    npc_dota_hero_ancient_apparition: {
        abilities: [
            'ancient_apparition_cold_feet',
            'ancient_apparition_ice_vortex',
            'ancient_apparition_chilling_touch',
            'ancient_apparition_death_rime',
            'generic_hidden',
            'ancient_apparition_ice_blast',
            'ancient_apparition_ice_blast_release'
        ],
        talents: [
            {
                name: 'special_bonus_unique_ancient_apparition_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_ancient_apparition_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_ancient_apparition_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_ancient_apparition_1',
                level: 2
            },
            {
                name: 'special_ bonus_unique_ancient_apparition_ice_vortex_duration',
                level: 3
            },
            {
                name: 'special_bonus_unique_ancient_apparition_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_ancient_apparition_6',
                level: 4
            },
            {
                name: 'special_bonus_unique_ancient_apparition_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'ancient_apparition_bone_chill',
                icon: 'debuff',
                color: 'Gray',
                gradient_id: 3,
                title: 'Bone Chill',
                description: "Ancient Apparition's abilities reduce the enemy's Strength."
            },
            {
                id: 1,
                name: 'ancient_apparition_exposure',
                icon: 'area_of_effect',
                color: 'Blue',
                gradient_id: 0,
                title: 'Exposure',
                description: 'Cold Feet applies in an AoE, depending on the current level of Ice Blast.'
            }
        ]
    },
    npc_dota_hero_ursa: {
        abilities: [
            'ursa_earthshock',
            'ursa_overpower',
            'ursa_fury_swipes',
            'ursa_maul',
            'generic_hidden',
            'ursa_enrage'
        ],
        talents: [
            {
                name: 'special_bonus_unique_ursa_4',
                level: 1
            },
            {
                name: 'special_bonus_mp_regen_175',
                level: 1
            },
            {
                name: 'special_bonus_unique_ursa',
                level: 2
            },
            {
                name: 'special_bonus_unique_ursa_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_ursa_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_ursa_earthshock_furyswipes',
                level: 3
            },
            {
                name: 'special_bonus_unique_ursa_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_ursa_7',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'ursa_grudge_bearer',
                icon: 'damage',
                color: 'Red',
                gradient_id: 0,
                title: 'Grudge Bearer',
                description: 'When damaged during Enrage, Ursa gains bonus attack damage.'
            },
            {
                id: 1,
                name: 'ursa_debuff_reduce',
                icon: 'cooldown',
                color: 'Blue',
                gradient_id: 0,
                title: 'Bear Down',
                description: 'Debuffs inflicted by Ursa last longer.',
                abilities: ['ursa_bear_down']
            }
        ]
    },
    npc_dota_hero_spirit_breaker: {
        abilities: [
            'spirit_breaker_charge_of_darkness',
            'spirit_breaker_bulldoze',
            'spirit_breaker_greater_bash',
            'spirit_breaker_planar_pocket',
            'spirit_breaker_herd_mentality',
            'spirit_breaker_nether_strike'
        ],
        talents: [
            {
                name: 'special_bonus_night_vision_500',
                level: 1
            },
            {
                name: 'special_bonus_armor_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_spirit_breaker_2',
                level: 2
            },
            {
                name: 'special_bonus_attack_damage_45',
                level: 2
            },
            {
                name: 'special_bonus_unique_spirit_breaker_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_spirit_breaker_shield',
                level: 3
            },
            {
                name: 'special_bonus_unique_spirit_breaker_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_spirit_breaker_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'spirit_breaker_bull_rush',
                icon: 'speed',
                color: 'Red',
                gradient_id: 1,
                title: 'Bull Rush',
                description: 'Charge of Darkness bonus movement speed lingers after charge ends.'
            },
            {
                id: 1,
                name: 'spirit_breaker_imbalanced',
                icon: 'movement',
                color: 'Blue',
                gradient_id: 2,
                title: 'Imbalanced',
                description:
                    'Enemy targets hit by Nether Strike will be moved further by allied forced movement effects.'
            }
        ]
    },
    npc_dota_hero_gyrocopter: {
        abilities: [
            'gyrocopter_rocket_barrage',
            'gyrocopter_homing_missile',
            'gyrocopter_flak_cannon',
            'gyrocopter_chop_shop',
            'generic_hidden',
            'gyrocopter_call_down',
            'generic_hidden',
            'generic_hidden'
        ],
        talents: [
            {
                name: 'special_bonus_unique_gyrocopter_homing_missile_damage',
                level: 1
            },
            {
                name: 'special_bonus_hp_175',
                level: 1
            },
            {
                name: 'special_bonus_unique_gyrocopter_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_gyrocopter_flak_cannon_bonus_damage',
                level: 2
            },
            {
                name: 'special_bonus_unique_gyrocopter_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_gyrocopter_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_gyrocopter_1',
                level: 4
            },
            {
                name: 'special_bonus_unique_gyrocopter_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'gyrocopter_secondary_strikes',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 0,
                title: 'Secondary Strikes',
                description: 'Call Down creates delayed secondary explosions around heroes it hits.'
            },
            {
                id: 1,
                name: 'gyrocopter_afterburner',
                icon: 'speed',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Afterburner',
                description:
                    "Every successful hit of a Rocket Barrage rocket on an enemy hero increases Gyrocopter's movement speed."
            }
        ]
    },
    npc_dota_hero_alchemist: {
        abilities: [
            'alchemist_acid_spray',
            'alchemist_unstable_concoction',
            'alchemist_corrosive_weaponry',
            'alchemist_berserk_potion',
            'alchemist_ goblins_greed',
            'alchemist_chemical_rage',
            'alchemist_unstable_conco ction_throw'
        ],
        talents: [
            {
                name: 'special_bonus_unique_alchemist_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_alche mist',
                level: 1
            },
            {
                name: 'special_bonus_unique_alchemist_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_alchemi st_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_alchemist_8',
                level: 3
            },
            {
                name: 'special_bonus_unique_alchemi st_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_alchemist_6',
                level: 4
            },
            {
                name: 'special_bonus_unique_alchemi st_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'alchemist_seed_money',
                icon: 'gold',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Seed Money',
                description: 'Alchemist starts with 250 more gold.'
            },
            {
                id: 1,
                name: 'alchemist_mixologist',
                icon: 'cooldown',
                color: 'Purple',
                gradient_id: 2,
                title: 'Mixologist',
                description: 'Unstable Concoction and Berserk Potion recharge faster when in Chemical Rage.'
            }
        ]
    },
    npc_dota_hero_invoker: {
        abilities: [
            'invoker_quas',
            'invoker_wex',
            'invoker_exort',
            'invoker_empty1',
            'invoker_empty2',
            'invoker_invoke',
            'invoker_cold_snap',
            'invoker_ghost_walk',
            'invoker_tornado',
            'invoker_emp',
            'invoker_alacrity',
            'invoker_chaos_meteor',
            'invoker_sun_strike',
            'invoker_forge_spirit',
            'invoker_ice_wall',
            'invoker_deafening_blast'
        ],
        talents: [
            {
                name: 'invoker_mastermind',
                level: 1
            },
            {
                name: 'special_bonus_unique_invoker_ice_wall_dps',
                level: 1
            },
            {
                name: 'special_bonus_unique_invoker_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_invoker_11',
                level: 2
            },
            {
                name: 'special_bonus_unique_invoker_9',
                level: 3
            },
            {
                name: 'special_bonus_unique_invoker_additional_chaos_meteors',
                level: 3
            },
            {
                name: 'special_bonus_unique_invoker_5',
                level: 4
            },
            {
                name: 'special_bonus_unique_invoker_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_invoker_13',
                level: 5
            }
        ],
        facets: [
            {
                id: 0,
                name: 'invoker_agnostic',
                icon: 'invoker_passive',
                color: 'Purple',
                gradient_id: 0,
                title: 'Agnostic',
                description:
                    "Your orbs passively grant <font color='#7998b5'>Damage Over Time</font>, <font color='#d671a9'>Attack Speed</font> and <font color='#cabe68'>Attack Damage</font> when leveled."
            },
            {
                id: 1,
                name: 'invoker_elitist',
                icon: 'invoker_active',
                color: 'Gray',
                gradient_id: 0,
                title: 'Elitist',
                description:
                    "Your active orbs grant <font color='#7998b5'>Lifesteal</font>, <font color='#d671a9'>Movespeed</font> and <font color='#cabe68'>Spell Amplification</font>."
            }
        ]
    },
    npc_dota_hero_silencer: {
        abilities: [
            'silencer_curse_of_the_silent',
            'silencer_glaives_of_wisdom',
            'silencer_last_word',
            'silencer_brain_drain',
            'generic_hidden',
            'silencer_global_silence'
        ],
        talents: [
            {
                name: 'special_bonus_unique_silencer',
                level: 1
            },
            {
                name: 'special_bonus_attack_speed_20',
                level: 1
            },
            {
                name: 'special_bonus_unique_silencer_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_silencer_arcane_curse_duration',
                level: 2
            },
            {
                name: 'special_bonus_unique_silencer_glaives_bounces',
                level: 3
            },
            {
                name: 'special_bonus_unique_silencer_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_silencer_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_silencer_arcane_curse_charges',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'silencer_irrepressible',
                icon: 'silencer',
                color: 'Purple',
                gradient_id: 1,
                title: 'Irrepressible',
                description: 'Silencer cannot be silenced.',
                abilities: ['silencer_irrepressible']
            },
            {
                id: 1,
                name: 'silencer_reverberating_silence',
                icon: 'debuff',
                color: 'Gray',
                gradient_id: 3,
                title: 'Reverberating Silence',
                description: 'The first time Global Silence ends on a unit it is applied again.'
            }
        ]
    },
    npc_dota_hero_obsidian_destroyer: {
        abilities: [
            'obsidian_destroyer_arcane_orb',
            'obsidian_destroyer_astral_imprisonment',
            'obsidian_destroyer_equilibrium',
            'generic_hidden',
            'obsidian_destroyer_ominous_discernment',
            'obsidian_destroyer_sanity_eclipse'
        ],
        talents: [
            {
                name: 'special_bonus_hp_200',
                level: 1
            },
            {
                name: 'special_bonus_mp_250',
                level: 1
            },
            {
                name: 'special_bonus_unique_outworld_devourer_astral_castrange',
                level: 2
            },
            {
                name: 'special_bonus_unique_outworld_devourer_3',
                level: 2
            },
            {
                name: 'special_bonus_spell_lifesteal_20',
                level: 3
            },
            {
                name: 'special_bonus_unique_outworld_devourer_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_outworld_devourer',
                level: 4
            },
            {
                name: 'special_bonus_unique_outworld_devourer_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'obsidian_destroyer_obsidian_decimator',
                icon: 'mana',
                color: 'Blue',
                gradient_id: 0,
                title: 'Obsidian Decimator',
                description: 'When Essence Flux restores mana, it also temporarily increases maximum mana.'
            },
            {
                id: 1,
                name: 'obsidian_destroyer_overwhelming_devourer',
                icon: 'healing',
                color: 'Blue',
                gradient_id: 2,
                title: 'Overwhelming Devourer',
                description:
                    "Heroes affected by Astral Imprisonment and  Sanity's Eclipse heal Outworld Destroyer every time they cast a spell."
            }
        ]
    },
    npc_dota_hero_lycan: {
        abilities: [
            ' lycan_summon_wolves',
            'lycan_howl',
            'lycan_feral_impulse',
            'lycan_wolf_bite',
            'lycan_apex_predator',
            'lycan_shapeshift'
        ],
        talents: [
            {
                name: 'special_bonus_unique_lycan_howl_armor',
                level: 1
            },
            {
                name: 'special_bonus_unique_lycan_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_lycan_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_lycan_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_lycan_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_lycan_4',
                'leve l': 3
            },
            {
                name: 'special_bonus_unique_lycan_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_lycan_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'lycan_pack_leader',
                icon: 'summons',
                color: 'Gray',
                'gradient _id': 1,
                title: 'Pack Leader',
                description: 'Enemy heroes killed by Lycan or his units extend Shapeshift duration.'
            },
            {
                id: 1,
                name: 'lycan_spirit_wolves',
                icon: 'spirit',
                color: 'Red',
                gradient_id: 0,
                title: 'S pirit Wolves',
                description:
                    "Summon Wolves creates invulnerable non-attacking wolves that buff Lycan's health and attack damage."
            },
            {
                id: 2,
                name: 'lycan_alpha_wolves',
                icon: 'wolf',
                color: 'Green',
                gradient_id: 2,
                title: 'Alpha Wolves',
                'descri ption':
                    'Increases the max level of Summon Wolves while lowering the max level of Howl and Feral Impulse.'
            }
        ]
    },
    npc_dota_hero_brewmaster: {
        abilities: [
            'brewmaster_thunder_clap',
            'brewmaster_cinder_brew',
            'brewmaster_drunken_braw ler',
            'brewmaster_primal_companion',
            'generic_hidden',
            'brewmaster_primal_split',
            'brewmaster_belligerent'
        ],
        talents: [
            {
                'name ': 'special_bonus_unique_brewmaster_2',
                level: 1
            },
            {
                name: 'spe cial_bonus_uniqu e_brewmaster_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_brewmaster_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_brewmaster_8',
                'leve l': 2
            },
            {
                name: 'special_bonus_unique_brewmaster',
                level: 3
            },
            {
                name: 'special_bonus_attack_speed_90',
                level: 3
            },
            {
                name: 'special_bonus_unique_brewmaster_6',
                level: 4
            },
            {
                name: 'special_bonus_unique_brewmaster_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'brewmaster_roll_out_the_barrel',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 1,
                title: 'Roll Out the Barrel',
                description: 'Throw a barrel at enemies, damaging them and applying Cinder Brew.'
            },
            {
                id: 1,
                name: 'brewmaster_drunken_master',
                icon: 'speed',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Drunken Master',
                description:
                    'When brewed up, Brewmaster moves with a varying amount of movement speed, altering between 15% slower and 50% faster for the duration.'
            }
        ]
    },
    npc_dota_hero_shadow_demon: {
        abilities: [
            'shadow_demon_disruption',
            'shadow_demon_disseminate',
            'shadow_demon_shadow_poison',
            'shadow_demon_shadow_poison_rel ease',
            'shadow_demon_demonic_cleanse',
            'shadow_demon_demonic_purge',
            'shadow_demon_menace'
        ],
        talents: [
            {
                name: 'special_bonus_uniq ue_shadow_demon_4',
                level: 1
            },
            {
                name: 'special_bonus_strength_10',
                level: 1
            },
            {
                name: 'specia l_bonus_movement_speed_25',
                level: 2
            },
            {
                name: 'special_bonus_unique_shadow_demon_3',
                level: 2
            },
            {
                name: 'spec ial_bonus_unique_shadow_demon_disseminate_damage',
                level: 3
            },
            {
                name: 'special_bonus_unique_shadow_demon_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_shadow_demon_9',
                level: 4
            },
            {
                name: 'special_bonus_unique_shadow_demon_7',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'shadow_demon_promulgate',
                icon: 'nuke',
                color: 'Gray',
                gradient_id: 0,
                title: 'Promulgate',
                'des cription':
                    "Disseminate instantly removes a percentage of the opponent's health for its duration."
            },
            {
                id: 1,
                'na me': 'shadow_demon_facet_soul_mastery',
                icon: 'illusion',
                color: 'Purple',
                gradient_id: 0,
                title: 'Shadow Servant',
                description: 'Shadow Demon creates illusions of heroes that die near him.',
                'abili ties': ['shadow_demon_shadow_servant']
            }
        ]
    },
    'npc_dota_hero_l one_druid': {
        abilities: [
            'lone_druid_spirit_bear',
            'lone_druid_spirit_link',
            'lone_dru id_savage_roar',
            'generic_hidden',
            ' generic_hidden',
            'lone_druid_true_form',
            'lone_druid_gift_bearer'
        ],
        talents: [
            {
                name: 'special_bonus_hp_200',
                'l evel': 1
            },
            {
                name: 'special_bonus_unique_lone_druid_11',
                level: 1
            },
            {
                name: 'special_bonus_unique_lone_druid_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_lone_druid_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_lone_druid_savage_roar_aoe',
                level: 3
            },
            {
                name: 'special_bonus_unique_lone_druid_entangle_dps',
                level: 3
            },
            {
                name: 'special_bonus_unique_lone_druid_8',
                level: 4
            },
            {
                name: 'special_bonus_unique_ lone_druid_spirit_link_attack_speed',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'lone_druid_bear_with_me',
                icon: 'healing',
                color: 'Green',
                gradient_id: 1,
                title: 'Bear with Me',
                description:
                    "Spirit Link's Shared Armor is increased and  Lone Druid's attacks heal the Spirit Bear."
            },
            {
                id: 1,
                name: 'lone_druid_unbearable',
                icon: 'overshadow',
                'co lor': 'Yellow',
                gradient_id: 1,
                title: 'Unbearable',
                description:
                    'True Form transforms the Spirit Bear instead of  Lone Druid. Increases the distance from Lone Druid at which the Spirit Bear can attack.'
            },
            {
                id: 2,
                name: 'lone_druid_bear_necessities',
                icon: 'item',
                color: 'Gray',
                gradient_id: 1,
                title: 'Bear Necessities',
                description: "Lone Druid's items are more powerful and his inventory is smaller.",
                abilities: ['lone_druid_bear_necessities']
            }
        ]
    },
    npc_dota_hero_chaos_knight: {
        abilities: [
            'chaos_knight_chaos_bolt',
            'chaos_knight_re ality_rift',
            'chaos_knight_chaos_strike',
            'generic_hidden',
            'chaos_knight_reins_of_chaos',
            'chaos_knight _phantasm'
        ],
        talents: [
            {
                name: 'special_bonus_unique_chaos_knight_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_chaos_knight_2',
                level: 1
            },
            {
                name: 'special_bonus_ unique_chaos_knight_8',
                level: 2
            },
            {
                name: 'special_bonus_strength_10',
                level: 2
            },
            {
                name: 'special_bonus_unique_chaos_knight_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_chaos_knight',
                level: 3
            },
            {
                name: 'special_bonus_unique_chaos_knight_5',
                level: 4
            },
            {
                name: 'special_bonus_unique_chaos_knight_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'c haos_knight_strong_illusions',
                icon: 'illusion',
                color: 'Red',
                gradient_id: 1,
                title: 'Phantasmagoria',
                'descrip tion':
                    'All Chaos Knight Illusions are Strong Illusions and take less damage when near him.',
                abilities: ['chaos_knight_pha ntasmagoria']
            },
            {
                id: 1,
                name: 'chaos_knight_irrationality',
                icon: 'rng',
                color: 'Gray',
                gradient_id: 0,
                title: 'Irrationality',
                description:
                    'Reality Rift has equal chances of app lying Break, Disarm, or Silence for 50% of the base debuff duration in addition  to its normal effects.'
            }
        ]
    },
    'npc_dota_hero_meep  o': {
        abilities: [
            'meepo_earthbind',
            'meepo_p oof',
            'meepo_ransack',
            'meepo_petrify',
            'meepo_megameepo',
            'meepo_divided_we_stand',
            'meepo_megameepo_fling',
            'meepo_sticky_fingers'
        ],
        talents: [
            {
                name: 'special_bonus_strength_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_meepo_2',
                level: 1
            },
            {
                name: 'special_bonus_evasion_15',
                level: 2
            },
            {
                name: 'special_bonus_unique_meepo_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_meepo_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_meepo_6',
                level: 3
            },
            {
                name: 'specia l_bonus_hp_350',
                level: 4
            },
            {
                name: 'special_bonus_unique_meepo_poof_cast_point',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'meepo_more_meepo',
                icon: 'summons',
                color: 'Blue',
                gradient_id: 2,
                title: 'More Meepo',
                'descript ion': 'Obtain extra Meepos sooner and get 1 extra Meepo.'
            },
            {
                id: 1,
                name: 'meepo_pack_rat',
                icon: 'item',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Pack Rat',
                description: 'All Meepos can use the item in the neutral item slot. ',
                abilities: ['meepo_pack_rat']
            }
        ]
    },
    npc_dota_hero_treant: {
        abilities: [
            'treant_natures_grasp',
            'treant_leech_seed',
            'treant_living_armor',
            'treant_eyes_in_the_forest',
            'treant_natures_guise',
            'treant_over growth',
            'treant_innate_attack_damage'
        ],
        talents: [
            {
                name: 'special_bonus_unique_treant_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_treant_12',
                level: 1
            },
            {
                name: 'special _bonus_unique_treant_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_treant_9',
                level: 2
            },
            {
                name: 'special_bonus_unique_treant_13',
                level: 3
            },
            {
                name: 'special_bonus_unique_treant_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_treant_14',
                level: 4
            },
            {
                name: 'special_bonus_unique_treant_7',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'treant_primeval_power',
                icon: 'damage',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Primeva l Power',
                description: 'Treant gains +5 base attack damage per hero level.'
            },
            {
                id: 1,
                name: 'treant_sapling',
                icon: 'tree',
                color: 'Green',
                gradient_id: 2,
                title: 'Sapling',
                description: 'Leech Seed can be ground targeted to plant a tree.'
            }
        ]
    },
    npc_dota_hero_ogre_magi: {
        abilities: [
            'ogre_magi_fireblast',
            'ogre_magi_ignite',
            'ogre_magi_blood lust',
            'ogre_magi_unrefined_fireblast',
            'ogre_magi_smash',
            'ogre_magi_dumb_luck',
            'ogre_magi_multicast'
        ],
        talents: [
            {
                name: 'special_bonus_unique_ogre_magi_4',
                level: 1
            },
            {
                name: 'special _bonus_unique_ogre_magi_5',
                level: 1
            },
            {
                name: 'special_bonus_a ttack_damage_80',
                level: 2
            },
            {
                name: 'special_bonus_unique_ogre _magi_dumb_luck_mana',
                level: 2
            },
            {
                name: 'special_bonus_streng th_30',
                level: 3
            },
            {
                name: 'spe cial_bonus_unique_ogre_magi',
                level: 3
            },
            {
                name: 'special_bonus_unique_ogre_magi_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_ogre_magi_2',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'ogre_magi_fat_chance',
                icon: 'rng',
                color: 'Red',
                gradient_id: 0,
                title: 'Fat Chance',
                description: "Multicast chance is increased b y  0.06% of Ogre Magi's Strength."
            },
            {
                id: 1,
                name: 'ogre_magi_learning_curve',
                icon: 'ogre',
                color: 'Blue',
                gradient_id: 1,
                title: 'Learning Curve',
                description:
                    'Level requirement of all spells and talents reduced by 1. You get 0 Ability Points at level one and 3 Ability Points at level two.'
            }
        ]
    },
    npc_dota_hero_undying: {
        abilities: [
            'undying_decay',
            'undying_soul_rip',
            'undying_tombstone',
            'undying_ceaseless_dirge',
            'generic_hidden',
            'undying_flesh_golem'
        ],
        talents: [
            {
                name: 'special_bonus_unique_undying_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_undying_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_undying',
                level: 2
            },
            {
                name: 'special_bonus_unique_undying_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_undying_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_undying_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_undying_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_undying_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'undying_rotting_mitts',
                icon: 'summons',
                color: 'Green',
                gradient_id: 4,
                title: 'Rotting Mitts',
                description: 'While transformed into a Flesh Golem, attacks spawn a zombie.'
            },
            {
                id: 1,
                name: 'undying_ripped',
                icon: 'strength',
                color: 'Red',
                gradient_id: 1,
                title: 'Ripped',
                description:
                    "Casting Soul Rip on allies increases their Strength by a percentage of Undying's Strength."
            }
        ]
    },
    npc_dota_hero_rubick: {
        abilities: [
            'rubick_telekinesis',
            'rubick_fade_bolt',
            'rubick_arcane_supremacy',
            'rubick_empty1',
            'rubick_empty2',
            'rubick_spell_steal',
            'rubick_telekinesis_land',
            'rubick_hidden1',
            'rubick_hidden2',
            'rubick_might_and_magus',
            'rubick_telekinesis_land_self'
        ],
        talents: [
            {
                name: 'special_bonus_unique_rubick_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_rubick_2',
                level: 1
            },
            {
                name: 'special_bonus_unique_rubick_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_rubick_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_rubick_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_rubick_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_rubick',
                level: 4
            },
            {
                name: 'special_bonus_unique_rubick_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'rubick_frugal_filch',
                icon: 'mana',
                color: 'Purple',
                gradient_id: 2,
                title: 'Frugal Filch',
                description: 'Stolen spells also have lower mana cost.'
            },
            {
                id: 1,
                name: 'rubick_arcane_accumulation',
                icon: 'area_of_effect',
                color: 'Green',
                gradient_id: 0,
                title: 'Arcane Accumulation',
                description:
                    'Casting a spell temporarily increases the area of effect for all subsequent spells.'
            }
        ]
    },
    npc_dota_hero_disruptor: {
        abilities: [
            'disruptor_thunder_strike',
            'disruptor_glimpse',
            'disruptor_kinetic_field',
            'disruptor_electromagnetic_repulsion',
            'generic_hidden',
            'disruptor_static_storm'
        ],
        talents: [
            {
                name: 'special_bonus_unique_disruptor_2',
                level: 1
            },
            {
                name: 'special_bonus_unique_disruptor_consecutive_strike_damage',
                level: 1
            },
            {
                name: 'special_bonus_unique_disruptor_9',
                level: 2
            },
            {
                name: 'special_bonus_unique_disruptor_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_disruptor_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_disruptor',
                level: 3
            },
            {
                name: 'special_bonus_unique_disruptor_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_disruptor_8',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'disruptor_thunderstorm',
                icon: 'area_of_effect',
                color: 'Red',
                gradient_id: 1,
                title: 'Thunderstorm',
                description: 'Thunder Strike additionally hits all enemies within Kinetic Field.'
            },
            {
                id: 1,
                name: 'disruptor_line_walls',
                icon: 'fence',
                color: 'Blue',
                gradient_id: 1,
                title: 'Kinetic Fence',
                description: 'Replaces Kinetic Field with the ability to create impassable walls.',
                abilities: ['disruptor_kinetic_fence']
            }
        ]
    },
    npc_dota_hero_nyx_assassin: {
        abilities: [
            'nyx_assassin_impale',
            'nyx_assassin_jolt',
            'nyx_assassin_spiked_carapace',
            'nyx_assassin_burrow',
            'nyx_assassin_nyxth_sense',
            'nyx_assassin_vendetta',
            'nyx_assassin_unburrow'
        ],
        talents: [
            {
                name: 'special_bonus_unique_nyx_vendetta_damage',
                level: 1
            },
            {
                name: 'special_bonus_unique_nyx_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_nyx_carapace_reflect_duration',
                level: 2
            },
            {
                name: 'special_bonus_unique_nyx_jolt_cooldown',
                level: 2
            },
            {
                name: 'special_bonus_unique_nyx_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_nyx_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_nyx',
                level: 4
            },
            {
                name: 'special_bonus_agility_80',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'nyx_assassin_burn_mana',
                icon: 'nuke',
                color: 'Blue',
                gradient_id: 3,
                title: 'Mana Burn',
                description: "Nyx Assassin's ability damage burns enemies' mana.",
                abilities: ['nyx_assassin_innate_mana_burn']
            },
            {
                id: 1,
                name: 'nyx_assassin_scuttle',
                icon: 'speed',
                color: 'Red',
                gradient_id: 2,
                title: 'Scuttle',
                description: 'For the first 15s of Vendetta, Nyx is hasted and has unobstructed pathing.'
            }
        ]
    },
    npc_dota_hero_naga_siren: {
        abilities: [
            'naga_siren_mirror_image',
            'naga_siren_ensnare',
            'generic_hidden',
            'naga_siren_reel_in',
            'naga_siren_eelskin',
            'naga_siren_song_of_the_siren',
            'naga_siren_song_of_the_siren_cancel'
        ],
        talents: [
            {
                name: 'special_bonus_unique_naga_siren_net_cooldown',
                level: 1
            },
            {
                name: 'special_bonus_unique_naga_siren_2',
                level: 1
            },
            {
                name: 'special_bonus_unique_naga_siren_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_naga_siren_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_naga_siren_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_naga_siren',
                level: 3
            },
            {
                name: 'special_bonus_unique_naga_siren_6',
                level: 4
            },
            {
                name: 'special_bonus_unique_naga_siren_net_breaks',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'naga_siren_passive_riptide',
                icon: 'armor_broken',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Rip Tide',
                description:
                    'Every 6 attacks from Naga and her illusions, enemies around them are damaged and their Armor is reduced.',
                abilities: ['naga_siren_rip_tide']
            },
            {
                id: 1,
                name: 'naga_siren_active_riptide',
                icon: 'nuke',
                color: 'Green',
                gradient_id: 2,
                title: 'Deluge',
                description:
                    'Naga Siren can create a splash around herself and her illusions, damaging enemies and reducing their Status Resistance.',
                abilities: ['naga_siren_deluge']
            }
        ]
    },
    npc_dota_hero_keeper_of_the_light: {
        abilities: [
            'keeper_of_the_light_illuminate',
            'keeper_of_the_light_blinding_light',
            'keeper_of_the_light_chakra_magic',
            'generic_hidden',
            'keeper_of_the_light_will_o_wisp',
            'keeper_of_the_light_spirit_form',
            'keeper_of_the_light_illuminate_end',
            'keeper_of_the_light_mana_magnifier',
            'generic_hidden',
            'generic_hidden'
        ],
        talents: [
            {
                name: 'special_bonus_unique_keeper_of_the_light_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_keeper_of_the_light_illuminate_cooldown',
                level: 1
            },
            {
                name: 'special_bonus_unique_keeper_of_the_light_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_keeper_of_the_light_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_keeper_of_the_light_11',
                level: 3
            },
            {
                name: 'special_bonus_unique_keeper_of_the_light_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_keeper_of_the_light_14',
                level: 4
            },
            {
                name: 'special_bonus_unique_keeper_of_the_light',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'keeper_of_the_light_facet_solar_bind',
                icon: 'slow',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Solar Bind',
                description: 'Grants the Solar Bind ability while active.',
                abilities: ['keeper_of_the_light_radiant_bind']
            },
            {
                id: 1,
                name: 'keeper_of_the_light_facet_recall',
                icon: 'teleport',
                color: 'Gray',
                gradient_id: 3,
                title: 'Recall',
                description:
                    "After a short delay, teleports the targeted friendly hero to your location. If the targeted friendly hero takes player based damage during this time, the ability is interrupted. When cast, the teleport target's movement speed is increased. Upon teleporting, Chakra Magic and the increased movement speed buff are applied to both Keeper of the Light and the teleport target.\n\n If alt-cast, teleports Keeper of the Light to the target Ally instead. \n\n Ability Level increases with levels of Spirit Form.",
                abilities: ['keeper_of_the_light_recall']
            }
        ]
    },
    npc_dota_hero_wisp: {
        abilities: [
            'wisp_tether',
            'wisp_spirits',
            'wisp_overcharge',
            'wisp_spirits_in',
            'wisp_spirits_out',
            'wisp_relocate',
            'wisp_tether_break',
            'wisp_sight_seer'
        ],
        talents: [
            {
                name: 'special_bonus_unique_wisp_11',
                level: 1
            },
            {
                name: 'special_bonus_unique_wisp_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_wisp_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_wisp',
                level: 2
            },
            {
                name: 'special_bonus_unique_wisp_10',
                level: 3
            },
            {
                name: 'special_bonus_unique_wisp_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_wisp_9',
                level: 4
            },
            {
                name: 'special_bonus_unique_wisp_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'wisp_kritzkrieg',
                icon: 'damage',
                color: 'Blue',
                gradient_id: 3,
                title: 'Kritzkrieg',
                description:
                    'Overcharge grants attack speed and spell amplification to Io and any Tethered allies.'
            },
            {
                id: 1,
                name: 'wisp_medigun',
                icon: 'armor',
                color: 'Gray',
                gradient_id: 3,
                title: 'Medigun',
                description: 'Overcharge grants armor and magic resistance to Io and any Tethered allies.'
            }
        ]
    },
    npc_dota_hero_visage: {
        abilities: [
            'visage_grave_chill',
            'visage_soul_assumption',
            'visage_gravekeepers_cloak',
            'visage_stone_form_self_cast',
            'visage_silent_as_the_grave',
            'visage_summon_familiars',
            'visage_summon_familiars_stone_form',
            'visage_lurker'
        ],
        talents: [
            {
                name: 'special_bonus_unique_visage_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_visage_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_visage_grave_chill_duration',
                level: 2
            },
            {
                name: 'special_bonus_unique_visage_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_visage_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_visage_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_visage_5',
                level: 4
            },
            {
                name: 'special_bonus_unique_visage_6',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'visage_sepulchre',
                icon: 'area_of_effect',
                color: 'Gray',
                gradient_id: 0,
                title: 'Sepulchre',
                description:
                    'Grave Chill also affects units around the target. Visage can also recall his familiars.'
            },
            {
                id: 1,
                name: 'visage_faithful_followers',
                icon: 'summons',
                color: 'Blue',
                gradient_id: 2,
                title: 'Faithful Followers',
                description: 'Familiars automatically move with Visage and attack his targets.'
            },
            {
                id: 2,
                name: 'visage_gold_assumption',
                icon: 'gold',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Death Toll',
                description: 'Soul Assumption kills give bonus gold. Visage can also recall his familiars.'
            }
        ]
    },
    npc_dota_hero_slark: {
        abilities: [
            'slark_dark_pact',
            'slark_pounce',
            'slark_essence_shift',
            'slark_depth_shroud',
            'slark_barracuda',
            'slark_shadow_dance'
        ],
        talents: [
            {
                name: 'special_bonus_unique_slark_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_slark',
                level: 1
            },
            {
                name: 'special_bonus_unique_slark_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_slark_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_slark_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_slark_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_slark_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_slark_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'slark_leeching_leash',
                icon: 'agility',
                color: 'Green',
                gradient_id: 2,
                title: 'Leeching Leash',
                description: 'Pounce applies stacks of Essence Shift when striking enemy heroes.'
            },
            {
                id: 1,
                name: 'slark_dark_reef_renegade',
                icon: 'cooldown',
                color: 'Blue',
                gradient_id: 2,
                title: 'Dark Reef Renegade',
                description:
                    'Barracuda lingers after being revealed to the enemy if Slark is not nearby allied heroes.'
            }
        ]
    },
    npc_dota_hero_medusa: {
        abilities: [
            'medusa_split_shot',
            'medusa_mystic_snake',
            'medusa_gorgon_grasp',
            'medusa_cold_blooded',
            'medusa_mana_shield',
            'medusa_stone_gaze'
        ],
        talents: [
            {
                name: 'special_bonus_unique_medusa_snake_damage',
                level: 1
            },
            {
                name: 'special_bonus_unique_medusa_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_medusa_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_medusa_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_medusa_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_medusa',
                level: 3
            },
            {
                name: 'special_bonus_special_bonus_unique_medusa_gorgons_grasp_volleys',
                level: 4
            },
            {
                name: 'special_bonus_unique_medusa_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'medusa_engorged',
                icon: 'snake',
                color: 'Green',
                gradient_id: 1,
                title: 'Engorged',
                description: 'Mystic Snake grants Medusa attack damage.'
            },
            {
                id: 1,
                name: 'medusa_mana_pact',
                deprecated: 'true',
                icon: 'mana',
                color: 'Blue',
                gradient_id: 1,
                title: 'Mana Pact',
                description: 'Medusa can gain attack speed at the cost of mana over time.'
            },
            {
                id: 2,
                name: 'medusa_slow_attacks',
                icon: 'slow',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Venomous Volley',
                description:
                    'Every 5 attacks, Medusa applies poison to her arrow that briefly reduces movement speed, attack speed, and cast speed.',
                abilities: ['medusa_venomed_volley']
            }
        ]
    },
    npc_dota_hero_troll_warlord: {
        abilities: [
            'troll_warlord_switch_stance',
            'troll_warlord_whirling_axes_ranged',
            'troll_warlord_whirling_axes_melee',
            'troll_warlord_fervor',
            'troll_warlord_berserkers_rage',
            'troll_warlord_battle_trance'
        ],
        talents: [
            {
                name: 'special_bonus_unique_troll_warlord_whirling_axes_debuff_duration',
                level: 1
            },
            {
                name: 'special_bonus_unique_troll_warlord_2',
                level: 1
            },
            {
                name: 'special_bonus_unique_troll_warlord_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_troll_warlord_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_troll_warlord_battle_trance_movespeed',
                level: 3
            },
            {
                name: 'special_bonus_unique_troll_warlord',
                level: 3
            },
            {
                name: 'special_bonus_unique_troll_warlord_6',
                level: 4
            },
            {
                name: 'special_bonus_unique_troll_warlord_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'troll_warlord_insensitive',
                icon: 'armor',
                color: 'Blue',
                gradient_id: 2,
                title: 'Insensitive',
                description: 'Fervor grants armor per stack while in melee form.'
            },
            {
                id: 1,
                name: 'troll_warlord_bad_influence',
                icon: 'damage',
                color: 'Red',
                gradient_id: 1,
                title: 'Bad Influence',
                description: 'Battle Trance grants allied heroes 40% of the attack speed bonus.'
            }
        ]
    },
    npc_dota_hero_centaur: {
        abilities: [
            'centaur_hoof_stomp',
            'centaur_double_edge',
            'centaur_return',
            'centaur_mount',
            'centaur_work_horse',
            'centaur_stampede',
            'centaur_rawhide'
        ],
        talents: [
            {
                name: 'special_bonus_hp_regen_4',
                level: 1
            },
            {
                name: 'special_bonus_movement_speed_20',
                level: 1
            },
            {
                name: 'special_bonus_strength_12',
                level: 2
            },
            {
                name: 'special_bonus_unique_centaur_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_centaur_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_centaur_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_centaur_1',
                level: 4
            },
            {
                name: 'special_bonus_unique_centaur_2',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'centaur_counter_strike',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 1,
                title: 'Counter-Strike',
                description: 'Double Edge damage is increased when Centaur is attacked.'
            },
            {
                id: 1,
                name: 'centaur_horsepower',
                icon: 'speed',
                color: 'Gray',
                gradient_id: 3,
                title: 'Horsepower',
                description: 'Centaur Warrunner gains Movement Speed based on his Strength.',
                abilities: ['centaur_horsepower']
            }
        ]
    },
    npc_dota_hero_magnataur: {
        abilities: [
            'magnataur_shockwave',
            'magnataur_empower',
            'magnataur_skewer',
            'magnataur_horn_toss',
            'magnataur_solid_core',
            'magnataur_reverse_polarity'
        ],
        talents: [
            {
                name: 'special_bonus_unique_magnus_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_magnus_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_magnus_reverse_polarity_stats',
                level: 2
            },
            {
                name: 'special_bonus_unique_magnus_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_magnus',
                level: 3
            },
            {
                name: 'special_bonus_unique_magnus_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_magnus_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_magnus_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'magnataur_run_through',
                deprecated: 'true',
                icon: 'movement',
                color: 'Gray',
                gradient_id: 3,
                title: 'Run Through',
                description: 'Skewer deals bonus damage when pushing enemies through trees and cliffs.'
            },
            {
                id: 1,
                name: 'magnataur_reverse_polarity',
                icon: 'vortex_in',
                color: 'Gray',
                gradient_id: 3,
                title: 'Reverse Polarity',
                description: 'Reverse Polarity pulls all nearby enemies in.'
            },
            {
                id: 2,
                name: 'magnataur_reverse_reverse_polarity',
                icon: 'vortex_out',
                color: 'Gray',
                gradient_id: 0,
                title: 'Reverse Reverse Polarity',
                description: 'Reverse Polarity pushes enemies away all around Magnus.'
            }
        ]
    },
    npc_dota_hero_shredder: {
        abilities: [
            'shredder_whirling_death',
            'shredder_timber_chain',
            'shredder_reactive_armor',
            'generic_hidden',
            'shredder_flamethrower',
            'shredder_chakram',
            'shredder_return_chakram',
            'shredder_return_chakram_2',
            'shredder_exposure_therapy'
        ],
        talents: [
            {
                name: 'special_bonus_unique_timbersaw_reactive_armor_regen_per_stack',
                level: 1
            },
            {
                name: 'special_bonus_mp_regen_150',
                level: 1
            },
            {
                name: 'special_bonus_unique_timbersaw_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_timbersaw_2',
                level: 2
            },
            {
                name: 'special_bonus_magic_resistance_20',
                level: 3
            },
            {
                name: 'special_bonus_unique_timbersaw_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_timbersaw',
                level: 4
            },
            {
                name: 'special_bonus_unique_timbersaw_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'shredder_shredder',
                icon: 'tree',
                color: 'Green',
                gradient_id: 0,
                title: 'Shredder',
                description: 'Timber Chain splinters the tree into all directions around Timbersaw.'
            },
            {
                id: 1,
                name: 'shredder_second_chakram',
                icon: 'spinning',
                color: 'Red',
                gradient_id: 1,
                title: 'Twisted Chakram',
                description:
                    'Launches a second independent Chakram that follows a curved path and returns to Timbersaw, damaging and slowing enemies it passes through. Enemies caught in the saw blade will move more slowly for every 5% of health missing.',
                abilities: ['shredder_twisted_chakram']
            }
        ]
    },
    npc_dota_hero_bristleback: {
        abilities: [
            'bristleback_viscous_nasal_goo',
            'bristleback_quill_spray',
            'bristleback_bristleback',
            'bristleback_hairball',
            'generic_hidden',
            'bristleback_warpath',
            'bristleback_prickly'
        ],
        talents: [
            {
                name: 'special_bonus_attack_speed_25',
                level: 1
            },
            {
                name: 'special_bonus_mp_regen_150',
                level: 1
            },
            {
                name: 'special_bonus_unique_bristleback_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_bristleback_6',
                level: 2
            },
            {
                name: 'special_bonus_hp_regen_25',
                level: 3
            },
            {
                name: 'special_bonus_unique_bristleback_2',
                level: 3
            },
            {
                name: 'special_bonus_spell_lifesteal_12',
                level: 4
            },
            {
                name: 'special_bonus_unique_bristleback_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'bristleback_berserk',
                icon: 'damage',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Berserk',
                description: 'Warpath grants scaling Attack Speed instead of Damage.'
            },
            {
                id: 1,
                name: 'bristleback_snot_rocket',
                icon: 'snot',
                color: 'Green',
                gradient_id: 0,
                title: 'Snot Rocket',
                description:
                    'Bristleback now fires Viscous Nasal Goo instead of Quills when damaged. Viscous Nasal Goo effects are stronger.'
            },
            {
                id: 2,
                name: 'bristleback_seeing_red',
                icon: 'no_vision',
                color: 'Red',
                gradient_id: 0,
                title: 'Seeing Red',
                description:
                    "Warpath can be activated to gain extra bonuses. While Seeing Red, Bristleback's vision is limited and he does not share vision with his allies."
            }
        ]
    },
    npc_dota_hero_tusk: {
        abilities: [
            'tusk_ice_shards',
            'tusk_snowball',
            'generic_hidden',
            'tusk_walrus_kick',
            'tusk_bitter_chill',
            'tusk_walrus_punch',
            'tusk_launch_snowball'
        ],
        talents: [
            {
                name: 'special_bonus_unique_tusk_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_tusk_7',
                level: 1
            },
            {
                name: 'special_bonus_hp_325',
                level: 2
            },
            {
                name: 'special_bonus_unique_tusk_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_tusk_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_tusk',
                level: 3
            },
            {
                name: 'special_bonus_unique_tusk_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_tusk_6',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'tusk_facet_tag_team',
                icon: 'damage',
                color: 'Blue',
                gradient_id: 3,
                title: 'Tag Team',
                description:
                    'Tusk can cast Tag Team causing nearby enemies to receive bonus damage from attacks.',
                abilities: ['tusk_tag_team']
            },
            {
                id: 1,
                name: 'tusk_facet_fist_bump',
                icon: 'movement',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Drinking Buddies',
                description:
                    'Tusk can cast Drinking Buddies , pulling him and a teammate closer and granting both bonus Movement Speed and Attack Damage.',
                abilities: ['tusk_drinking_buddies']
            }
        ]
    },
    npc_dota_hero_skywrath_mage: {
        abilities: [
            'skywrath_mage_arcane_bolt',
            'skywrath_mage_concussive_shot',
            'skywrath_mage_ancient_seal',
            'generic_hidden',
            'skywrath_mage_ruin_and_restoration',
            'skywrath_mage_mystic_flare'
        ],
        talents: [
            {
                name: 'special_bonus_mp_regen_150',
                level: 1
            },
            {
                name: 'special_bonus_unique_skywrath_2',
                level: 1
            },
            {
                name: 'special_bonus_unique_skywrath',
                level: 2
            },
            {
                name: 'special_bonus_unique_skywrath_concussive_shot_slow',
                level: 2
            },
            {
                name: 'special_bonus_unique_skywrath_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_skywrath_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_skywrath_6',
                level: 4
            },
            {
                name: 'special_bonus_unique_skywrath_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'skywrath_mage_shield',
                icon: 'armor',
                color: 'Blue',
                gradient_id: 0,
                title: 'Shield of the Scion',
                description: 'Skywrath Mage gains a magic damage barrier when dealing damage to heroes.',
                abilities: ['skywrath_mage_shield_of_the_scion']
            },
            {
                id: 1,
                name: 'skywrath_mage_staff',
                icon: 'cooldown',
                color: 'Yellow',
                gradient_id: 2,
                title: 'Staff of the Scion',
                description:
                    "Skywrath Mage's Cooldowns are reduced when he deals spell damage to enemy heroes.",
                abilities: ['skywrath_mage_staff_of_the_scion']
            }
        ]
    },
    npc_dota_hero_abaddon: {
        abilities: [
            'abaddon_death_coil',
            'abaddon_aphotic_shield',
            'abaddon_frostmourne',
            'abaddon_withering_mist',
            'generic_hidden',
            'abaddon_borrowed_time'
        ],
        talents: [
            {
                name: 'special_bonus_unique_abaddon_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_abaddon_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_abaddon_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_abaddon_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_abaddon',
                level: 3
            },
            {
                name: 'special_bonus_unique_abaddon_immolation',
                level: 3
            },
            {
                name: 'special_bonus_unique_abaddon_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_abaddon_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'abaddon_death_dude',
                icon: 'cooldown',
                color: 'Gray',
                gradient_id: 0,
                title: 'The Quickening',
                description: 'Units dying nearby Abaddon lower his cooldowns.',
                abilities: ['abaddon_the_quickening']
            },
            {
                id: 1,
                name: 'abaddon_mephitic_shroud',
                icon: 'barrier',
                color: 'Blue',
                gradient_id: 1,
                title: 'Mephitic Shroud',
                description:
                    'Aphotic Shield absorbs more damage and reflects damage when received instead of exploding at the end.'
            }
        ]
    },
    npc_dota_hero_elder_titan: {
        abilities: [
            'elder_titan_echo_stomp',
            'elder_titan_ancestral_spirit',
            'elder_titan_natural_order',
            'elder_titan_move_spirit',
            'generic_hidden',
            'elder_titan_earth_splitter',
            'elder_titan_return_spirit',
            'elder_titan_tip_the_scales'
        ],
        talents: [
            {
                name: 'special_bonus_unique_elder_titan_bonus_spirit_speed',
                level: 1
            },
            {
                name: 'special_bonus_attack_speed_25',
                level: 1
            },
            {
                name: 'special_bonus_unique_elder_titan_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_elder_titan',
                level: 2
            },
            {
                name: 'special_bonus_cleave_100',
                level: 3
            },
            {
                name: 'special_bonus_unique_elder_titan_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_elder_titan_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_elder_titan_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'elder_titan_deconstruction',
                icon: 'armor_broken',
                color: 'Blue',
                gradient_id: 2,
                title: 'Deconstruction',
                description: 'Natural Order drains Magic Resistance and Armor over time.'
            },
            {
                id: 1,
                name: 'elder_titan_boost_atkspd',
                icon: 'damage',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Momentum',
                description:
                    "Elder Titan's Base Attack Speed is reduced but his Movement Speed also grants Attack Speed.",
                abilities: ['elder_titan_momentum']
            }
        ]
    },
    npc_dota_hero_legion_commander: {
        abilities: [
            'legion_commander_overwhelming_odds',
            'legion_commander_press_the_attack',
            'legion_commander_moment_of_courage',
            'legion_commander_outfight_them',
            'generic_hidden',
            'legion_commander_duel'
        ],
        talents: [
            {
                name: 'special_bonus_unique_legion_commander_9',
                level: 1
            },
            {
                name: 'special_bonus_unique_legion_commander_pta_movespeed',
                level: 1
            },
            {
                name: 'special_bonus_unique_legion_commander_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_legion_commander_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_legion_commander_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_legion_commander_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_legion_commander_7',
                level: 4
            },
            {
                name: 'special_bonus_unique_legion_commander_8',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'legion_commander_stonehall_plate',
                icon: 'armor',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Stonehall Plate',
                description:
                    'Overwhelming Odds grants an all damage barrier based on the damage it deals to enemy heroes.'
            },
            {
                id: 1,
                name: 'legion_commander_spoils_of_war',
                icon: 'damage',
                color: 'Red',
                gradient_id: 0,
                title: 'Spoils of War',
                description:
                    'When a Duel is won, units that damaged the loser during the Duel will receive a small amount of permanent damage.'
            }
        ]
    },
    npc_dota_hero_ember_spirit: {
        abilities: [
            'ember_spirit_searing_chains',
            'ember_spirit_sleight_of_fist',
            'ember_spirit_flame_guard',
            'ember_spirit_activate_fire_remnant',
            'ember_spirit_immolation',
            'ember_spirit_fire_remnant'
        ],
        talents: [
            {
                name: 'special_bonus_attack_damage_12',
                level: 1
            },
            {
                name: 'special_bonus_unique_ember_spirit_1',
                level: 1
            },
            {
                name: 'special_bonus_unique_ember_spirit_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_ember_spirit_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_ember_spirit_chains_dps',
                level: 3
            },
            {
                name: 'special_bonus_unique_ember_spirit_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_ember_spirit_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_ember_spirit_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'ember_spirit_double_impact',
                icon: 'fist',
                color: 'Red',
                gradient_id: 0,
                title: 'Double Impact',
                description: 'Sleight of Fist hits one of its targets an extra time.'
            },
            {
                id: 1,
                name: 'ember_spirit_chain_gang',
                icon: 'debuff',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Chain Gang',
                description: 'Searing Chains affect 1 more enemy and also spawn from Fire Remnants.'
            }
        ]
    },
    npc_dota_hero_earth_spirit: {
        abilities: [
            'earth_spirit_boulder_smash',
            'earth_spirit_rolling_boulder',
            'earth_spirit_geomagnetic_grip',
            'earth_spirit_stone_caller',
            'earth_spirit_petrify',
            'earth_spirit_magnetize'
        ],
        talents: [
            {
                name: 'special_bonus_unique_earth_spirit_4',
                level: 1
            },
            {
                name: 'special_bonus_spell_amplify_10',
                level: 1
            },
            {
                name: 'special_bonus_unique_earth_spirit_8',
                level: 2
            },
            {
                name: 'special_bonus_unique_earth_spirit',
                level: 2
            },
            {
                name: 'special_bonus_unique_earth_spirit_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_earth_spirit_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_earth_spirit_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_earth_spirit_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'earth_spirit_resonance',
                icon: 'damage',
                color: 'Green',
                gradient_id: 0,
                title: 'Resonance',
                description: 'Gain bonus Attack Damage when Magnetizing Stone Remnants.'
            },
            {
                id: 1,
                name: 'earth_spirit_stepping_stone',
                icon: 'cooldown',
                color: 'Gray',
                gradient_id: 2,
                title: 'Stepping Stone',
                description:
                    "Stone Remnant has a {s:bonus_AbilityCooldown}s cooldown instead of Charges and Remnants don't get destroyed by Rolling Boulder."
            },
            {
                id: 2,
                name: 'earth_spirit_ready_to_roll',
                icon: 'spinning',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Ready to Roll',
                description: 'Rolling Boulder can roll over allied heroes for additional bonuses.'
            }
        ]
    },
    npc_dota_hero_terrorblade: {
        abilities: [
            'terrorblade_reflection',
            'terrorblade_conjure_image',
            'terrorblade_metamorphosis',
            'terrorblade_demon_zeal',
            'terrorblade_terror_wave',
            'terrorblade_sunder',
            'terrorblade_dark_unity'
        ],
        talents: [
            {
                name: 'special_bonus_unique_terrorblade_2',
                level: 1
            },
            {
                name: 'special_bonus_unique_terrorblade_4',
                level: 1
            },
            {
                name: 'special_bonus_unique_terrorblade_metamorphosis_cooldown',
                level: 2
            },
            {
                name: 'special_bonus_unique_terrorblade_6',
                level: 2
            },
            {
                name: 'special_bonus_all_stats_10',
                level: 3
            },
            {
                name: 'special_bonus_unique_terrorblade_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_terrorblade',
                level: 4
            },
            {
                name: 'special_bonus_unique_terrorblade_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'terrorblade_condemned',
                icon: 'twin_hearts',
                color: 'Gray',
                gradient_id: 0,
                title: 'Condemned',
                description: 'There is no minimum health threshold for Sundered enemies.'
            },
            {
                id: 1,
                name: 'terrorblade_soul_fragment',
                icon: 'illusion',
                color: 'Blue',
                gradient_id: 2,
                title: 'Soul Fragment',
                description:
                    'Conjure Image illusions always spawn at full health, but has an additional health cost.'
            }
        ]
    },
    npc_dota_hero_phoenix: {
        abilities: [
            'phoenix_icarus_dive',
            'phoenix_fire_spirits',
            'phoenix_sun_ray',
            'phoenix_sun_ray_toggle_move',
            'phoenix_blinding_sun',
            'phoenix_supernova',
            'phoenix_launch_fire_spirit',
            'phoenix_icarus_dive_stop',
            'phoenix_sun_ray_stop'
        ],
        talents: [
            {
                name: 'special_bonus_unique_phoenix_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_phoenix_dive_damage',
                level: 1
            },
            {
                name: 'special_bonus_unique_phoenix_3',
                level: 2
            },
            {
                name: 'special_bonus_hp_regen_20',
                level: 2
            },
            {
                name: 'special_bonus_unique_phoenix_5',
                level: 3
            },
            {
                name: 'special_bonus_unique_phoenix_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_phoenix_1',
                level: 4
            },
            {
                name: 'special_bonus_unique_phoenix_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'phoenix_facet_immolate',
                icon: 'barrier',
                color: 'Red',
                gradient_id: 2,
                title: 'Dying Light',
                description:
                    'Phoenix deals 4.5% of his missing health as magic damage to all enemies in a 400 radius every second.',
                abilities: ['phoenix_dying_light']
            },
            {
                id: 1,
                name: 'phoenix_hotspot',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 1,
                title: 'Hotspot',
                description: 'Sun Ray deals more damage towards the tip of the ray.'
            }
        ]
    },
    npc_dota_hero_oracle: {
        abilities: [
            'oracle_fortunes_end',
            'oracle_fates_edict',
            'oracle_purifying_flames',
            'oracle_rain_of_destiny',
            'oracle_prognosticate',
            'oracle_false_promise'
        ],
        talents: [
            {
                name: 'special_bonus_unique_oracle_2',
                level: 1
            },
            {
                name: 'special_bonus_unique_oracle_9',
                level: 1
            },
            {
                name: 'special_bonus_unique_oracle_damage_per_purge',
                level: 2
            },
            {
                name: 'special_bonus_unique_oracle_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_oracle_6',
                level: 3
            },
            {
                name: 'special_bonus_unique_oracle_8',
                level: 3
            },
            {
                name: 'special_bonus_unique_oracle_7',
                level: 4
            },
            {
                name: 'special_bonus_unique_oracle',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'oracle_facet_dmg',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 2,
                title: 'Clairvoyant Curse',
                description: 'Spell amplification increased by 0.75% per hero level.',
                abilities: ['oracle_clairvoyant_curse']
            },
            {
                id: 1,
                name: 'oracle_facet_heal',
                icon: 'healing',
                color: 'Green',
                gradient_id: 1,
                title: 'Clairvoyant Cure',
                description: 'Heal amplification increased by 0.75% per hero level.',
                abilities: ['oracle_clairvoyant_cure']
            }
        ]
    },
    npc_dota_hero_techies: {
        abilities: [
            'techies_sticky_bomb',
            'techies_reactive_tazer',
            'techies_suicide',
            'techies_reactive_tazer_stop',
            'techies_minefield_sign',
            'techies_land_mines'
        ],
        talents: [
            {
                name: 'special_bonus_magic_resistance_20',
                level: 1
            },
            {
                name: 'special_bonus_unique_techies_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_techies',
                level: 2
            },
            {
                name: 'special_bonus_mp_regen_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_techies_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_techies_5',
                level: 3
            },
            {
                name: 'special_bonus_attack_damage_252',
                level: 4
            },
            {
                name: 'special_bonus_unique_techies_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'techies_atk_range',
                icon: 'range',
                color: 'Gray',
                gradient_id: 0,
                title: "Squee's Scope",
                description:
                    'Techies gains 1 attack range and attack projectile speed for each point of attack speed.',
                abilities: ['techies_squees_scope']
            },
            {
                id: 1,
                name: 'techies_spleens_secret_sauce',
                icon: 'nuke',
                color: 'Red',
                gradient_id: 0,
                title: "Spleen's Secret Sauce",
                description: 'Increased Blast Off! damage and self damage.'
            },
            {
                id: 2,
                name: 'techies_backpack',
                icon: 'item',
                color: 'Blue',
                gradient_id: 1,
                title: "Spoon's Stash",
                description: 'Techies can use items in their backpack as if they were in their inventory.',
                abilities: ['techies_spoons_stash']
            }
        ]
    },
    npc_dota_hero_winter_wyvern: {
        abilities: [
            'winter_wyvern_arctic_burn',
            'winter_wyvern_splinter_blast',
            'winter_wyvern_cold_embrace',
            'winter_wyvern_eldwurm_scholar',
            'generic_hidden',
            'winter_wyvern_winters_curse'
        ],
        talents: [
            {
                name: 'special_bonus_unique_winter_wyvern_5',
                level: 1
            },
            {
                name: 'special_bonus_attack_damage_30',
                level: 1
            },
            {
                name: 'special_bonus_unique_winter_wyvern_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_winter_wyvern_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_winter_wyvern_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_winter_wyvern_7',
                level: 3
            },
            {
                name: 'special_bonus_unique_winter_wyvern_3',
                level: 4
            },
            {
                name: 'special_bonus_unique_winter_wyvern_4',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'winter_wyvern_heal_mana',
                icon: 'mana',
                color: 'Blue',
                gradient_id: 0,
                title: 'Essence of the Blueheart',
                description: "Winter Wyvern's heals also restore mana.",
                abilities: ['winter_wyvern_essence_of_the_blueheart']
            },
            {
                id: 1,
                name: 'winter_wyvern_atk_range',
                icon: 'damage',
                color: 'Gray',
                gradient_id: 3,
                title: 'Dragon Sight',
                description: 'Winter Wyvern gains bonus damage when her attack range is over 400.',
                abilities: ['winter_wyvern_dragon_sight']
            }
        ]
    },
    npc_dota_hero_arc_warden: {
        abilities: [
            'arc_warden_flux',
            'arc_warden_magnetic_field',
            'arc_warden_spark_wraith',
            'arc_warden_runic_infusion',
            'generic_hidden',
            'arc_warden_tempest_double'
        ],
        talents: [
            {
                name: 'special_bonus_unique_arc_warden_5',
                level: 1
            },
            {
                name: 'special_bonus_hp_200',
                level: 1
            },
            {
                name: 'special_bonus_unique_arc_warden_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_arc_warden_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_arc_warden',
                level: 3
            },
            {
                name: 'special_bonus_unique_arc_warden_9',
                level: 3
            },
            {
                name: 'special_bonus_unique_arc_warden_8',
                level: 4
            },
            {
                name: 'special_bonus_unique_arc_warden_flux_silences',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'arc_warden_order',
                icon: 'arc_warden',
                color: 'Gray',
                gradient_id: 3,
                title: 'Order',
                description: 'Arc Warden and Tempest Double have their respective ability effects.'
            },
            {
                id: 1,
                name: 'arc_warden_disorder',
                icon: 'arc_warden_alt',
                color: 'Gray',
                gradient_id: 0,
                title: 'Disorder',
                description: 'Arc Warden and Tempest Double have their ability effects swapped.'
            }
        ]
    },
    npc_dota_hero_abyssal_underlord: {
        abilities: [
            'abyssal_underlord_firestorm',
            'abyssal_underlord_pit_of_malice',
            'abyssal_underlord_atrophy_aura',
            'abyssal_underlord_raid_boss',
            'generic_hidden',
            'abyssal_underlord_dark_portal'
        ],
        talents: [
            {
                name: 'special_bonus_unique_underlord_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_underlord_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_underlord_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_underlord_5',
                level: 2
            },
            {
                name: 'special_bonus_unique_underlord_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_underlord_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_underlord',
                level: 4
            },
            {
                name: 'special_bonus_unique_underlord_9',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'abyssal_underlord_demons_reach',
                icon: 'area_of_effect',
                color: 'Green',
                gradient_id: 0,
                title: "Demon's Reach",
                description: "Underlord's attacks cleave while he has bonus damage from Atrophy Aura."
            },
            {
                id: 1,
                name: 'abyssal_underlord_summons',
                icon: 'summons',
                color: 'Yellow',
                gradient_id: 3,
                title: 'Abyssal Horde',
                description: "Fiend's Gate periodically summons minions.",
                abilities: ['abyssal_underlord_abyssal_horde']
            }
        ]
    },
    npc_dota_hero_monkey_king: {
        abilities: [
            'monkey_king_boundless_strike',
            'monkey_king_tree_dance',
            'monkey_king_primal_spring',
            'monkey_king_jingu_mastery',
            'monkey_king_mischief',
            'monkey_king_wukongs_command',
            'monkey_king_primal_spring_early',
            'monkey_king_untransform'
        ],
        talents: [
            {
                name: 'special_bonus_unique_monkey_king_3',
                level: 1
            },
            {
                name: 'special_bonus_unique_monkey_king_9',
                level: 1
            },
            {
                name: 'special_bonus_unique_monkey_king_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_monkey_king_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_monkey_king_8',
                level: 3
            },
            {
                name: 'special_bonus_unique_monkey_king_10',
                level: 3
            },
            {
                name: 'special_bonus_unique_monkey_king_11',
                level: 4
            },
            {
                name: 'special_bonus_unique_monkey_king_6',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'monkey_king_wukongs_faithful',
                icon: 'summons',
                color: 'Red',
                gradient_id: 2,
                title: "Wukong's Faithful",
                description:
                    "Monkey King's soldiers last longer and do not disperse unless he spends more than 4.0 seconds outside the area."
            },
            {
                id: 1,
                name: 'monkey_king_simian_stride',
                icon: 'tree',
                color: 'Green',
                gradient_id: 4,
                title: 'Simian Stride',
                description: 'Tree Dance has no cooldown while Monkey King is above 95% health.'
            }
        ]
    },
    npc_dota_hero_pangolier: {
        abilities: [
            'pangolier_swashbuckle',
            'pangolier_shield_crash',
            'pangolier_lucky_shot',
            'pangolier_fortune_favors_the_bold',
            'pangolier_rollup',
            'pangolier_gyroshell',
            'pangolier_gyroshell_stop',
            'pangolier_rollup_stop'
        ],
        talents: [
            {
                name: 'special_bonus_unique_pangolier_luckyshot_armor',
                level: 1
            },
            {
                name: 'special_bonus_unique_pangolier',
                level: 1
            },
            {
                name: 'special_bonus_unique_pangolier_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_pangolier_shield_crash_herostacks',
                level: 2
            },
            {
                name: 'special_bonus_unique_pangolier_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_pangolier_shield_crash_radius',
                level: 3
            },
            {
                name: 'special_bonus_unique_pangolier_4',
                level: 4
            },
            {
                name: 'special_bonus_unique_pangolier_5',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'pangolier_double_jump',
                icon: 'double_bounce',
                color: 'Red',
                gradient_id: 1,
                title: 'Double Jump',
                description:
                    'Pangolier can double jump with Shield Crash dealing more damage and gaining more barrier.'
            },
            {
                id: 1,
                name: 'pangolier_thunderbolt',
                icon: 'speed',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Thunderbolt',
                description: 'Rolling Thunder movement and turn speed increased, but duration is decreased.'
            }
        ]
    },
    npc_dota_hero_dark_willow: {
        abilities: [
            'dark_willow_bramble_maze',
            'dark_willow_shadow_realm',
            'dark_willow_cursed_crown',
            'dark_willow_bedlam',
            'dark_willow_pixie_dust',
            'dark_willow_terrorize'
        ],
        talents: [
            {
                name: 'special_bonus_unique_dark_willow_6',
                level: 1
            },
            {
                name: 'special_bonus_unique_dark_willow_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_dark_willow_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_dark_willow_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_dark_willow_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_dark_willow_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_dark_willow_2',
                level: 4
            },
            {
                name: 'special_bonus_unique_dark_willow_bedlam_targets',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'dark_willow_throwing_shade',
                icon: 'damage',
                color: 'Purple',
                gradient_id: 1,
                title: 'Throwing Shade',
                description:
                    "Dark Willow deals more damage to nearby heroes when she's in the Shadow Realm."
            },
            {
                id: 1,
                name: 'dark_willow_thorny_thicket',
                icon: 'area_of_effect',
                color: 'Green',
                gradient_id: 4,
                title: 'Thorny Thicket',
                description: 'Bramble Maze creates extra brambles.'
            }
        ]
    },
    npc_dota_hero_grimstroke: {
        abilities: [
            'grimstroke_dark_artistry',
            'grimstroke_ink_creature',
            'grimstroke_spirit_walk',
            'grimstroke_dark_portrait',
            'grimstroke_return',
            'grimstroke_soul_chain',
            'grimstroke_ink_trail'
        ],
        talents: [
            {
                name: 'special_bonus_unique_grimstroke_8',
                level: 1
            },
            {
                name: 'special_bonus_unique_grimstroke_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_grimstroke_soul_chain_reflect_damage',
                level: 2
            },
            {
                name: 'special_bonus_unique_grimstroke_6',
                level: 2
            },
            {
                name: 'special_bonus_unique_grimstroke_2',
                level: 3
            },
            {
                name: 'special_bonus_unique_grimstroke_4',
                level: 3
            },
            {
                name: 'special_bonus_unique_grimstroke_1',
                level: 4
            },
            {
                name: 'special_bonus_unique_grimstroke_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'grimstroke_inkstigate',
                icon: 'area_of_effect',
                color: 'Gray',
                gradient_id: 0,
                title: 'Inkstigate',
                description: 'Ink Swell can be manually detonated early.'
            },
            {
                id: 1,
                name: 'grimstroke_fine_art',
                icon: 'brush',
                color: 'Red',
                gradient_id: 1,
                title: 'Fine Art',
                description:
                    "Stroke of Fate can now be vector targeted to manipulate the ink's travel path."
            }
        ]
    },
    npc_dota_hero_mars: {
        abilities: [
            'mars_spear',
            'mars_gods_rebuke',
            'mars_bulwark',
            'mars_dauntless',
            'generic_hidden',
            'mars_arena_of_blood'
        ],
        talents: [
            {
                name: 'special_bonus_unique_mars_rebuke_radius',
                level: 1
            },
            {
                name: 'special_bonus_unique_mars_bulwark_damage_reduction',
                level: 1
            },
            {
                name: 'special_bonus_unique_mars_rebuke_cooldown',
                level: 2
            },
            {
                name: 'special_bonus_unique_mars_spear_bonus_damage',
                level: 2
            },
            {
                name: 'special_bonus_unique_mars_arena_cooldown',
                level: 3
            },
            {
                name: 'special_bonus_unique_mars_spear_stun_duration',
                level: 3
            },
            {
                name: 'special_bonus_unique_mars_gods_rebuke_extra_crit',
                level: 4
            },
            {
                name: 'special_bonus_unique_mars_arena_of_blood_hp_regen',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'mars_victory_feast',
                icon: 'healing',
                color: 'Red',
                gradient_id: 2,
                title: 'Victory Feast',
                description:
                    'Mars gains health, mana, and attack damage when an enemy inside his Arena of Blood dies.'
            },
            {
                id: 1,
                name: 'mars_arena',
                icon: 'no_vision',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Blood Sport',
                description: "Enemies inside the Arena of Blood don't have vision outside the arena."
            }
        ]
    },
    npc_dota_hero_void_spirit: {
        abilities: [
            'void_spirit_aether_remnant',
            'void_spirit_dissimilate',
            'void_spirit_resonant_pulse',
            'void_spirit_intrinsic_edge',
            'generic_hidden',
            'void_spirit_astral_step'
        ],
        talents: [
            {
                name: 'special_bonus_mp_regen_175',
                level: 1
            },
            {
                name: 'special_bonus_unique_void_spirit_2',
                level: 1
            },
            {
                name: 'special_bonus_unique_void_spirit_7',
                level: 2
            },
            {
                name: 'special_bonus_unique_void_spirit_4',
                level: 2
            },
            {
                name: 'special_bonus_unique_void_spirit_dissimilate_outerring',
                level: 3
            },
            {
                name: 'special_bonus_unique_void_spirit_1',
                level: 3
            },
            {
                name: 'special_bonus_unique_void_spirit_8',
                level: 4
            },
            {
                name: 'special_bonus_unique_void_spirit_3',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'void_spirit_sanctuary',
                icon: 'armor',
                color: 'Purple',
                gradient_id: 1,
                title: 'Sanctuary',
                description:
                    'Resonant Pulse creates a larger all damage barrier instead of a physical barrier.'
            },
            {
                id: 1,
                name: 'void_spirit_phys_barrier',
                deprecated: 'true',
                icon: 'nuke',
                color: 'Gray',
                gradient_id: 3,
                title: 'Symmetry',
                description:
                    'Void Spirit gains a physical damage barrier when dealing magic damage to enemy heroes.',
                abilities: ['void_spirit_symmetry']
            },
            {
                id: 2,
                name: 'void_spirit_aether_artifice',
                icon: 'illusion',
                color: 'Gray',
                gradient_id: 3,
                title: 'Call of the Void',
                description:
                    'Upon exiting Dissimilate, Aether Remnants are created at the 3 portals furthest from Void Spirit.'
            }
        ]
    },
    npc_dota_hero_snapfire: {
        abilities: [
            'snapfire_scatterblast',
            'snapfire_firesnap_cookie',
            'snapfire_lil_shredder',
            'snapfire_gobble_up',
            'snapfire_spit_creep',
            'snapfire_mortimer_kisses',
            'snapfire_buckshot'
        ],
        talents: [
            {
                name: 'special_bonus_unique_snapfire_7',
                level: 1
            },
            {
                name: 'special_bonus_unique_snapfire_5',
                level: 1
            },
            {
                name: 'special_bonus_unique_snapfire_2',
                level: 2
            },
            {
                name: 'special_bonus_unique_snapfire_3',
                level: 2
            },
            {
                name: 'special_bonus_unique_snapfire_8',
                level: 3
            },
            {
                name: 'special_bonus_unique_snapfire_mortimer_kisses_impact_damage',
                level: 3
            },
            {
                name: 'special_bonus_unique_snapfire_6',
                level: 4
            },
            {
                name: 'special_bonus_unique_snapfire_1',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'snapfire_ricochet_ii',
                icon: 'ricochet',
                color: 'Gray',
                gradient_id: 3,
                title: 'Ricochet II',
                description:
                    'Whenever Snapfire glances or misses an attack, 2 ricochet attacks will bounce towards nearby enemies.'
            },
            {
                id: 1,
                name: 'snapfire_full_bore',
                icon: 'range',
                color: 'Red',
                gradient_id: 0,
                title: 'Full Bore',
                description:
                    'Scatterblast is narrower and longer. Bonus damage and slow when enemies are not in point blank range.'
            }
        ]
    },
    npc_dota_hero_hoodwink: {
        abilities: [
            'hoodwink_acorn_shot',
            'hoodwink_bushwhack',
            'hoodwink_scurry',
            'hoodwink_decoy',
            'hoodwink_hunters_boomerang',
            'hoodwink_mistwoods_wayfarer',
            'hoodwink_sharpshooter',
            'hoodwink_sharpshooter_release'
        ],
        talents: [
            {
                name: 'special_bonus_unique_hoodwink_scurry_duration',
                level: 1
            },
            {
                name: 'special_bonus_unique_hoodwink_bushwhack_cooldown',
                level: 1
            },
            {
                name: 'special_bonus_unique_hoodwink_bushwhack_damage',
                level: 2
            },
            {
                name: 'special_bonus_unique_hoodwink_acorn_shot_bounces',
                level: 2
            },
            {
                name: 'special_bonus_unique_hoodwink_sharpshooter_damage',
                level: 3
            },
            {
                name: 'special_bonus_corruption_3',
                level: 3
            },
            {
                name: 'special_bonus_unique_hoodwink_acorn_shot_charges',
                level: 4
            },
            {
                name: 'special_bonus_unique_hoodwink_sharpshooter_pure_damage',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'hoodwink_hunter',
                icon: 'range',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Go Nuts',
                description: 'Scurry also provides bonus attack and cast range.'
            },
            {
                id: 1,
                name: 'hoodwink_treebounce_trickshot',
                icon: 'tree',
                color: 'Green',
                gradient_id: 0,
                title: 'Treebounce Trickshot',
                description: 'Acorn Shot can bounce once on trees.'
            }
        ]
    },
    npc_dota_hero_dawnbreaker: {
        abilities: [
            'dawnbreaker_fire_wreath',
            'dawnbreaker_celestial_hammer',
            'dawnbreaker_luminosity',
            'dawnbreaker_converge',
            'dawnbreaker_break_of_dawn',
            'dawnbreaker_solar_guardian',
            'dawnbreaker_land'
        ],
        talents: [
            {
                name: 'special_bonus_unique_dawnbreaker_fire_wreath_swipe',
                level: 1
            },
            {
                name: 'special_bonus_unique_dawnbreaker_celestial_hammer_slow',
                level: 1
            },
            {
                name: 'special_bonus_unique_dawnbreaker_luminosity_crit',
                level: 2
            },
            {
                name: 'special_bonus_unique_dawnbreaker_solar_guardian_cooldown',
                level: 2
            },
            {
                name: 'special_bonus_unique_dawnbreaker_solar_guardian_radius',
                level: 3
            },
            {
                name: 'special_bonus_unique_dawnbreaker_luminosity_attack_count',
                level: 3
            },
            {
                name: 'special_bonus_unique_dawnbreaker_fire_wreath_cooldown',
                level: 4
            },
            {
                name: 'special_bonus_unique_dawnbreaker_celestial_hammer_cast_range',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'dawnbreaker_solar_charged',
                icon: 'cooldown',
                color: 'Gray',
                gradient_id: 3,
                title: 'Solar Charged',
                description:
                    'Whenever Dawnbreaker hits a target with a powered up Luminosity, she decreases the cooldowns of all of her abilities.'
            },
            {
                id: 1,
                name: 'dawnbreaker_gleaming_hammer',
                icon: 'dawnbreaker_hammer',
                color: 'Yellow',
                gradient_id: 1,
                title: 'Gleaming Hammer',
                description: 'Celestial Hammer heals allies and damages enemies when on the ground.'
            }
        ]
    },
    npc_dota_hero_marci: {
        abilities: [
            'marci_grapple',
            'marci_companion_run',
            'generic_hidden',
            'marci_special_delivery',
            'generic_hidden',
            'marci_unleash'
        ],
        talents: [
            {
                name: 'special_bonus_unique_marci_lunge_range',
                level: 1
            },
            {
                name: 'special_bonus_unique_marci_guardian_lifesteal',
                level: 1
            },
            {
                name: 'special_bonus_unique_marci_grapple_damage',
                level: 2
            },
            {
                name: 'special_bonus_unique_marci_lunge_movespeed',
                level: 2
            },
            {
                name: 'special_bonus_unique_marci_grapple_stun_duration',
                level: 3
            },
            {
                name: 'special_bonus_unique_marci_unleash_speed',
                level: 3
            },
            {
                name: 'special_bonus_unique_marci_unleash_extend_duration',
                level: 4
            },
            {
                name: 'special_bonus_unique_marci_guardian_damage',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'marci_sidekick',
                icon: 'healing',
                color: 'Gray',
                gradient_id: 3,
                title: 'Sidekick',
                description:
                    "Marci can protect an ally, granting them shared lifesteal and damage. Effect is stronger if she's close to the ally.",
                abilities: ['marci_guardian']
            },
            {
                id: 1,
                name: 'marci_bodyguard',
                icon: 'ricochet',
                color: 'Blue',
                gradient_id: 1,
                title: 'Bodyguard',
                description:
                    "Marci can protect an ally, countering attacks directed towards them if she's in range of the enemy.",
                abilities: ['marci_bodyguard']
            }
        ]
    },
    npc_dota_hero_primal_beast: {
        abilities: [
            'primal_beast_onslaught',
            'primal_beast_trample',
            'primal_beast_uproar',
            'primal_beast_rock_throw',
            'primal_beast_onslaught_release',
            'primal_beast_pulverize',
            'primal_beast_colossal'
        ],
        talents: [
            {
                name: 'special_bonus_unique_primal_beast_onslaught_damage',
                level: 1
            },
            {
                name: 'special_bonus_unique_primal_beast_trample_magic_resist',
                level: 1
            },
            {
                name: 'special_bonus_unique_primal_beast_trample_cooldown',
                level: 2
            },
            {
                name: 'special_bonus_unique_primal_beast_roar_dispells',
                level: 2
            },
            {
                name: 'special_bonus_unique_primal_beast_trample_attack_damage',
                level: 3
            },
            {
                name: 'special_bonus_unique_primal_beast_uproar_armor',
                level: 3
            },
            {
                name: 'special_bonus_unique_primal_beast_trample_unslowable',
                level: 4
            },
            {
                name: 'special_bonus_unique_primal_beast_pulverize_duration',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'primal_beast_romp_n_stomp',
                icon: 'speed',
                color: 'Red',
                gradient_id: 0,
                title: "Romp n' Stomp",
                description:
                    'Trample grants bonus movement speed to Primal Beast and his allies when activated.'
            },
            {
                id: 1,
                name: 'primal_beast_ferocity',
                icon: 'area_of_effect',
                color: 'Yellow',
                gradient_id: 3,
                title: 'Ferocity',
                description:
                    "Each Pulverize hit increases the AoE bonuses of Primal Beast's abilities and items."
            }
        ]
    },
    npc_dota_hero_muerta: {
        abilities: [
            'muerta_dead_shot',
            'muerta_the_calling',
            'muerta_gunslinger',
            'muerta_parting_shot',
            'generic_hidden',
            'muerta_pierce_the_veil',
            'muerta_supernatural',
            'generic_hidden',
            'generic_hidden'
        ],
        talents: [
            {
                name: 'special_bonus_unique_muerta_dead_shot_range',
                level: 1
            },
            {
                name: 'special_bonus_unique_muerta_calling_hp_regen',
                level: 1
            },
            {
                name: 'special_bonus_unique_muerta_dead_shot_damage',
                level: 2
            },
            {
                name: 'special_bonus_unique_muerta_gunslinger_bonus_damage',
                level: 2
            },
            {
                name: 'special_bonus_unique_muerta_dead_shot_charges',
                level: 3
            },
            {
                name: 'special_bonus_unique_muerta_the_calling_num_revenants',
                level: 3
            },
            {
                name: 'special_bonus_unique_muerta_gunslinger_double_shot_chance',
                level: 4
            },
            {
                name: 'special_bonus_magic_resistance_25',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'muerta_dance_of_the_dead',
                icon: 'spirit',
                color: 'Green',
                gradient_id: 1,
                title: 'Dance of the Dead',
                description: 'The Calling becomes stronger when heroes die inside it.'
            },
            {
                id: 1,
                name: 'muerta_ofrenda',
                icon: 'teleport',
                color: 'Yellow',
                gradient_id: 0,
                title: 'Ofrenda',
                description:
                    'Muerta can place a beneficial Ofrenda on the map to respawn there instead of the fountain.',
                abilities: ['muerta_ofrenda']
            }
        ]
    },
    npc_dota_hero_ringmaster: {
        abilities: [
            'ringmaster_tame_the_beasts',
            'ringmaster_the_box',
            'ringmaster_impalement',
            'ringmaster_empty_souvenir',
            'ringmaster_spotlight',
            'ringmaster_wheel',
            'ringmaster_tame_the_beasts_crack',
            'generic_hidden'
        ],
        talents: [
            {
                name: 'special_bonus_unique_ringmaster_whip_radius',
                level: 1
            },
            {
                name: 'special_bonus_unique_ringmaster_box_cast_range',
                level: 1
            },
            {
                name: 'special_bonus_unique_ringmaster_dagger_penetrates',
                level: 2
            },
            {
                name: 'special_bonus_unique_ringmaster_whip_debuff_immunity',
                level: 2
            },
            {
                name: 'special_bonus_unique_ringmaster_dagger_bleed_and_slow_duration',
                level: 3
            },
            {
                name: 'special_bonus_unique_ringmaster_whip_damage',
                level: 3
            },
            {
                name: 'special_bonus_unique_ringmaster_wheel_radius',
                level: 4
            },
            {
                name: 'special_bonus_unique_ringmaster_the_box_strong_dispel_and_flying',
                level: 4
            },
            {
                name: 'ringmaster_dark_carnival_souvenirs',
                level: 5
            },
            {
                name: 'ringmaster_funhouse_mirror',
                level: 5
            },
            {
                name: 'ringmaster_strongman_tonic',
                level: 6
            },
            {
                name: 'ringmaster_whoopee_cushion',
                level: 6
            }
        ],
        facets: [
            {
                id: 0,
                name: 'ringmaster_default',
                icon: 'item',
                color: 'Gray',
                gradient_id: 3,
                title: 'Center Stage',
                description:
                    "Ringmaster is still new to the spotlight. This facet doesn't do anything... yet."
            }
        ]
    },
    npc_dota_hero_kez: {
        abilities: [
            'kez_echo_slash',
            'kez_grappling_claw',
            'kez_kazurai_katana',
            'kez_switch_weapons',
            'generic_hidden',
            'kez_raptor_dance',
            'kez_falcon_rush',
            'kez_talon_toss',
            'kez_shodo_sai',
            'kez_ravens_veil',
            'kez_shodo_sai_parry_cancel'
        ],
        talents: [
            {
                name: 'special_bonus_magic_resistance_12',
                level: 1
            },
            {
                name: 'special_bonus_mp_regen_150',
                level: 1
            },
            {
                name: 'special_bonus_unique_kez_falcon_rush_duration',
                level: 2
            },
            {
                name: 'special_bonus_unique_kez_raptor_dance_radius',
                level: 2
            },
            {
                name: 'special_bonus_unique_kez_kazura_katana_bleed_damage',
                level: 3
            },
            {
                name: 'special_bonus_unique_kez_falcon_rush_evasion',
                level: 3
            },
            {
                name: 'special_bonus_unique_kez_mark_damage',
                level: 4
            },
            {
                name: 'special_bonus_unique_kez_echo_slash_strike_count',
                level: 4
            }
        ],
        facets: [
            {
                id: 0,
                name: 'kez_default',
                icon: 'kez',
                color: 'Blue',
                gradient_id: 3,
                title: 'Hero of the Flightless',
                description:
                    "Kez always has a few fun tricks up his sleeve, but right now he's got a war to win. This facet doesn't do anything... yet."
            }
        ]
    }
};
