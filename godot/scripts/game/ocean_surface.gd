extends MeshInstance3D

func _ready() -> void:
	var mesh_resource := PlaneMesh.new()
	mesh_resource.size = Vector2(3000.0, 2200.0)
	mesh_resource.subdivide_width = 40
	mesh_resource.subdivide_depth = 30
	mesh = mesh_resource
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.02, 0.18, 0.32, 1.0)
	material.metallic = 0.12
	material.roughness = 0.34
	material_override = material
