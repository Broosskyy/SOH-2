import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

globalThis.FileReader = class FileReader {
  result = null;
  onloadend = null;
  async readAsArrayBuffer(blob) { this.result = await blob.arrayBuffer(); this.onloadend?.(); }
  async readAsDataURL(blob) { this.result = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString("base64")}`; this.onloadend?.(); }
};

const material = (name, color, roughness, metalness = 0) => {
  const value = new THREE.MeshStandardMaterial({ name, color, roughness, metalness });
  return value;
};

function hullGeometry(segments) {
  const points = [[-50, 0, 0], [-43, 8, 13], [-12, 13, 20], [30, 11, 17], [52, 6, 0], [30, 11, -17], [-12, 13, -20], [-43, 8, -13]];
  const vertices = [], indices = [];
  for (let layer = 0; layer < 2; layer++) for (const [x, y, z] of points) vertices.push(x, y + layer * 12, z * (layer ? 1 : .55));
  for (let i = 0; i < 8; i++) { const n = (i + 1) % 8; indices.push(i, n, 8 + n, i, 8 + n, 8 + i); }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices.flat(), 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry.toNonIndexed().setDrawRange(0, segments > 12 ? Infinity : 72);
}

function buildSovereign(lod) {
  const root = new THREE.Group(); root.name = `Sovereign_Frigate_LOD${lod}`;
  const wood = material("MAT_StylizedWood", 0x6d351e, .72, .04), dark = material("MAT_DarkWood", 0x2b1a16, .8, .03), deck = material("MAT_DeckWood", 0x92613b, .84, .02), bronze = material("MAT_Bronze", 0xb7833f, .4, .62), metal = material("MAT_Metal", 0x242a2e, .3, .86), cloth = material("MAT_SailCloth", 0xe8ddc3, .9, 0), accent = material("MAT_AbyssalAccent", 0x3cbfc5, .38, .28);
  const add = (name, geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0]) => { const mesh = new THREE.Mesh(geometry, mat); mesh.name = name; mesh.position.set(...position); mesh.rotation.set(...rotation); root.add(mesh); return mesh; };
  add("hull", hullGeometry(lod === 0 ? 24 : lod === 1 ? 14 : 8), wood, [0, 0, 0]);
  add("deck", new THREE.BoxGeometry(72, 3, 31, lod === 0 ? 3 : 1, 1, lod === 0 ? 2 : 1), deck, [-4, 21, 0]);
  add("stern", new THREE.BoxGeometry(25, 19, 25), dark, [-36, 29, 0]);
  add("bow", new THREE.ConeGeometry(4, 31, lod === 0 ? 10 : 6), bronze, [61, 15, 0], [0, 0, -Math.PI / 2]);
  const mastCount = lod === 2 ? 1 : 2;
  for (let i = 0; i < mastCount; i++) {
    const x = i ? 22 : -15, h = i ? 67 : 80;
    add(`mast_${i + 1}`, new THREE.CylinderGeometry(1.2, 2, h, lod === 0 ? 10 : 7), dark, [x, 23 + h / 2, 0]);
    const shape = new THREE.Shape(); shape.moveTo(-20, 21); shape.lineTo(20, 17); shape.lineTo(16, -21); shape.lineTo(-16, -18); shape.closePath();
    add(`sail_${i + 1}`, new THREE.ShapeGeometry(shape, lod === 0 ? 6 : 2), cloth, [x + 3, 67, 1], [0, -Math.PI / 2, 0]);
  }
  const cannonCount = lod === 0 ? 5 : lod === 1 ? 3 : 2;
  for (const side of [-1, 1]) for (let i = 0; i < cannonCount; i++) {
    const x = -24 + i * (48 / Math.max(1, cannonCount - 1));
    add(`cannon_${side > 0 ? "port" : "starboard"}_${i + 1}`, new THREE.CylinderGeometry(1.4, 2, 13, lod === 0 ? 10 : 6), metal, [x, 25, side * 20], [Math.PI / 2, 0, 0]);
  }
  add("flag", new THREE.PlaneGeometry(18, 10, lod === 0 ? 3 : 1, 1), accent, [-14, 105, 1], [0, -Math.PI / 2, 0]);
  add("keel", new THREE.BoxGeometry(74, 3, 3), bronze, [-4, 7, 0]);
  root.userData = { assetId: "sovereign-frigate", lod, units: "meters", forwardAxis: "+X", upAxis: "+Y", gameplayPlane: "XZ", modularParts: ["hull", "deck", "mast", "sails", "cannons", "stern", "bow", "flag"] };
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return root;
}

async function exportGlb(object) {
  const exporter = new GLTFExporter();
  return await new Promise((resolve, reject) => exporter.parse(object, resolve, reject, { binary: true, onlyVisible: true, trs: false }));
}

const publicDir = path.resolve("public/assets/3d/ships/sovereign-frigate"), godotDir = path.resolve("godot/assets/ships/player/sovereign-frigate");
await mkdir(publicDir, { recursive: true }); await mkdir(godotDir, { recursive: true });
for (let lod = 0; lod <= 2; lod++) {
  const file = `sovereign-frigate-lod${lod}.glb`, data = await exportGlb(buildSovereign(lod));
  await writeFile(path.join(publicDir, file), Buffer.from(data));
  await copyFile(path.join(publicDir, file), path.join(godotDir, file));
}
console.log("Generated Sovereign Frigate LOD0/LOD1/LOD2 GLB assets.");
