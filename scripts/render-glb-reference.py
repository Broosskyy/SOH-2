#!/usr/bin/env python3
"""CPU-only orthographic GLB reference renderer for asset integration QA."""

import io
import json
import math
import struct
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


def load_glb(path: Path):
    data = path.read_bytes()
    magic, version, length = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF" or version != 2 or length != len(data):
        raise ValueError("Expected a complete glTF 2.0 binary file")
    offset = 12
    document = binary = None
    while offset < length:
        chunk_length, chunk_type = struct.unpack_from("<II", data, offset)
        chunk = data[offset + 8 : offset + 8 + chunk_length]
        if chunk_type == 0x4E4F534A:
            document = json.loads(chunk.rstrip(b" \0"))
        elif chunk_type == 0x004E4942:
            binary = chunk
        offset += 8 + chunk_length
    return document, binary


COMPONENTS = {5121: (np.uint8, 1), 5123: (np.uint16, 2), 5125: (np.uint32, 4), 5126: (np.float32, 4)}
SIZES = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}


def accessor(doc, binary, index):
    item = doc["accessors"][index]
    view = doc["bufferViews"][item["bufferView"]]
    dtype, component_size = COMPONENTS[item["componentType"]]
    components = SIZES[item["type"]]
    start = view.get("byteOffset", 0) + item.get("byteOffset", 0)
    stride = view.get("byteStride", component_size * components)
    if stride == component_size * components:
        return np.frombuffer(binary, dtype=dtype, count=item["count"] * components, offset=start).reshape((-1, components)).copy()
    values = np.empty((item["count"], components), dtype=dtype)
    for row in range(item["count"]):
        values[row] = np.frombuffer(binary, dtype=dtype, count=components, offset=start + row * stride)
    return values


def embedded_image(doc, binary, texture_index):
    image_index = doc["textures"][texture_index]["source"]
    image = doc["images"][image_index]
    view = doc["bufferViews"][image["bufferView"]]
    start = view.get("byteOffset", 0)
    return Image.open(io.BytesIO(binary[start : start + view["byteLength"]])).convert("RGB")


def render(vertices, triangles, uvs, texture, axes, depth_axis, output, labels):
    width, height, scale = 1200, 1200, 2
    canvas = Image.new("RGB", (width * scale, height * scale), (8, 15, 20))
    draw = ImageDraw.Draw(canvas)
    xy = vertices[:, axes]
    mins, maxs = xy.min(axis=0), xy.max(axis=0)
    span = np.maximum(maxs - mins, 1e-6)
    margin = 110 * scale
    factor = min((width * scale - 2 * margin) / span[0], (height * scale - 2 * margin) / span[1])
    projected = np.column_stack(((xy[:, 0] - mins[0]) * factor + margin, (maxs[1] - xy[:, 1]) * factor + margin))
    tex = np.asarray(texture)
    order = np.argsort(vertices[triangles].mean(axis=1)[:, depth_axis])
    light = np.array([0.35, 0.85, 0.4]); light /= np.linalg.norm(light)
    for face_index in order:
        face = triangles[face_index]
        points = vertices[face]
        normal = np.cross(points[1] - points[0], points[2] - points[0])
        normal_length = np.linalg.norm(normal)
        if normal_length == 0:
            continue
        normal /= normal_length
        uv = uvs[face].mean(axis=0)
        tx = int(np.clip(uv[0], 0, 1) * (tex.shape[1] - 1))
        ty = int((1 - np.clip(uv[1], 0, 1)) * (tex.shape[0] - 1))
        color = tex[ty, tx].astype(float)
        shade = 0.5 + 0.5 * abs(float(np.dot(normal, light)))
        fill = tuple(np.clip(color * shade, 0, 255).astype(np.uint8))
        polygon = [tuple(projected[index]) for index in face]
        draw.polygon(polygon, fill=fill)
    draw.rectangle((24 * scale, 24 * scale, (width - 24) * scale, (height - 24) * scale), outline=(188, 147, 77), width=2 * scale)
    draw.text((48 * scale, 42 * scale), labels[0], fill=(240, 222, 181), font=ImageFont.load_default(size=22 * scale))
    draw.text((48 * scale, (height - 78) * scale), labels[1], fill=(93, 218, 218), font=ImageFont.load_default(size=17 * scale))
    canvas.resize((width, height), Image.Resampling.LANCZOS).save(output)


doc, binary = load_glb(Path(sys.argv[1]))
primitive = doc["meshes"][0]["primitives"][0]
vertices = accessor(doc, binary, primitive["attributes"]["POSITION"]).astype(float)
uvs = accessor(doc, binary, primitive["attributes"]["TEXCOORD_0"]).astype(float)
indices = accessor(doc, binary, primitive["indices"]).reshape(-1).astype(np.int64)
triangles = indices.reshape((-1, 3))
texture = embedded_image(doc, binary, doc["materials"][primitive["material"]]["pbrMetallicRoughness"]["baseColorTexture"]["index"])
out_dir = Path(sys.argv[2]); out_dir.mkdir(parents=True, exist_ok=True)
render(vertices, triangles, uvs, texture, (0, 2), 1, out_dir / "kraken-top.png", ("KRAKEN SHIP — TOP / XZ", "-Z top  |  +Z bottom  |  X port-starboard"))
render(vertices, triangles, uvs, texture, (2, 1), 0, out_dir / "kraken-side.png", ("KRAKEN SHIP — SIDE / ZY", "-Z left  |  +Z right  |  Y up"))
print(out_dir / "kraken-top.png")
print(out_dir / "kraken-side.png")
