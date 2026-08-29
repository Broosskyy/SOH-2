extends IslandEntity

func _ready() -> void:
	if profile == null:
		push_error("IslandRoot requires IslandPresentationProfile")
		return
	_build_proxy_geometry()
	call_deferred("_register_label")
	add_to_group("island_entities")
	add_to_group("navigation_boundaries")

func _build_proxy_geometry() -> void:
	var shore_mesh := CylinderMesh.new()
	var land_mesh := CylinderMesh.new()
	match profile.size_class:
		IslandPresentationProfile.SizeClass.SMALL:
			shore_mesh.top_radius = 73.0
			shore_mesh.bottom_radius = 82.0
			shore_mesh.height = 7.0
			land_mesh.top_radius = 54.0
			land_mesh.bottom_radius = 69.0
			land_mesh.height = 18.0
		IslandPresentationProfile.SizeClass.MEDIUM:
			shore_mesh.top_radius = 135.0
			shore_mesh.bottom_radius = 151.0
			shore_mesh.height = 9.0
			land_mesh.top_radius = 103.0
			land_mesh.bottom_radius = 132.0
			land_mesh.height = 28.0
		_:
			shore_mesh.top_radius = 180.0
			shore_mesh.bottom_radius = 205.0
			shore_mesh.height = 12.0
			land_mesh.top_radius = 145.0
			land_mesh.bottom_radius = 185.0
			land_mesh.height = 36.0
	var shore := MeshInstance3D.new()
	shore.mesh = shore_mesh
	shore.position = Vector3(0, 2, 0)
	visual_root.add_child(shore)
	var land := MeshInstance3D.new()
	land.mesh = land_mesh
	land.position = Vector3(0, 14, 0)
	visual_root.add_child(land)
	label_anchor.position.y = profile.world_label_height

func _register_label() -> void:
	var service := get_tree().get_first_node_in_group("world_label_service") as Node
	if service != null and service.has_method("register_anchor"):
		service.call("register_anchor", profile.island_id, label_anchor, profile.display_name, Color(0.82, 0.95, 0.88))
