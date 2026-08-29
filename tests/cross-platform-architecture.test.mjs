import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("platform-neutral catalog contains every V15 gameplay domain", async () => {
  const catalog = JSON.parse(await read("shared/game-data/catalog.v1.json"));
  const godotCatalog = JSON.parse(await read("godot/data/catalog.v1.json"));
  const required = [
    "ships",
    "cannons",
    "ammo",
    "harpoons",
    "abilities",
    "enemies",
    "monsters",
    "bosses",
    "maps",
    "islands",
    "missions",
    "loot",
    "deckLevels",
    "economy",
    "events",
    "progression",
  ];
  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.coordinateSystem, "XZ_UP_Y");
  assert.equal(catalog.presentation.gameplayMode, "2.5D_NAVAL_COMBAT");
  assert.equal(catalog.presentation.rendering, "FULL_3D");
  assert.equal(catalog.presentation.gameplayPlane, "XZ");
  assert.equal(catalog.presentation.heightIsPlayerControlled, false);
  assert.equal(catalog.presentation.camera.playerOrbitEnabled, false);
  assert.equal(catalog.presentation.camera.thirdPersonChaseEnabled, false);
  for (const domain of required) assert.ok(catalog[domain], domain);
  assert.deepEqual(Object.keys(catalog.ships), [
    "sovereign",
    "tempest",
    "ironclad",
    "arcanum",
  ]);
  assert.equal(Object.keys(catalog.maps).length, 5);
  assert.equal(catalog.islands.length, 19);
  assert.equal(catalog.maps.aster.enemySpawns.length, 5);
  assert.equal(catalog.maps.gloam.enemySpawns.length, 6);
  assert.deepEqual(godotCatalog.presentation, catalog.presentation);
});

test("web and Godot expose the same logical input action contract", async () => {
  const actions = await read("app/game/input/actions.ts");
  const godot = await read("godot/project.godot");
  const required = [
    "moveForward",
    "moveBackward",
    "steerLeft",
    "steerRight",
    "selectTarget",
    "cycleTarget",
    "primaryFire",
    "harpoonFire",
    "ability1",
    "ability2",
    "ability3",
    "interact",
    "zoomIn",
    "zoomOut",
    "openMap",
    "openShipyard",
  ];
  for (const action of required) {
    assert.match(actions, new RegExp(`"${action}"`), `web:${action}`);
    assert.match(godot, new RegExp(`${action}=\\{`), `godot:${action}`);
  }
});

test("Godot migration base has scenes, platform, quality and save layers", async () => {
  const project = await read("godot/project.godot");
  const world = await read("godot/scenes/world/World.tscn");
  const localSave = await read("godot/scripts/save/local_save_repository.gd");
  assert.match(project, /run\/main_scene="res:\/\/scenes\/main\/Main.tscn"/);
  assert.match(project, /PlatformService/);
  assert.match(project, /QualityManager/);
  assert.match(world, /PlayerShip/);
  assert.match(world, /Camera3D/);
  assert.match(localSave, /user:\/\/profiles/);
});

test("Web and Godot enforce fixed-oblique 2.5D naval gameplay", async () => {
  const webPolicy = await read("app/game/camera/cameraPolicy.ts");
  const webRenderer = await read("app/threeRenderer.ts");
  const godotCamera = await read("godot/scripts/camera/camera_controller.gd");
  const godotShip = await read("godot/scripts/ships/player_ship.gd");
  const godotPlane = await read("godot/scripts/core/gameplay_plane.gd");

  assert.match(webPolicy, /projection: "fixed-oblique-perspective"/);
  assert.match(webPolicy, /playerOrbitEnabled: false/);
  assert.doesNotMatch(await read("app/game/input/actions.ts"), /orbit|rotateCamera/i);
  assert.match(webRenderer, /resolveCameraPresentation/);
  assert.match(webRenderer, /new THREE\.Plane\(new THREE\.Vector3\(0,1,0\),0\)/);
  assert.match(godotCamera, /PERSPECTIVE_NAVAL/);
  assert.match(godotCamera, /LOW_FOV_PERSPECTIVE/);
  assert.match(godotCamera, /ORTHOGRAPHIC/);
  assert.match(godotCamera, /GameState\.catalog/);
  assert.match(godotCamera, /set_boss_overview/);
  assert.doesNotMatch(godotCamera, /orbit/i);
  assert.match(godotShip, /position\.y = GameplayPlane\.WATER_Y/);
  assert.match(godotPlane, /const WATER_Y := 0\.0/);
});

test("V20 ships an engine-neutral world and hero-asset pipeline", async () => {
  const renderer = await read("app/threeRenderer.ts");
  const page = await read("app/page.tsx");
  const materials = JSON.parse(await read("public/assets/3d/materials/stylized-naval-materials.v1.json"));
  const manifest = JSON.parse(await read("public/assets/3d/ships/sovereign-frigate/manifest.json"));
  assert.match(renderer, /uIslandCount/);
  assert.match(renderer, /createWorldProp/);
  assert.match(renderer, /createWakePatch/);
  assert.match(renderer, /createWaterSplash/);
  assert.match(renderer, /GLTFLoader/);
  assert.match(page, /startDistance/);
  assert.match(page, /gesture\.pinching/);
  assert.equal(materials.workflow, "metallic-roughness");
  assert.equal(manifest.lods.length, 3);
  for (let lod = 0; lod <= 2; lod++) {
    const webPath = new URL(`../public/assets/3d/ships/sovereign-frigate/sovereign-frigate-lod${lod}.glb`, import.meta.url);
    const godotPath = new URL(`../godot/assets/ships/player/sovereign-frigate/sovereign-frigate-lod${lod}.glb`, import.meta.url);
    assert.ok((await stat(webPath)).size > 1024, `web LOD${lod}`);
    assert.equal((await stat(webPath)).size, (await stat(godotPath)).size, `mirrored LOD${lod}`);
  }
});

test("V20.1 integrates the exact Kraken player GLB with visual-only configuration and fallbacks", async () => {
  const renderer = await read("app/threeRenderer.ts");
  const page = await read("app/page.tsx");
  const visualConfig = await read("app/game/visuals/shipVisuals.ts");
  const manifest = JSON.parse(
    await read("public/assets/3d/ships/player/kraken/manifest.json"),
  );
  const webAsset = new URL(
    "../public/assets/3d/ships/player/kraken/Kraken_ship_player_30k.glb",
    import.meta.url,
  );
  const godotAsset = new URL(
    "../godot/assets/ships/player/kraken/Kraken_ship_player_30k.glb",
    import.meta.url,
  );

  assert.equal(manifest.analysis.triangles, 30744);
  assert.equal(manifest.analysis.drawCalls, 1);
  assert.equal(manifest.analysis.materials, 1);
  assert.deepEqual(manifest.lods, []);
  assert.equal((await stat(webAsset)).size, 21394148);
  assert.equal((await stat(webAsset)).size, (await stat(godotAsset)).size);

  assert.match(visualConfig, /Kraken_ship_player_30k\.glb/);
  assert.match(visualConfig, /scale: 65/);
  assert.match(visualConfig, /rotationOffsetY: KRAKEN_MODEL_YAW_OFFSET/);
  assert.match(visualConfig, /waterlineOffset: 22/);
  assert.match(visualConfig, /wakeOffset: \{ forward: -62, lateral: 0 \}/);
  for (const shipId of ["sovereign", "tempest", "ironclad", "arcanum"])
    assert.match(visualConfig, new RegExp(`${shipId}: KRAKEN_PLAYER_VISUAL`));
  assert.match(page, /PLAYER_SHIP_VISUALS/);
  assert.match(page, /worldOffset/);
  assert.match(renderer, /loadPlayerShipVisuals/);
  assert.match(renderer, /loadLegacySovereignVisual/);
  assert.match(renderer, /ProceduralPlayerFallback/);
  assert.match(renderer, /playerMuzzlePosition/);
  assert.match(renderer, /shipDebug/);
  assert.match(renderer, /PlayerShipRoot/);
  assert.match(renderer, /PlayerShipVisualRoot/);
  assert.match(renderer, /ImportedKrakenMesh/);
  assert.match(renderer, /Kraken GLB loaded -> mesh attached -> fallback hidden/);
  assert.match(renderer, /Kraken assigned to active saved player ship/);
  assert.match(renderer, /Kraken follows gameplay PlayerShipRoot/);
  assert.match(renderer, /for\(const shipId of PLAYER_SHIP_IDS\)this\.playerVisualTemplates\.set\(shipId,root\)/);
  assert.doesNotMatch(renderer, /Kraken cached for inactive ship/);
  assert.doesNotMatch(renderer, /id==="sovereign"/);
  assert.match(renderer, /__ABYSSAL_PLAYER_VISUAL__/);
  assert.match(renderer, /fetch\(assetUrl/);
  assert.match(renderer, /cache:"no-store"/);
  assert.match(renderer, /20\.1-kraken-device-fix-3/);
  assert.match(page, /KRAKEN-LADEFEHLER/);
  assert.match(page, /visualBoundsCenter/);
  assert.match(renderer, /loader\.parseAsync\(buffer,basePath\)/);
  assert.match(renderer, /o\.frustumCulled=false/);
  assert.doesNotMatch(renderer, /world\.remove\(this\.player\);this\.player=template/);
});
