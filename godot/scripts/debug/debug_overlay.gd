extends CanvasLayer

const QA_HEADINGS := [0.0, 45.0, 90.0, 135.0, 180.0, 225.0, 270.0, 315.0]

@export var player_path: NodePath
@export var camera_path: NodePath

@onready var player: PlayerShip = get_node(player_path)
@onready var camera: NavalCameraController = get_node(camera_path)

var label: Label
var heading_index := 0
var anchor_visible := false
var forward_visible := false
var collision_visible := false

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
	label.text = "\n".join([
		"BUILD: G0.1",
		"MILESTONE: GODOT 4.7.2 FOUNDATION RECOVERY",
		"REFERENCE: V20.3.2",
		"ENGINE: Godot %s" % Engine.get_version_info().get("string", "unknown"),
		"RENDERER: %s" % renderer,
		"PLATFORM: %s" % PlatformService.platform_name(),
		"FPS: %d" % int(Performance.get_monitor(Performance.TIME_FPS)),
		"PLAYER X/Z: %.1f / %.1f" % [player.global_position.x, player.global_position.z],
		"HEADING: %.1f°" % player.heading_degrees(),
		"SPEED: %.1f" % player.speed(),
		"CAMERA PROFILE: %s" % camera.profile_name(),
		"CAMERA FOV / ORTHO SIZE: %.1f" % camera_value,
		"QUALITY PROFILE: %s" % QualityManager.profile_name(),
		"",
		"F1 OVERLAY  F2 8-WAY  F3 CAMERA  F4 QUALITY",
		"F5 UI ANCHOR  F6 FORWARD  F7 COLLISION",
	])

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
