class_name NavigationBlockV2
extends HBoxContainer

const PHONE_PRIMARY := [
	["S", "SHIPS"], ["W", "WERFT"], ["E", "EVENTS"], ["Q", "QUESTS"],
	["G", "GUILD"], ["C", "CHAT"], ["M", "MENU"],
]
const DESKTOP_ALL := [
	["S", "SHIPS"], ["W", "WERFT"], ["E", "EVENTS"], ["Q", "QUESTS"],
	["P", "SHOP"], ["G", "GUILD"], ["C", "CHAT"], ["A", "ACHIEV"],
	["L", "LOG"], ["R", "RANK"], ["B", "BONUS"], ["M", "MENU"],
]

func _init() -> void:
	name = "NavigationBlock"
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	alignment = BoxContainer.ALIGNMENT_CENTER

func apply_viewport(viewport: Vector2) -> void:
	for child in get_children():
		child.queue_free()
	var phone := ResponsiveHudMetrics.detect_profile(viewport) == ResponsiveHudMetrics.Profile.PHONE_LANDSCAPE
	var entries := PHONE_PRIMARY if phone else DESKTOP_ALL
	var btn_h := maxf(12.0, size.y - 2.0)
	var font_px := HudV2Typography.font_size(viewport, HudV2Typography.Tier.NAV)
	for entry in entries:
		var button := Button.new()
		button.text = entry[1] if phone else "%s\n%s" % [entry[0], entry[1]]
		button.disabled = true
		button.focus_mode = Control.FOCUS_NONE
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.custom_minimum_size = Vector2(0.0, btn_h)
		button.add_theme_font_size_override("font_size", font_px)
		var style := PresentationTheme.compact_nav_button(false) if phone else PresentationTheme.nav_button(false)
		button.add_theme_stylebox_override("normal", style)
		button.add_theme_stylebox_override("disabled", style)
		add_child(button)
