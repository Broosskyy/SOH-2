extends Node

const QA_HEADINGS := [0, 45, 90, 135, 180, 225, 270, 315]

@export var player_path: NodePath
@export var camera_path: NodePath

@onready var player: PlayerShip = get_node(player_path)
@onready var camera: NavalCameraController = get_node(camera_path)

func _ready() -> void:
	var args := OS.get_cmdline_args()
	if not "--qa-capture" in args and OS.get_environment("ABYSSAL_QA_CAPTURE") != "1":
		return
	print("G0.1 QA capture started")
	call_deferred("_capture_suite")

func _capture_suite() -> void:
	var output_dir := ProjectSettings.globalize_path("res://../artifacts/godot-g0.1")
	DirAccess.make_dir_recursive_absolute(output_dir)
	await _settle()
	for heading in QA_HEADINGS:
		player.set_heading_degrees(float(heading))
		await _settle()
		_capture(output_dir.path_join("heading_%03d.png" % heading))
	player.set_heading_degrees(45.0)
	camera.set_camera_profile(NavalCameraController.CameraProfile.PERSPECTIVE_NAVAL, true)
	camera.zoom = 1.0
	await _settle()
	_capture(output_dir.path_join("normal_gameplay.png"))
	_capture(output_dir.path_join("floating_hud.png"))
	camera.zoom = camera.max_zoom
	await _settle()
	_capture(output_dir.path_join("close_gameplay.png"))
	camera.zoom = camera.min_zoom
	await _settle()
	_capture(output_dir.path_join("test_world.png"))
	camera.zoom = 1.0
	for profile_index in NavalCameraController.PROFILES.size():
		camera.set_camera_profile(profile_index as NavalCameraController.CameraProfile, true)
		await _settle()
		_capture(output_dir.path_join("camera_profile_%s.png" % ["a", "b", "c"][profile_index]))
	print("G0.1 QA capture complete: %s" % output_dir)
	get_tree().quit()

func _settle() -> void:
	for frame in 8:
		await get_tree().process_frame

func _capture(path: String) -> void:
	var image := get_viewport().get_texture().get_image()
	var error := image.save_png(path)
	if error != OK:
		push_error("Could not save QA capture %s: %s" % [path, error_string(error)])
