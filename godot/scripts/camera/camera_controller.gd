extends Camera3D

@export var target_path: NodePath
@export var follow_smoothing := 5.5
@export var min_zoom := 0.68
@export var max_zoom := 1.35
@export var base_height := 185.0
@export var base_back_distance := 235.0
@export var fixed_lateral_offset := -42.0
@export var target_height := 3.0
@export var target_forward_offset := -18.0
@export var boss_overview_multiplier := 1.30
@export var event_overview_multiplier := 1.14
@export var max_shake := 3.5

@onready var target: Node3D = get_node(target_path)
var zoom := 1.0
var boss_overview := false
var event_overview := false
var shake_strength := 0.0
var shake_remaining := 0.0

func _ready() -> void:
	# Read the engine-neutral policy; distances stay engine-specific scene tuning.
	var presentation: Dictionary = GameState.catalog.get("presentation", {})
	var camera_policy: Dictionary = presentation.get("camera", {})
	fov = float(camera_policy.get("fovDegrees", fov))
	min_zoom = float(camera_policy.get("zoomMin", min_zoom))
	max_zoom = float(camera_policy.get("zoomMax", max_zoom))
	boss_overview_multiplier = float(camera_policy.get("bossOverviewMultiplier", boss_overview_multiplier))
	event_overview_multiplier = float(camera_policy.get("eventOverviewMultiplier", event_overview_multiplier))

func _process(delta: float) -> void:
	if Input.is_action_just_pressed("zoomIn"):
		zoom = clampf(zoom + 0.08, min_zoom, max_zoom)
	if Input.is_action_just_pressed("zoomOut"):
		zoom = clampf(zoom - 0.08, min_zoom, max_zoom)
	var overview := boss_overview_multiplier if boss_overview else (event_overview_multiplier if event_overview else 1.0)
	var target_on_plane := GameplayPlane.flatten(target.global_position)
	var shake := Vector3.ZERO
	if shake_remaining > 0.0:
		shake_remaining = maxf(0.0, shake_remaining - delta)
		var fade := minf(1.0, shake_remaining * 8.0)
		shake = Vector3(sin(Time.get_ticks_msec() * 0.083), 0.0, cos(Time.get_ticks_msec() * 0.071)) * shake_strength * fade
	else:
		shake_strength = 0.0
	var offset := Vector3(fixed_lateral_offset * overview, base_height / zoom * overview, base_back_distance / zoom * overview)
	global_position = global_position.lerp(target_on_plane + offset + shake, 1.0 - exp(-follow_smoothing * delta))
	look_at(target_on_plane + Vector3(0.0, target_height, target_forward_offset * overview), Vector3.UP)

## Combat/world systems may request more overview without changing camera angle.
func set_boss_overview(enabled: bool) -> void:
	boss_overview = enabled

func set_event_overview(enabled: bool) -> void:
	event_overview = enabled

func request_shake(strength: float, duration: float = 0.18) -> void:
	shake_strength = clampf(maxf(shake_strength, strength), 0.0, max_shake)
	shake_remaining = maxf(shake_remaining, duration)
