class_name ShipWake
extends Node3D

@export var follow_target: Node3D
@export var min_speed := 4.0

var _left_trail: MeshInstance3D
var _right_trail: MeshInstance3D
var _stern_foam: MeshInstance3D

func _ready() -> void:
	_build_wake_meshes()

func _process(_delta: float) -> void:
	if follow_target == null:
		visible = false
		return
	global_position = follow_target.global_position
	global_rotation = follow_target.global_rotation
	var speed := 0.0
	if follow_target is CharacterBody3D:
		speed = Vector2((follow_target as CharacterBody3D).velocity.x, (follow_target as CharacterBody3D).velocity.z).length()
	var active := speed >= min_speed and QualityManager.particle_multiplier() > 0.1
	visible = active
	if not active:
		return
	var intensity := clampf(speed / 42.0, 0.25, 1.0)
	_set_trail_scale(_left_trail, intensity)
	_set_trail_scale(_right_trail, intensity)
	_set_trail_scale(_stern_foam, intensity * 0.8)

func _build_wake_meshes() -> void:
	_left_trail = _make_trail(Vector3(-7.0, 0.2, 14.0), 0.55)
	_right_trail = _make_trail(Vector3(7.0, 0.2, 14.0), 0.55)
	_stern_foam = _make_trail(Vector3(0.0, 0.15, 20.0), 0.75)
	add_child(_left_trail)
	add_child(_right_trail)
	add_child(_stern_foam)

func _make_trail(offset: Vector3, alpha: float) -> MeshInstance3D:
	var mesh := PlaneMesh.new()
	mesh.size = Vector2(5.0, 14.0)
	var instance := MeshInstance3D.new()
	instance.mesh = mesh
	instance.position = offset
	instance.rotation_degrees = Vector3(-90.0, 0.0, 0.0)
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.88, 0.95, 1.0, alpha)
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	instance.material_override = material
	return instance

func _set_trail_scale(trail: MeshInstance3D, intensity: float) -> void:
	if trail == null:
		return
	trail.scale = Vector3(0.6 + intensity * 0.5, 1.0, 0.8 + intensity * 0.9)
