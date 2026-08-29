class_name NpcBehaviourProfile
extends Resource

enum Mode { IDLE, PATROL, CHASE, ATTACK, RETURN }

@export var behaviour_id: String = "patrol"
@export var mode: Mode = Mode.PATROL
@export var detection_range := 520.0
@export var max_chase_range := 760.0
@export var attack_range := 430.0
@export var patrol_points: Array[Vector3] = []
@export var patrol_speed := 0.65
@export var idle_duration := 2.0
