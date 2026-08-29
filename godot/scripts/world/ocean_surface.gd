extends MeshInstance3D

var _base_y := 0.0
var _elapsed := 0.0
var _material: ShaderMaterial

func _ready() -> void:
	_base_y = position.y
	_material = material_override as ShaderMaterial
	if _material == null:
		_material = ShaderMaterial.new()
		_material.shader = preload("res://shaders/ocean_surface.gdshader")
		material_override = _material

func _process(delta: float) -> void:
	_elapsed += delta
	position.y = _base_y + sin(_elapsed * 0.8) * 0.12
	if _material != null:
		_material.set_shader_parameter("u_time", _elapsed)
