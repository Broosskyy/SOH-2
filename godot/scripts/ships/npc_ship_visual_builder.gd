class_name NpcShipVisualBuilder
extends RefCounted

## Lightweight readable NPC ship proxy until final GLBs are integrated.

static func build_into(visual_root: Node3D, definition: NpcDefinition) -> void:
	if visual_root == null or definition == null:
		return
	_clear_children(visual_root)
	var hull_color := definition.visual_color
	var hostile := definition.faction == UnitFaction.Allegiance.HOSTILE
	var hull := MeshInstance3D.new()
	hull.mesh = BoxMesh.new()
	(hull.mesh as BoxMesh).size = Vector3(14.0, 7.0, 32.0)
	hull.position = Vector3(0.0, 4.0, 0.0)
	hull.material_override = _hull_material(hull_color.darkened(0.15))
	visual_root.add_child(hull)
	var deck := MeshInstance3D.new()
	deck.mesh = BoxMesh.new()
	(deck.mesh as BoxMesh).size = Vector3(12.0, 1.5, 24.0)
	deck.position = Vector3(0.0, 8.0, -2.0)
	deck.material_override = _hull_material(hull_color.lightened(0.08))
	visual_root.add_child(deck)
	for side in [-1, 1]:
		var mast := MeshInstance3D.new()
		mast.mesh = CylinderMesh.new()
		(mast.mesh as CylinderMesh).top_radius = 0.35
		(mast.mesh as CylinderMesh).bottom_radius = 0.5
		(mast.mesh as CylinderMesh).height = 16.0
		mast.position = Vector3(float(side) * 3.5, 14.0, -4.0)
		mast.material_override = _hull_material(Color(0.35, 0.24, 0.16))
		visual_root.add_child(mast)
		var sail := MeshInstance3D.new()
		sail.mesh = BoxMesh.new()
		(sail.mesh as BoxMesh).size = Vector3(0.4, 10.0, 8.0)
		sail.position = Vector3(float(side) * 3.5, 16.0, -4.0)
		var sail_color := hull_color if hostile else Color(0.82, 0.86, 0.9)
		sail.material_override = _sail_material(sail_color)
		visual_root.add_child(sail)
	var bow := MeshInstance3D.new()
	bow.mesh = BoxMesh.new()
	(bow.mesh as BoxMesh).size = Vector3(8.0, 5.0, 6.0)
	bow.position = Vector3(0.0, 5.0, 17.0)
	bow.material_override = _hull_material(hull_color.darkened(0.2))
	visual_root.add_child(bow)
	if hostile and QualityManager.current_level != QualityManager.QualityLevel.LOW:
		var ring := MeshInstance3D.new()
		ring.mesh = CylinderMesh.new()
		(ring.mesh as CylinderMesh).top_radius = 22.0
		(ring.mesh as CylinderMesh).bottom_radius = 22.0
		(ring.mesh as CylinderMesh).height = 0.3
		ring.position = Vector3(0.0, 0.2, 0.0)
		var ring_mat := StandardMaterial3D.new()
		ring_mat.albedo_color = Color(0.9, 0.2, 0.15, 0.35)
		ring_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		ring_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		ring.material_override = ring_mat
		visual_root.add_child(ring)

static func _clear_children(node: Node3D) -> void:
	for child in node.get_children():
		child.queue_free()

static func _hull_material(color: Color) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.72
	return material

static func _sail_material(color: Color) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.88
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	return material
