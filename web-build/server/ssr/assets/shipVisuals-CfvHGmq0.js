//#region app/gameData.ts
var DECK_LEVELS = {
	1: {
		name: "Eichendeck",
		cost: 0,
		weaponSlots: 12,
		expansionSlots: 6,
		hpBonus: 0,
		shieldBonus: 0,
		color: "#c89553"
	},
	2: {
		name: "Verstärktes Deck",
		cost: 1400,
		weaponSlots: 16,
		expansionSlots: 8,
		hpBonus: .06,
		shieldBonus: .05,
		color: "#e0a55f"
	},
	3: {
		name: "Veteranendeck",
		cost: 2600,
		weaponSlots: 20,
		expansionSlots: 10,
		hpBonus: .12,
		shieldBonus: .1,
		color: "#d66b4e"
	},
	4: {
		name: "Königsdeck",
		cost: 4300,
		weaponSlots: 24,
		expansionSlots: 12,
		hpBonus: .19,
		shieldBonus: .17,
		color: "#f0cf67"
	},
	5: {
		name: "Tiefendeck",
		cost: 6800,
		weaponSlots: 28,
		expansionSlots: 15,
		hpBonus: .27,
		shieldBonus: .26,
		color: "#68ddd7"
	},
	6: {
		name: "Dominion-Deck",
		cost: 9800,
		weaponSlots: 32,
		expansionSlots: 18,
		hpBonus: .36,
		shieldBonus: .36,
		color: "#b68bff"
	}
};
var AMMO = {
	iron: {
		name: "Eisenkugeln",
		short: "EISEN",
		damage: 72,
		reload: 1.15,
		range: 540,
		color: "#f0dfbc",
		effect: "Zuverlässige Standardmunition"
	},
	piercing: {
		name: "Panzerbrecher",
		short: "PANZER",
		damage: 98,
		reload: 1.5,
		range: 525,
		color: "#a8f0ef",
		effect: "+35 % gegen gepanzerte Ziele"
	},
	fire: {
		name: "Brandmunition",
		short: "BRAND",
		damage: 84,
		reload: 1.35,
		range: 510,
		color: "#ff944d",
		effect: "Entzündet das Ziel"
	},
	frost: {
		name: "Frostmunition",
		short: "FROST",
		damage: 63,
		reload: 1.1,
		range: 560,
		color: "#77dfff",
		effect: "Verlangsamt Gegner"
	},
	harpoon: {
		name: "Tiefenharpune",
		short: "HARPUNE",
		damage: 105,
		reload: 1.45,
		range: 450,
		color: "#d77cff",
		effect: "Wirksam gegen Seeungeheuer"
	}
};
var SHIPS = {
	sovereign: {
		name: "Sovereign-Fregatte",
		role: "Ausgeglichen",
		price: 0,
		level: 1,
		hp: 1250,
		shield: 350,
		speed: 180,
		turn: 1.85,
		damage: 1,
		color: "#d9a247",
		description: "Vielseitiges Flaggschiff für Jagd, Missionen und Monsterkampf."
	},
	tempest: {
		name: "Sturmsegler",
		role: "Jäger",
		price: 1800,
		level: 1,
		hp: 920,
		shield: 260,
		speed: 238,
		turn: 2.45,
		damage: .92,
		color: "#55d5cf",
		description: "Schmaler Korsarenrumpf, Lateinersegel und extreme Wendigkeit."
	},
	ironclad: {
		name: "Eisenkrone",
		role: "Breitseiten-Tank",
		price: 6800,
		level: 2,
		hp: 2050,
		shield: 420,
		speed: 138,
		turn: 1.35,
		damage: 1.22,
		color: "#dc7a45",
		description: "Breiter Panzerkiel, drei Masten und eine gewaltige Geschützlinie."
	},
	arcanum: {
		name: "Arkanum der Tiefe",
		role: "Relikt-Kreuzer",
		price: 11800,
		level: 3,
		hp: 1450,
		shield: 820,
		speed: 172,
		turn: 1.72,
		damage: 1.16,
		color: "#9b7cff",
		description: "Geteilter Reliktrumpf, leuchtende Segel und kontrollierte Distanzangriffe."
	}
};
var CANNONS = {
	bronze: {
		name: "Bronze-Breitseiten",
		price: 0,
		level: 1,
		damage: 1,
		reload: 1,
		range: 1,
		color: "#d6ab62",
		description: "Zuverlässige Standardkanonen ohne Schwäche."
	},
	storm: {
		name: "Sturmfeuer-Batterie",
		price: 1400,
		level: 1,
		damage: .82,
		reload: .68,
		range: .94,
		color: "#5fe3e1",
		description: "Schnelle Salven mit hohem Munitionsverbrauch."
	},
	siege: {
		name: "Belagerungsgeschütze",
		price: 5200,
		level: 2,
		damage: 1.55,
		reload: 1.42,
		range: 1.08,
		color: "#ff8a55",
		description: "Gewaltige Treffer, aber deutlich längere Nachladezeit."
	},
	abyssal: {
		name: "Abyssale Langrohre",
		price: 9500,
		level: 3,
		damage: 1.26,
		reload: 1.08,
		range: 1.32,
		color: "#b58aff",
		description: "Große Reichweite und Reliktenergie für Elitejagden."
	}
};
var MAPS = {
	aster: {
		id: "aster",
		name: "Azurwacht",
		sector: "1-A",
		danger: 1,
		recommended: 1,
		width: 3e3,
		height: 1900,
		color: ["#2ec8d8", "#0a6d82"],
		weather: "clear",
		islands: [
			{
				x: 410,
				y: 900,
				rx: 210,
				ry: 135,
				name: "Hafen Aster",
				port: true
			},
			{
				x: 1200,
				y: 370,
				rx: 170,
				ry: 95,
				name: "Glasriff"
			},
			{
				x: 2050,
				y: 1260,
				rx: 230,
				ry: 135,
				name: "Sonnenruh"
			},
			{
				x: 2580,
				y: 480,
				rx: 145,
				ry: 90,
				name: "Wachtklippe"
			}
		],
		enemies: [
			{
				kind: "raider",
				x: 1050,
				y: 1040
			},
			{
				kind: "scout",
				x: 1540,
				y: 650
			},
			{
				kind: "escort",
				x: 2050,
				y: 550
			},
			{
				kind: "raider",
				x: 2450,
				y: 1450
			},
			{
				kind: "serpent",
				x: 1590,
				y: 1450
			}
		]
	},
	gloam: {
		id: "gloam",
		name: "Dämmersee",
		sector: "2-C",
		danger: 2,
		recommended: 3,
		width: 3400,
		height: 2100,
		color: ["#1f9aab", "#0a4f62"],
		weather: "rain",
		islands: [
			{
				x: 390,
				y: 1050,
				rx: 195,
				ry: 120,
				name: "Dämmerhafen",
				port: true
			},
			{
				x: 1350,
				y: 390,
				rx: 240,
				ry: 120,
				name: "Kräheninsel"
			},
			{
				x: 2180,
				y: 1390,
				rx: 180,
				ry: 105,
				name: "Flüsterzahn"
			},
			{
				x: 2920,
				y: 650,
				rx: 230,
				ry: 150,
				name: "Ruinenhort"
			}
		],
		enemies: [
			{
				kind: "scout",
				x: 970,
				y: 780
			},
			{
				kind: "escort",
				x: 1600,
				y: 1150
			},
			{
				kind: "frigate",
				x: 2450,
				y: 420
			},
			{
				kind: "ghost",
				x: 2760,
				y: 1590
			},
			{
				kind: "kraken",
				x: 1750,
				y: 1740
			},
			{
				kind: "elite",
				x: 3040,
				y: 1160
			}
		]
	},
	coral: {
		id: "coral",
		name: "Korallenmark",
		sector: "3-B",
		danger: 3,
		recommended: 4,
		width: 3600,
		height: 2200,
		color: ["#34d0dc", "#0c7a8e"],
		weather: "clear",
		islands: [
			{
				x: 420,
				y: 1100,
				rx: 220,
				ry: 135,
				name: "Perlenkai",
				port: true
			},
			{
				x: 1280,
				y: 480,
				rx: 270,
				ry: 135,
				name: "Papageienkrone"
			},
			{
				x: 2250,
				y: 1510,
				rx: 250,
				ry: 155,
				name: "Smaragdatoll"
			},
			{
				x: 3020,
				y: 620,
				rx: 205,
				ry: 120,
				name: "Sonnenzahn"
			},
			{
				x: 3190,
				y: 1760,
				rx: 145,
				ry: 90,
				name: "Mojo-Riff"
			}
		],
		enemies: [
			{
				kind: "escort",
				x: 1060,
				y: 1320
			},
			{
				kind: "scout",
				x: 1580,
				y: 810
			},
			{
				kind: "frigate",
				x: 2350,
				y: 700
			},
			{
				kind: "serpent",
				x: 1910,
				y: 1760
			},
			{
				kind: "kraken",
				x: 3040,
				y: 1370
			},
			{
				kind: "elite",
				x: 3260,
				y: 920
			}
		]
	},
	maelstrom: {
		id: "maelstrom",
		name: "Sturmbruch",
		sector: "4-F",
		danger: 4,
		recommended: 6,
		width: 3600,
		height: 2300,
		color: ["#1a7f92", "#083a50"],
		weather: "storm",
		islands: [
			{
				x: 430,
				y: 1150,
				rx: 205,
				ry: 125,
				name: "Bollwerk Nox",
				port: true
			},
			{
				x: 1380,
				y: 550,
				rx: 160,
				ry: 100,
				name: "Donnergrat"
			},
			{
				x: 2300,
				y: 1660,
				rx: 250,
				ry: 140,
				name: "Geborstene Krone"
			},
			{
				x: 3180,
				y: 590,
				rx: 180,
				ry: 110,
				name: "Exilklippe"
			}
		],
		enemies: [
			{
				kind: "frigate",
				x: 1120,
				y: 1350
			},
			{
				kind: "ghost",
				x: 1700,
				y: 920
			},
			{
				kind: "elite",
				x: 2450,
				y: 680
			},
			{
				kind: "leviathan",
				x: 1850,
				y: 1880
			},
			{
				kind: "kraken",
				x: 3030,
				y: 1550
			},
			{
				kind: "elite",
				x: 3240,
				y: 1040
			}
		]
	},
	abyss: {
		id: "abyss",
		name: "Abyssale Prüfung",
		sector: "BOSS",
		danger: 5,
		recommended: 7,
		width: 2800,
		height: 1800,
		color: ["#283b62", "#100e2d"],
		weather: "void",
		islands: [{
			x: 340,
			y: 900,
			rx: 160,
			ry: 105,
			name: "Rückkehrsiegel",
			port: true
		}, {
			x: 1400,
			y: 900,
			rx: 95,
			ry: 60,
			name: "Auge der Tiefe"
		}],
		enemies: [
			{
				kind: "ghost",
				x: 1050,
				y: 560
			},
			{
				kind: "frigate",
				x: 1080,
				y: 1280
			},
			{
				kind: "elite",
				x: 1900,
				y: 520
			},
			{
				kind: "leviathan",
				x: 2050,
				y: 1250
			}
		]
	}
};
var ENTITY_DATA = {
	raider: {
		name: "Scherben-Plünderer",
		level: 1,
		hp: 300,
		speed: 52,
		damage: 38,
		range: 410,
		reward: 320
	},
	scout: {
		name: "Nox-Kundschafter",
		level: 2,
		hp: 350,
		speed: 68,
		damage: 34,
		range: 430,
		reward: 390
	},
	escort: {
		name: "Kupfer-Eskorte",
		level: 3,
		hp: 520,
		speed: 43,
		damage: 52,
		range: 450,
		reward: 520
	},
	frigate: {
		name: "Schwere Dämmerfregatte",
		level: 5,
		hp: 850,
		speed: 34,
		damage: 72,
		range: 480,
		reward: 780,
		armored: true
	},
	ghost: {
		name: "Geisterbarke",
		level: 5,
		hp: 620,
		speed: 46,
		damage: 64,
		range: 470,
		reward: 720
	},
	elite: {
		name: "Elitekapitän Veyra",
		level: 7,
		hp: 1350,
		speed: 38,
		damage: 88,
		range: 510,
		reward: 1400,
		boss: true,
		armored: true
	},
	kraken: {
		name: "Tiefenkrake",
		level: 5,
		hp: 1250,
		speed: 28,
		damage: 74,
		range: 360,
		reward: 1100,
		monster: true
	},
	serpent: {
		name: "Smaragd-Seeschlange",
		level: 3,
		hp: 680,
		speed: 76,
		damage: 50,
		range: 300,
		reward: 690,
		monster: true
	},
	leviathan: {
		name: "Panzerleviathan",
		level: 8,
		hp: 2100,
		speed: 24,
		damage: 105,
		range: 390,
		reward: 1900,
		monster: true,
		boss: true,
		armored: true
	},
	boss: {
		name: "Abyssfürst Kharon",
		level: 10,
		hp: 3400,
		speed: 31,
		damage: 125,
		range: 520,
		reward: 3500,
		monster: true,
		boss: true,
		armored: true
	}
};
var QUESTS = [
	{
		id: "first-blood",
		title: "Rote Segel",
		text: "Versenke 3 feindliche Schiffe.",
		type: "ships",
		goal: 3,
		reward: "900 Gold · 250 XP"
	},
	{
		id: "deep-hunt",
		title: "Ruf aus der Tiefe",
		text: "Erlege 2 Seeungeheuer mit Harpunen.",
		type: "monsters",
		goal: 2,
		reward: "40 Perlen · 350 XP"
	},
	{
		id: "salvager",
		title: "Bergungsrecht",
		text: "Sammle 5 Beutekisten oder Wrackteile.",
		type: "loot",
		goal: 5,
		reward: "1.200 Gold · 3 Panzerbrecher"
	},
	{
		id: "storm-vanguard",
		title: "Vorhut im Sturm",
		text: "Besiege einen Elitekapitän.",
		type: "elite",
		goal: 1,
		reward: "75 Perlen · Reliktfragment"
	},
	{
		id: "cartographer",
		title: "Jenseits des Horizonts",
		text: "Besuche drei verschiedene Seekarten.",
		type: "maps",
		goal: 3,
		reward: "1.500 Gold · Schatzteil"
	},
	{
		id: "shipwright",
		title: "Eine neue Silhouette",
		text: "Erwirb ein weiteres Schiff in der Werft.",
		type: "ships-owned",
		goal: 1,
		reward: "2.000 Gold · 5 Tiefenperlen"
	},
	{
		id: "ritualist",
		title: "Stimme des Kessels",
		text: "Vollziehe fünf Gezeitenrituale.",
		type: "rituals",
		goal: 5,
		reward: "1 Kartenfragment · 350 XP"
	},
	{
		id: "refit",
		title: "Kapitän der Werft",
		text: "Baue drei Schiffssysteme aus.",
		type: "upgrades",
		goal: 3,
		reward: "200 XP · Werftrang I"
	}
];
//#endregion
//#region app/generated/buildInfo.ts
var BUILD_RELEASE = "V20.2.10";
var BUILD_COMMIT = "ebefe3e";
//#endregion
//#region app/game/platform/detection.ts
function detectPlatform() {
	if (typeof window === "undefined") return {
		platform: "web-desktop",
		touch: false,
		coarsePointer: false,
		reducedMotion: false,
		deviceMemoryGb: null,
		logicalCores: 4
	};
	const touch = navigator.maxTouchPoints > 0;
	const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
	return {
		platform: touch || coarsePointer ? "web-mobile" : "web-desktop",
		touch,
		coarsePointer,
		reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
		deviceMemoryGb: navigator.deviceMemory ?? null,
		logicalCores: navigator.hardwareConcurrency || 4
	};
}
//#endregion
//#region app/game/quality/qualityProfiles.ts
var QUALITY_PROFILES = {
	LOW: {
		id: "LOW",
		renderScale: .75,
		shadows: false,
		shadowMapSize: 512,
		particles: .35,
		waterSegments: 42,
		reflections: false,
		postProcessing: false,
		viewDistance: .7,
		lodBias: 1.8,
		effectComplexity: .4,
		textureQuality: .5,
		worldPropDensity: .55
	},
	MEDIUM: {
		id: "MEDIUM",
		renderScale: 1,
		shadows: true,
		shadowMapSize: 1024,
		particles: .65,
		waterSegments: 64,
		reflections: false,
		postProcessing: false,
		viewDistance: .85,
		lodBias: 1.25,
		effectComplexity: .7,
		textureQuality: .75,
		worldPropDensity: .82
	},
	HIGH: {
		id: "HIGH",
		renderScale: 1.25,
		shadows: true,
		shadowMapSize: 1536,
		particles: 1,
		waterSegments: 96,
		reflections: true,
		postProcessing: true,
		viewDistance: 1,
		lodBias: 1,
		effectComplexity: 1,
		textureQuality: 1,
		worldPropDensity: 1
	},
	ULTRA: {
		id: "ULTRA",
		renderScale: 1.6,
		shadows: true,
		shadowMapSize: 2048,
		particles: 1.35,
		waterSegments: 128,
		reflections: true,
		postProcessing: true,
		viewDistance: 1.2,
		lodBias: .7,
		effectComplexity: 1.25,
		textureQuality: 1,
		worldPropDensity: 1.18
	}
};
var STORAGE_KEY = "abyssal-quality-profile";
function recommendedQuality() {
	const platform = detectPlatform();
	if (platform.platform === "web-mobile") {
		if ((platform.deviceMemoryGb ?? 4) <= 4 || platform.logicalCores <= 4) return "LOW";
		return "MEDIUM";
	}
	if ((platform.deviceMemoryGb ?? 8) >= 12 && platform.logicalCores >= 8) return "ULTRA";
	return "HIGH";
}
function resolveQuality(preference) {
	return QUALITY_PROFILES[preference === "AUTO" ? recommendedQuality() : preference];
}
function loadQualityPreference() {
	if (typeof localStorage === "undefined") return "AUTO";
	const value = localStorage.getItem(STORAGE_KEY);
	return value === "LOW" || value === "MEDIUM" || value === "HIGH" || value === "ULTRA" ? value : "AUTO";
}
function saveQualityPreference(preference) {
	localStorage.setItem(STORAGE_KEY, preference);
}
//#endregion
//#region app/game/camera/cameraPolicy.ts
/**
* Binding presentation contract for every Abyssal Dominion client.
*
* The renderer is genuinely 3D, while navigation, targeting and combat remain
* on the horizontal X/Z water plane. No user-controlled orbit or third-person
* chase camera is part of the game action contract.
*/
var GAMEPLAY_CAMERA_POLICY = {
	gameplayPlane: "XZ",
	waterLevel: 0,
	projection: "fixed-oblique-perspective",
	fieldOfViewDegrees: 35,
	minZoom: .55,
	maxZoom: 1.38,
	baseHeight: 660,
	minHeight: 500,
	maxHeight: 1180,
	baseBackDistance: 360,
	minBackDistance: 240,
	maxBackDistance: 680,
	fixedLateralRatio: -.16,
	targetOffsetX: 24,
	targetOffsetZ: -72,
	bossOverviewMultiplier: 1.3,
	eventOverviewMultiplier: 1.14,
	followSmoothing: .09,
	maxShake: 7,
	playerOrbitEnabled: false,
	thirdPersonChaseEnabled: false
};
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function resolveCameraPresentation(situation) {
	const policy = GAMEPLAY_CAMERA_POLICY;
	const zoom = clamp(situation.zoom, policy.minZoom, policy.maxZoom);
	const overview = situation.bossSelected ? policy.bossOverviewMultiplier : situation.mapId === "abyss" ? policy.eventOverviewMultiplier : 1;
	return {
		zoom,
		overview,
		height: clamp(policy.baseHeight / zoom, policy.minHeight, policy.maxHeight) * overview,
		backDistance: clamp(policy.baseBackDistance / zoom, policy.minBackDistance, policy.maxBackDistance) * overview
	};
}
var KRAKEN_PLAYER_VISUAL = {
	id: "kraken-player-30k",
	assetPath: "/assets/3d/ships/player/kraken/Kraken_ship_player_30k.glb",
	scale: 65,
	rotationOffsetY: Math.PI / 2,
	waterlineOffset: 22,
	wakeOffset: {
		forward: -62,
		lateral: 0
	},
	cannonOffsets: {
		port: [
			{
				forward: -18,
				lateral: 17,
				height: 10
			},
			{
				forward: 0,
				lateral: 17,
				height: 10
			},
			{
				forward: 18,
				lateral: 17,
				height: 10
			}
		],
		starboard: [
			{
				forward: -18,
				lateral: -17,
				height: 10
			},
			{
				forward: 0,
				lateral: -17,
				height: 10
			},
			{
				forward: 18,
				lateral: -17,
				height: 10
			}
		],
		bow: {
			forward: 45,
			lateral: 0,
			height: 9
		}
	},
	shadow: {
		cast: true,
		receive: true
	}
};
/**
* V20.1 is a visual integration test: the Kraken replaces the visual of the
* currently selected player ship, while the selected ShipId continues to own
* all gameplay stats and save data. Keep every current player id routed to the
* same visual definition until a later skin/LOD system is introduced.
*/
var PLAYER_SHIP_VISUALS = {
	sovereign: KRAKEN_PLAYER_VISUAL,
	tempest: KRAKEN_PLAYER_VISUAL,
	ironclad: KRAKEN_PLAYER_VISUAL,
	arcanum: KRAKEN_PLAYER_VISUAL
};
function validateShipVisualDefinition(definition) {
	return definition.assetPath.endsWith(".glb") && Number.isFinite(definition.scale) && definition.scale > 0 && Number.isFinite(definition.rotationOffsetY) && Number.isFinite(definition.waterlineOffset) && Number.isFinite(definition.wakeOffset.forward) && Number.isFinite(definition.wakeOffset.lateral);
}
function worldOffset(origin, heading, offset) {
	return {
		x: origin.x + Math.cos(heading) * offset.forward - Math.sin(heading) * offset.lateral,
		y: origin.y + Math.sin(heading) * offset.forward + Math.cos(heading) * offset.lateral
	};
}
//#endregion
export { SHIPS as _, resolveCameraPresentation as a, saveQualityPreference as c, AMMO as d, CANNONS as f, QUESTS as g, MAPS as h, GAMEPLAY_CAMERA_POLICY as i, BUILD_COMMIT as l, ENTITY_DATA as m, validateShipVisualDefinition as n, loadQualityPreference as o, DECK_LEVELS as p, worldOffset as r, resolveQuality as s, PLAYER_SHIP_VISUALS as t, BUILD_RELEASE as u };
