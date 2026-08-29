extends CanvasLayer

const QA_HEADINGS := [0.0, 45.0, 90.0, 135.0, 180.0, 225.0, 270.0, 315.0]

@export var player_path: NodePath
@export var camera_path: NodePath
@export var input_source_path: NodePath
@export var hud_path: NodePath
@export var world_path: NodePath
@export var region_runtime_path: NodePath

@onready var player: PlayerShip = get_node(player_path)
@onready var camera: NavalCameraController = get_node(camera_path)
@onready var input_source: PlayerInputSource = get_node(input_source_path)
@onready var hud: FloatingStatusHud = get_node(hud_path)
@onready var world: Node3D = get_node(world_path)
@onready var region_runtime: Node = get_node_or_null(region_runtime_path)

var label: Label
var heading_index := 0
var anchor_visible := false
var forward_visible := false
var collision_visible := false
var hud_bounds_visible := false
var island_bounds_visible := false
var performance_visible := true

func _ready() -> void:
	if not OS.is_debug_build():
		visible = false
		set_process(false)
		set_process_unhandled_key_input(false)
		return
	layer = 100
	label = Label.new()
	label.position = Vector2(12, 12)
	label.add_theme_font_size_override("font_size", 14)
	label.add_theme_color_override("font_color", Color(0.82, 0.96, 1.0))
	label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.9))
	label.add_theme_constant_override("shadow_offset_x", 1)
	label.add_theme_constant_override("shadow_offset_y", 1)
	add_child(label)

func _process(_delta: float) -> void:
	if label == null:
		return
	var renderer := str(ProjectSettings.get_setting("rendering/renderer/rendering_method", "unknown"))
	var camera_value := camera.size if camera.projection == Camera3D.PROJECTION_ORTHOGONAL else camera.fov
	var viewport_size := get_viewport().get_visible_rect().size
	var safe := PlatformService.safe_rect(viewport_size)
	var lines := [
		"BUILD: G0.3",
		"MILESTONE: WORLD DOMAIN + GAME UNIT",
		"REFERENCE: V20.3.2",
		"ENGINE: Godot %s" % Engine.get_version_info().get("string", "unknown"),
		"RENDERER: %s" % renderer,
		"PLATFORM: %s" % PlatformService.platform_name(),
		"REGION: %s" % _region_id(),
		"PLAYER X/Z: %.1f / %.1f" % [player.global_position.x, player.global_position.z],
		"HEADING: %.1f°" % player.heading_degrees(),
		"SPEED: %.1f" % player.speed(),
		"NAV DESTINATION: %s" % ("ACTIVE" if input_source.destination_active() else "NONE"),
		"CURRENT TARGET: %s" % _target_name(),
		"HARBOR STATE: %s" % _harbor_state(),
		"CAMERA PROFILE: %s" % camera.profile_name(),
		"CAMERA FOV / ORTHO SIZE: %.1f  ZOOM: %.2f" % [camera_value, camera.zoom],
		"QUALITY PROFILE: %s" % QualityManager.profile_name(),
		"INPUT MODE: %s" % input_source.input_mode_name(),
		"ISLANDS: %d  POIS: %d  NPCS: %d" % [_island_count(), _poi_count(), _npc_count()],
		"VIEWPORT: %dx%d  ASPECT: %.2f" % [viewport_size.x, viewport_size.y, viewport_size.x / maxf(1.0, viewport_size.y)],
		"DPR: %.2f" % _device_pixel_ratio(),
		"SAFE AREA: %.0f,%.0f %.0fx%.0f" % [safe.position.x, safe.position.y, safe.size.x, safe.size.y],
		"",
		"F1 OVERLAY  F2 8-WAY  F3 CAMERA  F4 QUALITY",
		"F5 UI ANCHOR  F6 FORWARD  F7 COLLISION",
		"F8 HUD BOUNDS  F9 ISLAND BOUNDS  F10 PERF",
	]
	if performance_visible:
		lines.insert(7, "FPS: %d  DRAWS: %d" % [
			int(Performance.get_monitor(Performance.TIME_FPS)),
			int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)),
		])
		lines.insert(8, "STATIC MEMORY: %.1f MiB" % (
			Performance.get_monitor(Performance.MEMORY_STATIC) / 1048576.0
		))
	label.text = "\n".join(lines)

func _unhandled_key_input(event: InputEvent) -> void:
	if not OS.is_debug_build() or not event.pressed or event.echo:
		return
	match event.keycode:
		KEY_F1:
			label.visible = not label.visible
		KEY_F2:
			heading_index = (heading_index + 1) % QA_HEADINGS.size()
			player.set_heading_degrees(QA_HEADINGS[heading_index])
		KEY_F3:
			camera.cycle_camera_profile()
		KEY_F4:
			QualityManager.cycle_profile()
		KEY_F5:
			anchor_visible = not anchor_visible
			player.set_debug_ui_anchor_visible(anchor_visible)
		KEY_F6:
			forward_visible = not forward_visible
			player.set_debug_forward_visible(forward_visible)
		KEY_F7:
			collision_visible = not collision_visible
			player.set_debug_collision_visible(collision_visible)
		KEY_F8:
			hud_bounds_visible = not hud_bounds_visible
			hud.set_debug_bounds_visible(hud_bounds_visible)
		KEY_F9:
			island_bounds_visible = not island_bounds_visible
			world.call("set_debug_island_bounds_visible", island_bounds_visible)
		KEY_F10:
			performance_visible = not performance_visible

func _region_id() -> String:
	return region_runtime.region_id() if region_runtime != null and region_runtime.has_method("region_id") else "unknown"

func _island_count() -> int:
	return region_runtime.island_count() if region_runtime != null and region_runtime.has_method("island_count") else 0

func _poi_count() -> int:
	return region_runtime.poi_count() if region_runtime != null and region_runtime.has_method("poi_count") else 0

func _npc_count() -> int:
	return region_runtime.npc_count() if region_runtime != null and region_runtime.has_method("npc_count") else 0

func _harbor_state() -> String:
	return region_runtime.harbor_phase() if region_runtime != null and region_runtime.has_method("harbor_phase") else "unknown"

func _target_name() -> String:
	if TargetingSystem.current_target == null:
		return "none"
	if TargetingSystem.current_target is ShipEntity:
		return (TargetingSystem.current_target as ShipEntity).display_name()
	return TargetingSystem.current_target.name

func _device_pixel_ratio() -> float:
	if OS.get_name() == "Web" and ClassDB.class_exists("JavaScriptBridge"):
		return float(JavaScriptBridge.eval("window.devicePixelRatio || 1"))
	return 1.0
