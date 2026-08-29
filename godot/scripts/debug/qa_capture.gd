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
	print("G0.4 QA capture started")
	call_deferred("_capture_suite")

func _capture_suite() -> void:
	var output_dir := ProjectSettings.globalize_path("res://../artifacts/godot-g0.4")
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
	print("G0.4 QA capture complete: %s" % output_dir)
	get_tree().quit()

func _capture_presentation_suite(output_dir: String, quality_name: String) -> void:
	player.global_position = MockupCompositionProfile.PLAYER_SPAWN
	player.set_heading_degrees(45.0)
	camera.set_camera_profile(NavalCameraController.CameraProfile.PERSPECTIVE_NAVAL, true)
	camera.zoom = MockupCompositionProfile.DEFAULT_CAMERA_ZOOM
	await _settle()
	_capture(output_dir.path_join("01_CLEAN_GAMEPLAY_DESKTOP.png"))
	mobile_controls.visible = true
	await _settle()
	_capture(output_dir.path_join("02_CLEAN_GAMEPLAY_MOBILE_EMULATION.png"))
	mobile_controls.visible = PlatformService.mobile
	_capture(output_dir.path_join("03_PLAYER_FLOATING_HUD.png"))
	_capture(output_dir.path_join("04_TOP_HUD.png"))
	_capture(output_dir.path_join("05_MISSION.png"))
	_capture(output_dir.path_join("06_MINIMAP.png"))
	player.global_position = _npc_position("black_corsair") + Vector3(60, 0, 40)
	await _settle()
	_capture(output_dir.path_join("07_NPC_GROUP.png"))
	_capture(output_dir.path_join("08_HOSTILE_TARGET.png"))
	player.global_position = _harbor_position("harbor_aster_port") + Vector3(-120, 0, 80)
	await _settle()
	_capture(output_dir.path_join("09_HARBOR.png"))
	player.global_position = MockupCompositionProfile.world_pos(75, -72)
	await _settle()
	_capture(output_dir.path_join("10_POI_LOOT.png"))
	player.global_position = MockupCompositionProfile.PLAYER_SPAWN
	await _settle()
	_capture(output_dir.path_join("11_WORLD_COMPOSITION.png"))
	player.global_position = _island_position("coral_crescent") + Vector3(0, 0, 120)
	await _settle()
	_capture(output_dir.path_join("12_SMALL_ISLAND.png"))
	player.global_position = _island_position("fortress_harbor") + Vector3(-180, 0, 60)
	await _settle()
	_capture(output_dir.path_join("14_LANDMARK.png"))
	camera.zoom = camera.min_zoom
	await _settle()
	_capture(output_dir.path_join("15_ZOOM_OUT.png"))
	camera.zoom = MockupCompositionProfile.DEFAULT_CAMERA_ZOOM
	await _settle()
	_capture(output_dir.path_join("16_ZOOM_MID.png"))
	camera.zoom = camera.max_zoom
	await _settle()
	_capture(output_dir.path_join("17_ZOOM_IN.png"))
	if quality_name == "LOW":
		_capture(output_dir.path_join("18_LOW.png"))
	else:
		_capture(output_dir.path_join("19_HIGH.png"))

func _write_manifest(output_dir: String, aspects: Array, qualities: Array) -> void:
	var manifest := {
		"build": "G0.4",
		"milestone": "MOCKUP-FIRST GAMEPLAY",
		"engine": Engine.get_version_info().get("string", "unknown"),
		"platform": PlatformService.platform_name(),
		"camera_profile": camera.profile_name(),
		"camera_fov": 35.0,
		"default_zoom": MockupCompositionProfile.DEFAULT_CAMERA_ZOOM,
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
