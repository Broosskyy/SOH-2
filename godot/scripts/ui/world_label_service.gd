extends Node

const LABEL_SCENE := preload("res://scenes/ui/WorldLabel.tscn")

var _labels: Dictionary = {}

func register_anchor(anchor_id: String, anchor: Node3D, text: String, color: Color = Color(0.92, 0.9, 0.72)) -> void:
	if _labels.has(anchor_id):
		return
	var label := LABEL_SCENE.instantiate()
	label.configure(text, color)
	add_child(label)
	_labels[anchor_id] = {"node": label, "anchor": anchor}

func _process(_delta: float) -> void:
	var camera := get_viewport().get_camera_3d()
	if camera == null:
		return
	for entry in _labels.values():
		var label: Control = entry.node
		var anchor: Node3D = entry.anchor
		if not is_instance_valid(anchor) or not anchor.is_inside_tree():
			continue
		label.update_projection(camera, anchor.global_position)
