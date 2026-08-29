class_name TargetableComponent
extends Node

signal target_state_changed(enabled: bool)

@export var targetable := true
@export var target_anchor_path: NodePath = ^".."

var _anchor: Node3D

func _ready() -> void:
	_anchor = get_node_or_null(target_anchor_path) as Node3D

func is_valid_target() -> bool:
	return targetable and is_instance_valid(_anchor)

func target_position() -> Vector3:
	return _anchor.global_position if is_instance_valid(_anchor) else Vector3.ZERO

func set_targetable(enabled: bool) -> void:
	if targetable == enabled:
		return
	targetable = enabled
	target_state_changed.emit(enabled)
