class_name IslandVisualBuilder
extends RefCounted

## Builds inexpensive Godot-native temporary island visuals from presentation profiles.
## Visual footprint is derived from gameplay radii — never oversized debug slabs.

static func build_into(visual_root: Node3D, profile: IslandPresentationProfile) -> void:
	if visual_root == null or profile == null:
		return
	_clear_children(visual_root)
	var seed := profile.visual_seed()
	var rx := profile.gameplay_radius_x * profile.visual_scale
	var rz := profile.gameplay_radius_z * profile.visual_scale
	var quality: QualityManager.QualityLevel = QualityManager.current_level
	_build_underwater_base(visual_root, rx, rz, seed)
	_build_shore_ring(visual_root, rx, rz, seed)
	_build_land_mass(visual_root, profile, rx, rz, seed, quality)
	_apply_shape_variation(visual_root, profile.shape_class, rx, rz, seed, quality)
	if quality != QualityManager.QualityLevel.LOW:
		_add_sparse_dressing(visual_root, profile, rx, rz, seed)

static func build_debug_footprint(debug_root: Node3D, profile: IslandPresentationProfile) -> void:
	if debug_root == null or profile == null:
		return
	_clear_children(debug_root)
	debug_root.visible = false
	var mesh := BoxMesh.new()
	mesh.size = Vector3(
		profile.gameplay_radius_x * 2.0,
		2.0,
		profile.gameplay_radius_z * 2.0
	)
	var instance := MeshInstance3D.new()
	instance.mesh = mesh
	instance.position.y = 1.0
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.2, 1.0, 0.45, 0.22)
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	instance.material_override = material
	debug_root.add_child(instance)

static func _clear_children(node: Node3D) -> void:
	for child in node.get_children():
		child.queue_free()

static func _build_underwater_base(
		root: Node3D,
		rx: float,
		rz: float,
		seed: int
	) -> void:
	var mesh := _make_deformed_disc(rx * 1.08, rz * 1.08, 6.0, seed + 11, 0.18)
	var instance := MeshInstance3D.new()
	instance.mesh = mesh
	instance.position.y = -4.0
	instance.material_override = _material(Color(0.04, 0.12, 0.14), 0.92, 0.55)
	root.add_child(instance)

static func _build_shore_ring(
		root: Node3D,
		rx: float,
		rz: float,
		seed: int
	) -> void:
	var mesh := _make_deformed_disc(rx * 0.98, rz * 0.98, 2.5, seed + 23, 0.12)
	var instance := MeshInstance3D.new()
	instance.mesh = mesh
	instance.position.y = 0.4
	instance.material_override = _material(Color(0.78, 0.72, 0.52), 0.35, 0.78)
	root.add_child(instance)

static func _build_land_mass(
		root: Node3D,
		profile: IslandPresentationProfile,
		rx: float,
		rz: float,
		seed: int,
		quality: QualityManager.QualityLevel
	) -> void:
	var height := _land_height(profile.size_class)
	var land_rx := rx * 0.72
	var land_rz := rz * 0.72
	var mesh := _make_deformed_disc(land_rx, land_rz, height, seed + 37, 0.28)
	var instance := MeshInstance3D.new()
	instance.mesh = mesh
	instance.position.y = height * 0.42
	var land_color := _biome_land_color(profile.biome)
	instance.material_override = _material(land_color, 0.08, 0.88)
	root.add_child(instance)
	if quality == QualityManager.QualityLevel.HIGH:
		var cliff := MeshInstance3D.new()
		cliff.mesh = _make_deformed_disc(land_rx * 1.05, land_rz * 1.05, height * 0.35, seed + 41, 0.15)
		cliff.position.y = height * 0.18
		cliff.material_override = _material(_biome_cliff_color(profile.biome), 0.12, 0.82)
		root.add_child(cliff)

static func _apply_shape_variation(
		root: Node3D,
		shape: IslandPresentationProfile.ShapeClass,
		rx: float,
		rz: float,
		seed: int,
		quality: QualityManager.QualityLevel
	) -> void:
	match shape:
		IslandPresentationProfile.ShapeClass.TALL_CLIFF, IslandPresentationProfile.ShapeClass.FORTRESS:
			var spire := MeshInstance3D.new()
			spire.mesh = _make_deformed_disc(rx * 0.22, rz * 0.22, _land_height(IslandPresentationProfile.SizeClass.LANDMARK) * 1.4, seed + 3, 0.08)
			spire.position = Vector3(rx * 0.18, 18.0, -rz * 0.12)
			spire.material_override = _material(Color(0.38, 0.4, 0.42), 0.1, 0.8)
			root.add_child(spire)
		IslandPresentationProfile.ShapeClass.TWIN_ISLANDS, IslandPresentationProfile.ShapeClass.DOUBLE_LOBE:
			var twin := MeshInstance3D.new()
			twin.mesh = _make_deformed_disc(rx * 0.38, rz * 0.38, _land_height(IslandPresentationProfile.SizeClass.SMALL), seed + 5, 0.2)
			twin.position = Vector3(-rx * 0.55, 6.0, rz * 0.42)
			twin.material_override = _material(Color(0.22, 0.48, 0.28), 0.08, 0.88)
			root.add_child(twin)
		IslandPresentationProfile.ShapeClass.MINI_ROCK_SPIRE, IslandPresentationProfile.ShapeClass.NARROW_ROCK_RIDGE:
			var ridge := MeshInstance3D.new()
			ridge.mesh = BoxMesh.new()
			(ridge.mesh as BoxMesh).size = Vector3(rx * 0.35, 14.0, rz * 0.18)
			ridge.position = Vector3(0.0, 8.0, 0.0)
			ridge.rotation_degrees.y = float(seed % 90)
			ridge.material_override = _material(Color(0.42, 0.44, 0.46), 0.1, 0.78)
			root.add_child(ridge)
		IslandPresentationProfile.ShapeClass.LONG_SAND_SPIT, IslandPresentationProfile.ShapeClass.HOOK:
			var spit := MeshInstance3D.new()
			spit.mesh = BoxMesh.new()
			(spit.mesh as BoxMesh).size = Vector3(rx * 1.1, 3.0, rz * 0.28)
			spit.position = Vector3(rx * 0.2, 1.5, rz * 0.35)
			spit.rotation_degrees.y = float((seed % 50) - 25)
			spit.material_override = _material(Color(0.82, 0.76, 0.58), 0.2, 0.82)
			root.add_child(spit)
		IslandPresentationProfile.ShapeClass.HARBOR:
			if quality != QualityManager.QualityLevel.LOW:
				var dock := MeshInstance3D.new()
				dock.mesh = BoxMesh.new()
				(dock.mesh as BoxMesh).size = Vector3(rx * 0.45, 2.0, rz * 0.12)
				dock.position = Vector3(-rx * 0.15, 1.2, rz * 0.42)
				dock.material_override = _material(Color(0.45, 0.3, 0.18), 0.05, 0.9)
				root.add_child(dock)
		_:
			pass

static func _add_sparse_dressing(
		root: Node3D,
		profile: IslandPresentationProfile,
		rx: float,
		rz: float,
		seed: int
	) -> void:
	if profile.biome != "tropical" and profile.biome != "jungle":
		return
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var palm_count := 2 if profile.size_class <= IslandPresentationProfile.SizeClass.SMALL else 4
	if profile.size_class >= IslandPresentationProfile.SizeClass.LANDMARK:
		palm_count = 6
	for index in palm_count:
		var trunk := MeshInstance3D.new()
		trunk.mesh = CylinderMesh.new()
		(trunk.mesh as CylinderMesh).top_radius = 0.6
		(trunk.mesh as CylinderMesh).bottom_radius = 0.9
		(trunk.mesh as CylinderMesh).height = 8.0 + rng.randf() * 4.0
		trunk.position = Vector3(
			rng.randf_range(-rx * 0.45, rx * 0.45),
			5.0,
			rng.randf_range(-rz * 0.45, rz * 0.45)
		)
		trunk.material_override = _material(Color(0.42, 0.28, 0.16), 0.0, 0.95)
		root.add_child(trunk)
		var crown := MeshInstance3D.new()
		crown.mesh = SphereMesh.new()
		(crown.mesh as SphereMesh).radius = 3.5
		(crown.mesh as SphereMesh).height = 5.0
		crown.position = trunk.position + Vector3(0.0, 7.0, 0.0)
		crown.material_override = _material(Color(0.18, 0.55, 0.24), 0.0, 0.9)
		root.add_child(crown)

static func _make_deformed_disc(
		radius_x: float,
		radius_z: float,
		height: float,
		seed: int,
		noise_strength: float
	) -> ArrayMesh:
	var segments := 24 if QualityManager.current_level == QualityManager.QualityLevel.LOW else 36
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var top_y := height
	var bottom_y := 0.0
	var top_verts: PackedVector3Array = []
	var bottom_verts: PackedVector3Array = []
	for index in segments:
		var angle := TAU * float(index) / float(segments)
		var wobble := 1.0 + rng.randf_range(-noise_strength, noise_strength)
		var x := cos(angle) * radius_x * wobble
		var z := sin(angle) * radius_z * wobble
		top_verts.append(Vector3(x, top_y, z))
		bottom_verts.append(Vector3(x * 1.06, bottom_y, z * 1.06))
	var center_top := Vector3(0.0, top_y + height * 0.08, 0.0)
	var center_bottom := Vector3(0.0, bottom_y, 0.0)
	for index in segments:
		var next := (index + 1) % segments
		st.add_vertex(center_top)
		st.add_vertex(top_verts[index])
		st.add_vertex(top_verts[next])
		st.add_vertex(bottom_verts[index])
		st.add_vertex(bottom_verts[next])
		st.add_vertex(center_bottom)
		st.add_vertex(top_verts[index])
		st.add_vertex(bottom_verts[index])
		st.add_vertex(top_verts[next])
		st.add_vertex(bottom_verts[next])
		st.add_vertex(bottom_verts[index])
	return st.commit()

static func _land_height(size_class: IslandPresentationProfile.SizeClass) -> float:
	match size_class:
		IslandPresentationProfile.SizeClass.XS:
			return 8.0
		IslandPresentationProfile.SizeClass.SMALL:
			return 12.0
		IslandPresentationProfile.SizeClass.MEDIUM:
			return 18.0
		IslandPresentationProfile.SizeClass.LARGE:
			return 24.0
		IslandPresentationProfile.SizeClass.XL:
			return 30.0
		_:
			return 36.0

static func _biome_land_color(biome: String) -> Color:
	match biome:
		"rocky", "cliff":
			return Color(0.34, 0.36, 0.38)
		"volcanic":
			return Color(0.28, 0.16, 0.12)
		"frozen":
			return Color(0.78, 0.84, 0.9)
		"jungle", "tropical":
			return Color(0.2, 0.46, 0.26)
		_:
			return Color(0.24, 0.42, 0.28)

static func _biome_cliff_color(biome: String) -> Color:
	match biome:
		"volcanic":
			return Color(0.22, 0.12, 0.1)
		"frozen":
			return Color(0.62, 0.68, 0.74)
		_:
			return Color(0.4, 0.42, 0.44)

static func _material(color: Color, metallic: float, roughness: float) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.metallic = metallic
	material.roughness = roughness
	return material
