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

const BUILD_LABEL := "G0.5-WEB-PRESENTATION-REBASE"
const GIT_SHA := "pending"

static func ui_scale(viewport: Vector2) -> float:
	var short_edge := minf(viewport.x, viewport.y)
	if PlatformService.mobile and viewport.x >= viewport.y:
		return clampf(short_edge / 607.0, 0.92, 1.08)
	return clampf(short_edge / 1080.0, 0.88, 1.05)

static func margin(viewport: Vector2) -> float:
	return maxf(8.0, 10.0 * ui_scale(viewport))

static func safe(viewport: Vector2) -> Rect2:
	return PlatformService.safe_rect(viewport)

static func top_bar_height(viewport: Vector2) -> float:
	return maxf(52.0, 58.0 * ui_scale(viewport))

static func zone_rect(viewport: Vector2, zone: Zone) -> Rect2:
	var area := safe(viewport)
	var m := margin(viewport)
	var scale := ui_scale(viewport)
	var top_h := top_bar_height(viewport)
	match zone:
		Zone.TOP_LEFT:
			return Rect2(area.position.x + m, area.position.y + m, 150.0 * scale, top_h - m)
		Zone.TOP_STATUS:
			var w := minf(280.0 * scale, area.size.x * 0.22)
			return Rect2(area.position.x + area.size.x * 0.5 - w * 0.5, area.position.y + m, w, top_h - m)
		Zone.TOP_NAV:
			var w := minf(area.size.x * 0.42, 520.0 * scale)
			return Rect2(area.position.x + area.size.x * 0.5 - w * 0.5, area.position.y + m, w, top_h - m)
		Zone.MISSION:
			return Rect2(area.position.x + m, area.position.y + top_h + 4.0, 252.0 * scale, 46.0 * scale)
		Zone.MINIMAP:
			var d := minf(142.0 * scale, area.size.y * 0.24)
			return Rect2(area.end.x - d - m, area.position.y + top_h + 2.0, d, d)
		Zone.ZOOM:
			var w := 40.0 * scale
			var h := w * 5.2
			return Rect2(area.position.x + m, area.position.y + top_h + 58.0 * scale, w, h)
		Zone.BOTTOM_LEFT:
			var w := 238.0 * scale
			var h := 72.0 * scale
			return Rect2(area.position.x + m, area.end.y - h - m - 52.0 * scale, w, h)
		Zone.BOTTOM_CENTER:
			var w := 220.0 * scale
			var h := 48.0 * scale
			return Rect2(area.position.x + area.size.x * 0.5 - w * 0.5, area.end.y - h - m, w, h)
		Zone.BOTTOM_RIGHT:
			var size := minf(180.0 * scale, area.size.y * 0.32)
			return Rect2(area.end.x - size - m, area.end.y - size - m, size, size)
		Zone.TARGET:
			var w := minf(250.0 * scale, area.size.x * 0.42)
			return Rect2(area.position.x + area.size.x * 0.5 - w * 0.5, area.position.y + top_h + 2.0, w, 44.0 * scale)
		_:
			return Rect2()

static func place(control: Control, rect: Rect2) -> void:
	if control == null:
		return
	var size := control.get_combined_minimum_size()
	if size == Vector2.ZERO:
		size = rect.size
	control.position = rect.position
	control.size = Vector2(minf(rect.size.x, size.x) if rect.size.x > 0 else size.x, minf(rect.size.y, size.y) if rect.size.y > 0 else size.y)
	if control.custom_minimum_size == Vector2.ZERO:
		control.custom_minimum_size = control.size
