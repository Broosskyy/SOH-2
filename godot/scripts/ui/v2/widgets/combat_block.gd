class_name CombatBlockV2
extends Control

func _init() -> void:
	name = "CombatBlock"
	mouse_filter = Control.MOUSE_FILTER_IGNORE

func apply_viewport(viewport: Vector2) -> void:
	for child in get_children():
		child.queue_free()
	var fire := Button.new()
	fire.name = "FireButton"
	fire.text = "FEUER"
	fire.disabled = true
	fire.focus_mode = Control.FOCUS_NONE
	var pad := 2.0
	var inner := Rect2(Vector2(pad, pad), size - Vector2(pad * 2.0, pad * 2.0))
	var fire_size := maxf(18.0, minf(inner.size.x, inner.size.y) * 0.62)
	fire.custom_minimum_size = Vector2(fire_size, fire_size)
	fire.size = fire.custom_minimum_size
	fire.position = Vector2(inner.end.x - fire_size, inner.end.y - fire_size)
	fire.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.PRIMARY_ACTION))
	fire.add_theme_stylebox_override("normal", PresentationTheme.round_button(fire_size * 0.5, Color(0.92, 0.62, 0.22, 0.9)))
	fire.add_theme_stylebox_override("disabled", fire.get_theme_stylebox("normal"))
	add_child(fire)
	var secondary := clampf(fire_size * 0.34, 11.0, fire_size * 0.4)
	var slots := [
		["Ability8", "8", Vector2(fire.position.x - secondary * 0.9, fire.position.y + fire_size * 0.15)],
		["Ability14", "14", Vector2(fire.position.x + fire_size * 0.1, fire.position.y - secondary * 0.9)],
		["Ability11", "11", Vector2(fire.position.x - secondary * 0.5, fire.position.y - secondary * 0.5)],
		["ShieldButton", "S", Vector2(fire.position.x - secondary * 1.3, fire.position.y + fire_size * 0.4)],
		["TargetButton", "T", Vector2(fire.position.x + fire_size * 0.4, fire.position.y - secondary * 1.3)],
	]
	for spec in slots:
		var ability := Button.new()
		ability.name = spec[0]
		ability.text = spec[1]
		ability.disabled = true
		ability.focus_mode = Control.FOCUS_NONE
		ability.custom_minimum_size = Vector2(secondary, secondary)
		ability.size = ability.custom_minimum_size
		ability.position = _clamp(spec[2], ability.size, inner)
		ability.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.SECONDARY_ACTION))
		var style := PresentationTheme.round_button(secondary * 0.5)
		ability.add_theme_stylebox_override("normal", style)
		ability.add_theme_stylebox_override("disabled", style)
		add_child(ability)

func _clamp(pos: Vector2, btn_size: Vector2, bounds: Rect2) -> Vector2:
	return Vector2(
		clampf(pos.x, bounds.position.x, bounds.end.x - btn_size.x),
		clampf(pos.y, bounds.position.y, bounds.end.y - btn_size.y)
	)
