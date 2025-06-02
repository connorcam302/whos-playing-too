const itemMap = new Map();

const items = [
    {
        id: 4302,
        name: "Forebearer's Fortune",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ofrenda_pledge.png"
    },
    {
        id: 4301,
        name: "Scrying Shovel",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ofrenda_shovel.png"
    },
    {
        id: 4300,
        name: "Beloved Memory",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ofrenda.png"
    },
    {
        id: 4206,
        name: "Greater Healing Lotus",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/greater_famango.png"
    },
    {
        id: 4205,
        name: "Great Healing Lotus",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/great_famango.png"
    },
    {
        id: 4204,
        name: "Healing Lotus",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/famango.png"
    },
    {
        id: 2193,
        name: "Gossamer Cape",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/gossamer_cape.png"
    },
    {
        id: 2192,
        name: "Martyr's Plate",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/martyrs_plate.png"
    },
    {
        id: 2191,
        name: "Turtle Shell",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/turtle_shell.png"
    },
    {
        id: 2190,
        name: "Dandelion Amulet",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dandelion_amulet.png"
    },
    {
        id: 2099,
        name: "Blighted Spirit",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/blighted_spirit.png"
    },
    {
        id: 2098,
        name: "Horizon's Equilibrium",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/horizons_equilibrium.png"
    },
    {
        id: 2097,
        name: "Duelist Gloves",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/duelist_gloves.png"
    },
    {
        id: 2096,
        name: "Vindicator's Axe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/vindicators_axe.png"
    },
    {
        id: 2095,
        name: "Tier 5 Token",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tier5_token.png"
    },
    {
        id: 2094,
        name: "Tier 4 Token",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tier4_token.png"
    },
    {
        id: 2093,
        name: "Tier 3 Token",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tier3_token.png"
    },
    {
        id: 2092,
        name: "Tier 2 Token",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tier2_token.png"
    },
    {
        id: 2091,
        name: "Tier 1 Token",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tier1_token.png"
    },
    {
        id: 1808,
        name: "Khanda",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/angels_demise.png"
    },
    {
        id: 1806,
        name: "Parasma",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/devastator.png"
    },
    {
        id: 1804,
        name: "Roshan's Banner",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/roshans_banner.png"
    },
    {
        id: 1803,
        name: "Doubloon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/doubloon.png"
    },
    {
        id: 1802,
        name: "Tiara Of Selemene",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tiara_of_selemene.png"
    },
    {
        id: 1645,
        name: "Disgraced Regalia",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/divine_regalia_broken.png"
    },
    {
        id: 1644,
        name: "Divine Regalia",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/divine_regalia.png"
    },
    {
        id: 1643,
        name: "Giant's Maul",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/giant_maul.png"
    },
    {
        id: 1642,
        name: "Dezun Bloodrite",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dezun_bloodrite.png"
    },
    {
        id: 1641,
        name: "Outworld Staff",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/outworld_staff.png"
    },
    {
        id: 1640,
        name: "Jidi Pollen Bag",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/jidi_pollen_bag.png"
    },
    {
        id: 1639,
        name: "Sisters's Shroud",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/sisters_shroud.png"
    },
    {
        id: 1638,
        name: "Dormant Curio",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dormant_curio.png"
    },
    {
        id: 1637,
        name: "Kobold Cup",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/kobold_cup.png"
    },
    {
        id: 1610,
        name: "Miniboss Minion Summoner",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/miniboss_minion_summoner.png"
    },
    {
        id: 1609,
        name: "Madstone Bundle",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/madstone_bundle.png"
    },
    {
        id: 1608,
        name: "Pyrrhic Cloak",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/pyrrhic_cloak.png"
    },
    {
        id: 1607,
        name: "Magnifying Monocle",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/magnifying_monocle.png"
    },
    {
        id: 1606,
        name: "Polliwog Charm",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/polliwog_charm.png"
    },
    {
        id: 1605,
        name: "Serrated Shiv",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/serrated_shiv.png"
    },
    {
        id: 1604,
        name: "Searing Signet",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/searing_signet.png"
    },
    {
        id: 1603,
        name: "Gunpowder Gauntlets",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/gunpowder_gauntlets.png"
    },
    {
        id: 1602,
        name: "Gale Guard",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/gale_guard.png"
    },
    {
        id: 1601,
        name: "Crippling Crossbow",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/crippling_crossbow.png"
    },
    {
        id: 1600,
        name: "Ripper's Lash",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/rippers_lash.png"
    },
    {
        id: 1599,
        name: "Mana Draught",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mana_draught.png"
    },
    {
        id: 1598,
        name: "Unrelenting Eye",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/unrelenting_eye.png"
    },
    {
        id: 1582,
        name: "Hellbear Totem",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/hellbear_totem.png"
    },
    {
        id: 1580,
        name: "Neutral Tabi",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/neutral_tabi.png"
    },
    {
        id: 1579,
        name: "Ogre Heart",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ogre_heart.png"
    },
    {
        id: 1578,
        name: "Cursed Circlet",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/cursed_circlet.png"
    },
    {
        id: 1575,
        name: "Orb of Frost",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/orb_of_frost.png"
    },
    {
        id: 1565,
        name: "Gleipnir Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 1466,
        name: "Gleipnir",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/gungir.png"
    },
    {
        id: 1168,
        name: "Rattlecage",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/rattlecage.png"
    },
    {
        id: 1167,
        name: "Light Collector",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/light_collector.png"
    },
    {
        id: 1161,
        name: "Unwavering Condition",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/unwavering_condition.png"
    },
    {
        id: 1160,
        name: "Aviana's Feather",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/avianas_feather.png"
    },
    {
        id: 1159,
        name: "Nemesis Curse",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/nemesis_curse.png"
    },
    {
        id: 1158,
        name: "Whisper of the Dread",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/whisper_of_the_dread.png"
    },
    {
        id: 1157,
        name: "Safety Bubble",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/safety_bubble.png"
    },
    {
        id: 1156,
        name: "Ancient Guardian",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ancient_guardian.png"
    },
    {
        id: 1154,
        name: "Block of Cheese",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/royale_with_cheese.png"
    },
    {
        id: 1128,
        name: "Pavise",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/pavise.png"
    },
    {
        id: 1127,
        name: "Pavise Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 1125,
        name: "Cornucopia",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/cornucopia.png"
    },
    {
        id: 1124,
        name: "Spark of Courage",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/spark_of_courage.png"
    },
    {
        id: 1123,
        name: "Blood Grenade",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/blood_grenade.png"
    },
    {
        id: 1122,
        name: "Diadem",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/diadem.png"
    },
    {
        id: 1107,
        name: "Phylactery",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/phylactery.png"
    },
    {
        id: 1106,
        name: "Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 1101,
        name: "",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 1100,
        name: "Witches Switch",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/witches_switch.png"
    },
    {
        id: 1099,
        name: "Witches Switch Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 1098,
        name: "Samurai Tabi Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 1097,
        name: "Disperser",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/disperser.png"
    },
    {
        id: 1096,
        name: "Disperser Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 1095,
        name: "Lunar Crest",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/lunar_crest.png"
    },
    {
        id: 1094,
        name: "Lunar Crest Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 1093,
        name: "Hermes Sandals",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/hermes_sandals.png"
    },
    {
        id: 1092,
        name: "Hermes Sandals Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 1091,
        name: "Samurai Tabi",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/samurai_tabi.png"
    },
    {
        id: 1090,
        name: "Mercy & Grace",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/muertas_gun.png"
    },
    {
        id: 1077,
        name: "Dagger of Ristul",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dagger_of_ristul.png"
    },
    {
        id: 1076,
        name: "Specialist's Array",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/specialists_array.png"
    },
    {
        id: 1032,
        name: "Pocket Roshan",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/pocket_roshan.png"
    },
    {
        id: 1030,
        name: "Pocket Tower",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/pocket_tower.png"
    },
    {
        id: 1029,
        name: "Super Blink Dagger",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/super_blink.png"
    },
    {
        id: 1028,
        name: "Tombstone",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mutation_tombstone.png"
    },
    {
        id: 1027,
        name: "River Vial: Blood",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/river_painter7.png"
    },
    {
        id: 1026,
        name: "River Vial: Potion",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/river_painter6.png"
    },
    {
        id: 1025,
        name: "River Vial: Electrified",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/river_painter5.png"
    },
    {
        id: 1024,
        name: "River Vial: Oil",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/river_painter4.png"
    },
    {
        id: 1023,
        name: "River Vial: Slime",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/river_painter3.png"
    },
    {
        id: 1022,
        name: "River Vial: Dry",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/river_painter2.png"
    },
    {
        id: 1021,
        name: "River Vial: Chrome",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/river_painter.png"
    },
    {
        id: 1017,
        name: "",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/wand_of_sanctitude.png"
    },
    {
        id: 1000,
        name: "",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/bottomless_chalice.png"
    },
    {
        id: 998,
        name: "",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/manacles_of_power.png"
    },
    {
        id: 990,
        name: "Eye of the Vizier",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/eye_of_the_vizier.png"
    },
    {
        id: 969,
        name: "",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/barricade.png"
    },
    {
        id: 968,
        name: "",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/arcane_scout.png"
    },
    {
        id: 950,
        name: "Defiant Shell",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/defiant_shell.png"
    },
    {
        id: 949,
        name: "Ogre Seal Totem",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ogre_seal_totem.png"
    },
    {
        id: 948,
        name: "",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tome_of_omniscience.png"
    },
    {
        id: 947,
        name: "Occult Bracelet",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/occult_bracelet.png"
    },
    {
        id: 946,
        name: "Lance of Pursuit",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/lance_of_pursuit.png"
    },
    {
        id: 945,
        name: "Seeds of Serenity",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/seeds_of_serenity.png"
    },
    {
        id: 940,
        name: "",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/wand_of_the_brine.png"
    },
    {
        id: 939,
        name: "Harpoon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/harpoon.png"
    },
    {
        id: 938,
        name: "",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/slime_vial.png"
    },
    {
        id: 931,
        name: "Boots of Bearing",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/boots_of_bearing.png"
    },
    {
        id: 930,
        name: "Boots of Bearing Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 911,
        name: "Revenant's Brooch",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/revenants_brooch.png"
    },
    {
        id: 910,
        name: "Revenant's Brooch Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 908,
        name: "Wraith Pact",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/wraith_pact.png"
    },
    {
        id: 907,
        name: "Wraith Pact Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 849,
        name: "Mechanical Arm",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mechanical_arm.png"
    },
    {
        id: 840,
        name: "Tumbler's Toy",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/pogo_stick.png"
    },
    {
        id: 839,
        name: "Ring of Fortitude",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/fortitude_ring.png"
    },
    {
        id: 838,
        name: "Pig Pole",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/unstable_wand.png"
    },
    {
        id: 837,
        name: "Witchbane",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/heavy_blade.png"
    },
    {
        id: 836,
        name: "Light Robes",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/light_robes.png"
    },
    {
        id: 835,
        name: "Fae Grenade",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/paintball.png"
    },
    {
        id: 834,
        name: "Blast Rig",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_powder_bag.png"
    },
    {
        id: 829,
        name: "Arcanist's Armor",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/force_field.png"
    },
    {
        id: 828,
        name: "Brigand's Blade",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/misericorde.png"
    },
    {
        id: 827,
        name: "Icarus Wings",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/icarus_wings.png"
    },
    {
        id: 826,
        name: "Assassin's Contract",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/sample_picker.png"
    },
    {
        id: 825,
        name: "Ascetic's Cap",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ascetic_cap.png"
    },
    {
        id: 824,
        name: "Assassin's Dagger",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/assassins_dagger.png"
    },
    {
        id: 731,
        name: "Satchel",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/satchel.png"
    },
    {
        id: 727,
        name: "Aghanim's Blessing - Roshan",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ultimate_scepter_roshan.png"
    },
    {
        id: 725,
        name: "Aghanim's Shard - Roshan",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/aghanims_shard_roshan.png"
    },
    {
        id: 692,
        name: "Eternal Shroud",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/eternal_shroud.png"
    },
    {
        id: 691,
        name: "Eternal Shroud Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 686,
        name: "Quicksilver Amulet",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/quicksilver_amulet.png"
    },
    {
        id: 680,
        name: "Bullwhip",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/bullwhip.png"
    },
    {
        id: 679,
        name: "Shadow of Vengeance",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/vengeances_shadow.png"
    },
    {
        id: 678,
        name: "Giant's Ring",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/giants_ring.png"
    },
    {
        id: 677,
        name: "Book of Shadows",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/book_of_shadows.png"
    },
    {
        id: 676,
        name: "Ceremonial Robe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ceremonial_robe.png"
    },
    {
        id: 675,
        name: "Psychic Headband",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/psychic_headband.png"
    },
    {
        id: 674,
        name: "Warhammer",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/warhammer.png"
    },
    {
        id: 655,
        name: "Grandmaster's Glaive",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/grandmasters_glaive.png"
    },
    {
        id: 640,
        name: "Orb of Corrosion Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 638,
        name: "Penta-Edged Sword",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/penta_edged_sword.png"
    },
    {
        id: 637,
        name: "Star Mace",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/star_mace.png"
    },
    {
        id: 635,
        name: "Helm of the Overlord",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/helm_of_the_overlord.png"
    },
    {
        id: 633,
        name: "Helm of the Overlord Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 612,
        name: "Wind Waker Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 610,
        name: "Wind Waker",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/wind_waker.png"
    },
    {
        id: 609,
        name: "Aghanim's Shard",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/aghanims_shard.png"
    },
    {
        id: 608,
        name: "Overwhelming Blink Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 607,
        name: "Swift Blink Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 606,
        name: "Arcane Blink Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 604,
        name: "Arcane Blink",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/arcane_blink.png"
    },
    {
        id: 603,
        name: "Swift Blink",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/swift_blink.png"
    },
    {
        id: 600,
        name: "Overwhelming Blink",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/overwhelming_blink.png"
    },
    {
        id: 599,
        name: "Falcon Blade Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 598,
        name: "Mage Slayer",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mage_slayer.png"
    },
    {
        id: 597,
        name: "Mage Slayer Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 596,
        name: "Falcon Blade",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/falcon_blade.png"
    },
    {
        id: 593,
        name: "Fluffy Hat",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/fluffy_hat.png"
    },
    {
        id: 589,
        name: "Fairy's Trinket",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mysterious_hat.png"
    },
    {
        id: 588,
        name: "Overflowing Elixir",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/overflowing_elixir.png"
    },
    {
        id: 585,
        name: "Stormcrafter",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/stormcrafter.png"
    },
    {
        id: 582,
        name: "Oakheart",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/oakheart.png"
    },
    {
        id: 578,
        name: "Ancient Perseverance",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ancient_perseverance.png"
    },
    {
        id: 577,
        name: "Possessed Mask",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/possessed_mask.png"
    },
    {
        id: 576,
        name: "Helm of the Gladiator",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/gladiator_helm.png"
    },
    {
        id: 575,
        name: "Venom Gland",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/venom_gland.png"
    },
    {
        id: 574,
        name: "Cloak of Flames",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/cloak_of_flames.png"
    },
    {
        id: 573,
        name: "Elven Tunic",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/elven_tunic.png"
    },
    {
        id: 571,
        name: "Trickster Cloak",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/trickster_cloak.png"
    },
    {
        id: 570,
        name: "Gloves of Travel",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/gloves_of_travel.png"
    },
    {
        id: 569,
        name: "Orb of Corrosion",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/orb_of_corrosion.png"
    },
    {
        id: 566,
        name: "Wizard Glass",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/wizard_glass.png"
    },
    {
        id: 565,
        name: "Chipped Vest",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/chipped_vest.png"
    },
    {
        id: 534,
        name: "Witch Blade",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/witch_blade.png"
    },
    {
        id: 533,
        name: "Witch Blade Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 485,
        name: "Blitz Knuckles",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/blitz_knuckles.png"
    },
    {
        id: 473,
        name: "Voodoo Mask",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/voodoo_mask.png"
    },
    {
        id: 381,
        name: "Titan Sliver",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/titan_sliver.png"
    },
    {
        id: 379,
        name: "The Leveller",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/the_leveller.png"
    },
    {
        id: 378,
        name: "Orb of Destruction",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/orb_of_destruction.png"
    },
    {
        id: 377,
        name: "Minotaur Horn",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/minotaur_horn.png"
    },
    {
        id: 376,
        name: "Paladin Sword",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/paladin_sword.png"
    },
    {
        id: 375,
        name: "Faded Broach",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/faded_broach.png"
    },
    {
        id: 374,
        name: "Ex Machina",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ex_machina.png"
    },
    {
        id: 373,
        name: "Dimensional Doorway",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dimensional_doorway.png"
    },
    {
        id: 372,
        name: "Pirate Hat",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/pirate_hat.png"
    },
    {
        id: 371,
        name: "Fallen Sky",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/fallen_sky.png"
    },
    {
        id: 370,
        name: "Book of the Dead",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/demonicon.png"
    },
    {
        id: 369,
        name: "Trident",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/trident.png"
    },
    {
        id: 368,
        name: "Woodland Striders",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/woodland_striders.png"
    },
    {
        id: 367,
        name: "Ballista",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ballista.png"
    },
    {
        id: 366,
        name: "Apex",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/apex.png"
    },
    {
        id: 365,
        name: "Magic Lamp",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/panic_button.png"
    },
    {
        id: 364,
        name: "Havoc Hammer",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/havoc_hammer.png"
    },
    {
        id: 363,
        name: "Illusionist's Cape",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/illusionsts_cape.png"
    },
    {
        id: 362,
        name: "Ninja Gear",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ninja_gear.png"
    },
    {
        id: 361,
        name: "Enchanted Quiver",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/enchanted_quiver.png"
    },
    {
        id: 360,
        name: "Clumsy Net",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/clumsy_net.png"
    },
    {
        id: 359,
        name: "Essence Ring",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/essence_ring.png"
    },
    {
        id: 358,
        name: "Dragon Scale",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dragon_scale.png"
    },
    {
        id: 357,
        name: "Nether Shawl",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/nether_shawl.png"
    },
    {
        id: 356,
        name: "Trusty Shovel",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/trusty_shovel.png"
    },
    {
        id: 355,
        name: "Broom Handle",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/broom_handle.png"
    },
    {
        id: 354,
        name: "Ocean Heart",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ocean_heart.png"
    },
    {
        id: 349,
        name: "Arcane Ring",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/arcane_ring.png"
    },
    {
        id: 336,
        name: "Telescope",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/spy_gadget.png"
    },
    {
        id: 335,
        name: "Flicker",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/flicker.png"
    },
    {
        id: 334,
        name: "Imp Claw",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/imp_claw.png"
    },
    {
        id: 331,
        name: "Vambrace",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/vambrace.png"
    },
    {
        id: 330,
        name: "Witless Shako",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/witless_shako.png"
    },
    {
        id: 328,
        name: "Mango Tree",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mango_tree.png"
    },
    {
        id: 327,
        name: "Helm of the Undying",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/helm_of_the_undying.png"
    },
    {
        id: 326,
        name: "Spider Legs",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/spider_legs.png"
    },
    {
        id: 325,
        name: "Prince's Knife",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/princes_knife.png"
    },
    {
        id: 317,
        name: "Recipe: Fallen Sky",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 313,
        name: "Fusion Rune",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/fusion_rune.png"
    },
    {
        id: 312,
        name: "Horizon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/horizon.png"
    },
    {
        id: 311,
        name: "Spell Prism",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/spell_prism.png"
    },
    {
        id: 310,
        name: "Third Eye",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/third_eye.png"
    },
    {
        id: 309,
        name: "Mind Breaker",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mind_breaker.png"
    },
    {
        id: 308,
        name: "Repair Kit",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/repair_kit.png"
    },
    {
        id: 307,
        name: "Tome of Aghanim",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tome_of_aghanim.png"
    },
    {
        id: 306,
        name: "Pupil's Gift",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/pupils_gift.png"
    },
    {
        id: 305,
        name: "Royal Jelly",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/royal_jelly.png"
    },
    {
        id: 304,
        name: "Ironwood Tree",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ironwood_tree.png"
    },
    {
        id: 303,
        name: "Ironwood Tree Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 302,
        name: "Elixir",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/elixer.png"
    },
    {
        id: 301,
        name: "Mirror Shield",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mirror_shield.png"
    },
    {
        id: 300,
        name: "Timeless Relic",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/timeless_relic.png"
    },
    {
        id: 299,
        name: "Greater Faerie Fire",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/greater_faerie_fire.png"
    },
    {
        id: 298,
        name: "Craggy Coat",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/craggy_coat.png"
    },
    {
        id: 297,
        name: "Vampire Fangs",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/vampire_fangs.png"
    },
    {
        id: 295,
        name: "Greater Mango",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/greater_mango.png"
    },
    {
        id: 294,
        name: "Seer Stone",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/seer_stone.png"
    },
    {
        id: 293,
        name: "Phoenix Ash",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/phoenix_ash.png"
    },
    {
        id: 292,
        name: "Stygian Desolator",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/desolator_2.png"
    },
    {
        id: 291,
        name: "Force Boots",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/force_boots.png"
    },
    {
        id: 290,
        name: "Philosopher's Stone",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/philosophers_stone.png"
    },
    {
        id: 289,
        name: "Quickening Charm",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/quickening_charm.png"
    },
    {
        id: 288,
        name: "Grove Bow",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/grove_bow.png"
    },
    {
        id: 287,
        name: "Keen Optic",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/keen_optic.png"
    },
    {
        id: 286,
        name: "Flying Courier",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/flying_courier.png"
    },
    {
        id: 279,
        name: "Ring of Tarrasque",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ring_of_tarrasque.png"
    },
    {
        id: 277,
        name: "Yasha and Kaya",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/yasha_and_kaya.png"
    },
    {
        id: 276,
        name: "",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/combo_breaker.png"
    },
    {
        id: 275,
        name: "Trident Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 273,
        name: "Kaya and Sange",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/kaya_and_sange.png"
    },
    {
        id: 271,
        name: "Aghanim's Blessing",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ultimate_scepter_2.png"
    },
    {
        id: 270,
        name: "Aghanim's Blessing Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 269,
        name: "Holy Locket",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/holy_locket.png"
    },
    {
        id: 268,
        name: "Holy Locket Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 267,
        name: "Spirit Vessel",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/spirit_vessel.png"
    },
    {
        id: 266,
        name: "Spirit Vessel Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 265,
        name: "Infused Raindrops",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/infused_raindrop.png"
    },
    {
        id: 263,
        name: "Hurricane Pike",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/hurricane_pike.png"
    },
    {
        id: 262,
        name: "Hurricane Pike Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 261,
        name: "Crown",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/crown.png"
    },
    {
        id: 260,
        name: "Refresher Shard",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/refresher_shard.png"
    },
    {
        id: 259,
        name: "Kaya",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/kaya.png"
    },
    {
        id: 258,
        name: "Kaya Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 257,
        name: "Tome of Knowledge",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tome_of_knowledge.png"
    },
    {
        id: 256,
        name: "Aeon Disk",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/aeon_disk.png"
    },
    {
        id: 255,
        name: "Aeon Disk Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 254,
        name: "Glimmer Cape",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/glimmer_cape.png"
    },
    {
        id: 253,
        name: "Glimmer Cape Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 252,
        name: "Echo Sabre",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/echo_sabre.png"
    },
    {
        id: 250,
        name: "Bloodthorn",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/bloodthorn.png"
    },
    {
        id: 249,
        name: "Silver Edge",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/silver_edge.png"
    },
    {
        id: 248,
        name: "Silver Edge Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 247,
        name: "Moon Shard",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/moon_shard.png"
    },
    {
        id: 245,
        name: "Bloodthorn Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 244,
        name: "Wind Lace",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/wind_lace.png"
    },
    {
        id: 243,
        name: "Crimson Guard Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 242,
        name: "Crimson Guard",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/crimson_guard.png"
    },
    {
        id: 241,
        name: "Tango (Shared)",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tango_single.png"
    },
    {
        id: 240,
        name: "Blight Stone",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/blight_stone.png"
    },
    {
        id: 239,
        name: "Iron Talon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/iron_talon.png"
    },
    {
        id: 238,
        name: "Iron Talon Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png?3"
    },
    {
        id: 237,
        name: "Faerie Fire",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/faerie_fire.png"
    },
    {
        id: 236,
        name: "Dragon Lance",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dragon_lance.png"
    },
    {
        id: 235,
        name: "Octarine Core",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/octarine_core.png"
    },
    {
        id: 234,
        name: "Dragon Lance Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 233,
        name: "Aether Lens Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 232,
        name: "Aether Lens",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/aether_lens.png"
    },
    {
        id: 231,
        name: "Guardian Greaves",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/guardian_greaves.png"
    },
    {
        id: 230,
        name: "Guardian Greaves Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 229,
        name: "Solar Crest",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/solar_crest.png"
    },
    {
        id: 228,
        name: "Octarine Core Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 227,
        name: "Solar Crest Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 226,
        name: "Lotus Orb",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/lotus_orb.png"
    },
    {
        id: 225,
        name: "Nullifier",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/nullifier.png"
    },
    {
        id: 223,
        name: "Meteor Hammer",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/meteor_hammer.png"
    },
    {
        id: 222,
        name: "Meteor Hammer Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 221,
        name: "",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 220,
        name: "Boots of Travel 2",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/travel_boots_2.png"
    },
    {
        id: 218,
        name: "Observer and Sentry Wards",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ward_dispenser.png"
    },
    {
        id: 216,
        name: "Enchanted Mango",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/enchanted_mango.png"
    },
    {
        id: 215,
        name: "Shadow Amulet",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/shadow_amulet.png"
    },
    {
        id: 214,
        name: "Tranquil Boots",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tranquil_boots.png"
    },
    {
        id: 212,
        name: "Ring of Aquila",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ring_of_aquila.png"
    },
    {
        id: 210,
        name: "Heaven's Halberd",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/heavens_halberd.png"
    },
    {
        id: 209,
        name: "Heaven's Halberd Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 208,
        name: "Abyssal Blade",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/abyssal_blade.png"
    },
    {
        id: 207,
        name: "Abyssal Blade Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 206,
        name: "Rod of Atos",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/rod_of_atos.png"
    },
    {
        id: 205,
        name: "Rod of Atos Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 204,
        name: "Dagon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dagon_5.png"
    },
    {
        id: 203,
        name: "Dagon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dagon_4.png"
    },
    {
        id: 202,
        name: "Dagon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dagon_3.png"
    },
    {
        id: 201,
        name: "Dagon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dagon_2.png"
    },
    {
        id: 196,
        name: "Diffusal Blade",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/diffusal_blade_2.png?3"
    },
    {
        id: 194,
        name: "Necronomicon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/necronomicon_3.png"
    },
    {
        id: 193,
        name: "Necronomicon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/necronomicon_2.png"
    },
    {
        id: 190,
        name: "Veil of Discord",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/veil_of_discord.png"
    },
    {
        id: 189,
        name: "Veil of Discord Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 188,
        name: "Smoke of Deceit",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/smoke_of_deceit.png"
    },
    {
        id: 187,
        name: "Medallion of Courage",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/medallion_of_courage.png"
    },
    {
        id: 185,
        name: "Drum of Endurance",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ancient_janggo.png"
    },
    {
        id: 184,
        name: "Drum of Endurance Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 182,
        name: "Stout Shield",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/stout_shield.png"
    },
    {
        id: 181,
        name: "Orb of Venom",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/orb_of_venom.png"
    },
    {
        id: 180,
        name: "Arcane Boots",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/arcane_boots.png"
    },
    {
        id: 178,
        name: "Soul Ring",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/soul_ring.png"
    },
    {
        id: 177,
        name: "Soul Ring Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 176,
        name: "Ethereal Blade",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ethereal_blade.png"
    },
    {
        id: 175,
        name: "Ethereal Blade Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 174,
        name: "Diffusal Blade",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/diffusal_blade.png"
    },
    {
        id: 173,
        name: "Diffusal Blade Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 172,
        name: "Mask of Madness",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mask_of_madness.png"
    },
    {
        id: 170,
        name: "Yasha",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/yasha.png"
    },
    {
        id: 169,
        name: "Yasha Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 168,
        name: "Desolator",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/desolator.png"
    },
    {
        id: 166,
        name: "Maelstrom",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/maelstrom.png"
    },
    {
        id: 164,
        name: "Helm of the Dominator",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/helm_of_the_dominator.png"
    },
    {
        id: 163,
        name: "Helm of the Dominator Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 162,
        name: "Sange",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/sange.png"
    },
    {
        id: 161,
        name: "Sange Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 160,
        name: "Eye of Skadi",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/skadi.png"
    },
    {
        id: 158,
        name: "Mjollnir",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mjollnir.png"
    },
    {
        id: 157,
        name: "Mjollnir Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 156,
        name: "Satanic",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/satanic.png"
    },
    {
        id: 154,
        name: "Sange and Yasha",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/sange_and_yasha.png"
    },
    {
        id: 152,
        name: "Shadow Blade",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/invis_sword.png"
    },
    {
        id: 151,
        name: "Armlet of Mordiggian",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/armlet.png"
    },
    {
        id: 150,
        name: "Armlet of Mordiggian Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 149,
        name: "Crystalys",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/lesser_crit.png"
    },
    {
        id: 148,
        name: "Crystalys Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 147,
        name: "Manta Style",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/manta.png"
    },
    {
        id: 146,
        name: "Manta Style Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 145,
        name: "Battle Fury",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/bfury.png"
    },
    {
        id: 144,
        name: "Battle Fury Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 143,
        name: "Skull Basher",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/basher.png"
    },
    {
        id: 142,
        name: "Skull Basher Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 141,
        name: "Daedalus",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/greater_crit.png"
    },
    {
        id: 140,
        name: "Daedalus Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 139,
        name: "Butterfly",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/butterfly.png"
    },
    {
        id: 137,
        name: "Radiance",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/radiance.png"
    },
    {
        id: 135,
        name: "Monkey King Bar",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/monkey_king_bar.png"
    },
    {
        id: 134,
        name: "Monkey King Bar Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 133,
        name: "Divine Rapier",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/rapier.png"
    },
    {
        id: 131,
        name: "Hood of Defiance",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/hood_of_defiance.png"
    },
    {
        id: 129,
        name: "Soul Booster",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/soul_booster.png"
    },
    {
        id: 127,
        name: "Blade Mail",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/blade_mail.png"
    },
    {
        id: 126,
        name: "Blade Mail Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 125,
        name: "Vanguard",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/vanguard.png"
    },
    {
        id: 123,
        name: "Linken's Sphere",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/sphere.png"
    },
    {
        id: 122,
        name: "Linken's Sphere Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 121,
        name: "Bloodstone",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/bloodstone.png"
    },
    {
        id: 120,
        name: "Bloodstone Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 119,
        name: "Shiva's Guard",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/shivas_guard.png"
    },
    {
        id: 118,
        name: "Shiva's Guard Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 117,
        name: "Aegis of the Immortal",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/aegis.png"
    },
    {
        id: 116,
        name: "Black King Bar",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/black_king_bar.png"
    },
    {
        id: 115,
        name: "Black King Bar Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 114,
        name: "Heart of Tarrasque",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/heart.png"
    },
    {
        id: 113,
        name: "Heart of Tarrasque Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 112,
        name: "Assault Cuirass",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/assault.png"
    },
    {
        id: 111,
        name: "Assault Cuirass Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 110,
        name: "Refresher Orb",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/refresher.png"
    },
    {
        id: 109,
        name: "Refresher Orb Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 108,
        name: "Aghanim's Scepter",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ultimate_scepter.png"
    },
    {
        id: 106,
        name: "Necronomicon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/necronomicon.png"
    },
    {
        id: 105,
        name: "Necronomicon Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 104,
        name: "Dagon",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dagon.png"
    },
    {
        id: 103,
        name: "Dagon Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 102,
        name: "Force Staff",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/force_staff.png"
    },
    {
        id: 101,
        name: "Force Staff Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 100,
        name: "Eul's Scepter of Divinity",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/cyclone.png"
    },
    {
        id: 99,
        name: "Eul's Scepter Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 98,
        name: "Orchid Malevolence",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/orchid.png"
    },
    {
        id: 97,
        name: "Orchid Malevolence Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 96,
        name: "Scythe of Vyse",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/sheepstick.png"
    },
    {
        id: 94,
        name: "Headdress",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/headdress.png"
    },
    {
        id: 93,
        name: "Headdress Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 92,
        name: "Urn of Shadows",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/urn_of_shadows.png"
    },
    {
        id: 91,
        name: "Urn of Shadows Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 90,
        name: "Pipe of Insight",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/pipe.png"
    },
    {
        id: 89,
        name: "Pipe of Insight Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 88,
        name: "Ring of Basilius",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ring_of_basilius.png"
    },
    {
        id: 87,
        name: "Ring of Basilius Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 86,
        name: "Buckler",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/buckler.png"
    },
    {
        id: 85,
        name: "Buckler Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 81,
        name: "Vladmir's Offering",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/vladmir.png"
    },
    {
        id: 80,
        name: "Vladmir's Offering Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 79,
        name: "Mekansm",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mekansm.png"
    },
    {
        id: 78,
        name: "Mekansm Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 77,
        name: "Null Talisman",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/null_talisman.png"
    },
    {
        id: 76,
        name: "Null Talisman Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 75,
        name: "Wraith Band",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/wraith_band.png"
    },
    {
        id: 74,
        name: "Wraith Band Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 73,
        name: "Bracer",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/bracer.png"
    },
    {
        id: 72,
        name: "Bracer Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 71,
        name: "Poor Man's Shield",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/poor_mans_shield.png"
    },
    {
        id: 69,
        name: "Perseverance",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/pers.png"
    },
    {
        id: 67,
        name: "Oblivion Staff",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/oblivion_staff.png"
    },
    {
        id: 65,
        name: "Hand of Midas",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/hand_of_midas.png"
    },
    {
        id: 64,
        name: "Hand of Midas Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 63,
        name: "Power Treads",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/power_treads.png"
    },
    {
        id: 61,
        name: "Vitality Booster",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/vitality_booster.png"
    },
    {
        id: 60,
        name: "Point Booster",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/point_booster.png"
    },
    {
        id: 59,
        name: "Energy Booster",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/energy_booster.png"
    },
    {
        id: 58,
        name: "Mystic Staff",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mystic_staff.png"
    },
    {
        id: 57,
        name: "Void Stone",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/void_stone.png"
    },
    {
        id: 56,
        name: "Ring of Health",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ring_of_health.png"
    },
    {
        id: 55,
        name: "Hyperstone",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/hyperstone.png"
    },
    {
        id: 54,
        name: "Sacred Relic",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/relic.png"
    },
    {
        id: 53,
        name: "Reaver",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/reaver.png"
    },
    {
        id: 52,
        name: "Eaglesong",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/eagle.png"
    },
    {
        id: 51,
        name: "Demon Edge",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/demon_edge.png"
    },
    {
        id: 50,
        name: "Phase Boots",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/phase_boots.png"
    },
    {
        id: 48,
        name: "Boots of Travel",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/travel_boots.png"
    },
    {
        id: 47,
        name: "Boots of Travel Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 46,
        name: "Town Portal Scroll",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tpscroll.png"
    },
    {
        id: 45,
        name: "Animal Courier",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/courier.png"
    },
    {
        id: 44,
        name: "Tango",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/tango.png"
    },
    {
        id: 43,
        name: "Sentry Ward",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ward_sentry.png"
    },
    {
        id: 42,
        name: "Observer Ward",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ward_observer.png"
    },
    {
        id: 41,
        name: "Bottle",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/bottle.png"
    },
    {
        id: 40,
        name: "Dust of Appearance",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/dust.png"
    },
    {
        id: 39,
        name: "Healing Salve",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/flask.png"
    },
    {
        id: 38,
        name: "Clarity",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/clarity.png"
    },
    {
        id: 37,
        name: "Ghost Scepter",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ghost.png"
    },
    {
        id: 36,
        name: "Magic Wand",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/magic_wand.png"
    },
    {
        id: 35,
        name: "Magic Wand Recipe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
    },
    {
        id: 34,
        name: "Magic Stick",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/magic_stick.png"
    },
    {
        id: 33,
        name: "Cheese",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/cheese.png"
    },
    {
        id: 32,
        name: "Talisman of Evasion",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/talisman_of_evasion.png"
    },
    {
        id: 31,
        name: "Cloak",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/cloak.png"
    },
    {
        id: 30,
        name: "Gem of True Sight",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/gem.png"
    },
    {
        id: 29,
        name: "Boots of Speed",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/boots.png"
    },
    {
        id: 28,
        name: "Sage's Mask",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/sobi_mask.png"
    },
    {
        id: 27,
        name: "Ring of Regen",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ring_of_regen.png"
    },
    {
        id: 26,
        name: "Morbid Mask",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/lifesteal.png"
    },
    {
        id: 25,
        name: "Gloves of Haste",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/gloves.png"
    },
    {
        id: 24,
        name: "Ultimate Orb",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ultimate_orb.png"
    },
    {
        id: 23,
        name: "Staff of Wizardry",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/staff_of_wizardry.png"
    },
    {
        id: 22,
        name: "Blade of Alacrity",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/blade_of_alacrity.png"
    },
    {
        id: 21,
        name: "Ogre Axe",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ogre_axe.png"
    },
    {
        id: 20,
        name: "Circlet",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/circlet.png"
    },
    {
        id: 19,
        name: "Robe of the Magi",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/robe.png"
    },
    {
        id: 18,
        name: "Band of Elvenskin",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/boots_of_elves.png"
    },
    {
        id: 17,
        name: "Belt of Strength",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/belt_of_strength.png"
    },
    {
        id: 16,
        name: "Iron Branch",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/branches.png"
    },
    {
        id: 15,
        name: "Mantle of Intelligence",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mantle.png"
    },
    {
        id: 14,
        name: "Slippers of Agility",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/slippers.png"
    },
    {
        id: 13,
        name: "Gauntlets of Strength",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/gauntlets.png"
    },
    {
        id: 12,
        name: "Ring of Protection",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ring_of_protection.png"
    },
    {
        id: 11,
        name: "Quelling Blade",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/quelling_blade.png"
    },
    {
        id: 10,
        name: "Quarterstaff",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/quarterstaff.png"
    },
    {
        id: 9,
        name: "Platemail",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/platemail.png"
    },
    {
        id: 8,
        name: "Mithril Hammer",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/mithril_hammer.png"
    },
    {
        id: 7,
        name: "Javelin",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/javelin.png"
    },
    {
        id: 6,
        name: "Helm of Iron Will",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/helm_of_iron_will.png"
    },
    {
        id: 5,
        name: "Claymore",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/claymore.png"
    },
    {
        id: 4,
        name: "Chainmail",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/chainmail.png"
    },
    {
        id: 3,
        name: "Broadsword",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/broadsword.png"
    },
    {
        id: 2,
        name: "Blades of Attack",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/blades_of_attack.png"
    },
    {
        id: 1,
        name: "Blink Dagger",
        img: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/blink.png"
    },
    {
        id: 0,
        name: "Empty",
        img: "https://sshuvscqhguullfguoct.supabase.co/storage/v1/object/public/images/empty-slot.webp?t=2024-01-05T22%3A27%3A45.243Z"
    }
]

items.forEach(item => itemMap.set(item.id, item));

export { itemMap };
