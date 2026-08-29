class_name Minimap
extends Control

@export var region_runtime_path: NodePath
@export var player_path: NodePath
@export var world_size := Vector2(3000.0, 2200.0)
@export var map_radius := 88.0

@onready var region_runtime: Node = get_node(region_runtime_path)
@onready var player: Node3D = get_node(player_path)

var _panel: PanelContainer
var _canvas: Control

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	custom_minimum_size = Vector2(174, 105)
	_build_ui()
	set_anchors_preset(Control.PRESET_TOP_RIGHT)
	anchor_left = 1.0
	anchor_right = 1.0
	offset_left = -186.0
	offset_top = 74.0
	offset_right = -12.0
	offset_bottom = 179.0

func _process(_delta: float) -> void:
	if _canvas == null:
		return
	for child in _canvas.get_children():
		child.queue_free()
	_draw_entities()
	_apply_responsive()

func _build_ui() -> void:
	_panel = PanelContainer.new()
	_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.02, 0.07, 0.09, 0.86)
	style.border_color = Color(0.62, 0.48, 0.24, 0.72)
	style.set_border_width_all(1)
	style.set_corner_radius_all(4)
	style.content_margin_left = 6
	style.content_margin_right = 6
	style.content_margin_top = 5
	style.content_margin_bottom = 5
	_panel.add_theme_stylebox_override("panel", style)
	add_child(_panel)
	var stack := VBoxContainer.new()
	stack.add_theme_constant_override("separation", 4)
	_panel.add_child(stack)
	var heading := Label.new()
	heading.text = "SEEKARTE"
	heading.add_theme_font_size_override("font_size", 8)
	heading.add_theme_color_override("font_color", Color(0.82, 0.68, 0.4))
	stack.add_child(heading)
	_canvas = Control.new()
	_canvas.custom_minimum_size = Vector2(156, 76)
	_canvas.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stack.add_child(_canvas)
	var sea := StyleBoxFlat.new()
	sea.bg_color = Color(0.04, 0.22, 0.28, 1.0)
	_canvas.add_theme_stylebox_override("panel", sea)

func _draw_entities() -> void:
	if player == null:
		return
	var center := _canvas.size * 0.5
	var scale := minf(_canvas.size.x, _canvas.size.y) / (map_radius * 2.2)
	_draw_islands(center, scale)
	_draw_pois(center, scale)
	_draw_npcs(center, scale)
	_draw_player(center, scale)

func _world_to_minimap(world_pos: Vector3, player_pos: Vector3, center: Vector2, scale: float) -> Vector2:
	var relative := Vector2(world_pos.x - player_pos.x, world_pos.z - player_pos.z)
	return center + relative * scale

func _draw_islands(center: Vector2, scale: float) -> void:
	if region_runtime == null:
		return
	for island in get_tree().get_nodes_in_group("island_entities"):
		if not island is IslandEntity:
			continue
		var entity := island as IslandEntity
		if entity.profile == null or entity.profile.display_name.is_empty():
			continue
		var pos := _world_to_minimap(entity.global_position, player.global_position, center, scale)
		if pos.distance_to(center) > minf(_canvas.size.x, _canvas.size.y) * 0.5:
			continue
		var dot := _make_dot(pos, Color(0.32, 0.72, 0.42), 6.0)

func _draw_pois(center: Vector2, scale: float) -> void:
	if region_runtime == null or not region_runtime.has_method("poi_count"):
		return
	for poi in region_runtime.pois:
		if poi == null:
			continue
		var pos := _world_to_minimap(poi.world_position, player.global_position, center, scale)
		var color := Color(0.88, 0.72, 0.95) if poi.poi_type == PoiDefinition.PoiType.LANDMARK else Color(0.92, 0.78, 0.32)
		_make_dot(pos, color, 4.0)

func _draw_npcs(center: Vector2, scale: float) -> void:
	for npc in get_tree().get_nodes_in_group("npc_ships"):
		if not npc is ShipEntity:
			continue
		var ship := npc as ShipEntity
		var pos := _world_to_minimap(ship.global_position, player.global_position, center, scale)
		if pos.distance_to(center) > minf(_canvas.size.x, _canvas.size.y) * 0.5:
			continue
		var hostile := ship.faction() == UnitFaction.Allegiance.HOSTILE
		_make_dot(pos, Color(0.92, 0.28, 0.22) if hostile else Color(0.42, 0.82, 0.95), 4.0)

func _draw_player(center: Vector2, _scale: float) -> void:
	var marker := Polygon2D.new()
	marker.color = Color(0.95, 0.82, 0.32)
	marker.polygon = PackedVector2Array([
		center + Vector2(0, -6),
		center + Vector2(-4, 5),
		center + Vector2(4, 5),
	])
	_canvas.add_child(marker)

func _make_dot(pos: Vector2, color: Color, radius: float) -> ColorRect:
	var dot := ColorRect.new()
	dot.color = color
	dot.size = Vector2(radius, radius)
	dot.position = pos - dot.size * 0.5
	dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_canvas.add_child(dot)
	return dot

func _apply_responsive() -> void:
	var viewport := get_viewport().get_visible_rect().size
	var mobile := PlatformService.mobile or viewport.x < 920.0
	offset_left = -186.0 if not mobile else -150.0
	offset_right = -12.0
	offset_top = 74.0 if not mobile else 67.0
	custom_minimum_size = Vector2(174, 105) if not mobile else Vector2(145, 92)

func map_data() -> Dictionary:
	return {
		"world_size": world_size,
		"map_radius": map_radius,
		"island_count": get_tree().get_nodes_in_group("island_entities").size(),
		"npc_count": get_tree().get_nodes_in_group("npc_ships").size(),
	}
