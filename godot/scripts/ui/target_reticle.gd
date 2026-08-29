extends CanvasLayer

@export var target_path: NodePath

var _reticle: Panel

func _ready() -> void:
	layer = 90
	_reticle = Panel.new()
	_reticle.custom_minimum_size = Vector2(42, 42)
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0, 0, 0, 0)
	style.border_color = Color(1.0, 0.45, 0.2, 0.9)
	style.set_border_width_all(2)
	style.set_corner_radius_all(21)
	_reticle.add_theme_stylebox_override("panel", style)
	_reticle.visible = false
	add_child(_reticle)
	TargetingSystem.target_changed.connect(_on_target_changed)
	TargetingSystem.target_cleared.connect(_on_target_cleared)

func _process(_delta: float) -> void:
	if not _reticle.visible or TargetingSystem.current_target == null:
		return
	var camera := get_viewport().get_camera_3d()
	if camera == null:
		return
	var targetable := TargetingSystem.current_target.get_node_or_null("TargetableComponent") as TargetableComponent
	var world_position := targetable.target_position() if targetable != null else TargetingSystem.current_target.global_position
	if camera.is_position_behind(world_position):
		_reticle.visible = false
		return
	var screen_position := camera.unproject_position(world_position)
	_reticle.position = screen_position - _reticle.size * 0.5

func _on_target_changed(_target: Node3D) -> void:
	_reticle.visible = true

func _on_target_cleared() -> void:
	_reticle.visible = false
