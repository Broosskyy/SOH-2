class_name NavalCameraController
extends Camera3D

signal profile_changed(profile_index: int, profile_name: String)

enum CameraProfile { PERSPECTIVE_NAVAL, LOW_FOV_PERSPECTIVE, ORTHOGRAPHIC }

const PROFILES := {
	CameraProfile.PERSPECTIVE_NAVAL: {
		"name": "Perspective Naval",
		"projection": PROJECTION_PERSPECTIVE,
		"fov": 35.0,
		"height": 560.0,
		"back": 360.0,
		"lateral": -58.0,
		"target_height": 12.0,
		"target_forward": -52.0,
	},
	CameraProfile.LOW_FOV_PERSPECTIVE: {
		"name": "Low-FOV Perspective",
		"projection": PROJECTION_PERSPECTIVE,
		"fov": 24.0,
		"height": 790.0,
		"back": 500.0,
		"lateral": -80.0,
		"target_height": 12.0,
		"target_forward": -68.0,
	},
	CameraProfile.ORTHOGRAPHIC: {
		"name": "Orthographic",
		"projection": PROJECTION_ORTHOGONAL,
		"size": 450.0,
		"height": 620.0,
		"back": 420.0,
		"lateral": -68.0,
		"target_height": 12.0,
		"target_forward": -58.0,
	},
}

@export var target_path: NodePath
@export var follow_smoothing := 5.5
@export var min_zoom := 0.55
@export var max_zoom := 1.38
@export var initial_profile: CameraProfile = CameraProfile.PERSPECTIVE_NAVAL
@export var boss_overview_multiplier := 1.30
@export var event_overview_multiplier := 1.14
@export var max_shake := 3.5

@onready var target: Node3D = get_node(target_path)
var zoom := 1.0
var current_profile: CameraProfile = CameraProfile.PERSPECTIVE_NAVAL
var boss_overview := false
var event_overview := false
var shake_strength := 0.0
var shake_remaining := 0.0

func _ready() -> void:
	# Read the engine-neutral policy; distances stay engine-specific scene tuning.
	var presentation: Dictionary = GameState.catalog.get("presentation", {})
	var camera_policy: Dictionary = presentation.get("camera", {})
	min_zoom = float(camera_policy.get("zoomMin", min_zoom))
	max_zoom = float(camera_policy.get("zoomMax", max_zoom))
	boss_overview_multiplier = float(camera_policy.get("bossOverviewMultiplier", boss_overview_multiplier))
	event_overview_multiplier = float(camera_policy.get("eventOverviewMultiplier", event_overview_multiplier))
	set_camera_profile(initial_profile, true)

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
	var profile: Dictionary = PROFILES[current_profile]
	var offset := Vector3(
		float(profile["lateral"]) * overview,
		float(profile["height"]) / zoom * overview,
		float(profile["back"]) / zoom * overview
	)
	global_position = global_position.lerp(target_on_plane + offset + shake, 1.0 - exp(-follow_smoothing * delta))
	look_at(target_on_plane + Vector3(
		0.0,
		float(profile["target_height"]),
		float(profile["target_forward"]) * overview
	), Vector3.UP)
	if projection == PROJECTION_ORTHOGONAL:
		size = float(profile["size"]) / zoom * overview

## Combat/world systems may request more overview without changing camera angle.
func set_boss_overview(enabled: bool) -> void:
	boss_overview = enabled

func set_event_overview(enabled: bool) -> void:
	event_overview = enabled

func request_shake(strength: float, duration: float = 0.18) -> void:
	shake_strength = clampf(maxf(shake_strength, strength), 0.0, max_shake)
	shake_remaining = maxf(shake_remaining, duration)

func set_camera_profile(profile_index: CameraProfile, snap_to_target := false) -> void:
	current_profile = profile_index
	var profile: Dictionary = PROFILES[current_profile]
	projection = int(profile["projection"]) as ProjectionType
	if projection == PROJECTION_PERSPECTIVE:
		fov = float(profile["fov"])
	else:
		size = float(profile["size"]) / zoom
	if snap_to_target and is_instance_valid(target):
		var target_on_plane := GameplayPlane.flatten(target.global_position)
		global_position = target_on_plane + Vector3(
			float(profile["lateral"]),
			float(profile["height"]) / zoom,
			float(profile["back"]) / zoom
		)
	profile_changed.emit(current_profile, profile_name())

func cycle_camera_profile() -> void:
	set_camera_profile(((current_profile + 1) % PROFILES.size()) as CameraProfile)

func profile_name() -> String:
	return str(PROFILES[current_profile]["name"])

func profile_value() -> float:
	return size if projection == PROJECTION_ORTHOGONAL else fov
