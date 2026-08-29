extends Node3D

@onready var ocean: MeshInstance3D = $Ocean
@onready var sun: DirectionalLight3D = $Sun
@onready var world_environment: WorldEnvironment = $Environment
@onready var player_ship: Node3D = $PlayerShip
@onready var camera: Camera3D = $Camera
@onready var mobile_controls: CanvasLayer = $MobileControls
@onready var floating_hud: CanvasLayer = $FloatingPlayerHUD
@onready var region_aster: Node3D = $Region_Aster

var elapsed := 0.0

func _ready() -> void:
	sun.add_to_group("directional_lights")
	_apply_mobile_web_render_profile()
	_apply_isolation(MobileWebDiagnostics.isolation_step())
	QualityManager.apply_directional_shadows(QualityManager.shadows_enabled())
	MobileWebBootTelemetry.mark_stage("WORLD READY", "isolate=%d" % MobileWebDiagnostics.isolation_step())
	if camera != null:
		camera.add_to_group("boot_camera")
		MobileWebBootTelemetry.mark_stage(
			"CAMERA READY",
			"current=%s pos=%s" % [camera.current, _format_vec3(camera.global_position)]
		)

func _process(delta: float) -> void:
	elapsed += delta
	ocean.position.y = sin(elapsed * 0.8) * 0.12

func set_debug_island_bounds_visible(enabled: bool) -> void:
	for bounds in get_tree().get_nodes_in_group("island_bounds"):
		(bounds as GeometryInstance3D).visible = enabled

func _apply_mobile_web_render_profile() -> void:
	if OS.get_name() != "Web" or not PlatformService.mobile:
		return
	var ocean_mesh := PlaneMesh.new()
	ocean_mesh.size = Vector2(3000, 2200)
	ocean_mesh.subdivide_width = 32
	ocean_mesh.subdivide_depth = 24
	ocean.mesh = ocean_mesh
	if world_environment.environment != null:
		world_environment.environment.fog_enabled = false
	sun.shadow_enabled = QualityManager.shadows_enabled()

func _apply_isolation(step: int) -> void:
	if step >= 7:
		return
	player_ship.visible = step >= 3
	floating_hud.visible = step >= 5
	mobile_controls.visible = step >= 5 and PlatformService.mobile
	region_aster.visible = step >= 6
	if step <= 2:
		player_ship.visible = false
	if step == 2:
		floating_hud.visible = false
		mobile_controls.visible = false
		region_aster.visible = false

func _format_vec3(value: Vector3) -> String:
	return "(%.1f, %.1f, %.1f)" % [value.x, value.y, value.z]
