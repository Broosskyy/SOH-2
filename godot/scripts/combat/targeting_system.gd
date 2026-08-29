extends Node

signal target_changed(target: Node3D)
signal target_cleared

var current_target: Node3D = null

func set_target(target: Node3D) -> bool:
	if not is_target_valid(target):
		return false
	current_target = target
	target_changed.emit(target)
	return true

func clear_target() -> void:
	if current_target == null:
		return
	current_target = null
	target_cleared.emit()

func is_target_valid(target: Node3D) -> bool:
	if target == null or not is_instance_valid(target):
		return false
	var component := target.get_node_or_null("TargetableComponent") as TargetableComponent
	if component != null:
		return component.is_valid_target()
	return target is Node3D

func distance_to_target(from_position: Vector3) -> float:
	if current_target == null:
		return -1.0
	var anchor := current_target
	var targetable_component := current_target.get_node_or_null("TargetableComponent") as TargetableComponent
	if targetable_component != null:
		return from_position.distance_to(targetable_component.target_position())
	return from_position.distance_to(current_target.global_position)

func invalidate_if_dead() -> void:
	if current_target == null:
		return
	var health := current_target.get_node_or_null("HealthComponent") as HealthComponent
	if health != null and not health.is_alive():
		clear_target()
