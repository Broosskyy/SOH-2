extends Node

const QA_HEADINGS := [0, 45, 90, 135, 180, 225, 270, 315]
const QA_ASPECTS := {
	"1280x720": Vector2i(1280, 720),
	"1920x1080": Vector2i(1920, 1080),
	"2400x1080": Vector2i(2400, 1080),
}
const QA_QUALITIES := ["LOW", "HIGH"]

@export var player_path: NodePath
@export var camera_path: NodePath
@export var mobile_controls_path: NodePath
@export var small_island_path: NodePath
@export var medium_island_path: NodePath
@export var poi_path: NodePath

@onready var player: PlayerShip = get_node(player_path)
@onready var camera: NavalCameraController = get_node(camera_path)
@onready var mobile_controls: CanvasLayer = get_node(mobile_controls_path)

func _ready() -> void:
	var args := OS.get_cmdline_args()
	if not "--qa-capture" in args and OS.get_environment("ABYSSAL_QA_CAPTURE") != "1":
		return
	print("G0.3.1 QA capture started")
	call_deferred("_capture_suite")

func _capture_suite() -> void:
	var output_dir := ProjectSettings.globalize_path("res://../artifacts/godot-g0.3.1")
	DirAccess.make_dir_recursive_absolute(output_dir)
	var requested_aspect := OS.get_environment("ABYSSAL_QA_ASPECT")
	var requested_quality := OS.get_environment("ABYSSAL_QA_QUALITY").to_upper()
	var aspects := [requested_aspect] if QA_ASPECTS.has(requested_aspect) else QA_ASPECTS.keys()
	var qualities := [requested_quality] if requested_quality in QA_QUALITIES else QA_QUALITIES
	for aspect_name in aspects:
		get_window().size = QA_ASPECTS[aspect_name]
		get_window().content_scale_size = QA_ASPECTS[aspect_name]
		await _settle()
		for quality_name in qualities:
			QualityManager.apply_forced(QualityManager.level_from_name(quality_name))
			var suite_dir := output_dir.path_join("%s/%s" % [aspect_name, quality_name.to_lower()])
			DirAccess.make_dir_recursive_absolute(suite_dir)
			await _capture_presentation_suite(suite_dir)
	_write_manifest(output_dir, aspects, qualities)
	print("G0.3.1 QA capture complete: %s" % output_dir)
	get_tree().quit()

func _capture_presentation_suite(output_dir: String) -> void:
	player.global_position = Vector3.ZERO
	camera.set_camera_profile(NavalCameraController.CameraProfile.PERSPECTIVE_NAVAL, true)
	camera.zoom = 1.0
	for heading in QA_HEADINGS:
		player.set_heading_degrees(float(heading))
		await _settle()
		_capture(output_dir.path_join("heading_%03d.png" % heading))
	player.set_heading_degrees(45.0)
	camera.zoom = camera.max_zoom
	await _settle()
	_capture(output_dir.path_join("kraken_close.png"))
	camera.zoom = 1.0
	await _settle()
	_capture(output_dir.path_join("kraken_default.png"))
	_capture(output_dir.path_join("floating_hud.png"))
	camera.zoom = camera.min_zoom
	await _settle()
	_capture(output_dir.path_join("kraken_far.png"))
	camera.zoom = 1.0
	player.global_position = _island_position("glass_reef") + Vector3(0, 0, 150)
	camera.set_camera_profile(NavalCameraController.CameraProfile.PERSPECTIVE_NAVAL, true)
	await _settle()
	_capture(output_dir.path_join("small_island.png"))
	player.global_position = _island_position("sun_rest") + Vector3(150, 0, 175)
	camera.set_camera_profile(NavalCameraController.CameraProfile.PERSPECTIVE_NAVAL, true)
	await _settle()
	_capture(output_dir.path_join("medium_island.png"))
	player.global_position = _harbor_position("harbor_aster") + Vector3(150, 0, 150)
	camera.set_camera_profile(NavalCameraController.CameraProfile.PERSPECTIVE_NAVAL, true)
	await _settle()
	_capture(output_dir.path_join("poi_harbor.png"))
	mobile_controls.visible = true
	await _settle()
	_capture(output_dir.path_join("mobile_layout.png"))
	mobile_controls.visible = PlatformService.mobile
	player.global_position = Vector3.ZERO
	camera.set_camera_profile(NavalCameraController.CameraProfile.PERSPECTIVE_NAVAL, true)
	for profile_index in NavalCameraController.PROFILES.size():
		camera.set_camera_profile(profile_index as NavalCameraController.CameraProfile, true)
		await _settle()
		_capture(output_dir.path_join("camera_profile_%s.png" % ["a", "b", "c"][profile_index]))
	camera.set_camera_profile(NavalCameraController.CameraProfile.PERSPECTIVE_NAVAL, true)

func _write_manifest(output_dir: String, aspects: Array, qualities: Array) -> void:
	var manifest := {
		"build": "G0.3.1",
		"milestone": "TARGET VISUAL FOUNDATION",
		"engine": Engine.get_version_info().get("string", "unknown"),
		"platform": PlatformService.platform_name(),
		"camera_profile": camera.profile_name(),
		"camera_fov": 35.0,
		"zoom_range": [camera.min_zoom, camera.max_zoom],
		"aspects": aspects,
		"qualities": qualities,
		"input_mode": "HYBRID_TAP_NAV",
	}
	var file := FileAccess.open(output_dir.path_join("manifest.json"), FileAccess.WRITE)
	if file != null:
		file.store_string(JSON.stringify(manifest, "\t"))

func _island_position(island_id: String) -> Vector3:
	for node in get_tree().get_nodes_in_group("island_entities"):
		if node is IslandEntity and node.island_id() == island_id:
			return node.global_position
	return Vector3.ZERO

func _harbor_position(harbor_id: String) -> Vector3:
	for node in get_tree().get_nodes_in_group("harbors"):
		if node.name == harbor_id:
			return node.global_position
	return Vector3.ZERO

func _settle() -> void:
	for frame in 8:
		await get_tree().process_frame

func _capture(path: String) -> void:
	var image := get_viewport().get_texture().get_image()
	if image == null:
		push_error("Could not read viewport image for QA capture: %s" % path)
		return
	var error := image.save_png(path)
	if error != OK:
		push_error("Could not save QA capture %s: %s" % [path, error_string(error)])
