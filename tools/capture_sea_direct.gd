extends SceneTree

const OUTPUT_DIR := "user://qa_capture/flow/"
const GAME_SCENE := "res://scenes/main.tscn"

func _initialize() -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(OUTPUT_DIR))
	get_tree().root.set_meta("reconstruction_test_mode", true)
	var packed := load(GAME_SCENE) as PackedScene
	if packed == null:
		push_error("Failed to load sea scene")
		quit(1)
		return
	root.add_child(packed.instantiate())
	call_deferred("_capture_run")

func _capture_run() -> void:
	for i in 300:
		await process_frame
		if get_tree().get_first_node_in_group("player") != null:
			print("SEA ready frame=", i)
			break
	await process_frame
	await process_frame
	await _capture("04_sea_initial")
	for _i in 150:
		await process_frame
	await _capture("05_sea_settled")
	quit(0)

func _capture(name: String) -> void:
	var image := root.get_viewport().get_texture().get_image()
	var output_path := OUTPUT_DIR.path_join(name + ".png")
	image.save_png(output_path)
	print("CAPTURE_SAVED ", ProjectSettings.globalize_path(output_path))
