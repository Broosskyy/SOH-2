import { readFile } from "node:fs/promises";
import * as THREE from "three";

const filePath = process.argv[2];
if (!filePath) throw new Error("Usage: node scripts/analyze-glb.mjs <asset.glb>");

const bytes = await readFile(filePath);
if (bytes.toString("utf8", 0, 4) !== "glTF") throw new Error("Not a GLB file");
const version = bytes.readUInt32LE(4);
const declaredLength = bytes.readUInt32LE(8);
let offset = 12, json, binary;
while (offset < declaredLength) {
  const length = bytes.readUInt32LE(offset), type = bytes.readUInt32LE(offset + 4);
  const chunk = bytes.subarray(offset + 8, offset + 8 + length);
  if (type === 0x4e4f534a) json = JSON.parse(chunk.toString("utf8").trim());
  if (type === 0x004e4942) binary = chunk;
  offset += 8 + length;
}
if (!json || !binary) throw new Error("GLB JSON or BIN chunk missing");

const componentReaders = {
  5120: [1, "getInt8"], 5121: [1, "getUint8"], 5122: [2, "getInt16"],
  5123: [2, "getUint16"], 5125: [4, "getUint32"], 5126: [4, "getFloat32"],
};
const componentsByType = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };

function accessorValues(index) {
  const accessor = json.accessors[index], view = json.bufferViews[accessor.bufferView];
  const [componentBytes, method] = componentReaders[accessor.componentType];
  const components = componentsByType[accessor.type], stride = view.byteStride ?? componentBytes * components;
  const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0), data = new DataView(binary.buffer, binary.byteOffset, binary.byteLength), values = [];
  for (let i = 0; i < accessor.count; i++) {
    const row = [];
    for (let c = 0; c < components; c++) row.push(data[method](start + i * stride + c * componentBytes, true));
    values.push(row);
  }
  return values;
}

function nodeMatrix(node) {
  if (node.matrix) return new THREE.Matrix4().fromArray(node.matrix);
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...(node.translation ?? [0, 0, 0])),
    new THREE.Quaternion(...(node.rotation ?? [0, 0, 0, 1])),
    new THREE.Vector3(...(node.scale ?? [1, 1, 1])),
  );
}

const meshInstances = [], hierarchy = [];
function walk(nodeIndex, parentMatrix = new THREE.Matrix4(), depth = 0) {
  const node = json.nodes[nodeIndex], world = parentMatrix.clone().multiply(nodeMatrix(node));
  hierarchy.push(`${"  ".repeat(depth)}${node.name ?? `node_${nodeIndex}`}${node.mesh !== undefined ? ` [mesh:${json.meshes[node.mesh].name ?? node.mesh}]` : ""}`);
  if (node.mesh !== undefined) meshInstances.push({ nodeIndex, meshIndex: node.mesh, world });
  for (const child of node.children ?? []) walk(child, world, depth + 1);
}
const scene = json.scenes[json.scene ?? 0];
for (const node of scene.nodes ?? []) walk(node);

const bounds = new THREE.Box3(), points = [], primitiveDetails = [];
let triangles = 0, drawCalls = 0, hasNormals = true, hasUvs = true;
for (const instance of meshInstances) {
  const mesh = json.meshes[instance.meshIndex];
  for (const [primitiveIndex, primitive] of mesh.primitives.entries()) {
    drawCalls++;
    const positions = accessorValues(primitive.attributes.POSITION);
    for (const p of positions) {
      const point = new THREE.Vector3(p[0], p[1], p[2]).applyMatrix4(instance.world);
      bounds.expandByPoint(point); points.push(point);
    }
    const mode = primitive.mode ?? 4, elementCount = primitive.indices !== undefined ? json.accessors[primitive.indices].count : positions.length;
    const primitiveTriangles = mode === 4 ? Math.floor(elementCount / 3) : mode === 5 || mode === 6 ? Math.max(0, elementCount - 2) : 0;
    triangles += primitiveTriangles;
    hasNormals &&= primitive.attributes.NORMAL !== undefined;
    hasUvs &&= primitive.attributes.TEXCOORD_0 !== undefined;
    primitiveDetails.push({ mesh: mesh.name ?? instance.meshIndex, primitive: primitiveIndex, triangles: primitiveTriangles, vertices: positions.length, material: primitive.material !== undefined ? json.materials?.[primitive.material]?.name ?? primitive.material : null, normals: primitive.attributes.NORMAL !== undefined, uv0: primitive.attributes.TEXCOORD_0 !== undefined });
  }
}

function imageSize(image) {
  if (image.bufferView === undefined) return { uri: image.uri ?? "external" };
  const view = json.bufferViews[image.bufferView], data = binary.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
  if (data.subarray(1, 4).toString() === "PNG") return { width: data.readUInt32BE(16), height: data.readUInt32BE(20), bytes: data.length };
  if (data[0] === 0xff && data[1] === 0xd8) {
    let cursor = 2;
    while (cursor < data.length - 9) {
      if (data[cursor] !== 0xff) { cursor++; continue; }
      const marker = data[cursor + 1], length = data.readUInt16BE(cursor + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return { width: data.readUInt16BE(cursor + 7), height: data.readUInt16BE(cursor + 5), bytes: data.length };
      cursor += 2 + length;
    }
  }
  return { bytes: data.length };
}

const size = bounds.getSize(new THREE.Vector3()), center = bounds.getCenter(new THREE.Vector3());
const axes = [["X", size.x], ["Y", size.y], ["Z", size.z]].sort((a, b) => b[1] - a[1]);
const longAxis = axes[0][0].toLowerCase(), min = bounds.min[longAxis], max = bounds.max[longAxis], span = max - min;
const endCounts = { negative: 0, positive: 0 };
for (const p of points) { if (p[longAxis] < min + span * .15) endCounts.negative++; if (p[longAxis] > max - span * .15) endCounts.positive++; }

const materials = (json.materials ?? []).map((m, index) => ({
  index, name: m.name ?? `material_${index}`, alphaMode: m.alphaMode ?? "OPAQUE", doubleSided: !!m.doubleSided,
  baseColorFactor: m.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1, 1],
  metallicFactor: m.pbrMetallicRoughness?.metallicFactor ?? 1, roughnessFactor: m.pbrMetallicRoughness?.roughnessFactor ?? 1,
  baseColorTexture: m.pbrMetallicRoughness?.baseColorTexture?.index ?? null,
  metallicRoughnessTexture: m.pbrMetallicRoughness?.metallicRoughnessTexture?.index ?? null,
  normalTexture: m.normalTexture?.index ?? null, emissiveFactor: m.emissiveFactor ?? [0, 0, 0], emissiveTexture: m.emissiveTexture?.index ?? null,
}));
const images = (json.images ?? []).map((image, index) => ({ index, name: image.name ?? `image_${index}`, mimeType: image.mimeType ?? null, ...imageSize(image) }));

console.log(JSON.stringify({ file: filePath, version, declaredLength, generator: json.asset?.generator ?? null, scene: scene.name ?? null, hierarchy, meshes: json.meshes?.length ?? 0, meshInstances: meshInstances.length, drawCalls, triangles, hasNormals, hasUvs, bounds: { min: bounds.min.toArray(), max: bounds.max.toArray(), size: size.toArray(), center: center.toArray() }, dominantAxis: axes[0][0], endVertexDensity: endCounts, primitiveDetails, materials, textures: json.textures?.length ?? 0, samplers: json.samplers?.length ?? 0, images, animations: json.animations?.length ?? 0, skins: json.skins?.length ?? 0 }, null, 2));
