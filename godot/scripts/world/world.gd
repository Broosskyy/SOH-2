extends Node3D

@onready var ocean: MeshInstance3D = $Ocean

var elapsed := 0.0

func _process(delta: float) -> void:
	elapsed += delta
	# Lightweight migration placeholder: visible ocean motion without a custom
	# shader dependency. It remains safe for WebGL, Android and iOS.
	ocean.position.y = sin(elapsed * 0.8) * 0.12

func set_debug_island_bounds_visible(enabled: bool) -> void:
	for bounds in get_tree().get_nodes_in_group("island_bounds"):
		(bounds as GeometryInstance3D).visible = enabled

