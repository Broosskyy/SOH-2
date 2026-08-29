extends Node

const LABEL_SCENE := preload("res://scenes/ui/WorldLabel.tscn")
const MAX_VISIBLE_DISTANCE := 1400.0
const DECLUTTER_DISTANCE := 520.0

var _labels: Dictionary = {}

func register_anchor(anchor_id: String, anchor: Node3D, text: String, color: Color = Color(0.92, 0.9, 0.72)) -> void:
	if text.strip_edges().is_empty():
		return
	if _labels.has(anchor_id):
		return
	var label := LABEL_SCENE.instantiate()
	label.configure(text, color)
	add_child(label)
	_labels[anchor_id] = {"node": label, "anchor": anchor, "priority": _priority_for_id(anchor_id)}

func _process(_delta: float) -> void:
	var camera := get_viewport().get_camera_3d()
	if camera == null:
		return
	var player := get_tree().get_first_node_in_group("player_ship") as Node3D
	var player_pos := player.global_position if player != null else Vector3.ZERO
	var entries: Array = _labels.values()
	entries.sort_custom(func(a, b): return int(a.priority) > int(b.priority))
	var occupied: Array[Rect2] = []
	for entry in entries:
		var label: Control = entry.node
		var anchor: Node3D = entry.anchor
		if not is_instance_valid(anchor) or not anchor.is_inside_tree():
			label.visible = false
			continue
		var distance := player_pos.distance_to(anchor.global_position)
		if distance > MAX_VISIBLE_DISTANCE:
			label.visible = false
			continue
		label.update_projection(camera, anchor.global_position)
		if distance > DECLUTTER_DISTANCE and _overlaps_existing(label, occupied):
			label.visible = false
			continue
		label.visible = true
		occupied.append(Rect2(label.position, label.size))

func _priority_for_id(anchor_id: String) -> int:
	if anchor_id.begins_with("player"):
		return 100
	if anchor_id.contains("harbor"):
		return 80
	if anchor_id.contains("hostile") or anchor_id.contains("raider"):
		return 70
	return 50

func _overlaps_existing(label: Control, occupied: Array[Rect2]) -> bool:
	var rect := Rect2(label.position, label.size).grow(4.0)
	for other in occupied:
		if rect.intersects(other):
			return true
	return false
