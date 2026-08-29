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
	print("G0.3.2 QA capture started")
	call_deferred("_capture_suite")

func _capture_suite() -> void:
	var output_dir := ProjectSettings.globalize_path("res://../artifacts/godot-g0.3.2")
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
			await _capture_presentation_suite(suite_dir, quality_name)
	_write_manifest(output_dir, aspects, qualities)
	print("G0.3.2 QA capture complete: %s" % output_dir)
	get_tree().quit()

func _capture_presentation_suite(output_dir: String, quality_name: String) -> void:
	player.global_position = Vector3.ZERO
	player.set_heading_degrees(45.0)
	camera.set_camera_profile(NavalCameraController.CameraProfile.PERSPECTIVE_NAVAL, true)
	camera.zoom = 1.0
	await _settle()
	_capture(output_dir.path_join("01_DESKTOP_MID.png"))
	camera.zoom = camera.min_zoom
	await _settle()
	_capture(output_dir.path_join("02_DESKTOP_OUT.png"))
	camera.zoom = camera.max_zoom
	await _settle()
	_capture(output_dir.path_join("03_DESKTOP_IN.png"))
	camera.zoom = 1.0
	player.global_position = Vector3(80, 0, -40)
	await _settle()
	_capture(output_dir.path_join("04_WORLD_COMPOSITION.png"))
	player.global_position = _island_position("glass_reef") + Vector3(0, 0, 140)
	camera.zoom = 1.0
	await _settle()
	_capture(output_dir.path_join("05_SMALL_ISLAND.png"))
	player.global_position = _island_position("watch_cliff") + Vector3(120, 0, 80)
	await _settle()
	_capture(output_dir.path_join("06_LONG_ISLAND.png"))
	player.global_position = _island_position("sun_rest") + Vector3(140, 0, 160)
	await _settle()
	_capture(output_dir.path_join("07_MEDIUM_ISLAND.png"))
	player.global_position = _harbor_position("harbor_aster") + Vector3(120, 0, 130)
	await _settle()
	_capture(output_dir.path_join("08_HARBOR.png"))
	player.global_position = _npc_position("neutral_escort") + Vector3(80, 0, 60)
	await _settle()
	_capture(output_dir.path_join("09_NEUTRAL_NPC.png"))
	player.global_position = _npc_position("hostile_raider_a") + Vector3(80, 0, 60)
	await _settle()
	_capture(output_dir.path_join("10_HOSTILE_NPC.png"))
	player.global_position = Vector3.ZERO
	camera.zoom = 1.0
	await _settle()
	_capture(output_dir.path_join("11_PLAYER_FLOATING_UI.png"))
	player.global_position = _npc_position("hostile_raider_a") + Vector3(40, 0, 40)
	await _settle()
	_capture(output_dir.path_join("12_NPC_FLOATING_UI.png"))
	player.global_position = Vector3.ZERO
	_capture(output_dir.path_join("13_MINIMAP.png"))
	_capture(output_dir.path_join("14_DESKTOP_HUD.png"))
	mobile_controls.visible = true
	await _settle()
	_capture(output_dir.path_join("15_MOBILE_HUD.png"))
	_capture(output_dir.path_join("16_MOBILE_CONTROLS.png"))
	mobile_controls.visible = PlatformService.mobile
	if quality_name == "LOW":
		_capture(output_dir.path_join("17_LOW.png"))
	else:
		_capture(output_dir.path_join("18_HIGH.png"))

func _write_manifest(output_dir: String, aspects: Array, qualities: Array) -> void:
	var manifest := {
		"build": "G0.3.2",
		"milestone": "MOBILE TARGET PRESENTATION RECOVERY",
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

func _npc_position(group_id: String) -> Vector3:
	for node in get_tree().get_nodes_in_group("npc_ships"):
		if not node is NpcShip:
			continue
		var ship := node as NpcShip
		if ship.npc_definition != null and ship.npc_definition.npc_id == group_id:
			return ship.global_position
	return Vector3(200, 0, -120)

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
