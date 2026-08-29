class_name HealthComponent
extends Node

signal health_changed(current: float, maximum: float)
signal damage_received(amount: float, source: Node)
signal died

@export var max_health := 1000.0
var current_health := 1000.0

func _ready() -> void:
	current_health = max_health

func apply_damage(amount: float, source: Node = null) -> void:
	if amount <= 0.0 or current_health <= 0.0:
		return
	current_health = maxf(0.0, current_health - amount)
	damage_received.emit(amount, source)
	health_changed.emit(current_health, max_health)
	if current_health <= 0.0:
		died.emit()

func heal(amount: float) -> void:
	if amount <= 0.0:
		return
	current_health = minf(max_health, current_health + amount)
	health_changed.emit(current_health, max_health)

func is_alive() -> bool:
	return current_health > 0.0

func health_ratio() -> float:
	return current_health / maxf(1.0, max_health)
