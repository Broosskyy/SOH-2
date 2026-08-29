class_name PresentationTheme
extends RefCounted

static func glass_panel() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.04, 0.1, 0.14, 0.88)
	style.border_color = Color(0.72, 0.57, 0.27, 0.72)
	style.set_border_width_all(1)
	style.set_corner_radius_all(4)
	style.content_margin_left = 6
	style.content_margin_right = 6
	style.content_margin_top = 4
	style.content_margin_bottom = 4
	return style

static func nav_button(enabled: bool) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.08, 0.12, 0.16, 0.82 if enabled else 0.35)
	style.border_color = Color(0.72, 0.57, 0.27, 0.5 if enabled else 0.18)
	style.set_border_width_all(1)
	style.set_corner_radius_all(3)
	style.content_margin_left = 2
	style.content_margin_right = 2
	style.content_margin_top = 1
	style.content_margin_bottom = 1
	return style

static func round_button(radius: float, accent := Color(0.62, 0.48, 0.24, 0.72)) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.04, 0.08, 0.1, 0.9)
	style.border_color = accent
	style.set_border_width_all(2)
	style.set_corner_radius_all(int(radius))
	return style

static func bar_background() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.03, 0.07, 0.09, 0.95)
	style.set_corner_radius_all(2)
	return style

static func bar_fill(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.set_corner_radius_all(2)
	return style

static func label_color(kind := "default") -> Color:
	match kind:
		"gold":
			return Color(0.92, 0.82, 0.48)
		"muted":
			return Color(0.72, 0.78, 0.82)
		"mission":
			return Color(0.82, 0.62, 0.38)
		"name":
			return Color(0.94, 0.9, 0.78)
		"guild":
			return Color(0.72, 0.82, 0.8)
		_:
			return Color(0.86, 0.82, 0.68)

static func font_px(viewport: Vector2, base: float, semantic: HudLayout.Semantic = HudLayout.Semantic.PLAYER_STATUS) -> int:
	return HudLayout.font_size(viewport, base, semantic)
