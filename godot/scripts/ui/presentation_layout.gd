class_name PresentationLayout
extends RefCounted

enum Zone {
	TOP_LEFT,
	TOP_STATUS,
	TOP_NAV,
	MISSION,
	MINIMAP,
	ZOOM,
	BOTTOM_LEFT,
	BOTTOM_CENTER,
	BOTTOM_RIGHT,
	TARGET,
}

const BUILD_LABEL := "G0.5.1-MOBILE-WEB-UI-METRICS"
const GIT_SHA := "pending"

static func ui_scale(viewport: Vector2) -> float:
	return UiMetrics.effective_ui_scale(viewport)

static func margin(viewport: Vector2) -> float:
	return HudLayout.panel_margin(viewport)

static func safe(viewport: Vector2) -> Rect2:
	return PlatformService.safe_rect(viewport)

static func top_bar_height(viewport: Vector2) -> float:
	return HudLayoutProfile.touch_floor(viewport, HudLayoutProfile.RATIO_TOP_BAR_H, "y")

static func zone_rect(viewport: Vector2, zone: Zone) -> Rect2:
	var area := safe(viewport)
	var m := margin(viewport)
	var top_h := top_bar_height(viewport)
	match zone:
		Zone.TOP_LEFT:
			var w := HudLayoutProfile.length(viewport, HudLayoutProfile.RATIO_PROFILE_W, "x")
			return Rect2(area.position.x + m, area.position.y + m, w, top_h - m)
		Zone.TOP_STATUS:
			var w := HudLayoutProfile.length(viewport, HudLayoutProfile.RATIO_STATUS_BAR_W, "x")
			return Rect2(area.position.x + area.size.x * 0.5 - w * 0.5, area.position.y + m, w, top_h - m)
		Zone.TOP_NAV:
			var w := minf(area.size.x * 0.62, HudLayoutProfile.length(viewport, 0.52, "x"))
			return Rect2(area.position.x + area.size.x * 0.5 - w * 0.5, area.position.y + m, w, top_h - m)
		Zone.MISSION:
			var w := HudLayoutProfile.length(viewport, HudLayoutProfile.RATIO_MISSION_W, "x")
			var h := maxf(UiMetrics.min_touch_render_px(viewport) * 1.05, viewport.y * 0.068)
			return Rect2(area.position.x + m, area.position.y + top_h + 4.0, w, h)
		Zone.MINIMAP:
			var d := HudLayoutProfile.touch_floor(viewport, HudLayoutProfile.RATIO_MINIMAP_D, "y")
			return Rect2(area.end.x - d - m, area.position.y + top_h + 2.0, d, d)
		Zone.ZOOM:
			var w := HudLayoutProfile.length(viewport, HudLayoutProfile.RATIO_ZOOM_W, "x")
			var h := w * 5.4
			return Rect2(area.position.x + m, area.position.y + top_h + 58.0, w, h)
		Zone.BOTTOM_LEFT:
			var w := HudLayoutProfile.length(viewport, HudLayoutProfile.RATIO_CHAT_W, "x")
			var h := maxf(viewport.y * 0.09, UiMetrics.min_touch_render_px(viewport) * 1.2)
			return Rect2(area.position.x + m, area.end.y - h - m - UiMetrics.min_touch_render_px(viewport) * 0.9, w, h)
		Zone.BOTTOM_CENTER:
			var w := HudLayoutProfile.length(viewport, HudLayoutProfile.RATIO_CONSUMABLE_ROW_W, "x")
			var h := UiMetrics.min_touch_render_px(viewport)
			return Rect2(area.position.x + area.size.x * 0.5 - w * 0.5, area.end.y - h - m, w, h)
		Zone.BOTTOM_RIGHT:
			var size := maxf(
				HudLayoutProfile.touch_floor(viewport, HudLayoutProfile.RATIO_FIRE_D, "y") * 1.55,
				UiMetrics.min_touch_render_px(viewport) * 2.4
			)
			return Rect2(area.end.x - size - m, area.end.y - size - m, size, size)
		Zone.TARGET:
			var w := minf(HudLayoutProfile.length(viewport, 0.26, "x"), area.size.x * 0.42)
			return Rect2(area.position.x + area.size.x * 0.5 - w * 0.5, area.position.y + top_h + 2.0, w, top_h * 0.72)
		_:
			return Rect2()

static func place(control: Control, rect: Rect2) -> void:
	if control == null:
		return
	control.position = rect.position
	control.size = rect.size
	control.custom_minimum_size = rect.size
