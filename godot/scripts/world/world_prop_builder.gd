class_name WorldPropBuilder
extends RefCounted

enum PropKind { BUOY, WRECK, BARREL, CRATE, BEACON }

static func build_into(root: Node3D, kind: PropKind, seed: int = 0) -> void:
	if root == null:
		return
	_clear_children(root)
	match kind:
		PropKind.BUOY:
			_build_buoy(root)
		PropKind.WRECK:
			_build_wreck(root, seed)
		PropKind.BARREL:
			_build_barrel(root)
		PropKind.CRATE:
			_build_crate(root, true)
		PropKind.BEACON:
			_build_beacon(root)

static func _build_buoy(root: Node3D) -> void:
	var mast := MeshInstance3D.new()
	mast.mesh = CylinderMesh.new()
	(mast.mesh as CylinderMesh).top_radius = 0.25
	(mast.mesh as CylinderMesh).bottom_radius = 0.35
	(mast.mesh as CylinderMesh).height = 5.5
	mast.position.y = 2.8
	mast.material_override = _wood()
	root.add_child(mast)
	var float := MeshInstance3D.new()
	float.mesh = SphereMesh.new()
	(float.mesh as SphereMesh).radius = 1.1
	float.position.y = 0.8
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.88, 0.18, 0.12)
	mat.emission_enabled = true
	mat.emission = Color(0.9, 0.2, 0.1)
	mat.emission_energy_multiplier = 0.6
	float.material_override = mat
	root.add_child(float)

static func _build_wreck(root: Node3D, seed: int) -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = seed + 17
	for index in 4:
		var plank := MeshInstance3D.new()
		plank.mesh = BoxMesh.new()
		(plank.mesh as BoxMesh).size = Vector3(
			rng.randf_range(3.0, 8.0),
			rng.randf_range(0.6, 1.4),
			rng.randf_range(2.0, 6.0)
		)
		plank.position = Vector3(rng.randf_range(-4.0, 4.0), 0.6, rng.randf_range(-4.0, 4.0))
		plank.rotation_degrees.y = rng.randf_range(0.0, 180.0)
		plank.material_override = _wood()
		root.add_child(plank)

static func _build_barrel(root: Node3D) -> void:
	var barrel := MeshInstance3D.new()
	barrel.mesh = CylinderMesh.new()
	(barrel.mesh as CylinderMesh).top_radius = 1.2
	(barrel.mesh as CylinderMesh).bottom_radius = 1.2
	(barrel.mesh as CylinderMesh).height = 2.4
	barrel.position.y = 1.2
	barrel.material_override = _wood()
	root.add_child(barrel)

static func _build_crate(root: Node3D, glow: bool) -> void:
	var crate := MeshInstance3D.new()
	crate.mesh = BoxMesh.new()
	(crate.mesh as BoxMesh).size = Vector3(4.5, 4.0, 4.5)
	crate.position.y = 2.0
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.55, 0.38, 0.18)
	if glow:
		mat.emission_enabled = true
		mat.emission = Color(0.45, 0.92, 0.38)
		mat.emission_energy_multiplier = 0.7
	crate.material_override = mat
	root.add_child(crate)

static func _build_beacon(root: Node3D) -> void:
	var pole := MeshInstance3D.new()
	pole.mesh = CylinderMesh.new()
	(pole.mesh as CylinderMesh).top_radius = 0.4
	(pole.mesh as CylinderMesh).bottom_radius = 0.55
	(pole.mesh as CylinderMesh).height = 12.0
	pole.position.y = 6.0
	pole.material_override = _stone()
	root.add_child(pole)
	var lamp := MeshInstance3D.new()
	lamp.mesh = SphereMesh.new()
	(lamp.mesh as SphereMesh).radius = 1.4
	lamp.position.y = 12.5
	var glow := StandardMaterial3D.new()
	glow.albedo_color = Color(0.45, 0.82, 1.0)
	glow.emission_enabled = true
	glow.emission = Color(0.45, 0.82, 1.0)
	glow.emission_energy_multiplier = 1.2
	lamp.material_override = glow
	root.add_child(lamp)

static func _wood() -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.45, 0.3, 0.18)
	material.roughness = 0.82
	return material

static func _stone() -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.48, 0.46, 0.42)
	material.roughness = 0.78
	return material

static func _clear_children(node: Node3D) -> void:
	for child in node.get_children():
		child.queue_free()
