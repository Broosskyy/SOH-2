class_name Minimap
extends Control

@export var region_runtime_path: NodePath
@export var player_path: NodePath
@export var map_radius := 520.0

@onready var region_runtime: Node = get_node(region_runtime_path)
@onready var player: Node3D = get_node(player_path)

var _panel: PanelContainer
var _canvas: MinimapCanvas

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_build_ui()
	_apply_layout()

func _process(_delta: float) -> void:
	if _canvas != null:
		_canvas.queue_redraw()
	_apply_layout()

func _build_ui() -> void:
	_panel = PanelContainer.new()
	_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.02, 0.07, 0.09, 0.9)
	style.border_color = Color(0.72, 0.57, 0.27, 0.82)
	style.set_border_width_all(2)
	style.set_corner_radius_all(6)
	style.content_margin_left = 8
	style.content_margin_right = 8
	style.content_margin_top = 6
	style.content_margin_bottom = 6
	_panel.add_theme_stylebox_override("panel", style)
	add_child(_panel)
	var stack := VBoxContainer.new()
	stack.add_theme_constant_override("separation", 4)
	_panel.add_child(stack)
	var heading := Label.new()
	heading.name = "Heading"
	heading.text = "SEEKARTE"
	heading.add_theme_color_override("font_color", Color(0.92, 0.76, 0.42))
	stack.add_child(heading)
	_canvas = MinimapCanvas.new()
	_canvas.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_canvas.region_runtime = region_runtime
	_canvas.player = player
	_canvas.map_radius = map_radius
	stack.add_child(_canvas)

func _apply_layout() -> void:
	var viewport := get_viewport().get_visible_rect().size
	var mobile := HudLayout.is_mobile_layout(viewport)
	var scale := HudLayout.scale_factor(viewport)
	var width := 220.0 * scale if mobile else 196.0 * scale
	var height := 138.0 * scale if mobile else 118.0 * scale
	custom_minimum_size = Vector2(width, height)
	size = custom_minimum_size
	anchor_left = 1.0
	anchor_right = 1.0
	anchor_top = 0.0
	offset_left = -width - HudLayout.panel_margin(viewport)
	offset_right = -HudLayout.panel_margin(viewport)
	offset_top = (72.0 if not mobile else 64.0) * scale
	offset_bottom = offset_top + height
	if _canvas != null:
		_canvas.custom_minimum_size = Vector2(width - 16.0, height - 28.0)
	var heading := _panel.get_node_or_null("VBoxContainer/Heading") as Label
	if heading == null and _panel.get_child_count() > 0:
		var stack := _panel.get_child(0) as VBoxContainer
		if stack != null and stack.get_child_count() > 0:
			heading = stack.get_child(0) as Label
	if heading != null:
		heading.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0))

func map_data() -> Dictionary:
	return {
		"map_radius": map_radius,
		"island_count": get_tree().get_nodes_in_group("island_entities").size(),
		"npc_count": get_tree().get_nodes_in_group("npc_ships").size(),
	}

class MinimapCanvas extends Control:
	var region_runtime: Node
	var player: Node3D
	var map_radius := 520.0

	func _draw() -> void:
		if player == null:
			return
		var center := size * 0.5
		var radius := minf(size.x, size.y) * 0.46
		draw_circle(center, radius, Color(0.04, 0.2, 0.28, 0.95))
		draw_arc(center, radius, 0.0, TAU, 48, Color(0.62, 0.48, 0.24, 0.65), 2.0)
		var scale := radius / map_radius
		_draw_islands(center, scale)
		_draw_pois(center, scale)
		_draw_npcs(center, scale)
		var player_points := PackedVector2Array([
			center + Vector2(0.0, -8.0),
			center + Vector2(-6.0, 6.0),
			center + Vector2(6.0, 6.0),
		])
		draw_colored_polygon(player_points, Color(0.95, 0.82, 0.32))

	func _world_to_map(world_pos: Vector3, center: Vector2, scale: float) -> Vector2:
		var relative := Vector2(world_pos.x - player.global_position.x, world_pos.z - player.global_position.z)
		return center + relative * scale

	func _draw_islands(center: Vector2, scale: float) -> void:
		for island in get_tree().get_nodes_in_group("island_entities"):
			if not island is IslandEntity:
				continue
			var entity := island as IslandEntity
			if entity.profile == null or entity.profile.display_name.is_empty():
				continue
			var pos := _world_to_map(entity.global_position, center, scale)
			if pos.distance_to(center) > minf(size.x, size.y) * 0.45:
				continue
			var island_radius := 5.0 + entity.profile.footprint_radius() * scale * 0.08
			draw_circle(pos, clampf(island_radius, 4.0, 12.0), Color(0.28, 0.62, 0.38, 0.9))

	func _draw_pois(center: Vector2, scale: float) -> void:
		if region_runtime == null:
			return
		for poi in region_runtime.pois:
			if poi == null:
				continue
			var pos := _world_to_map(poi.world_position, center, scale)
			var color := Color(0.88, 0.72, 0.95) if poi.poi_type == PoiDefinition.PoiType.LANDMARK else Color(0.92, 0.78, 0.32)
			draw_circle(pos, 4.0, color)

	func _draw_npcs(center: Vector2, scale: float) -> void:
		for npc in get_tree().get_nodes_in_group("npc_ships"):
			if not npc is ShipEntity:
				continue
			var ship := npc as ShipEntity
			var pos := _world_to_map(ship.global_position, center, scale)
			if pos.distance_to(center) > minf(size.x, size.y) * 0.45:
				continue
			var hostile := ship.faction() == UnitFaction.Allegiance.HOSTILE
			draw_circle(pos, 4.5, Color(0.92, 0.28, 0.22) if hostile else Color(0.42, 0.82, 0.95))
