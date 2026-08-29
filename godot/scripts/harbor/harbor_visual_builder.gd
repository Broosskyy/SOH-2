class_name HarborVisualBuilder
extends RefCounted

static func build_into(visual_root: Node3D, definition: HarborDefinition) -> void:
	if visual_root == null or definition == null:
		return
	_clear_children(visual_root)
	var quality := QualityManager.current_level
	_build_fortress_ring(visual_root)
	_build_coast_berm(visual_root)
	var pier := MeshInstance3D.new()
	pier.mesh = BoxMesh.new()
	(pier.mesh as BoxMesh).size = Vector3(88.0, 3.5, 16.0)
	pier.position = Vector3(0.0, 1.6, 22.0)
	pier.material_override = _wood_material()
	visual_root.add_child(pier)
	var pier_extension := MeshInstance3D.new()
	pier_extension.mesh = BoxMesh.new()
	(pier_extension.mesh as BoxMesh).size = Vector3(56.0, 2.8, 12.0)
	pier_extension.position = Vector3(0.0, 1.3, 48.0)
	pier_extension.material_override = _wood_material()
	visual_root.add_child(pier_extension)
	var pier_head := MeshInstance3D.new()
	pier_head.mesh = BoxMesh.new()
	(pier_head.mesh as BoxMesh).size = Vector3(18.0, 4.0, 18.0)
	pier_head.position = Vector3(0.0, 2.0, 58.0)
	pier_head.material_override = _wood_material()
	visual_root.add_child(pier_head)
	var warehouse := MeshInstance3D.new()
	warehouse.mesh = BoxMesh.new()
	(warehouse.mesh as BoxMesh).size = Vector3(34.0, 20.0, 26.0)
	warehouse.position = Vector3(-30.0, 11.0, -6.0)
	warehouse.material_override = _stone_material(Color(0.52, 0.5, 0.46))
	visual_root.add_child(warehouse)
	var warehouse_roof := MeshInstance3D.new()
	warehouse_roof.mesh = BoxMesh.new()
	(warehouse_roof.mesh as BoxMesh).size = Vector3(38.0, 4.0, 30.0)
	warehouse_roof.position = Vector3(-30.0, 23.0, -6.0)
	warehouse_roof.material_override = _stone_material(Color(0.62, 0.28, 0.18))
	visual_root.add_child(warehouse_roof)
	var tower := MeshInstance3D.new()
	tower.mesh = CylinderMesh.new()
	(tower.mesh as CylinderMesh).top_radius = 5.5
	(tower.mesh as CylinderMesh).bottom_radius = 7.0
	(tower.mesh as CylinderMesh).height = 30.0
	tower.position = Vector3(28.0, 16.0, -14.0)
	tower.material_override = _stone_material(Color(0.48, 0.46, 0.42))
	visual_root.add_child(tower)
	var flag := MeshInstance3D.new()
	flag.mesh = BoxMesh.new()
	(flag.mesh as BoxMesh).size = Vector3(0.25, 9.0, 6.0)
	flag.position = Vector3(28.0, 34.0, -14.0)
	flag.material_override = _cloth_material(Color(0.82, 0.18, 0.14))
	visual_root.add_child(flag)
	if quality != QualityManager.QualityLevel.LOW:
		var crane := MeshInstance3D.new()
		crane.mesh = BoxMesh.new()
		(crane.mesh as BoxMesh).size = Vector3(4.0, 16.0, 4.0)
		crane.position = Vector3(14.0, 10.0, 10.0)
		crane.material_override = _wood_material()
		visual_root.add_child(crane)
		var arm := MeshInstance3D.new()
		arm.mesh = BoxMesh.new()
		(arm.mesh as BoxMesh).size = Vector3(22.0, 1.5, 1.5)
		arm.position = Vector3(24.0, 18.0, 10.0)
		arm.material_override = _wood_material()
		visual_root.add_child(arm)
	var beacon := MeshInstance3D.new()
	beacon.mesh = SphereMesh.new()
	(beacon.mesh as SphereMesh).radius = 2.4
	beacon.position = Vector3(0.0, 5.5, 10.0)
	beacon.material_override = _glow_material(Color(0.45, 0.82, 1.0))
	visual_root.add_child(beacon)

static func _build_fortress_ring(root: Node3D) -> void:
	for index in 10:
		var segment := MeshInstance3D.new()
		segment.mesh = BoxMesh.new()
		(segment.mesh as BoxMesh).size = Vector3(22.0, 14.0, 8.0)
		var angle := TAU * float(index) / 10.0
		segment.position = Vector3(cos(angle) * 52.0, 8.0, sin(angle) * 52.0)
		segment.rotation.y = angle
		segment.material_override = _stone_material(Color(0.42, 0.4, 0.38))
		root.add_child(segment)
	var keep := MeshInstance3D.new()
	keep.mesh = CylinderMesh.new()
	(keep.mesh as CylinderMesh).top_radius = 10.0
	(keep.mesh as CylinderMesh).bottom_radius = 12.0
	(keep.mesh as CylinderMesh).height = 36.0
	keep.position = Vector3(0.0, 19.0, -18.0)
	keep.material_override = _stone_material(Color(0.46, 0.44, 0.4))
	root.add_child(keep)

static func _build_coast_berm(root: Node3D) -> void:
	var berm := MeshInstance3D.new()
	berm.mesh = CylinderMesh.new()
	(berm.mesh as CylinderMesh).top_radius = 58.0
	(berm.mesh as CylinderMesh).bottom_radius = 64.0
	(berm.mesh as CylinderMesh).height = 3.0
	berm.position = Vector3(0.0, 0.8, -8.0)
	var sand := StandardMaterial3D.new()
	sand.albedo_color = Color(0.78, 0.72, 0.54)
	sand.roughness = 0.92
	berm.material_override = sand
	root.add_child(berm)

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
