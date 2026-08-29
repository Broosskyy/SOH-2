class_name PlayerShip
extends ShipEntity

@export var max_speed := 42.0
@export var acceleration := 30.0
@export var turn_speed := 1.45
@export var drag := 1.7

var forward_speed := 0.0
var _command := PlayerCommand.new()

@onready var kraken_model: Node3D = $VisualRoot/KrakenModel
@onready var wake_anchor: Marker3D = $VFXAnchors/Wake
@onready var debug_ui_anchor: GeometryInstance3D = $Debug/UIAnchorMarker
@onready var debug_forward: GeometryInstance3D = $Debug/ForwardVector
@onready var debug_collision: GeometryInstance3D = $Debug/CollisionEnvelope

func _ready() -> void:
	add_to_group("player_ship")
	add_to_group("targetable_units")
	if identity == null:
		identity = UnitIdentity.new()
		identity.unit_id = "player_kraken"
		identity.unit_type = "player_ship"
		identity.display_name = str(GameState.save_data.get("playerName", "Captain Rowan"))
		identity.faction = UnitFaction.Allegiance.PLAYER
	if presentation_profile == null:
		push_error("PlayerShip requires a ShipPresentationProfile")
		MobileWebBootTelemetry.report_error("PlayerShip missing profile")
		return
	apply_presentation_profile()
	wake_anchor.position.z = presentation_profile.wake_stern_offset
	if health != null:
		var ship_id := str(GameState.save_data.get("shipId", "sovereign"))
		var ship_data: Dictionary = GameState.catalog.get("ships", {}).get(ship_id, {})
		health.max_health = float(ship_data.get("hp", 1250.0))
		health.current_health = health.max_health
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

func set_debug_ui_anchor_visible(enabled: bool) -> void:
	debug_ui_anchor.visible = enabled

func set_debug_forward_visible(enabled: bool) -> void:
	debug_forward.visible = enabled

func set_debug_collision_visible(enabled: bool) -> void:
	debug_collision.visible = enabled
