class_name HarborVisualBuilder
extends RefCounted

static func build_into(visual_root: Node3D, definition: HarborDefinition) -> void:
	if visual_root == null or definition == null:
		return
	_clear_children(visual_root)
	var quality := QualityManager.current_level
	var pier := MeshInstance3D.new()
	pier.mesh = BoxMesh.new()
	(pier.mesh as BoxMesh).size = Vector3(72.0, 3.0, 14.0)
	pier.position = Vector3(0.0, 1.5, 18.0)
	pier.material_override = _wood_material()
	visual_root.add_child(pier)
	var pier_extension := MeshInstance3D.new()
	pier_extension.mesh = BoxMesh.new()
	(pier_extension.mesh as BoxMesh).size = Vector3(48.0, 2.5, 10.0)
	pier_extension.position = Vector3(0.0, 1.2, 42.0)
	pier_extension.material_override = _wood_material()
	visual_root.add_child(pier_extension)
	if quality != QualityManager.QualityLevel.LOW:
		var warehouse := MeshInstance3D.new()
		warehouse.mesh = BoxMesh.new()
		(warehouse.mesh as BoxMesh).size = Vector3(28.0, 18.0, 22.0)
		warehouse.position = Vector3(-24.0, 10.0, -8.0)
		warehouse.material_override = _stone_material(Color(0.52, 0.5, 0.46))
		visual_root.add_child(warehouse)
		var tower := MeshInstance3D.new()
		tower.mesh = CylinderMesh.new()
		(tower.mesh as CylinderMesh).top_radius = 5.0
		(tower.mesh as CylinderMesh).bottom_radius = 6.5
		(tower.mesh as CylinderMesh).height = 26.0
		tower.position = Vector3(22.0, 14.0, -12.0)
		tower.material_override = _stone_material(Color(0.48, 0.46, 0.42))
		visual_root.add_child(tower)
		var flag := MeshInstance3D.new()
		flag.mesh = BoxMesh.new()
		(flag.mesh as BoxMesh).size = Vector3(0.2, 8.0, 5.0)
		flag.position = Vector3(22.0, 30.0, -12.0)
		flag.material_override = _cloth_material(Color(0.82, 0.18, 0.14))
		visual_root.add_child(flag)
	var beacon := MeshInstance3D.new()
	beacon.mesh = SphereMesh.new()
	(beacon.mesh as SphereMesh).radius = 2.2
	beacon.position = Vector3(0.0, 5.0, 8.0)
	beacon.material_override = _glow_material(Color(0.45, 0.82, 1.0))
	visual_root.add_child(beacon)

static func _clear_children(node: Node3D) -> void:
	for child in node.get_children():
		child.queue_free()

static func _wood_material() -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.45, 0.3, 0.18)
	material.roughness = 0.82
	return material

static func _stone_material(color: Color) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.78
	return material

static func _cloth_material(color: Color) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.9
	return material

static func _glow_material(color: Color) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.emission_enabled = true
	material.emission = color
	material.emission_energy_multiplier = 1.4
	return material
