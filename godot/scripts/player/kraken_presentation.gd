class_name KrakenPresentation
extends RefCounted

const VISUAL_SCALE := 52.0
const WATERLINE_OFFSET := 20.5
const VISUAL_YAW_DEGREES := 180.0

static func apply_to_visual_root(visual_root: Node3D) -> void:
	if visual_root == null:
		return
	visual_root.scale = Vector3.ONE * VISUAL_SCALE
	visual_root.rotation_degrees = Vector3(0.0, VISUAL_YAW_DEGREES, 0.0)
	visual_root.position = Vector3(0.0, WATERLINE_OFFSET, 0.0)
