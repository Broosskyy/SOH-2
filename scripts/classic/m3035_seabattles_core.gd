extends "res://scripts/classic/m3034_fullscreen_sea_map.gd"
## M303.5: classic SeaBattles-style asset bridge (LOCAL preview, not networked).
## One visual choice per ship: proprietary local test sprite OR original 16-way
## placeholder atlas OR existing Godot GLB. No gameplay dependency on visuals.
const ASSET_BRIDGE = preload("res://scripts/classic/m3035_render_adapter.gd")
var _graphics_button: Button
var _asset_mode := "private_sprite"
var _sea_speed := 0.0
var _wake_visual: MeshInstance3D

func _ready() -> void:
	_asset_mode = str(get_tree().root.get_meta("m3035_graphic_mode", "private_sprite"))
	super._ready()


func _asset(file: String, where: Vector3, scale_factor: float, label: String, atlas_path: String = "") -> Node3D:
	if _asset_mode == "private_sprite":
		if ASSET_BRIDGE.has_local_ship(label) or ASSET_BRIDGE.has_local_island(label):
			var holder := Node3D.new()
			holder.name = label
			holder.position = where
			add_child(holder)
			var adapter := ASSET_BRIDGE.new()
			adapter.name = "ShipSprite" if label == "PlayerShip" or label.begins_with("NPC_") else "IslandVisual"
			holder.add_child(adapter)
			var source: String = ASSET_BRIDGE.local_path(label)
			var success := false
			if label.begins_with("NPC_") or label == "PlayerShip":
				# Provisional layout of the private diagnostic atlas: 4 × 2.
				# Metadata alone cannot verify frame direction order, tune heading_bias.
				success = adapter.set_ship_atlas(source, 4, 2, 5.6 * scale_factor)
			else:
				var radius := 12.0
				for obstacle in islands:
					var center: Vector3 = obstacle["position"]
					if center.distance_to(where) < 0.5:
						radius = float(obstacle["radius"])
						break
				success = adapter.set_island_image(source, radius * 2.2)
			if success:
				return holder
			holder.queue_free()
	if _asset_mode == "complete_3d":
		return super._asset(file, where, scale_factor, label, "")
	return super._asset(file, where, scale_factor, label, atlas_path)


func _build_world() -> void:
	super._build_world()
	# Thin restrained stern wake. Visual only; fixes M302's broad white-fan issue.
	_wake_visual = MeshInstance3D.new()
	_wake_visual.name = "ClassicSternWake"
	var surface := PlaneMesh.new()
	surface.size = Vector2(0.95, 5.4)
	_wake_visual.mesh = surface
	_wake_visual.position = Vector3(0.0, -0.43, -3.0)
	var foam := StandardMaterial3D.new()
	foam.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	foam.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	foam.albedo_color = Color(0.76, 0.91, 0.94, 0.24)
	foam.depth_draw_mode = BaseMaterial3D.DEPTH_DRAW_ALWAYS
	_wake_visual.material_override = foam
	_wake_visual.visible = false
	ship.add_child(_wake_visual)


func _sail(delta: float) -> void:
	if route.is_empty():
		_sea_speed = move_toward(_sea_speed, 0.0, 20.0 * delta)
		if _wake_visual != null:
			_wake_visual.visible = false
		return
	var displacement := route[0] - ship.position
	displacement.y = 0.0
	if displacement.length() < 0.8:
		route.remove_at(0)
		return
	var direction := displacement.normalized()
	# Ported from M302 motor feel: measured acceleration and rotation rate,
	# with course-following independent of the heading/sprite presentation.
	_sea_speed = move_toward(_sea_speed, 11.0, 19.0 * delta)
	var next_point := ship.position + direction * minf(_sea_speed * delta, displacement.length())
	if _blocked(next_point):
		route.clear()
		_sea_speed = 0.0
		hint = "Küste erreicht – neuer Kurs nötig"
		_refresh()
		return
	ship.position = next_point
	var desired_heading := atan2(-direction.x, -direction.z)
	ship.rotation.y = rotate_toward(ship.rotation.y, desired_heading, deg_to_rad(112.0) * delta)
	var appearance := ship.get_node_or_null("ShipSprite")
	if appearance != null and appearance.has_method("set_heading"):
		appearance.set_heading(ship.rotation.y)
	if _wake_visual != null:
		_wake_visual.visible = _sea_speed > 0.3
		_wake_visual.scale.z = 0.35 + 0.7 * _sea_speed / 11.0


func _make_hud() -> void:
	super._make_hud()
	_graphics_button = _control("GRAFIK: 2D/3D", Callable(self,"_switch_graphics"))
	_graphics_button.add_theme_font_size_override("font_size", 12)
	_hud_header.text = "ABYSSAL DOMINION  ·  NORDMEER 10/2  ·  M303.5"


func _layout_hud() -> void:
	super._layout_hud()
	if _graphics_button == null:
		return
	var v := get_viewport().get_visible_rect().size
	var bar_height := 34.0 if v.x < 1024.0 or v.y < 540.0 else 44.0
	_place(_graphics_button, v.x * 0.44, bar_height + 8.0, minf(v.x * 0.24, 170.0), 36.0)
	_graphics_button.text = _mode_name()


func _mode_name() -> String:
	if _asset_mode == "private_sprite":
		return "GRAFIK: APK-TEST"
	if _asset_mode == "complete_3d":
		return "GRAFIK: 3D"
	return "GRAFIK: 2D"


func _switch_graphics() -> void:
	if _asset_mode == "private_sprite":
		_asset_mode = "complete_3d"
	elif _asset_mode == "complete_3d":
		_asset_mode = "placeholder_sprite"
	else:
		_asset_mode = "private_sprite"
	get_tree().root.set_meta("m3035_graphic_mode", _asset_mode)
	# Asset-reload is a LOCAL-TEST reset; no durable save or online state exists.
	get_tree().reload_current_scene()
