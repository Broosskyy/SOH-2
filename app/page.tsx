"use client";
/* eslint-disable react-hooks/refs -- the realtime canvas state intentionally lives outside React rendering */
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AMMO, CANNONS, DECK_LEVELS, ENTITY_DATA, MAPS, QUESTS, SHIPS, type AmmoId, type CannonId, type EntityKind, type MapId, type ShipId } from "./gameData";
import { loadSave, migrateSave, resetSave, writeSave, type SaveGame } from "./saveGame";
import { clamp, distance as dist, normalizeAngle as angleNorm } from "./game/core/math";
import { createRuntimeState, deckData, durability, freshSave, MONSTER_KINDS, spawnMap } from "./game/core/state";
import type { Entity, Panel, ThreeRendererHandle, Toast } from "./game/core/types";
import { BUILD_COMMIT, BUILD_RELEASE } from "./generated/buildInfo";
import { CONTINUOUS_ACTIONS, resolveKeyboardAction, type GameAction } from "./game/input/actions";
import { loadQualityPreference, saveQualityPreference, type QualityPreference } from "./game/quality/qualityProfiles";
import { calculateBroadside } from "./game/combat/calculations";
import { purchasePrice, type ShopPurchase } from "./game/economy/pricing";
import { grantMissionReward } from "./game/progression/missionRewards";
import { GAMEPLAY_CAMERA_POLICY } from "./game/camera/cameraPolicy";
import { planNavigationTo, stepShipMovement, createNavigationState } from "./game/navigation/shipMovement";
import {
  loadCameraPanSpeed,
  loadZoomSensitivity,
  resolveCameraPanSpeed,
  resolveZoomSensitivity,
  saveCameraPanSpeed,
  saveZoomSensitivity,
  type CameraPanSpeed,
  type ZoomSensitivity,
} from "./game/settings/cameraSettings";
import { PLAYER_SHIP_VISUALS, worldOffset } from "./game/visuals/shipVisuals";
const SHIP_ART: Record<ShipId, string> = { sovereign: "/assets/sovereign-frigate-v2.webp", tempest: "/assets/tempest-corsair-v2.webp", ironclad: "/assets/iron-crown-v2.webp", arcanum: "/assets/arcanum-depth-v2.webp" };
type LockableOrientation = ScreenOrientation & {
    lock?: (orientation: "landscape") => Promise<void>;
};
type PlayerVisualDeviceStatus = {
    status: "fallback" | "loading" | "kraken-attached" | "kraken-failed";
    activeShipId: ShipId;
    meshCount: number;
    fallbackPresent: boolean;
    playerWorldPosition: { x: number; y: number; z: number };
    visualBoundsCenter?: { x: number; y: number; z: number };
    error?: string;
};
const monsters = MONSTER_KINDS;
export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null), threeCanvasRef = useRef<HTMLCanvasElement>(null), renderer3DRef = useRef<ThreeRendererHandle | null>(null), fileRef = useRef<HTMLInputElement>(null);
    const [ready, setReady] = useState(false), [started, setStarted] = useState(false), [panel, setPanel] = useState<Panel>(null), [death, setDeath] = useState<string | null>(null);
    const [runtimeError, setRuntimeError] = useState(""), [playerVisualStatus, setPlayerVisualStatus] = useState<PlayerVisualDeviceStatus | null>(null);
    const [ammo, setAmmo] = useState<AmmoId>("piercing"), [autoFire, setAutoFire] = useState(false), [toasts, setToasts] = useState<Toast[]>([]), [cooldown, setCooldown] = useState(0), [abilityHud, setAbilityHud] = useState({ surge: 0, aegis: 0, volley: 0 });
    const [qualityPreference, setQualityPreference] = useState<QualityPreference>(() => loadQualityPreference());
    const [cameraPanSpeed, setCameraPanSpeed] = useState<CameraPanSpeed>(() => loadCameraPanSpeed());
    const [zoomSensitivity, setZoomSensitivity] = useState<ZoomSensitivity>(() => loadZoomSensitivity());
    const [ritualing, setRitualing] = useState(false), [ritualResult, setRitualResult] = useState("Der Kessel wartet auf dein erstes Opfer.");
    const [hud, setHud] = useState({ hp: 1250, maxHp: 1250, shield: 350, maxShield: 350, gold: 2600, pearls: 30, level: 1, xp: 0, kills: 0, monsters: 0, loot: 0, mapId: "aster" as MapId, x: 680, y: 900, selected: null as null | {
            name: string;
            level: number;
            hp: number;
            maxHp: number;
            range: number;
            kind: EntityKind;
        }, repairKits: 3, materials: 0, ammo: { ...freshSave().ammo }, cannonLevel: 1, harpoonLevel: 1, shipId: "sovereign" as ShipId, ownedShips: ["sovereign"] as ShipId[], cannonId: "bronze" as CannonId, ownedCannons: ["bronze"] as CannonId[], mojos: 3, mapFragments: 0, cauldronPity: 0, deckLevel: 1, progress: {} as Record<string, number>, completed: [] as string[], visited: ["aster"] as MapId[], wave: 1 });
    const saveRef = useRef<SaveGame>(freshSave()), cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
    const gestureRef = useRef({ points: new Map<number, { x: number; y: number }>(), startDistance: 0, startZoom: 1, pinching: false, moved: false, down: null as null | { id: number; x: number; y: number } });
    const toastTimerRef = useRef<number | null>(null), lastToastRef = useRef({ text: "", at: 0 });
    const gameRef = useRef(createRuntimeState());
    const toast = useCallback((text: string, kind: Toast["kind"] = "info") => { const now = performance.now(); if (lastToastRef.current.text === text && now - lastToastRef.current.at < 900)
        return; lastToastRef.current = { text, at: now }; const id = Date.now() + Math.random(); if (toastTimerRef.current !== null)
        window.clearTimeout(toastTimerRef.current); setToasts([{ id, text, kind }]); toastTimerRef.current = window.setTimeout(() => setToasts([]), kind === "danger" ? 1700 : 1450); }, []);
    const syncSave = useCallback(() => { const g = gameRef.current, s = saveRef.current; Object.assign(s, { hp: Math.ceil(g.player.hp), maxHp: g.player.maxHp, shield: Math.ceil(g.player.shield), maxShield: g.player.maxShield, mapId: g.mapId, ammo: { ...s.ammo }, visited: [...s.visited] }); writeSave(s).catch(() => undefined); }, []);
    const applySave = useCallback((raw: Partial<SaveGame> & {
        version?: number;
    }) => {
        const migrated = migrateSave(raw), base = freshSave(), s: SaveGame = { ...base, ...migrated, ammo: { ...base.ammo, ...migrated.ammo }, shipId: migrated.shipId ?? "sovereign", ownedShips: migrated.ownedShips?.length ? migrated.ownedShips : ["sovereign"], cannonId: migrated.cannonId ?? "bronze", ownedCannons: migrated.ownedCannons?.length ? migrated.ownedCannons : ["bronze"], mojos: migrated.mojos ?? 3, cauldronPity: migrated.cauldronPity ?? 0, mapFragments: migrated.mapFragments ?? 0, lastFreeRitual: migrated.lastFreeRitual ?? "", deckLevel: clamp(migrated.deckLevel ?? 1, 1, 6), hullLevel: clamp(migrated.hullLevel ?? 1, 1, 10), sailLevel: clamp(migrated.sailLevel ?? 1, 1, 10), crewLevel: clamp(migrated.crewLevel ?? 1, 1, 10), talentPoints: Math.max(0, migrated.talentPoints ?? 0) };
        const stats = durability(s.shipId!, s.deckLevel!, s.hullLevel), deck = deckData(s.deckLevel!);
        s.maxHp = stats.hp;
        s.maxShield = stats.shield;
        s.hp = clamp(s.hp || stats.hp, 1, stats.hp);
        s.shield = clamp(s.shield ?? stats.shield, 0, stats.shield);
        saveRef.current = s;
        const g = gameRef.current;
        g.mapId = s.mapId;
        g.shipId = s.shipId!;
        g.playerName = s.playerName;
        g.playerLevel = s.level;
        g.deckLevel = s.deckLevel!;
        g.weaponSlots = deck.weaponSlots;
        g.expansionSlots = deck.expansionSlots;
        g.player = { x: 680, y: MAPS[s.mapId].height / 2, angle: 0, hp: s.hp, maxHp: stats.hp, shield: s.shield, maxShield: stats.shield, speed: 0 };
        g.cameraPan = { x: 0, y: 0 };
        g.entities = spawnMap(s.mapId);
        g.shots = [];
        g.loot = [];
        setHud(h => ({ ...h, hp: s.hp, maxHp: stats.hp, shield: s.shield, maxShield: stats.shield, gold: s.gold, pearls: s.pearls, level: s.level, xp: s.xp, mapId: s.mapId, repairKits: s.repairKits, materials: s.materials, ammo: { ...s.ammo }, cannonLevel: s.cannonLevel, harpoonLevel: s.harpoonLevel, shipId: s.shipId!, ownedShips: [...s.ownedShips!], cannonId: s.cannonId!, ownedCannons: [...s.ownedCannons!], mojos: s.mojos!, mapFragments: s.mapFragments!, cauldronPity: s.cauldronPity!, deckLevel: s.deckLevel!, progress: { ...s.progress }, completed: [...s.completed], visited: [...s.visited] }));
    }, []);
    useEffect(() => { loadSave().then(s => { applySave(s ?? freshSave()); const settings = saveRef.current.settings; if (settings?.cameraPanSpeed) setCameraPanSpeed(settings.cameraPanSpeed); if (settings?.zoomSensitivity) setZoomSensitivity(settings.zoomSensitivity); setReady(true); setAmmo("iron"); if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("autoStart") === "1") window.setTimeout(() => { gameRef.current.running = true; gameRef.current.lastTime = performance.now(); (window as Window & { __ABYSSAL_GAME__?: typeof gameRef.current }).__ABYSSAL_GAME__ = gameRef.current; setStarted(true); }, 300); }); }, [applySave]);
    useEffect(() => { const handler = (event: ErrorEvent) => setRuntimeError(event.message); window.addEventListener("error", handler); return () => window.removeEventListener("error", handler); }, []);
    useEffect(() => { const handler = (event: Event) => setPlayerVisualStatus((event as CustomEvent<PlayerVisualDeviceStatus>).detail);window.addEventListener("abyssal:player-visual-status",handler);const existing=(window as Window&{__ABYSSAL_PLAYER_VISUAL__?:PlayerVisualDeviceStatus}).__ABYSSAL_PLAYER_VISUAL__;if(existing)queueMicrotask(()=>setPlayerVisualStatus(existing));return()=>window.removeEventListener("abyssal:player-visual-status",handler);}, []);
    useEffect(() => { const id = window.setInterval(() => { if (gameRef.current.running)
        syncSave(); }, 10000); return () => window.clearInterval(id); }, [syncSave]);
    const bumpProgress = useCallback((type: string, amount = 1) => { const s = saveRef.current; s.progress[type] = (s.progress[type] || 0) + amount; QUESTS.forEach(q => { if (q.type === type && !s.completed.includes(q.id) && s.progress[type] >= q.goal) {
        s.completed.push(q.id);
        grantMissionReward(s, q.id);
        toast(`Mission abgeschlossen: ${q.title}`, "gold");
    } }); }, [toast]);
    const travel = useCallback((id: MapId) => { const s = saveRef.current; if (id === "gloam" && s.level < 2)
        return toast("Dämmersee wird mit Level 2 freigeschaltet", "danger"); if (id === "coral" && s.level < 3)
        return toast("Korallenmark wird mit Level 3 freigeschaltet", "danger"); if (id === "maelstrom" && s.level < 4)
        return toast("Sturmbruch wird mit Level 4 freigeschaltet", "danger"); if (id === "abyss" && s.level < 5 && (s.mapFragments ?? 0) < 8)
        return toast("Level 5 oder acht Kartenfragmente öffnen die Bonuskarte", "danger"); if (id === "abyss" && s.level < 5) {
        s.mapFragments = Math.max(0, (s.mapFragments ?? 0) - 8);
        toast("Gezeitenkarte zusammengesetzt – Bonusfahrt beginnt!", "gold");
    } const g = gameRef.current; g.mapId = id; g.player.x = 650; g.player.y = MAPS[id].height / 2; g.player.speed = 0; g.cameraPan = { x: 0, y: 0 }; g.destination = null; g.navigation = createNavigationState({ x: g.player.x, y: g.player.y }); g.selectedId = null; g.entities = spawnMap(id); g.shots = []; g.loot = []; g.wave = 1; s.mapId = id; if (!s.visited.includes(id)) {
        s.visited.push(id);
        bumpProgress("maps");
    } setPanel(null); toast(`${MAPS[id].name} betreten`, "gold"); syncSave(); }, [bumpProgress, syncSave, toast]);
    const fire = useCallback(() => { const g = gameRef.current, s = saveRef.current, now = performance.now(); if (!g.running)
        return; const chosen = g.entities.find(e => e.id === g.selectedId && e.hp > 0); if (!chosen)
        return toast("Wähle zuerst ein Ziel", "danger"); const monster = monsters.has(chosen.kind); let active: AmmoId = ammo; if (monster && ammo !== "harpoon")
        active = "harpoon"; if (!monster && ammo === "harpoon")
        active = "iron"; const a = AMMO[active], broadsideStats = calculateBroadside({ ammoId: active, cannonId: s.cannonId ?? "bronze", shipId: s.shipId ?? "sovereign", cannonLevel: s.cannonLevel, harpoonLevel: s.harpoonLevel, crewLevel: s.crewLevel ?? 1, deckLevel: s.deckLevel ?? 1, targetKind: chosen.kind }); if (now - g.lastShot < broadsideStats.reloadMs)
        return; if (s.ammo[active] <= 0) {
        if (active !== "iron") {
            setAmmo("iron");
            toast(`${a.name} leer – Eisenkugeln gewählt`, "danger");
        }
        return;
    } const range = broadsideStats.range, d = dist(g.player, chosen); if (d > range) {
        const ang = Math.atan2(chosen.y - g.player.y, chosen.x - g.player.x);
        const goal = { x: chosen.x - Math.cos(ang) * (range - 60), y: chosen.y - Math.sin(ang) * (range - 60) };
        const planned = planNavigationTo(goal, g.player, MAPS[g.mapId].islands);
        g.destination = planned.destination;
        g.navigation = planned.navigation;
        return toast(`Außer Reichweite · ${Math.round(d)} m · Ziel wird angefahren`);
    } const ang = Math.atan2(chosen.y - g.player.y, chosen.x - g.player.x), count = broadsideStats.projectileCount, damage = broadsideStats.projectileDamage, side = Math.sin(ang - g.player.angle) >= 0 ? 1 : -1, broadside = g.player.angle + side * Math.PI / 2; for (let i = 0; i < count; i++) {
        const spreadIndex = i - (count - 1) / 2, o = spreadIndex * .035, startX = g.player.x + Math.cos(broadside) * 31 + Math.cos(g.player.angle) * spreadIndex * 14, startY = g.player.y + Math.sin(broadside) * 31 + Math.sin(g.player.angle) * spreadIndex * 14;
        g.shots.push({ x: startX, y: startY, vx: Math.cos(ang + o) * 570, vy: Math.sin(ang + o) * 570, ttl: Math.max(1.35, d / 570 + .7), enemy: false, damage, ammo: active, targetId: chosen.id });
    } if (active !== "iron")
        s.ammo[active]--; g.lastShot = now; }, [ammo, toast]);
    const updateCameraPanSpeed = (value: CameraPanSpeed) => { setCameraPanSpeed(value); saveCameraPanSpeed(value); saveRef.current.settings = { ...saveRef.current.settings, cameraPanSpeed: value }; writeSave(saveRef.current).catch(() => undefined); };
    const updateZoomSensitivity = (value: ZoomSensitivity) => { setZoomSensitivity(value); saveZoomSensitivity(value); saveRef.current.settings = { ...saveRef.current.settings, zoomSensitivity: value }; writeSave(saveRef.current).catch(() => undefined); };
    const selectAmmo = (a: AmmoId) => { setAmmo(a); toast(`${AMMO[a].name}: ${AMMO[a].effect}`); };
    const cycleTarget = () => { const g = gameRef.current, alive = g.entities.filter(e => e.hp > 0).sort((a, b) => dist(a, g.player) - dist(b, g.player)); if (!alive.length)
        return toast("Keine Ziele in diesem Gebiet"); const current = alive.findIndex(e => e.id === g.selectedId), next = alive[(current + 1) % alive.length]; g.selectedId = next.id; toast(`${ENTITY_DATA[next.kind].name} erfasst`, "gold"); };
    const repair = () => { const s = saveRef.current, g = gameRef.current; if (!s.repairKits)
        return toast("Keine Reparaturkits", "danger"); if (g.player.hp >= g.player.maxHp)
        return toast("Rumpf ist bereits intakt"); s.repairKits--; g.player.hp = Math.min(g.player.maxHp, g.player.hp + 450); toast("Rumpf um 450 repariert", "gold"); syncSave(); };
    const activateAbility = (ability: "surge" | "aegis" | "volley") => { const g = gameRef.current, s = saveRef.current, now = performance.now(); if (!g.running)
        return; if (ability === "surge") {
        if (now < g.surgeReady)
            return;
        g.surgeUntil = now + 4200 + g.expansionSlots * 70;
        g.surgeReady = now + 15000;
        toast("Sturmsegel gesetzt: Fahrt stark erhöht", "gold");
        return;
    } if (ability === "aegis") {
        if (now < g.aegisReady)
            return;
        if (g.player.shield >= g.player.maxShield)
            return toast("Schutzenergie ist bereits voll");
        if (s.pearls < 6)
            return toast("Benötigt 6 Tiefenperlen", "danger");
        s.pearls -= 6;
        g.player.shield = Math.min(g.player.maxShield, g.player.shield + g.player.maxShield * (.32 + g.expansionSlots * .008));
        g.aegisReady = now + 12000;
        toast("Reliktschild wiederhergestellt", "gold");
        syncSave();
        return;
    } if (now < g.volleyReady)
        return; const target = g.entities.find(e => e.id === g.selectedId && e.hp > 0); if (!target)
        return toast("Wähle ein Ziel für die Streusalve", "danger"); if (s.ammo.iron < 4)
        return toast("Benötigt 4 Eisenkugeln", "danger"); s.ammo.iron -= 4; g.volleyReady = now + 10000; const victims = g.entities.filter(e => e.hp > 0 && dist(e, target) < 260).slice(0, 5); victims.forEach((enemy, i) => { const ang = Math.atan2(enemy.y - g.player.y, enemy.x - g.player.x); g.shots.push({ x: g.player.x + Math.cos(g.player.angle) * ((i - 2) * 7), y: g.player.y + Math.sin(g.player.angle) * ((i - 2) * 7), vx: Math.cos(ang) * 610, vy: Math.sin(ang) * 610, ttl: 1.35, enemy: false, damage: 58 * (1 + (s.cannonLevel - 1) * .08), ammo: "iron", targetId: enemy.id }); }); toast(`Streusalve auf ${victims.length} Ziele abgefeuert`, "gold"); };
    const buy = (what: ShopPurchase) => { const s = saveRef.current, g = gameRef.current, cost = purchasePrice(what, s); if (s.gold < cost)
        return toast("Nicht genug Gold", "danger"); s.gold -= cost; if (what === "repair")
        s.repairKits++; if (what === "iron")
        s.ammo.iron += 80; if (what === "piercing")
        s.ammo.piercing += 25; if (what === "cannon")
        s.cannonLevel++; if (what === "harpoon")
        s.harpoonLevel++; if (what === "mojo")
        s.mojos = (s.mojos ?? 0) + 1; if (what === "hull") {
        s.hullLevel = (s.hullLevel ?? 1) + 1;
        const ratio = g.player.hp / Math.max(1, g.player.maxHp), stats = durability(s.shipId ?? "sovereign", s.deckLevel ?? 1, s.hullLevel);
        g.player.maxHp = stats.hp;
        g.player.maxShield = stats.shield;
        g.player.hp = Math.max(1, Math.round(stats.hp * ratio));
        s.hp = g.player.hp;
        s.maxHp = stats.hp;
        s.maxShield = stats.shield;
    } if (what === "sails")
        s.sailLevel = (s.sailLevel ?? 1) + 1; if (what === "crew")
        s.crewLevel = (s.crewLevel ?? 1) + 1; bumpProgress("upgrades"); setHud(h => ({ ...h, gold: s.gold, hp: g.player.hp, maxHp: g.player.maxHp, maxShield: g.player.maxShield, cannonLevel: s.cannonLevel, harpoonLevel: s.harpoonLevel, repairKits: s.repairKits, ammo: { ...s.ammo }, mojos: s.mojos ?? 0 })); toast("Kauf und Einbau abgeschlossen", "gold"); syncSave(); };
    const chooseShip = (id: ShipId) => { const s = saveRef.current, g = gameRef.current, ship = SHIPS[id], owned = [...(s.ownedShips ?? ["sovereign"])]; if (!owned.includes(id)) {
        if (s.gold < ship.price)
            return toast(`Es fehlen ${(ship.price - s.gold).toLocaleString("de-DE")} Gold`, "danger");
        s.gold -= ship.price;
        owned.push(id);
        s.ownedShips = owned;
        bumpProgress("ships-owned");
        toast(`${ship.name} wurde deiner Flotte hinzugefügt`, "gold");
    } const hpRatio = g.player.hp / Math.max(1, g.player.maxHp), shieldRatio = g.player.shield / Math.max(1, g.player.maxShield), stats = durability(id, s.deckLevel ?? 1, s.hullLevel); s.shipId = id; g.shipId = id; g.player.maxHp = stats.hp; g.player.maxShield = stats.shield; g.player.hp = Math.max(1, Math.round(stats.hp * hpRatio)); g.player.shield = Math.round(stats.shield * shieldRatio); s.maxHp = stats.hp; s.maxShield = stats.shield; s.hp = g.player.hp; s.shield = g.player.shield; setHud(h => ({ ...h, shipId: id, ownedShips: owned, gold: s.gold, hp: g.player.hp, maxHp: stats.hp, shield: g.player.shield, maxShield: stats.shield })); toast(`${ship.name} ist ausgerüstet und auf der Karte aktiv`, "gold"); syncSave(); };
    const chooseCannon = (id: CannonId) => { const s = saveRef.current, cannon = CANNONS[id], owned = [...(s.ownedCannons ?? ["bronze"])]; if (!owned.includes(id)) {
        if (s.gold < cannon.price)
            return toast(`Es fehlen ${(cannon.price - s.gold).toLocaleString("de-DE")} Gold`, "danger");
        s.gold -= cannon.price;
        owned.push(id);
        s.ownedCannons = owned;
        toast(`${cannon.name} gekauft`, "gold");
    } s.cannonId = id; setHud(h => ({ ...h, cannonId: id, ownedCannons: owned, gold: s.gold })); toast(`${cannon.name} ausgerüstet`, "gold"); syncSave(); };
    const upgradeDeck = () => { const s = saveRef.current, g = gameRef.current, current = clamp(s.deckLevel ?? 1, 1, 6); if (current >= 6)
        return toast("Das Dominion-Deck ist bereits vollständig ausgebaut", "gold"); const next = current + 1, deck = deckData(next); if (s.gold < deck.cost)
        return toast(`Es fehlen ${(deck.cost - s.gold).toLocaleString("de-DE")} Gold`, "danger"); s.gold -= deck.cost; s.deckLevel = next; g.deckLevel = next; g.weaponSlots = deck.weaponSlots; g.expansionSlots = deck.expansionSlots; const hpRatio = g.player.hp / Math.max(1, g.player.maxHp), shieldRatio = g.player.shield / Math.max(1, g.player.maxShield), stats = durability(s.shipId ?? "sovereign", next, s.hullLevel); g.player.maxHp = stats.hp; g.player.maxShield = stats.shield; g.player.hp = Math.max(1, Math.round(stats.hp * hpRatio)); g.player.shield = Math.round(stats.shield * shieldRatio); s.hp = g.player.hp; s.maxHp = stats.hp; s.shield = g.player.shield; s.maxShield = stats.shield; bumpProgress("upgrades"); setHud(h => ({ ...h, deckLevel: next, gold: s.gold, hp: g.player.hp, maxHp: stats.hp, shield: g.player.shield, maxShield: stats.shield })); toast(`${deck.name} eingebaut: ${deck.weaponSlots} Waffenplätze`, "gold"); syncSave(); };
    const performRitual = () => { if (ritualing)
        return; const s = saveRef.current, today = new Date().toISOString().slice(0, 10), free = s.lastFreeRitual !== today; if (!free && (s.mojos ?? 0) < 1)
        return toast("Du brauchst ein Gezeiten-Mojo", "danger"); if (free)
        s.lastFreeRitual = today;
    else
        s.mojos = (s.mojos ?? 0) - 1; setRitualing(true); setRitualResult("Die Strömungen sammeln sich …"); window.setTimeout(() => { const pity = s.cauldronPity ?? 0, roll = pity >= 8 ? .995 : Math.random(); let result = ""; if (roll < .29) {
        s.gold += 900;
        result = "900 Gold";
    }
    else if (roll < .49) {
        s.ammo.piercing += 35;
        result = "35 Panzerbrecher";
    }
    else if (roll < .66) {
        s.materials += 3;
        result = "3 Reliktfragmente";
    }
    else if (roll < .79) {
        s.pearls += 18;
        result = "18 Tiefenperlen";
    }
    else if (roll < .9) {
        s.repairKits += 2;
        result = "2 Reparaturkits";
    }
    else {
        s.mapFragments = (s.mapFragments ?? 0) + 1;
        s.cauldronPity = 0;
        result = "1 Fragment der Gezeitenkarte";
    } if (roll < .9)
        s.cauldronPity = pity + 1; bumpProgress("rituals"); setRitualResult(result); setRitualing(false); toast(`Ritualbelohnung: ${result}`, "gold"); syncSave(); }, 1150); };
    const respawn = () => { const g = gameRef.current, s = saveRef.current; g.mapId = "aster"; s.mapId = "aster"; g.player.hp = g.player.maxHp * .7; g.player.shield = g.player.maxShield; g.player.x = 650; g.player.y = MAPS.aster.height / 2; g.player.speed = 0; g.destination = null; g.navigation = createNavigationState({ x: g.player.x, y: g.player.y }); g.cameraPan = { x: 0, y: 0 }; g.entities = spawnMap("aster"); g.shots = []; g.loot = []; g.selectedId = null; g.running = true; g.lastTime = performance.now(); setDeath(null); toast("Im sicheren Hafen geborgen · Schutz aktiv", "gold"); syncSave(); };
    const enterImmersiveMode = async () => { try {
        if (!document.fullscreenElement)
            await document.documentElement.requestFullscreen();
        const orientation = screen.orientation as LockableOrientation;
        await orientation.lock?.("landscape");
    }
    catch { /* Browser ohne Fullscreen- oder Orientation-Lock bleibt im bildschirmfüllenden Layout. */ } };
    const start = () => { void enterImmersiveMode(); gameRef.current.running = true; gameRef.current.lastTime = performance.now(); setStarted(true); if (typeof window !== "undefined") (window as Window & { __ABYSSAL_GAME__?: typeof gameRef.current }).__ABYSSAL_GAME__ = gameRef.current; toast("Tippe auf das Meer oder nutze WASD zum Segeln", "gold"); };
    const exportSave = () => { syncSave(); const blob = new Blob([JSON.stringify(saveRef.current, null, 2)], { type: "application/json" }), a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "abyssal-dominion-save.json"; a.click(); URL.revokeObjectURL(a.href); };
    const importSave = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f)
        return; f.text().then(t => { try {
        const s = JSON.parse(t) as Partial<SaveGame> & {
            version?: number;
        };
        if (!s.version || s.version < 2 || s.version > 4)
            throw Error();
        applySave(s);
        writeSave(saveRef.current);
        toast("Spielstand importiert und auf V4 migriert", "gold");
        setPanel(null);
    }
    catch {
        toast("Ungültiger Spielstand", "danger");
    } }); };
    // Logical actions intentionally bridge keyboard and the same gameplay handlers used by touch controls.
    useEffect(() => { const runAction = (action: GameAction) => { const g = gameRef.current; if (action === "primaryFire" || action === "harpoonFire")
        fire(); if (action === "cycleTarget") {
        const alive = g.entities.filter(x => x.hp > 0), i = Math.max(0, alive.findIndex(x => x.id === g.selectedId));
        g.selectedId = alive[(i + 1) % alive.length]?.id ?? null;
    }     if (action === "cancelNavigation")
        { g.destination = null; g.navigation.ultimateDestination = null; g.navigation.detourWaypoint = null; } if (action === "closePanel")
        setPanel(null); if (action === "ability1")
        activateAbility("surge"); if (action === "ability2")
        activateAbility("volley"); if (action === "ability3")
        activateAbility("aegis"); if (action === "openMap")
        setPanel("map"); if (action === "openShipyard")
        setPanel("shipyard"); if (action === "zoomIn")
        g.zoom = clamp(g.zoom + .08, GAMEPLAY_CAMERA_POLICY.minZoom, GAMEPLAY_CAMERA_POLICY.maxZoom); if (action === "zoomOut")
        g.zoom = clamp(g.zoom - .08, GAMEPLAY_CAMERA_POLICY.minZoom, GAMEPLAY_CAMERA_POLICY.maxZoom); }; const down = (e: KeyboardEvent) => { const action = resolveKeyboardAction(e); if (!action)
        return; if (action === "primaryFire" || action === "cycleTarget" || action === "closePanel")
        e.preventDefault(); if (CONTINUOUS_ACTIONS.has(action))
        gameRef.current.actions.add(action);
    else if (!e.repeat)
        runAction(action); }; const up = (e: KeyboardEvent) => { const action = resolveKeyboardAction(e); if (action)
        gameRef.current.actions.delete(action); }; window.addEventListener("keydown", down); window.addEventListener("keyup", up); return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
        // activateAbility intentionally remains an immediate bridge into mutable realtime state.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fire]);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        let raf = 0, hudTick = 0;
        const water = (w: number, h: number, t: number, mapId: MapId) => { const m = MAPS[mapId], grad = ctx.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, m.color[0]); grad.addColorStop(1, m.color[1]); ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = "rgba(170,235,238,.12)"; ctx.lineWidth = 1; for (let y = 20; y < h + 30; y += 50)
            for (let x = 0; x < w + 70; x += 76) {
                ctx.beginPath();
                ctx.arc(x + Math.sin((y + t * 28) / 90) * 15, y + Math.sin((x + t * 18) / 115) * 5, 15, 3.6, 5.8);
                ctx.stroke();
            } if (m.weather !== "clear") {
            ctx.strokeStyle = m.weather === "storm" ? "rgba(190,225,242,.24)" : "rgba(170,220,235,.14)";
            for (let i = 0; i < (m.weather === "storm" ? 90 : 45); i++) {
                const x = (i * 83 + t * 360) % w, y = (i * 47 + t * 520) % h;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - 9, y + 19);
                ctx.stroke();
            }
        } };
        const island = (it: (typeof MAPS.aster.islands)[number], camX: number, camY: number, z: number) => { const x = (it.x - camX) * z, y = (it.y - camY) * z; ctx.save(); ctx.translate(x, y); ctx.scale(z, z); ctx.fillStyle = "rgba(0,12,18,.38)"; ctx.beginPath(); ctx.ellipse(9, 15, it.rx * 1.08, it.ry * 1.12, -.1, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#c7a95f"; ctx.beginPath(); ctx.ellipse(0, 0, it.rx, it.ry, -.1, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = it.port ? "#54783e" : "#426b3e"; ctx.beginPath(); ctx.ellipse(-8, -7, it.rx * .8, it.ry * .7, -.1, 0, Math.PI * 2); ctx.fill(); for (let i = 0; i < 8; i++) {
            ctx.fillStyle = i % 2 ? "#274d38" : "#355c39";
            ctx.beginPath();
            ctx.arc(Math.cos(i * 2.3) * it.rx * .48, Math.sin(i * 1.9) * it.ry * .42, 9 + i % 3 * 3, 0, Math.PI * 2);
            ctx.fill();
        } if (it.port) {
            ctx.fillStyle = "#d4c39a";
            ctx.fillRect(-18, -50, 40, 36);
            ctx.fillStyle = "#9b3f31";
            ctx.beginPath();
            ctx.moveTo(-27, -50);
            ctx.lineTo(31, -50);
            ctx.lineTo(2, -74);
            ctx.fill();
            ctx.fillStyle = "#744827";
            ctx.fillRect(32, -10, 62, 14);
        } ctx.restore(); ctx.fillStyle = "rgba(4,14,19,.82)"; ctx.font = "600 11px system-ui"; ctx.textAlign = "center"; ctx.fillText(it.name, x, y + (it.ry + 25) * z); };
        const ship = (e: Entity | typeof gameRef.current.player, camX: number, camY: number, z: number, player = false) => { const x = (e.x - camX) * z, y = (e.y - camY) * z, isEntity = "kind" in e, kind = isEntity ? e.kind : "raider", d = ENTITY_DATA[kind], monster = isEntity && monsters.has(kind); ctx.save(); ctx.translate(x, y); ctx.rotate(e.angle); ctx.scale(z, z); if (monster) {
            ctx.fillStyle = kind === "serpent" ? "#3d9a7a" : kind === "leviathan" ? "#355268" : "#653d83";
            for (let i = 0; i < (kind === "kraken" ? 7 : 4); i++) {
                ctx.strokeStyle = ctx.fillStyle;
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(-8, 0);
                ctx.quadraticCurveTo(-35 - i * 5, (i - 3) * 13, -65 - i * 4, (i - 3) * 18);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.ellipse(12, 0, d.boss ? 48 : 38, d.boss ? 32 : 25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#76e5df";
            ctx.beginPath();
            ctx.arc(25, -8, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        else {
            ctx.fillStyle = "rgba(0,8,14,.35)";
            ctx.beginPath();
            ctx.ellipse(-5, 10, d.boss ? 54 : 43, d.boss ? 21 : 16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = player ? "#b97932" : d.boss ? "#6d2934" : kind === "ghost" ? "#315c62" : "#4b2a22";
            ctx.beginPath();
            ctx.moveTo(d.boss ? 60 : 50, 0);
            ctx.lineTo(27, 17);
            ctx.lineTo(-42, 17);
            ctx.lineTo(-50, 0);
            ctx.lineTo(-42, -17);
            ctx.lineTo(27, -17);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = player ? "#ffe19a" : "#c07a52";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.strokeStyle = "#d8c49b";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(2, -3);
            ctx.lineTo(2, -54);
            ctx.stroke();
            ctx.fillStyle = player ? "#ece3cc" : kind === "ghost" ? "rgba(125,239,226,.7)" : "#17191b";
            ctx.beginPath();
            ctx.moveTo(4, -51);
            ctx.lineTo(4, -7);
            ctx.lineTo(39, -19);
            ctx.closePath();
            ctx.fill();
        } if (isEntity && e.hitAt > performance.now() - 120) {
            ctx.fillStyle = "rgba(255,225,155,.65)";
            ctx.beginPath();
            ctx.arc(0, 0, 48, 0, Math.PI * 2);
            ctx.fill();
        } ctx.restore(); if (isEntity) {
            if (gameRef.current.selectedId === e.id) {
                ctx.strokeStyle = "#f3cd68";
                ctx.lineWidth = 2;
                ctx.setLineDash([7, 5]);
                ctx.beginPath();
                ctx.ellipse(x, y, 58 * z, 37 * z, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            const bw = d.boss ? 100 : 76;
            ctx.fillStyle = "rgba(3,12,18,.85)";
            ctx.fillRect(x - bw / 2, y - 66 * z, bw, 7);
            ctx.fillStyle = e.hp / e.maxHp > .45 ? "#d5574d" : "#ff983f";
            ctx.fillRect(x - bw / 2 + 1, y - 65 * z, (bw - 2) * Math.max(0, e.hp / e.maxHp), 5);
            ctx.fillStyle = "#f6e9d2";
            ctx.font = `${d.boss ? 700 : 600} 10px system-ui`;
            ctx.textAlign = "center";
            ctx.fillText(`${monster ? "MONSTER" : "KI"} · ${d.name}`, x, y - 73 * z);
        } };
        const render = (ts: number) => {
            const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
            if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
                canvas.width = Math.round(rect.width * dpr);
                canvas.height = Math.round(rect.height * dpr);
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const w = rect.width, h = rect.height, g = gameRef.current, m = MAPS[g.mapId], dt = Math.min((ts - (g.lastTime || ts)) / 1000, .033);
            g.lastTime = ts;
            if (g.running) {
                try {
                    const shipStats = SHIPS[saveRef.current.shipId ?? "sovereign"], sailBonus = 1 + Math.max(0, (saveRef.current.sailLevel ?? 1) - 1) * .055;
                    let turn = 0, thrust = 0;
                    if (g.actions.has("steerLeft"))
                        turn = -1;
                    if (g.actions.has("steerRight"))
                        turn = 1;
                    if (g.actions.has("moveForward"))
                        thrust = 1;
                    if (g.actions.has("moveBackward"))
                        thrust = -.5;
                    const cameraInput = Math.hypot(g.joystick.x, g.joystick.y);
                    if (cameraInput > .08) {
                        const panSpeed = resolveCameraPanSpeed(cameraPanSpeed) / Math.max(.65, g.zoom);
                        const nextPanX = g.cameraPan.x + g.joystick.x * panSpeed * dt, nextPanY = g.cameraPan.y + g.joystick.y * panSpeed * dt;
                        g.cameraPan.x = clamp(nextPanX, 320 - g.player.x, m.width - 320 - g.player.x);
                        g.cameraPan.y = clamp(nextPanY, 230 - g.player.y, m.height - 230 - g.player.y);
                    }
                    const movement = stepShipMovement({
                        dt,
                        player: g.player,
                        destination: g.destination,
                        navigation: g.navigation,
                        islands: m.islands,
                        mapWidth: m.width,
                        mapHeight: m.height,
                        shipTurnRate: shipStats.turn,
                        shipMaxSpeed: shipStats.speed,
                        sailBonus,
                        surgeMultiplier: g.surgeUntil > ts ? 1.55 : 1,
                        keyboardTurn: turn,
                        keyboardThrust: thrust,
                    });
                    g.player.x = movement.player.x;
                    g.player.y = movement.player.y;
                    g.player.angle = movement.player.angle;
                    g.player.speed = movement.player.speed;
                    g.destination = movement.destination;
                    g.navigation = movement.navigation;
                    g.movementDebug = movement.movementDebug ?? null;
                    if (Math.abs(g.player.speed) > 40 && Math.random() < clamp(Math.abs(g.player.speed) / 520, .07, .24)) {
                        const wakeOffset = PLAYER_SHIP_VISUALS[g.shipId]?.wakeOffset ?? { forward: -43, lateral: 0 }, wakeOrigin = worldOffset(g.player, g.player.angle, wakeOffset);
                        g.wake.push({ x: wakeOrigin.x, y: wakeOrigin.y, ttl: 0.92, angle: g.player.angle, strength: clamp(Math.abs(g.player.speed) / shipStats.speed, .14, .82) });
                        if (g.wake.length > 14)
                            g.wake = g.wake.slice(-14);
                    }
                    if (g.autoFire)
                        fire();
                    g.entities.forEach(e => { if (e.hp <= 0)
                        return; const d = ENTITY_DATA[e.kind], range = dist(e, g.player), a = Math.atan2(g.player.y - e.y, g.player.x - e.x), slow = e.statusUntil > ts ? .55 : 1; if (range < 720) {
                        const ideal = monsters.has(e.kind) ? 240 : 330;
                        e.angle += clamp(angleNorm(a - e.angle), -1, 1) * .68 * dt;
                        if (range > ideal) {
                            e.x += Math.cos(e.angle) * d.speed * slow * dt;
                            e.y += Math.sin(e.angle) * d.speed * slow * dt;
                        }
                        else if (e.kind === "scout") {
                            e.x -= Math.cos(e.angle) * d.speed * .5 * dt;
                            e.y -= Math.sin(e.angle) * d.speed * .5 * dt;
                        }
                    }
                    else
                        e.angle += Math.sin(ts / 1700 + e.id) * .12 * dt; if (range < d.range && ts - e.fireAt > 1700 + (e.id % 5) * 170) {
                        e.fireAt = ts;
                        const burst = d.boss ? 2 : 1;
                        for (let i = 0; i < burst; i++)
                            g.shots.push({ x: e.x, y: e.y, vx: Math.cos(a + (i ? .035 : -.01)) * 390, vy: Math.sin(a + (i ? .035 : -.01)) * 390, ttl: Math.max(1.45, range / 390 + .65), enemy: true, damage: d.damage, ammo: monsters.has(e.kind) ? "harpoon" : "iron" });
                    } });
                    g.shots.forEach(s => { const intended = s.enemy ? g.player : s.targetId !== undefined ? g.entities.find(e => e.id === s.targetId && e.hp > 0) : undefined; if (intended) {
                        const speed = Math.max(1, Math.hypot(s.vx, s.vy)), aim = Math.atan2(intended.y - s.y, intended.x - s.x), desiredVx = Math.cos(aim) * speed, desiredVy = Math.sin(aim) * speed, guidance = Math.min(1, dt * (s.enemy ? 4.5 : 10));
                        s.vx += (desiredVx - s.vx) * guidance;
                        s.vy += (desiredVy - s.vy) * guidance;
                    } s.x += s.vx * dt; s.y += s.vy * dt; s.ttl -= dt; if (s.enemy) {
                        if (dist(s, g.player) < 44) {
                            let dmg = s.damage;
                            if (g.player.shield > 0) {
                                const absorbed = Math.min(g.player.shield, dmg * .65);
                                g.player.shield -= absorbed;
                                dmg -= absorbed;
                            }
                            g.player.hp -= dmg;
                            g.lastHit = ts;
                            s.hit = true;
                            s.ttl = 0;
                        }
                    }
                    else {
                        const hit = s.targetId !== undefined ? g.entities.find(e => e.id === s.targetId && e.hp > 0 && dist(s, e) < (monsters.has(e.kind) ? 58 : 48)) : g.entities.find(e => e.hp > 0 && dist(s, e) < (monsters.has(e.kind) ? 58 : 48));
                        if (hit) {
                            let damage = s.damage;
                            if (s.ammo === "harpoon" && !monsters.has(hit.kind))
                                damage *= .15;
                            if (s.ammo !== "harpoon" && monsters.has(hit.kind))
                                damage *= .35;
                            if (s.ammo === "fire")
                                damage += 18;
                            if (s.ammo === "frost")
                                hit.statusUntil = ts + 2200;
                            hit.hp -= damage;
                            hit.hitAt = ts;
                            s.hit = true;
                            s.ttl = 0;
                            if (hit.hp <= 0) {
                                const d = ENTITY_DATA[hit.kind], isMonster = monsters.has(hit.kind);
                                g.kills++;
                                if (isMonster)
                                    g.monsterKills++;
                                const elite = hit.kind === "elite" || hit.kind === "boss";
                                g.loot.push({ id: hit.id, x: hit.x, y: hit.y, gold: d.reward, pearls: elite ? 35 : isMonster ? 12 : 0, materials: elite ? 3 : 1, born: ts });
                                saveRef.current.xp += d.level * 55;
                                bumpProgress(isMonster ? "monsters" : "ships");
                                if (elite)
                                    bumpProgress("elite");
                                toast(`${d.name} besiegt!`, "gold");
                                g.selectedId = null;
                            }
                        }
                    } });
                    g.shots = g.shots.filter(s => s.ttl > 0);
                    g.wake.forEach(x => x.ttl -= dt);
                    g.wake = g.wake.filter(x => x.ttl > 0);
                    g.loot.forEach(l => { if (dist(l, g.player) < 78) {
                        const s = saveRef.current;
                        s.gold += l.gold;
                        s.pearls += l.pearls;
                        s.materials += l.materials;
                        g.lootCount++;
                        l.born = -1;
                        bumpProgress("loot");
                        toast(`+${l.gold} Gold${l.pearls ? ` · +${l.pearls} Perlen` : ""}`, "gold");
                    } });
                    g.loot = g.loot.filter(l => l.born !== -1);
                    if (ts - g.lastHit > 6000)
                        g.player.shield = Math.min(g.player.maxShield, g.player.shield + 28 * dt);
                    const s = saveRef.current;
                    while (s.xp >= s.level * 600) {
                        s.xp -= s.level * 600;
                        s.level++;
                        g.playerLevel = s.level;
                        g.player.hp = g.player.maxHp;
                        g.player.shield = g.player.maxShield;
                        toast(`Level ${s.level} erreicht!`, "gold");
                    }
                    if (g.mapId === "abyss" && g.entities.every(e => e.hp <= 0)) {
                        if (g.wave < 3) {
                            g.wave++;
                            g.entities = spawnMap("abyss", g.wave === 3);
                            toast(`Welle ${g.wave} beginnt`, "danger");
                        }
                    }
                    if (g.player.hp <= 0) {
                        g.running = false;
                        setDeath("Dein Schiff wurde von den Mächten der Tiefe versenkt.");
                        syncSave();
                    }
                    if (ts - hudTick > 200) {
                        hudTick = ts;
                        const target = g.entities.find(e => e.id === g.selectedId && e.hp > 0), td = target ? ENTITY_DATA[target.kind] : null, cannon = CANNONS[s.cannonId ?? "bronze"];
                        setCooldown(Math.max(0, 1 - (ts - g.lastShot) / (AMMO[ammo].reload * cannon.reload * 1000)));
                        setAbilityHud({ surge: Math.max(0, (g.surgeReady - ts) / 1000), aegis: Math.max(0, (g.aegisReady - ts) / 1000), volley: Math.max(0, (g.volleyReady - ts) / 1000) });
                        setHud({ hp: Math.ceil(g.player.hp), maxHp: g.player.maxHp, shield: Math.ceil(g.player.shield), maxShield: g.player.maxShield, gold: s.gold, pearls: s.pearls, level: s.level, xp: s.xp, kills: g.kills, monsters: g.monsterKills, loot: g.lootCount, mapId: g.mapId, x: g.player.x, y: g.player.y, selected: target && td ? { name: td.name, level: td.level, hp: Math.max(0, Math.ceil(target.hp)), maxHp: target.maxHp, range: Math.ceil(dist(g.player, target)), kind: target.kind } : null, repairKits: s.repairKits, materials: s.materials, ammo: { ...s.ammo }, cannonLevel: s.cannonLevel, harpoonLevel: s.harpoonLevel, shipId: s.shipId ?? "sovereign", ownedShips: [...(s.ownedShips ?? ["sovereign"])], cannonId: s.cannonId ?? "bronze", ownedCannons: [...(s.ownedCannons ?? ["bronze"])], mojos: s.mojos ?? 0, mapFragments: s.mapFragments ?? 0, cauldronPity: s.cauldronPity ?? 0, deckLevel: s.deckLevel ?? 1, progress: { ...s.progress }, completed: [...s.completed], visited: [...s.visited], wave: g.wave });
                    }
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    console.error("abyssal-game-loop", message);
                    setRuntimeError(message);
                    g.running = false;
                }
            }
            const z = g.zoom, viewW = w / z, viewH = h / z, camX = clamp(g.player.x + g.cameraPan.x - viewW / 2, 0, Math.max(0, m.width - viewW)), camY = clamp(g.player.y + g.cameraPan.y - viewH / 2, 0, Math.max(0, m.height - viewH));
            cameraRef.current = { x: camX, y: camY, zoom: z };
            water(w, h, ts / 1000, g.mapId);
            m.islands.forEach(i => island(i, camX, camY, z));
            g.wake.forEach(p => { ctx.strokeStyle = `rgba(205,245,244,${p.ttl * .3})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc((p.x - camX) * z, (p.y - camY) * z, (18 * (1.2 - p.ttl) + 7) * z, 0, Math.PI * 2); ctx.stroke(); });
            g.loot.forEach(l => { const x = (l.x - camX) * z, y = (l.y - camY) * z, bob = Math.sin(ts / 220) * 4; ctx.fillStyle = "rgba(245,196,72,.2)"; ctx.beginPath(); ctx.arc(x, y, 28 * z, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#e7b943"; ctx.fillRect(x - 11 * z, y + (-9 + bob) * z, 22 * z, 18 * z); });
            g.entities.filter(e => e.hp > 0).forEach(e => ship(e, camX, camY, z));
            ship(g.player, camX, camY, z, true);
            g.shots.forEach(s => { const x = (s.x - camX) * z, y = (s.y - camY) * z; ctx.fillStyle = s.enemy ? "#ff7659" : AMMO[s.ammo].color; ctx.beginPath(); ctx.arc(x, y, (s.ammo === "harpoon" ? 6 : 4) * z, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = s.enemy ? "rgba(255,100,70,.3)" : AMMO[s.ammo].color; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - s.vx * .035 * z, y - s.vy * .035 * z); ctx.stroke(); });
            if (g.destination) {
                ctx.strokeStyle = "#f2d174";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc((g.destination.x - camX) * z, (g.destination.y - camY) * z, 13 + Math.sin(ts / 180) * 3, 0, Math.PI * 2);
                ctx.stroke();
            }
            raf = requestAnimationFrame(render);
        };
        raf = requestAnimationFrame(render);
        return () => cancelAnimationFrame(raf);
    }, [ammo, bumpProgress, fire, syncSave, toast]);
    useEffect(() => {
        const canvas = threeCanvasRef.current;
        if (!canvas || !ready)
            return;
        let renderer: ThreeRendererHandle | null = null, raf = 0, disposed = false;
        import("./threeRenderer").then(({ AbyssalThreeRenderer }) => { if (disposed)
            return; renderer = new AbyssalThreeRenderer(canvas, qualityPreference); renderer3DRef.current = renderer; const draw = (time: number) => { if (disposed || !renderer)
            return; renderer.render(gameRef.current, time); raf = requestAnimationFrame(draw); }; raf = requestAnimationFrame(draw); }).catch(error => { if (disposed)
            return; console.error("abyssal-3d-renderer", error); setRuntimeError("Der 3D-Renderer konnte nicht geladen werden."); });
        return () => { disposed = true; cancelAnimationFrame(raf); renderer?.dispose(); renderer3DRef.current = null; };
    }, [qualityPreference, ready]);
    const handleWorldTap = (clientX: number, clientY: number) => { if (!started || panel || death)
        return; const renderer = renderer3DRef.current, g = gameRef.current; if (!renderer)
        return; const entityId = renderer.pickEntity(clientX, clientY); if (entityId !== null) {
        const hit = g.entities.find(x => x.id === entityId && x.hp > 0);
        if (hit) {
            g.selectedId = hit.id;
            toast(`${ENTITY_DATA[hit.kind].name} erfasst`, "gold");
            return;
        }
    }     const point = renderer.pointFromEvent(clientX, clientY); if (point) {
        const goal = { x: clamp(point.x, 40, MAPS[g.mapId].width - 40), y: clamp(point.y, 40, MAPS[g.mapId].height - 40) };
        const planned = planNavigationTo(goal, g.player, MAPS[g.mapId].islands);
        g.destination = planned.destination;
        g.navigation = planned.navigation;
    } };
    const recenterCamera = () => { gameRef.current.cameraPan = { x: 0, y: 0 }; };
    const adjustZoom = (delta: number) => { gameRef.current.zoom = clamp(gameRef.current.zoom + delta, GAMEPLAY_CAMERA_POLICY.minZoom, GAMEPLAY_CAMERA_POLICY.maxZoom); };
    const onCanvasDown = (e: React.PointerEvent<HTMLCanvasElement>) => { if (!started || panel || death)
        return; const gesture = gestureRef.current; gesture.points.set(e.pointerId, { x: e.clientX, y: e.clientY }); gesture.down = gesture.points.size === 1 ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null; gesture.moved = false; e.currentTarget.setPointerCapture(e.pointerId); if (gesture.points.size === 2) { const points = [...gesture.points.values()]; gesture.startDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y); gesture.startZoom = gameRef.current.zoom; gesture.pinching = true; } };
    const onCanvasMove = (e: React.PointerEvent<HTMLCanvasElement>) => { const gesture = gestureRef.current;if(!gesture.points.has(e.pointerId))return;gesture.points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(gesture.down&&Math.hypot(e.clientX-gesture.down.x,e.clientY-gesture.down.y)>8)gesture.moved=true;if(gesture.points.size>=2){const points=[...gesture.points.values()],distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);if(gesture.startDistance>0){const sens=resolveZoomSensitivity(zoomSensitivity);const ratio=distance/gesture.startDistance;gameRef.current.zoom=clamp(gesture.startZoom*Math.pow(ratio,sens),GAMEPLAY_CAMERA_POLICY.minZoom,GAMEPLAY_CAMERA_POLICY.maxZoom);}gesture.pinching=true;e.preventDefault();} };
    const onCanvasUp = (e: React.PointerEvent<HTMLCanvasElement>) => { const gesture=gestureRef.current,wasPinching=gesture.pinching,down=gesture.down;gesture.points.delete(e.pointerId);if(!wasPinching&&!gesture.moved&&down?.id===e.pointerId)handleWorldTap(e.clientX,e.clientY);if(gesture.points.size<2){gesture.startDistance=0;if(gesture.points.size===0){gesture.pinching=false;gesture.down=null;gesture.moved=false;}} };
    const onCanvasCancel = (e: React.PointerEvent<HTMLCanvasElement>) => { const gesture=gestureRef.current;gesture.points.delete(e.pointerId);if(gesture.points.size===0){gesture.pinching=false;gesture.down=null;gesture.moved=false;gesture.startDistance=0;} };
    const onWheel = (e: React.WheelEvent) => { e.preventDefault(); const sens = resolveZoomSensitivity(zoomSensitivity); gameRef.current.zoom = clamp(gameRef.current.zoom - e.deltaY * .0007 * sens, GAMEPLAY_CAMERA_POLICY.minZoom, GAMEPLAY_CAMERA_POLICY.maxZoom); };
    const joystickMove = (e: React.PointerEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(), x = (e.clientX - r.left - r.width / 2) / (r.width * .36), y = (e.clientY - r.top - r.height / 2) / (r.height * .36), magnitude = Math.hypot(x, y), n = Math.max(1, magnitude), value = magnitude < .12 ? { x: 0, y: 0 } : { x: x / n, y: y / n }; gameRef.current.joystick = value; const knob = e.currentTarget.querySelector("i") as HTMLElement | null; if (knob) knob.style.transform = `translate(${value.x * 24}px, ${value.y * 24}px)`; e.currentTarget.setPointerCapture(e.pointerId); };
    const joystickEnd = (e: React.PointerEvent<HTMLDivElement>) => { gameRef.current.joystick = { x: 0, y: 0 }; const knob = e.currentTarget.querySelector("i") as HTMLElement | null; if (knob)
        knob.style.transform = "translate(0, 0)"; };
    if (!ready)
        return <main className="loading"><span>⚓</span><b>ABYSSAL DOMINION</b><small>Seekarten werden geladen …</small></main>;
    const map = MAPS[hud.mapId], activeQuest = QUESTS.find(q => !hud.completed.includes(q.id)) ?? QUESTS[0], questProgress = Math.min(activeQuest.goal, hud.progress[activeQuest.type] || 0), activeMonster = !!hud.selected && monsters.has(hud.selected.kind), currentDeck = deckData(hud.deckLevel), nextDeck = deckData(Math.min(6, hud.deckLevel + 1));
    const combatAmmo: AmmoId = activeMonster ? "harpoon" : ammo === "harpoon" ? "iron" : ammo;
    const combatRange = hud.selected ? calculateBroadside({ ammoId: combatAmmo, cannonId: saveRef.current.cannonId ?? "bronze", shipId: saveRef.current.shipId ?? "sovereign", cannonLevel: saveRef.current.cannonLevel, harpoonLevel: saveRef.current.harpoonLevel, crewLevel: saveRef.current.crewLevel ?? 1, deckLevel: saveRef.current.deckLevel ?? 1, targetKind: hud.selected.kind }).range : 0;
    const targetInRange = !!hud.selected && hud.selected.range <= combatRange;
    const showShipVisualDebug = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && new URLSearchParams(window.location.search).get("shipDebug") === "1";
    const showVisualBuildDebug = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && new URLSearchParams(window.location.search).get("visualDebug") === "1";
    return <main className="game-shell"><canvas ref={canvasRef} className="logic-canvas" aria-hidden="true"/><canvas ref={threeCanvasRef} className="world world-3d" onPointerDown={onCanvasDown} onPointerMove={onCanvasMove} onPointerUp={onCanvasUp} onPointerCancel={onCanvasCancel} onWheel={onWheel} aria-label="3D-Spielwelt von Abyssal Dominion"/><div className="sunwash"/>{runtimeError && <div className="runtime-error">{runtimeError}</div>}{showVisualBuildDebug && <div className="visual-build-debug" aria-hidden="true"><b>BUILD: {BUILD_RELEASE}</b><small>COMMIT: {BUILD_COMMIT}</small></div>}{showShipVisualDebug && playerVisualStatus && <div className={`player-visual-device-status ${playerVisualStatus.status}`}><b>{playerVisualStatus.status==="kraken-attached"?"KRAKEN AKTIV":playerVisualStatus.status==="loading"?"KRAKEN WIRD GELADEN":playerVisualStatus.status==="kraken-failed"?"KRAKEN-LADEFEHLER":"PLAYER-FALLBACK"}</b><small>Ship: {playerVisualStatus.activeShipId} · Meshes: {playerVisualStatus.meshCount} · Fallback: {playerVisualStatus.fallbackPresent?"JA":"NEIN"}</small>{playerVisualStatus.visualBoundsCenter&&<small>Player X/Z: {Math.round(playerVisualStatus.playerWorldPosition.x)}/{Math.round(playerVisualStatus.playerWorldPosition.z)} · Mesh X/Z: {Math.round(playerVisualStatus.visualBoundsCenter.x)}/{Math.round(playerVisualStatus.visualBoundsCenter.z)}</small>}{playerVisualStatus.error&&<em>{playerVisualStatus.error}</em>}</div>}
    <header className="top-hud command-bar glass"><button className="captain" onClick={() => setPanel(panel ? null : "inventory")}><span className="captain-mark">AD</span><span className="captain-copy"><b>{saveRef.current.playerName.toUpperCase()}</b><small>LV {hud.level}</small></span></button><div className="bars"><span><b>RUMPF</b><i><em style={{ width: `${hud.hp / hud.maxHp * 100}%` }}/></i><small>{hud.hp}/{hud.maxHp}</small></span><span className="shield"><b>SCHUTZ</b><i><em style={{ width: `${hud.shield / hud.maxShield * 100}%` }}/></i><small>{hud.shield}/{hud.maxShield}</small></span></div><nav className="command-nav"><button className={panel === "inventory" ? "active" : ""} onClick={() => setPanel(panel === "inventory" ? null : "inventory")}><span>♜</span><small>ÜBERSICHT</small></button><button className={panel === "shipyard" ? "active" : ""} onClick={() => setPanel(panel === "shipyard" ? null : "shipyard")}><span>⚓</span><small>WERFT</small></button><button className={panel === "missions" ? "active" : ""} onClick={() => setPanel(panel === "missions" ? null : "missions")}><span>✦</span><small>MISSION</small></button><button className={panel === "map" ? "active" : ""} onClick={() => setPanel(panel === "map" ? null : "map")}><span>◈</span><small>SEEKARTE</small></button><button className={panel === "port" ? "active" : ""} onClick={() => setPanel(panel === "port" ? null : "port")}><span>▦</span><small>GESCHÄFT</small></button><button className={panel === "events" ? "active" : ""} onClick={() => setPanel(panel === "events" ? null : "events")}><span>★</span><small>EREIGNIS</small></button></nav><div className="currency"><span className="coin gold">◆</span><b>{hud.gold.toLocaleString("de-DE")}</b><span className="coin pearl">●</span><b>{hud.pearls}</b></div></header>
    <aside className="quest-card glass" onClick={() => setPanel("missions")}><div className="quest-icon">✦</div><div><small>AKTIVE MISSION</small><b>{activeQuest.title}</b><span><i style={{ width: `${questProgress / activeQuest.goal * 100}%` }}/></span><em>{questProgress} / {activeQuest.goal} · {activeQuest.text}</em></div></aside>
    {hud.selected && <aside className={`target-card glass ${targetInRange ? "locked" : "approaching"}`}><span className="target-icon">{activeMonster ? "☠" : "⚔"}</span><div><small>{activeMonster ? "SEEUNGEHEUER" : "KI-GEGNER"} · LV {hud.selected.level}</small><b>{hud.selected.name}</b><i className="target-track"><u style={{ width: `${hud.selected.hp / hud.selected.maxHp * 100}%` }}/></i></div><em>{targetInRange ? "ERFASST" : "ANFAHRT"}<small>{hud.selected.range} m</small></em><button aria-label="Ziel lösen" onClick={() => { gameRef.current.selectedId = null; }}>×</button></aside>}
    <button className="minimap chart-frame glass" onClick={() => setPanel("map")}><strong><span>SEKTOR {map.sector}</span><em>X:{Math.round(hud.x / 10)} Y:{Math.round(hud.y / 10)}</em></strong><div className="mini-sea">{map.islands.map((i, n) => <i key={n} style={{ left: `${i.x / map.width * 100}%`, top: `${i.y / map.height * 100}%` }}/>)}{gameRef.current.entities.filter(e => e.hp > 0).map(e => <u key={e.id} className={`${monsters.has(e.kind) ? "monster" : "hostile"} ${e.id === gameRef.current.selectedId ? "selected" : ""}`} style={{ left: `${e.x / map.width * 100}%`, top: `${e.y / map.height * 100}%` }}/>) }<b style={{ left: `${gameRef.current.player.x / map.width * 100}%`, top: `${gameRef.current.player.y / map.height * 100}%` }}>▲</b></div><span><em>{map.name}</em>GEFAHR {map.danger} · STÄRKE {map.recommended}</span></button><div className="toast-stack">{toasts.map(t => <div key={t.id} className={`toast ${t.kind}`}>{t.text}</div>)}</div><aside className="battle-log glass"><label>KAMPFSTATUS</label><b>{hud.selected ? targetInRange ? `${hud.selected.name} erfasst` : `Anfahrt auf ${hud.selected.name}` : `Freie Fahrt · ${map.name}`}</b><span>{activeQuest.title}: {questProgress}/{activeQuest.goal}</span></aside>
    <div className="camera-control-group">
    <div className="zoom-controls glass" aria-label="Zoom"><button type="button" onClick={() => adjustZoom(0.12)} aria-label="Heranzoomen" title="Heranzoomen">+</button><button type="button" onClick={() => adjustZoom(-0.12)} aria-label="Herauszoomen" title="Herauszoomen">−</button></div>
    <button type="button" className="recenter-ship-btn glass" aria-label="Zurück zum Schiff" title="Zurück zum Schiff" onClick={recenterCamera}><span>⚓</span><small>SCHIFF</small></button>
    <div className="joystick camera-stick" aria-label="Kartenkamera verschieben" title="Kamera verschieben" onPointerDown={joystickMove} onPointerMove={e => e.buttons && joystickMove(e)} onPointerUp={joystickEnd} onPointerCancel={joystickEnd}><span>‹　›</span><i /><small>KAMERA</small></div>
    </div>
    <button type="button" className="settings-quick-btn glass" aria-label="Einstellungen" title="Einstellungen" onClick={() => setPanel(panel === "settings" ? null : "settings")}><span>⚙</span></button>
    <div className="combat-cluster combat-cluster-v25">
    <div className="combat-skill-row glass ability-controls"><button onClick={() => activateAbility("surge")} className={abilityHud.surge > 0 ? "cooling" : ""} aria-label="Sturmsegel"><span>≋</span><b>STURMSEGEL</b><small>{abilityHud.surge > 0 ? `${Math.ceil(abilityHud.surge)} S` : "TEMPOSCHUB"}</small></button><button onClick={() => activateAbility("volley")} className={abilityHud.volley > 0 ? "cooling" : ""} aria-label="Streusalve"><span>✺</span><b>STREUSALVE</b><small>{abilityHud.volley > 0 ? `${Math.ceil(abilityHud.volley)} S` : "4 KUGELN"}</small></button><button onClick={() => activateAbility("aegis")} className={abilityHud.aegis > 0 ? "cooling" : ""} aria-label="Reliktschild"><span>⬡</span><b>RELIKTSCHILD</b><small>{abilityHud.aegis > 0 ? `${Math.ceil(abilityHud.aegis)} S` : "6 PERLEN"}</small></button></div>
    <div className="combat-primary-row battle-controls"><button className="target-button" onClick={cycleTarget} aria-label="Ziel wechseln"><span>⌖</span><small>ZIEL</small></button><button className={`auto-button ${autoFire ? "active" : ""}`} onClick={() => { const n = !autoFire; setAutoFire(n); gameRef.current.autoFire = n; }} aria-label="Automatisches Feuer"><span>◎</span><small>AUTO</small></button><button className={`fire-button ${activeMonster ? "harpoon" : ""} ${targetInRange ? "ready" : ""}`} onPointerDown={fire} aria-label="Feuer" style={{ "--cooldown": `${cooldown * 360}deg` } as React.CSSProperties}><span>{activeMonster ? "↯" : "☄"}</span><b>{activeMonster ? "HARPUNE" : "FEUER"}</b><small>{!hud.selected ? "ZIEL WÄHLEN" : targetInRange ? "BEREIT" : `${hud.selected.range} M`}</small></button><button className="repair-button" onClick={repair} aria-label="Reparatur"><span>✚</span><b>{hud.repairKits}</b><small>REPARATUR</small></button></div>
    <div className="combat-ammo-row ammo-select glass">{(Object.keys(AMMO) as AmmoId[]).map(a => <button key={a} className={ammo === a ? "active" : ""} onClick={() => selectAmmo(a)} title={AMMO[a].effect}><span style={{ color: AMMO[a].color }}>{a === "harpoon" ? "↯" : a === "fire" ? "✹" : "●"}</span><small>{AMMO[a].short}</small><b>{hud.ammo[a] >= 999 ? "∞" : hud.ammo[a]}</b></button>)}</div>
    </div>
    {!started && <section className="start-screen"><div className="crest">♜</div><p>THE ABYSSAL CHRONICLES</p><h1>ABYSSAL<br /><span>DOMINION</span></h1><div className="ornament">◆　⚓　◆</div><p className="intro">Segle per Klick oder Touch. Baue deine Flotte, rüste Breitseiten aus<br />und bezwinge fünf Reiche voller Beute und Seeungeheuer.</p><button onClick={start}>IM VOLLBILD STARTEN <span>›</span></button><small>Lokaler Spielstand · Querformat · Vollbildmodus</small></section>}
    {death && <section className="death-screen"><div>☠</div><label>{SHIPS[hud.shipId].name.toUpperCase()} VERSENKT</label><h2>Die Tiefe fordert ihren Tribut</h2><p>{death}</p><span>Verlust: keine Ausrüstung · Respawn im sicheren Hafen Aster</span><button onClick={respawn}>IM HAFEN BERGEN</button></section>}
    {panel && <section className="drawer glass"><button className="close" onClick={() => setPanel(null)}>×</button>{panel === "settings" && <><label>STEUERUNG & DARSTELLUNG</label><h2>Einstellungen</h2><div className="settings-panel"><article><b>STEUERUNG</b><label className="settings-row"><span>Kamera-Geschwindigkeit</span><select value={cameraPanSpeed} onChange={event => updateCameraPanSpeed(event.target.value as CameraPanSpeed)}><option value="slow">Langsam</option><option value="normal">Normal</option><option value="fast">Schnell</option></select></label><label className="settings-row"><span>Zoom-Empfindlichkeit</span><select value={zoomSensitivity} onChange={event => updateZoomSensitivity(event.target.value as ZoomSensitivity)}><option value="low">Niedrig</option><option value="normal">Normal</option><option value="high">Hoch</option></select></label></article><article><b>GRAFIK</b><label className="settings-row"><span>Grafikqualität</span><select value={qualityPreference} onChange={event => { const value = event.target.value as QualityPreference; saveQualityPreference(value); saveRef.current.settings = { ...saveRef.current.settings, qualityProfile: value }; writeSave(saveRef.current).catch(() => undefined); setQualityPreference(value); }}><option value="AUTO">AUTO</option><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="ULTRA">ULTRA</option></select></label></article></div></>}{panel === "missions" && <><label>LOGBUCH · {hud.completed.length}/{QUESTS.length}</label><h2>Missionen</h2><div className="mission-list">{QUESTS.map(q => { const done = hud.completed.includes(q.id), p = Math.min(q.goal, hud.progress[q.type] || 0); return <article key={q.id} className={done ? "done" : ""}><span>{done ? "✓" : "✦"}</span><div><b>{q.title}</b><p>{q.text}</p><i><em style={{ width: `${p / q.goal * 100}%` }}/></i><small>{p}/{q.goal} · {q.reward}</small></div></article>; })}</div></>}{panel === "map" && <><label>NAUTISCHE KARTE</label><h2>Fünf Reiche</h2><div className="map-grid">{(Object.keys(MAPS) as MapId[]).map(id => { const m = MAPS[id], locked = (id === "gloam" && hud.level < 2) || (id === "coral" && hud.level < 3) || (id === "maelstrom" && hud.level < 4) || (id === "abyss" && hud.level < 5 && hud.mapFragments < 8); return <button key={id} className={hud.mapId === id ? "current" : ""} onClick={() => travel(id)}><span>{locked ? "🔒" : id === "abyss" ? "◉" : id === "coral" ? "✺" : "≈"}</span><b>{m.name}</b><small>{m.sector} · Gefahr {m.danger} · Stärke {m.recommended}</small><em>{hud.mapId === id ? "AKTUELL" : locked ? "NOCH GESPERRT" : "KURS SETZEN"}</em></button>; })}</div></>}{panel === "port" && <><label>HAFEN ASTER · SICHERE ZONE</label><h2>Hafenviertel</h2><div className="port-actions"><button onClick={() => setPanel("shipyard")}><span>⚓</span><b>KRONENWERFT</b><small>Schiffe kaufen, wechseln und Kanonen ausrüsten</small></button><button onClick={() => setPanel("cauldron")}><span>♨</span><b>GEZEITENKESSEL</b><small>Mojo opfern, Beute und Kartenfragmente gewinnen</small></button></div><div className="shop-list"><Shop name="Reparaturkit" text="Stellt unterwegs 450 Rumpf wieder her" price="600 ◆" action={() => buy("repair")}/><Shop name="80 Eisenkugeln" text="Standardreserve für lange Jagden" price="300 ◆" action={() => buy("iron")}/><Shop name="25 Panzerbrecher" text="Bonus gegen gepanzerte Ziele" price="850 ◆" action={() => buy("piercing")}/><Shop name="Gezeiten-Mojo" text="Ritualopfer für den Kessel" price="500 ◆" action={() => buy("mojo")}/><Shop name={`Kanonenstufe ${hud.cannonLevel + 1}`} text="+12 % Kanonenschaden" price={`${1600 * hud.cannonLevel} ◆`} action={() => buy("cannon")}/><Shop name={`Harpunenstufe ${hud.harpoonLevel + 1}`} text="+12 % Monsterschaden" price={`${1400 * hud.harpoonLevel} ◆`} action={() => buy("harpoon")}/></div></>}{panel === "shipyard" && <><label>KRONENWERFT · FLOTTE {hud.ownedShips.length}/4</label><h2>Schiffe & Breitseiten</h2><div className="deck-upgrade"><div className="deck-pips">{Array.from({ length: 6 }, (_, i) => <i key={i} className={i < hud.deckLevel ? "filled" : ""} style={{ "--pip": DECK_LEVELS[(i + 1) as keyof typeof DECK_LEVELS].color } as React.CSSProperties}/>)}</div><div><small>AKTIVES OBERDECK · STUFE {hud.deckLevel}/6</small><b>{currentDeck.name}</b><span>☄ {currentDeck.weaponSlots} Waffenplätze · ◇ {currentDeck.expansionSlots} Erweiterungsplätze</span><em>Rumpf +{Math.round(currentDeck.hpBonus * 100)} % · Schutz +{Math.round(currentDeck.shieldBonus * 100)} %</em></div><button onClick={upgradeDeck} disabled={hud.deckLevel >= 6}>{hud.deckLevel < 6 ? `${nextDeck.name} · ${nextDeck.cost.toLocaleString("de-DE")} ◆` : "MAXIMAL AUSGEBAUT"}</button></div><h3>Schiffdesigns</h3><div className="fleet-grid">{(Object.keys(SHIPS) as ShipId[]).map(id => { const ship = SHIPS[id], owned = hud.ownedShips.includes(id), active = hud.shipId === id; return <article key={id} className={`fleet-card ${active ? "active" : ""}`} style={{ "--accent": ship.color } as React.CSSProperties} role="button" tabIndex={0} onClick={() => chooseShip(id)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ")
        chooseShip(id); }}><div className={`ship-showcase ${id}`}><Image src={SHIP_ART[id]} alt={`${ship.name} – eigenes Schiffdesign`} width={512} height={384} sizes="(max-width: 820px) 45vw, 320px"/><i /></div><b>{ship.name}</b><em>{ship.role} · sofort verfügbar</em><small>{ship.description}</small><span>{ship.hp} Rumpf · {ship.shield} Schutz · {ship.speed} Fahrt</span><button>{active ? "AKTIV" : owned ? "AUSRÜSTEN" : `${ship.price.toLocaleString("de-DE")} ◆`}</button></article>; })}</div><h3>Kanonenbatterien</h3><div className="cannon-grid">{(Object.keys(CANNONS) as CannonId[]).map(id => { const cannon = CANNONS[id], owned = hud.ownedCannons.includes(id), active = hud.cannonId === id; return <article key={id} className={active ? "active" : ""}><span style={{ color: cannon.color }}>☄</span><div><b>{cannon.name}</b><small>{cannon.description}</small><em>Schaden ×{cannon.damage} · Nachladen ×{cannon.reload} · Reichweite ×{cannon.range}</em></div><button onClick={() => chooseCannon(id)}>{active ? "AKTIV" : owned ? "AUSRÜSTEN" : `${cannon.price.toLocaleString("de-DE")} ◆`}</button></article>; })}</div></>}{panel === "cauldron" && <><label>VERBORGENER HAFEN · TÄGLICHES RITUAL</label><h2>Der Gezeitenkessel</h2><div className={`cauldron ${ritualing ? "ritualing" : ""}`}><div className="cauldron-orbit"><i /><i /><i /></div><div className="cauldron-bowl">♨</div><strong>{ritualResult}</strong><p>Opfere Mojo für Munition, Materialien, Perlen oder seltene Fragmente der Gezeitenkarte. Spätestens nach neun Ritualen erscheint ein Kartenfragment.</p><div className="ritual-stats"><span><b>{hud.mojos}</b> Mojo</span><span><b>{hud.mapFragments}/8</b> Kartenfragmente</span><span><b>{Math.min(9, hud.cauldronPity)}/9</b> Fragmentgarantie</span></div><button onClick={performRitual} disabled={ritualing}>{ritualing ? "DIE GEZEITEN ANTWORTEN …" : saveRef.current.lastFreeRitual !== new Date().toISOString().slice(0, 10) ? "KOSTENLOSES TAGESRITUAL" : "1 MOJO OPFERN"}</button></div></>}{panel === "events" && <><label>SAISON-EREIGNIS · LOKAL GEGEN KI</label><h2>Sturmflut der Vergessenen</h2><div className="event-hero"><div className="event-sigil">☠</div><div><small>ZEITLICHES FANTASY-EREIGNIS</small><b>Die Flotte der Hohlen Krone</b><p>Jage Geisterschiffe, sammle Gezeitensiegel und bezwinge anschließend den Elitekapitän in Sturmbruch.</p><span><i style={{ width: `${Math.min(100, (hud.kills + hud.monsters) * 10)}%` }}/></span><em>{Math.min(10, hud.kills + hud.monsters)} / 10 Gezeitensiegel</em></div></div><div className="event-rewards"><article><span>◆</span><b>2.500 Gold</b><small>bei 4 Siegeln</small></article><article><span>●</span><b>80 Perlen</b><small>bei 7 Siegeln</small></article><article><span>♜</span><b>Hohlen-Relikt</b><small>bei 10 Siegeln</small></article></div><button className="event-course" onClick={() => { setPanel(null); travel(hud.level >= 4 ? "maelstrom" : "gloam"); }}>EREIGNISKARTE ANSTEUERN</button></>}{panel === "inventory" && <><label>{SHIPS[hud.shipId].name.toUpperCase()} · AUSRÜSTUNG</label><h2>Schiff und Vorräte</h2><div className="loadout"><article><span>♜</span><b>{SHIPS[hud.shipId].name}</b><small>{SHIPS[hud.shipId].role} · {hud.ownedShips.length} Schiffe</small></article><article><span>☄</span><b>{CANNONS[hud.cannonId].name} · Stufe {hud.cannonLevel}</b><small>Schaden +{(hud.cannonLevel - 1) * 12}%</small></article><article><span>↯</span><b>Harpunenwerfer · Stufe {hud.harpoonLevel}</b><small>Monsterschaden +{(hud.harpoonLevel - 1) * 12}%</small></article><article><span>▦</span><b>{currentDeck.name} · Stufe {hud.deckLevel}</b><small>{currentDeck.weaponSlots} Waffen · {currentDeck.expansionSlots} Erweiterungen</small></article><article><span>⬡</span><b>Rumpf & Schutz</b><small>{hud.maxHp} Rumpf · {hud.maxShield} Schutz</small></article><article><span>♨</span><b>{hud.mojos} Gezeiten-Mojo</b><small>{hud.mapFragments}/8 Kartenfragmente</small></article><article><span>◆</span><b>Bergungsmaterial</b><small>{hud.materials} Fragmente</small></article></div><div className="save-actions"><button onClick={exportSave}>SPIELSTAND EXPORTIEREN</button><button onClick={() => fileRef.current?.click()}>IMPORTIEREN</button><button className="danger" onClick={() => { if (confirm("Lokalen Spielstand wirklich zurücksetzen?"))
        resetSave().then(() => location.reload()); }}>ZURÜCKSETZEN</button><label className="quality-setting">GRAFIKQUALITÄT<select value={qualityPreference} onChange={event => { const value = event.target.value as QualityPreference; saveQualityPreference(value); saveRef.current.settings = { ...saveRef.current.settings, qualityProfile: value }; writeSave(saveRef.current).catch(() => undefined); setQualityPreference(value); }}><option value="AUTO">AUTO</option><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="ULTRA">ULTRA</option></select></label><input ref={fileRef} type="file" accept="application/json" hidden onChange={importSave}/></div></>}</section>}
    {panel === "port" && <aside className="upgrade-dock glass"><label>WERFT-AUSBAU</label><h3>Schiffssysteme</h3><button onClick={() => buy("hull")}><span>⬡</span><b>Rumpf Stufe {saveRef.current.hullLevel}</b><small>+8 % Rumpf · {1250 * (saveRef.current.hullLevel ?? 1)} ◆</small></button><button onClick={() => buy("sails")}><span>≋</span><b>Segel Stufe {saveRef.current.sailLevel}</b><small>Fahrtvorbereitung · {1100 * (saveRef.current.sailLevel ?? 1)} ◆</small></button><button onClick={() => buy("crew")}><span>♟</span><b>Besatzung Stufe {saveRef.current.crewLevel}</b><small>Schaden & Nachladen · {1500 * (saveRef.current.crewLevel ?? 1)} ◆</small></button></aside>}
    <div className="hint">TOUCH: KURS SETZEN · LINKER STICK: KARTE · +/−: ZOOM · PINCH: ZOOM</div><div className="rotate-device"><div>↻</div><h2>Handy drehen</h2><p>Abyssal Dominion wird im Querformat gespielt.</p></div>
  </main>;
}
function Shop({ name, text, price, action }: {
    name: string;
    text: string;
    price: string;
    action: () => void;
}) { return <article><span><b>{name}</b><small>{text}</small></span><strong>{price}</strong><button onClick={action}>KAUFEN</button></article>; }
