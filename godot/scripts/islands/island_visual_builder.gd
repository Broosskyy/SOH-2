class_name IslandVisualBuilder
extends RefCounted

## Temporary island visuals — footprint-scaled, no triangle-fan artifacts.

static func build_into(visual_root: Node3D, profile: IslandPresentationProfile) -> void:
	if visual_root == null or profile == null:
		return
	_clear_children(visual_root)
	var seed := profile.visual_seed()
	var rx := profile.gameplay_radius_x * profile.visual_scale
	var rz := profile.gameplay_radius_z * profile.visual_scale
	var quality: QualityManager.QualityLevel = QualityManager.current_level
	_build_coast_ring(visual_root, rx, rz, seed)
	_build_island_body(visual_root, profile, rx, rz, seed, quality)
	_apply_shape_variation(visual_root, profile, rx, rz, seed, quality)
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

static func _build_coast_ring(
		root: Node3D,
		rx: float,
		rz: float,
		seed: int
	) -> void:
	var shore := MeshInstance3D.new()
	shore.mesh = _make_ring_mesh(rx * 1.02, rz * 1.02, rx * 0.82, rz * 0.82, 0.8, seed + 17)
	shore.position.y = 0.15
	shore.material_override = _material(Color(0.72, 0.82, 0.68), 0.1, 0.82)
	root.add_child(shore)
	var foam := MeshInstance3D.new()
	foam.mesh = _make_ring_mesh(rx * 0.86, rz * 0.86, rx * 0.74, rz * 0.74, 0.35, seed + 19)
	foam.position.y = 0.35
	var foam_mat := _material(Color(0.9, 0.95, 0.98), 0.0, 0.9)
	foam_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	foam.material_override = foam_mat
	root.add_child(foam)

static func _build_island_body(
		root: Node3D,
		profile: IslandPresentationProfile,
		rx: float,
		rz: float,
		seed: int,
		quality: QualityManager.QualityLevel
	) -> void:
	var height := _land_height(profile.size_class)
	var land_rx := rx * _shape_radius_scale(profile.shape_class, true)
	var land_rz := rz * _shape_radius_scale(profile.shape_class, false)
	var base := MeshInstance3D.new()
	base.mesh = _make_solid_island_mesh(land_rx, land_rz, height, seed + 37, 0.22)
	base.position.y = height * 0.38
	base.material_override = _material(_biome_land_color(profile.biome), 0.06, 0.9)
	root.add_child(base)
	var rock := MeshInstance3D.new()
	rock.mesh = _make_solid_island_mesh(land_rx * 1.04, land_rz * 1.04, height * 0.42, seed + 41, 0.1)
	rock.position.y = height * 0.14
	rock.material_override = _material(_biome_cliff_color(profile.biome), 0.08, 0.86)
	root.add_child(rock)
	if quality == QualityManager.QualityLevel.HIGH:
		var underwater := MeshInstance3D.new()
		underwater.mesh = _make_solid_island_mesh(land_rx * 1.1, land_rz * 1.1, height * 0.25, seed + 43, 0.05)
		underwater.position.y = -2.5
		underwater.material_override = _material(Color(0.05, 0.14, 0.16), 0.2, 0.8)
		root.add_child(underwater)

static func _apply_shape_variation(
		root: Node3D,
		profile: IslandPresentationProfile,
		rx: float,
		rz: float,
		seed: int,
		quality: QualityManager.QualityLevel
	) -> void:
	match profile.shape_class:
		IslandPresentationProfile.ShapeClass.CRESCENT_COVE, IslandPresentationProfile.ShapeClass.HOOK:
			var hook := MeshInstance3D.new()
			hook.mesh = _make_solid_island_mesh(rx * 0.42, rz * 0.22, _land_height(IslandPresentationProfile.SizeClass.SMALL) * 0.7, seed + 5, 0.12)
			hook.position = Vector3(rx * 0.42, 4.0, rz * 0.28)
			hook.rotation_degrees.y = float((seed % 60) - 30)
			hook.material_override = _material(Color(0.78, 0.72, 0.54), 0.05, 0.88)
			root.add_child(hook)
		IslandPresentationProfile.ShapeClass.TWIN_ISLANDS, IslandPresentationProfile.ShapeClass.DOUBLE_LOBE:
			var twin := MeshInstance3D.new()
			twin.mesh = _make_solid_island_mesh(rx * 0.36, rz * 0.36, _land_height(IslandPresentationProfile.SizeClass.SMALL), seed + 7, 0.18)
			twin.position = Vector3(-rx * 0.52, 5.0, rz * 0.38)
			twin.material_override = _material(Color(0.22, 0.48, 0.28), 0.06, 0.88)
			root.add_child(twin)
		IslandPresentationProfile.ShapeClass.TALL_CLIFF, IslandPresentationProfile.ShapeClass.FORTRESS:
			var spire := MeshInstance3D.new()
			spire.mesh = _make_solid_island_mesh(rx * 0.18, rz * 0.18, _land_height(IslandPresentationProfile.SizeClass.LANDMARK) * 1.5, seed + 3, 0.06)
			spire.position = Vector3(rx * 0.2, 16.0, -rz * 0.1)
			spire.material_override = _material(Color(0.4, 0.42, 0.44), 0.1, 0.8)
			root.add_child(spire)
		IslandPresentationProfile.ShapeClass.LONG_SAND_SPIT, IslandPresentationProfile.ShapeClass.NARROW_ROCK_RIDGE:
			var ridge := MeshInstance3D.new()
			ridge.mesh = BoxMesh.new()
			(ridge.mesh as BoxMesh).size = Vector3(rx * 0.9, 10.0, rz * 0.22)
			ridge.position = Vector3(0.0, 6.0, 0.0)
			ridge.rotation_degrees.y = float(seed % 70)
			ridge.material_override = _material(Color(0.42, 0.44, 0.46), 0.08, 0.82)
			root.add_child(ridge)
		IslandPresentationProfile.ShapeClass.HARBOR:
			if quality != QualityManager.QualityLevel.LOW:
				var dock := MeshInstance3D.new()
				dock.mesh = BoxMesh.new()
				(dock.mesh as BoxMesh).size = Vector3(rx * 0.5, 2.5, rz * 0.14)
				dock.position = Vector3(-rx * 0.12, 1.4, rz * 0.4)
				dock.material_override = _material(Color(0.45, 0.3, 0.18), 0.04, 0.9)
				root.add_child(dock)
		IslandPresentationProfile.ShapeClass.TINY_PALM_ISLET, IslandPresentationProfile.ShapeClass.MINI_ROCK_SPIRE:
			pass
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
		palm_count = 5
	for _index in palm_count:
		var trunk := MeshInstance3D.new()
		trunk.mesh = CylinderMesh.new()
		(trunk.mesh as CylinderMesh).top_radius = 0.55
		(trunk.mesh as CylinderMesh).bottom_radius = 0.8
		(trunk.mesh as CylinderMesh).height = 7.0 + rng.randf() * 3.0
		trunk.position = Vector3(
			rng.randf_range(-rx * 0.38, rx * 0.38),
			4.5,
			rng.randf_range(-rz * 0.38, rz * 0.38)
		)
		trunk.material_override = _material(Color(0.42, 0.28, 0.16), 0.0, 0.95)
		root.add_child(trunk)
		var crown := MeshInstance3D.new()
		crown.mesh = SphereMesh.new()
		(crown.mesh as SphereMesh).radius = 3.0
		(crown.mesh as SphereMesh).height = 4.5
		crown.position = trunk.position + Vector3(0.0, 6.5, 0.0)
		crown.material_override = _material(Color(0.18, 0.55, 0.24), 0.0, 0.9)
		root.add_child(crown)

## Solid capped island mesh — ring top triangulation + quad side walls, no center fan.
static func _make_solid_island_mesh(
		radius_x: float,
		radius_z: float,
		height: float,
		seed: int,
		noise_strength: float
	) -> ArrayMesh:
	var segments := 20 if QualityManager.current_level == QualityManager.QualityLevel.LOW else 28
	var rng := RandomNumberGenerator.new()
	rng.seed = seed
	var top_y := height
	var bottom_y := -height * 0.18
	var top_ring: PackedVector3Array = []
	var bottom_ring: PackedVector3Array = []
	for index in segments:
		var angle := TAU * float(index) / float(segments)
		var wobble := 1.0 + rng.randf_range(-noise_strength, noise_strength)
		var x := cos(angle) * radius_x * wobble
		var z := sin(angle) * radius_z * wobble
		top_ring.append(Vector3(x, top_y, z))
		bottom_ring.append(Vector3(x * 1.05, bottom_y, z * 1.05))
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for index in range(1, segments - 1):
		st.add_vertex(top_ring[0])
		st.add_vertex(top_ring[index])
		st.add_vertex(top_ring[index + 1])
	for index in range(1, segments - 1):
		st.add_vertex(bottom_ring[0])
		st.add_vertex(bottom_ring[index + 1])
		st.add_vertex(bottom_ring[index])
	for index in segments:
		var next := (index + 1) % segments
		st.add_vertex(top_ring[index])
		st.add_vertex(bottom_ring[index])
		st.add_vertex(top_ring[next])
		st.add_vertex(top_ring[next])
		st.add_vertex(bottom_ring[index])
		st.add_vertex(bottom_ring[next])
	st.generate_normals()
	return st.commit()

static func _make_ring_mesh(
		outer_rx: float,
		outer_rz: float,
		inner_rx: float,
		inner_rz: float,
		height: float,
		seed: int
	) -> ArrayMesh:
	var segments := 20
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for index in segments:
		var next := (index + 1) % segments
		var angle := TAU * float(index) / float(segments)
		var angle_next := TAU * float(next) / float(segments)
		var outer_a := Vector3(cos(angle) * outer_rx, height, sin(angle) * outer_rz)
		var outer_b := Vector3(cos(angle_next) * outer_rx, height, sin(angle_next) * outer_rz)
		var inner_a := Vector3(cos(angle) * inner_rx, height, sin(angle) * inner_rz)
		var inner_b := Vector3(cos(angle_next) * inner_rx, height, sin(angle_next) * inner_rz)
		st.add_vertex(outer_a)
		st.add_vertex(inner_a)
		st.add_vertex(outer_b)
		st.add_vertex(outer_b)
		st.add_vertex(inner_a)
		st.add_vertex(inner_b)
	st.generate_normals()
	return st.commit()

static func _shape_radius_scale(shape: IslandPresentationProfile.ShapeClass, x_axis: bool) -> float:
	match shape:
		IslandPresentationProfile.ShapeClass.LONG_SAND_SPIT, IslandPresentationProfile.ShapeClass.NARROW_ROCK_RIDGE:
			return 0.92 if x_axis else 0.58
		IslandPresentationProfile.ShapeClass.CRESCENT_COVE, IslandPresentationProfile.ShapeClass.HOOK:
			return 0.78 if x_axis else 0.68
		IslandPresentationProfile.ShapeClass.TINY_PALM_ISLET, IslandPresentationProfile.ShapeClass.MINI_ROCK_SPIRE:
			return 0.62
		IslandPresentationProfile.ShapeClass.HUGE_TROPICAL, IslandPresentationProfile.ShapeClass.FORTRESS:
			return 0.82
		_:
			return 0.7

static func _land_height(size_class: IslandPresentationProfile.SizeClass) -> float:
	match size_class:
		IslandPresentationProfile.SizeClass.XS:
			return 7.0
		IslandPresentationProfile.SizeClass.SMALL:
			return 11.0
		IslandPresentationProfile.SizeClass.MEDIUM:
			return 16.0
		IslandPresentationProfile.SizeClass.LARGE:
			return 22.0
		IslandPresentationProfile.SizeClass.XL:
			return 28.0
		_:
			return 32.0

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
	material.cull_mode = BaseMaterial3D.CULL_BACK
	return material
