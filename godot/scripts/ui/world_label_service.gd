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
	_labels[anchor_id] = {"node": label, "anchor": anchor, "priority": _priority_for_id(anchor_id), "npc": false}

func register_npc_anchor(
		anchor_id: String,
		anchor: Node3D,
		text: String,
		color: Color,
		max_hp: float
	) -> void:
	if _labels.has(anchor_id):
		return
	var label := LABEL_SCENE.instantiate()
	label.configure_npc(text, color, max_hp)
	add_child(label)
	_labels[anchor_id] = {"node": label, "anchor": anchor, "priority": _priority_for_id(anchor_id), "npc": true, "unit_id": anchor_id}

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
		if _should_hide_for_hud(label, int(entry.priority)):
			label.visible = false
			continue
		if entry.get("npc", false) and label.has_method("update_hp"):
			var unit := _resolve_unit(str(entry.get("unit_id", "")))
			if unit != null and unit.get("health") != null:
				var health: HealthComponent = unit.health
				label.update_hp(health.current_health, health.max_health)
		if distance > DECLUTTER_DISTANCE and _overlaps_existing(label, occupied):
			label.visible = false
			continue
		var label_rect := Rect2(label.position, label.size)
		var adjusted := _resolve_label_overlap(label_rect, occupied, int(entry.priority))
		label.position.y = adjusted.position.y
		label.visible = true
		occupied.append(Rect2(label.position, label.size))

func _should_hide_for_hud(label: Control, priority: int) -> bool:
	if priority >= 90:
		return false
	var hud_root := get_tree().get_first_node_in_group("gameplay_presentation_root")
	if hud_root == null:
		return false
	var viewport := ResponsiveHudMetrics.logical_ui_viewport_size(hud_root)
	var solution := ResponsiveHudLayoutSolver.solve(viewport)
	var rect := Rect2(label.position, label.size)
	for key in ["combat", "minimap", "mission", "chat"]:
		var region: Rect2 = solution.get(key, Rect2())
		if region.size == Vector2.ZERO:
			continue
		if VisibleContentBounds.major_overlap(rect, region, 0.18):
			return true
	return false

func _priority_for_id(anchor_id: String) -> int:
	if anchor_id.begins_with("player"):
		return 100
	var target := TargetingSystem.current_target
	if target != null and str(target.get_instance_id()) in anchor_id:
		return 90
	if anchor_id.contains("harbor"):
		return 80
	if anchor_id.contains("hostile") or anchor_id.contains("raider"):
		return 70
	return 50

func _resolve_label_overlap(rect: Rect2, occupied: Array[Rect2], priority: int) -> Rect2:
	var candidate := rect
	for _attempt in range(4):
		var blocked := false
		for other in occupied:
			if candidate.intersects(other.grow(2.0)):
				blocked = true
				break
		if not blocked:
			return candidate
		candidate.position.y -= 10.0 if priority >= 70 else 8.0
	return candidate

func _overlaps_existing(label: Control, occupied: Array[Rect2]) -> bool:
	var rect := Rect2(label.position, label.size).grow(4.0)
	for other in occupied:
		if rect.intersects(other):
			return true
	return false

func _resolve_unit(unit_id: String) -> Node:
	for npc in get_tree().get_nodes_in_group("npc_ships"):
		if npc is ShipEntity and npc.unit_id() == unit_id:
			return npc
	return null
