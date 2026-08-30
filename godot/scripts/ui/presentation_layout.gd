class_name PresentationLayout
extends RefCounted

enum Zone {
	PROFILE,
	STATUS,
	NAV,
	CURRENCY,
	MISSION,
	MINIMAP,
	ZOOM,
	CHAT,
	CONSUMABLES,
	COMBAT,
	FULLSCREEN,
	TARGET,
}

const BUILD_LABEL := "G0.5.2-NATIVE-RESPONSIVE-HUD"
const GIT_SHA := "1030cfe"

static func zone_rect(viewport: Vector2, zone: Zone) -> Rect2:
	var area := ResponsiveHudMetrics.safe_rect(viewport)
	var m := ResponsiveHudMetrics.margin(viewport)
	var profile := ResponsiveHudMetrics.detect_profile(viewport)
	var top_h := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_TOP_BAR_H, "y", ResponsiveHudMetrics.min_touch_px(viewport) * 0.5, 0.12)
	match zone:
		Zone.PROFILE:
			var w := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_PROFILE_W, "x", 96.0, 0.22)
			return Rect2(area.position.x + m, area.position.y + m, w, top_h)
		Zone.STATUS:
			var w := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_STATUS_BAR_W, "x", 120.0, 0.28)
			var x := area.position.x + area.size.x * 0.5 - w * 0.5
			if profile == ResponsiveHudMetrics.Profile.PHONE_LANDSCAPE:
				x = area.position.x + ResponsiveHudMetrics.length(viewport, HudLayoutProfile.RATIO_PROFILE_W, "x") + m * 2.0
			return Rect2(x, area.position.y + m, w, top_h)
		Zone.NAV:
			var left := area.position.x + ResponsiveHudMetrics.length(viewport, HudLayoutProfile.RATIO_PROFILE_W, "x") + m * 2.0
			var right := area.end.x - ResponsiveHudMetrics.touch_diameter(viewport, HudLayoutProfile.RATIO_MINIMAP_D) - m * 2.0
			if profile == ResponsiveHudMetrics.Profile.DESKTOP_TABLET:
				left = area.position.x + area.size.x * 0.2
				right = area.end.x - area.size.x * 0.2
			var w := maxf(120.0, right - left)
			return Rect2(left, area.position.y + m, w, top_h)
		Zone.CURRENCY:
			var w := ResponsiveHudMetrics.clamp_length(viewport, 0.14, "x", 80.0, 0.2)
			return Rect2(area.end.x - w - m, area.position.y + m * 0.5, w, top_h * 0.85)
		Zone.MISSION:
			var w := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_MISSION_W, "x", 110.0, 0.24)
			var h := ResponsiveHudMetrics.clamp_length(viewport, 0.075, "y", ResponsiveHudMetrics.min_touch_px(viewport), 0.14)
			return Rect2(area.position.x + m, area.position.y + top_h + m * 0.35, w, h)
		Zone.MINIMAP:
			var d := ResponsiveHudMetrics.touch_diameter(viewport, HudLayoutProfile.RATIO_MINIMAP_D, ResponsiveHudMetrics.min_touch_px(viewport), 0.24)
			return Rect2(area.end.x - d - m, area.position.y + m, d, d)
		Zone.ZOOM:
			var w := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_ZOOM_W, "x", 36.0, 0.08)
			var h := ResponsiveHudMetrics.clamp_length(viewport, 0.24, "y", ResponsiveHudMetrics.min_touch_px(viewport) * 2.0, 0.32)
			return Rect2(area.position.x + m, area.position.y + top_h + ResponsiveHudMetrics.length(viewport, 0.075, "y"), w, h)
		Zone.CHAT:
			var w := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_CHAT_W, "x", 120.0, 0.28)
			var h := ResponsiveHudMetrics.clamp_length(viewport, 0.1, "y", ResponsiveHudMetrics.min_touch_px(viewport), 0.16)
			var y := area.end.y - h - m - ResponsiveHudMetrics.min_touch_px(viewport) * 0.75
			return Rect2(area.position.x + m, y, w, h)
		Zone.CONSUMABLES:
			var w := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_CONSUMABLE_ROW_W, "x", 120.0, 0.26)
			var h := ResponsiveHudMetrics.touch_diameter(viewport, HudLayoutProfile.RATIO_ABILITY_D, ResponsiveHudMetrics.min_touch_px(viewport) * 0.85, 0.14)
			return Rect2(area.position.x + area.size.x * 0.5 - w * 0.5, area.end.y - h - m, w, h)
		Zone.COMBAT:
			var size := ResponsiveHudMetrics.touch_diameter(viewport, HudLayoutProfile.RATIO_FIRE_D, ResponsiveHudMetrics.min_touch_px(viewport) * 1.6, 0.28) * 1.55
			return Rect2(area.end.x - size - m, area.end.y - size - m, size, size)
		Zone.FULLSCREEN:
			var fs := ResponsiveHudMetrics.touch_diameter(viewport, 0.04, 32.0, 0.08)
			return Rect2(area.end.x - fs - m, area.position.y + top_h + m * 0.25, fs, fs)
		Zone.TARGET:
			var w := ResponsiveHudMetrics.clamp_length(viewport, 0.24, "x", 100.0, 0.42)
			return Rect2(area.position.x + area.size.x * 0.5 - w * 0.5, area.position.y + top_h + m * 0.2, w, top_h * 0.75)
		_:
			return Rect2()

static func apply_zone(control: Control, rect: Rect2) -> void:
	if control == null or rect.size.x <= 0.0 or rect.size.y <= 0.0:
		return
	control.scale = Vector2.ONE
	control.position = rect.position
	control.size = rect.size
	control.custom_minimum_size = rect.size
