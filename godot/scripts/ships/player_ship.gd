class_name PlayerShip
extends CharacterBody3D

@export var max_speed := 42.0
@export var acceleration := 30.0
@export var turn_speed := 1.45
@export var drag := 1.7
@export var presentation_profile: ShipPresentationProfile

var forward_speed := 0.0
var _command := PlayerCommand.new()

@onready var visual_root: Node3D = $VisualRoot
@onready var kraken_model: Node3D = $VisualRoot/KrakenModel
@onready var ui_anchor: Marker3D = $UIAnchor
@onready var wake_anchor: Marker3D = $VFXAnchors/Wake
@onready var debug_ui_anchor: GeometryInstance3D = $Debug/UIAnchorMarker
@onready var debug_forward: GeometryInstance3D = $Debug/ForwardVector
@onready var debug_collision: GeometryInstance3D = $Debug/CollisionEnvelope

func _ready() -> void:
	if presentation_profile == null:
		push_error("PlayerShip requires a ShipPresentationProfile")
		MobileWebBootTelemetry.report_error("PlayerShip missing profile")
		return
	visual_root.scale = Vector3.ONE * presentation_profile.visual_scale
	visual_root.rotation_degrees.y = presentation_profile.visual_yaw_degrees
	visual_root.position.y = presentation_profile.waterline_offset
	ui_anchor.position.y = presentation_profile.ui_anchor_height
	wake_anchor.position.z = presentation_profile.wake_stern_offset
	if MobileWebDiagnostics.hide_kraken():
		kraken_model.visible = false
		MobileWebBootTelemetry.mark_stage("KRAKEN READY", "hidden")
	else:
		if OS.get_name() == "Web" and PlatformService.mobile:
			call_deferred("_tune_visual_materials")
		else:
			_tune_visual_materials()
		MobileWebBootTelemetry.mark_stage("KRAKEN READY", "visible")
	MobileWebBootTelemetry.mark_stage("PLAYER READY", "heading=%.1f" % heading_degrees())

func _tune_visual_materials() -> void:
	for child in visual_root.find_children("*", "MeshInstance3D", true, false):
		var mesh_instance := child as MeshInstance3D
		if mesh_instance.mesh == null:
			continue
		for surface_index in mesh_instance.mesh.get_surface_count():
			var material := mesh_instance.get_active_material(surface_index)
			if material is BaseMaterial3D:
				var tuned := material.duplicate() as BaseMaterial3D
				tuned.albedo_color *= Color(1.28, 1.24, 1.2, 1.0)
				mesh_instance.set_surface_override_material(surface_index, tuned)

func _physics_process(delta: float) -> void:
	position.y = GameplayPlane.WATER_Y
	rotate_y(-_command.steering * turn_speed * delta)
	var thrust := _command.thrust
	forward_speed = move_toward(forward_speed, thrust * max_speed, acceleration * delta)
	if absf(thrust) < 0.05:
		forward_speed = move_toward(forward_speed, 0.0, drag * delta)
	velocity = -transform.basis.z * forward_speed
	velocity.y = 0.0
	move_and_slide()
	position.y = GameplayPlane.WATER_Y
	position.x = clampf(position.x, -1450.0, 1450.0)
	position.z = clampf(position.z, -1050.0, 1050.0)

func apply_command(command: PlayerCommand) -> void:
	_command.copy_from(command)

func set_heading_degrees(value: float) -> void:
	rotation.y = -deg_to_rad(wrapf(value, 0.0, 360.0))

func heading_degrees() -> float:
	return wrapf(-rad_to_deg(rotation.y), 0.0, 360.0)

func speed() -> float:
	return absf(forward_speed)

func set_debug_ui_anchor_visible(enabled: bool) -> void:
	debug_ui_anchor.visible = enabled

func set_debug_forward_visible(enabled: bool) -> void:
	debug_forward.visible = enabled

func set_debug_collision_visible(enabled: bool) -> void:
	debug_collision.visible = enabled
