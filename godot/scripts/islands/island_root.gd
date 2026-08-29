extends IslandEntity

@onready var debug_root: Node3D = $DebugRoot

func _ready() -> void:
	if profile == null:
		push_error("IslandRoot requires IslandPresentationProfile")
		return
	_build_visuals()
	IslandVisualBuilder.build_debug_footprint(debug_root, profile)
	call_deferred("_register_label")
	add_to_group("island_entities")
	add_to_group("navigation_boundaries")

func _build_visuals() -> void:
	_clear_visual_root()
	if profile.visual_scene != null:
		var authored := profile.visual_scene.instantiate()
		if authored is Node3D:
			visual_root.add_child(authored)
			(authored as Node3D).scale = Vector3.ONE * profile.visual_scale
			(authored as Node3D).position.y = profile.waterline_offset
		return
	if not profile.use_proxy_geometry:
		return
	IslandVisualBuilder.build_into(visual_root, profile)
	label_anchor.position.y = profile.world_label_height

func _clear_visual_root() -> void:
	for child in visual_root.get_children():
		child.queue_free()

func set_debug_bounds_visible(enabled: bool) -> void:
	if debug_root != null:
		debug_root.visible = enabled

func _register_label() -> void:
	if profile.display_name.strip_edges().is_empty():
		return
	var service := get_tree().get_first_node_in_group("world_label_service") as Node
	if service != null and service.has_method("register_anchor"):
		service.call(
			"register_anchor",
			profile.island_id,
			label_anchor,
			profile.display_name,
			Color(0.82, 0.95, 0.88)
		)
