class_name ResponsiveHudLayoutSolver
extends RefCounted

enum Region {
	IDENTITY,
	STATUS,
	NAV,
	MINIMAP,
	FULLSCREEN,
	MISSION,
	ZOOM,
	MOVEMENT,
	CHAT,
	CONSUMABLES,
	COMBAT,
	CENTER_SAFE,
}

const BUILD_LABEL := "G0.5.7-RESERVED-REGION-LAYOUT"
const REGION_KEYS := [
	"identity", "status", "nav", "minimap", "fullscreen",
	"mission", "zoom", "movement", "chat", "consumables", "combat", "center_safe",
]

static func solve(viewport: Vector2) -> Dictionary:
	if ResponsiveHudMetrics.detect_profile(viewport) == ResponsiveHudMetrics.Profile.PHONE_LANDSCAPE:
		return _solve_phone(viewport)
	return _solve_desktop(viewport)

static func region_rect(solution: Dictionary, region: Region) -> Rect2:
	return solution.get(REGION_KEYS[region], Rect2())

static func zone_rect(viewport: Vector2, zone: PresentationLayout.Zone) -> Rect2:
	var solution := solve(viewport)
	match zone:
		PresentationLayout.Zone.PROFILE, PresentationLayout.Zone.CURRENCY:
			return region_rect(solution, Region.IDENTITY)
		PresentationLayout.Zone.STATUS:
			return region_rect(solution, Region.STATUS)
		PresentationLayout.Zone.NAV:
			return region_rect(solution, Region.NAV)
		PresentationLayout.Zone.MINIMAP:
			return region_rect(solution, Region.MINIMAP)
		PresentationLayout.Zone.FULLSCREEN:
			return region_rect(solution, Region.FULLSCREEN)
		PresentationLayout.Zone.MISSION:
			return region_rect(solution, Region.MISSION)
		PresentationLayout.Zone.ZOOM:
			return region_rect(solution, Region.ZOOM)
		PresentationLayout.Zone.CHAT:
			return region_rect(solution, Region.CHAT)
		PresentationLayout.Zone.CONSUMABLES:
			return region_rect(solution, Region.CONSUMABLES)
		PresentationLayout.Zone.COMBAT:
			return region_rect(solution, Region.COMBAT)
		PresentationLayout.Zone.TARGET:
			return _target_rect(viewport, solution)
		_:
			return Rect2()

static func movement_rect(viewport: Vector2) -> Rect2:
	return region_rect(solve(viewport), Region.MOVEMENT)

static func center_safe_rect(viewport: Vector2) -> Rect2:
	return region_rect(solve(viewport), Region.CENTER_SAFE)

static func _target_rect(viewport: Vector2, solution: Dictionary) -> Rect2:
	var status: Rect2 = solution.get("status", Rect2())
	var w := ResponsiveHudMetrics.clamp_length(viewport, 0.16, "x", 72.0, 0.30)
	return Rect2(status.position.x + status.size.x * 0.5 - w * 0.5, status.end.y + ResponsiveHudMetrics.margin(viewport) * 0.1, w, status.size.y * 0.65)

static func _solve_phone(viewport: Vector2) -> Dictionary:
	var safe := ResponsiveHudMetrics.safe_rect(viewport)
	var m := ResponsiveHudMetrics.margin(viewport)
	var edge := ResponsiveHudMetrics.safe_edge_margin(viewport)
	var gap := m * 0.45

	var top_row_h := ResponsiveHudMetrics.clamp_length(viewport, 0.062, "y", 16.0, 0.085)
	var currency_h := ResponsiveHudMetrics.clamp_length(viewport, 0.034, "y", 10.0, 0.06)
	var identity_w := ResponsiveHudMetrics.clamp_length(viewport, 0.105, "x", 68.0, 0.14)
	var identity_h := top_row_h + currency_h + gap * 0.5

	var status_w := ResponsiveHudMetrics.clamp_length(viewport, 0.152, "x", 90.0, 0.19)
	var minimap_d := ResponsiveHudMetrics.touch_diameter(viewport, 0.125, ResponsiveHudMetrics.min_touch_px(viewport) * 0.8, 0.14)
	var fs_d := ResponsiveHudMetrics.touch_diameter(viewport, 0.032, 18.0, 0.05)

	var identity := Rect2(safe.position.x, safe.position.y, identity_w, identity_h)
	var status := Rect2(identity.end.x + gap, safe.position.y, status_w, top_row_h)
	var minimap := Rect2(safe.end.x - minimap_d, safe.position.y, minimap_d, minimap_d)
	var fullscreen := Rect2(minimap.position.x - fs_d - gap * 0.5, safe.position.y, fs_d, fs_d)

	var nav_left := status.end.x + gap
	var nav_right := fullscreen.position.x - gap
	var nav_w := maxf(36.0, nav_right - nav_left)
	var nav := Rect2(nav_left, safe.position.y, nav_w, top_row_h)

	var top_band_bottom := identity.end.y + gap
	var mission_h := ResponsiveHudMetrics.clamp_length(viewport, 0.13, "y", 34.0, 0.18)
	var mission := Rect2(safe.position.x, top_band_bottom, identity_w, mission_h)

	var zoom_w := ResponsiveHudMetrics.clamp_length(viewport, 0.044, "x", 24.0, 0.055)
	var zoom_h := ResponsiveHudMetrics.clamp_length(viewport, 0.12, "y", 34.0, 0.18)
	var zoom := Rect2(safe.position.x, mission.end.y + gap, zoom_w, zoom_h)

	var movement_h := ResponsiveHudMetrics.clamp_length(viewport, 0.10, "y", 28.0, 0.14)
	var movement := Rect2(safe.position.x, zoom.end.y + gap, zoom_w * 1.15, movement_h)

	var consumable_h := ResponsiveHudMetrics.touch_diameter(viewport, 0.085, ResponsiveHudMetrics.min_touch_px(viewport) * 0.75, 0.10)
	var consumable_w := ResponsiveHudMetrics.clamp_length(viewport, 0.21, "x", 84.0, 0.24)
	var combat_size := ResponsiveHudMetrics.touch_diameter(viewport, 0.13, ResponsiveHudMetrics.min_touch_px(viewport) * 0.85, 0.16)

	var chat_h := ResponsiveHudMetrics.clamp_length(viewport, 0.10, "y", 30.0, 0.16)
	var chat_w := ResponsiveHudMetrics.clamp_length(viewport, 0.19, "x", 80.0, 0.22)
	var bottom_y := safe.end.y - edge

	var consumables := Rect2(
		safe.position.x + safe.size.x * 0.5 - consumable_w * 0.5,
		bottom_y - consumable_h,
		consumable_w,
		consumable_h,
	)
	var combat := Rect2(safe.end.x - combat_size - edge, bottom_y - combat_size, combat_size, combat_size)

	var chat_y := maxf(movement.end.y + gap, bottom_y - chat_h)
	var chat := Rect2(safe.position.x, chat_y, chat_w, minf(chat_h, bottom_y - chat_y))

	var center_safe := _center_safe_from_regions(safe, identity, mission, zoom, movement, chat, consumables, combat, minimap, status, nav, top_band_bottom)

	var regions := {
		"identity": identity,
		"status": status,
		"nav": nav,
		"minimap": minimap,
		"fullscreen": fullscreen,
		"mission": mission,
		"zoom": zoom,
		"movement": movement,
		"chat": chat,
		"consumables": consumables,
		"combat": combat,
		"center_safe": center_safe,
	}
	_resolve_conflicts(regions, safe, edge)
	return regions

static func _solve_desktop(viewport: Vector2) -> Dictionary:
	var safe := ResponsiveHudMetrics.safe_rect(viewport)
	var m := ResponsiveHudMetrics.margin(viewport)
	var top_h := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_TOP_BAR_H, "y", ResponsiveHudMetrics.min_touch_px(viewport) * 0.5, 0.12)
	var identity_w := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_PROFILE_W, "x", 96.0, 0.22)
	var status_w := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_STATUS_BAR_W, "x", 120.0, 0.28)
	var minimap_d := ResponsiveHudMetrics.touch_diameter(viewport, HudLayoutProfile.RATIO_MINIMAP_D, ResponsiveHudMetrics.min_touch_px(viewport), 0.24)
	var identity := Rect2(safe.position.x + m, safe.position.y + m, identity_w, top_h * 1.35)
	var status := Rect2(safe.position.x + safe.size.x * 0.5 - status_w * 0.5, safe.position.y + m, status_w, top_h)
	var minimap := Rect2(safe.end.x - minimap_d - m, safe.position.y + m, minimap_d, minimap_d)
	var fs_d := ResponsiveHudMetrics.touch_diameter(viewport, 0.04, 32.0, 0.08)
	var fullscreen := Rect2(minimap.position.x - fs_d - m * 0.5, safe.position.y + m, fs_d, fs_d)
	var nav_left := identity.end.x + m
	var nav_right := fullscreen.position.x - m
	var nav := Rect2(nav_left, safe.position.y + m, maxf(120.0, nav_right - nav_left), top_h)
	var mission_h := ResponsiveHudMetrics.clamp_length(viewport, 0.075, "y", ResponsiveHudMetrics.min_touch_px(viewport), 0.14)
	var mission := Rect2(safe.position.x + m, identity.end.y + m * 0.35, identity_w, mission_h)
	var zoom_w := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_ZOOM_W, "x", 36.0, 0.08)
	var zoom_h := ResponsiveHudMetrics.clamp_length(viewport, 0.24, "y", ResponsiveHudMetrics.min_touch_px(viewport) * 2.0, 0.32)
	var zoom := Rect2(safe.position.x + m, mission.end.y + m * 0.4, zoom_w, zoom_h)
	var movement := Rect2(safe.position.x + m, zoom.end.y + m * 0.4, zoom_w * 1.2, zoom_h * 0.45)
	var chat_w := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_CHAT_W, "x", 120.0, 0.28)
	var chat_h := ResponsiveHudMetrics.clamp_length(viewport, 0.1, "y", ResponsiveHudMetrics.min_touch_px(viewport), 0.16)
	var chat := Rect2(safe.position.x + m, safe.end.y - chat_h - m - ResponsiveHudMetrics.min_touch_px(viewport) * 0.75, chat_w, chat_h)
	var consumable_w := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_CONSUMABLE_ROW_W, "x", 120.0, 0.26)
	var consumable_h := ResponsiveHudMetrics.touch_diameter(viewport, HudLayoutProfile.RATIO_ABILITY_D, ResponsiveHudMetrics.min_touch_px(viewport) * 0.85, 0.14)
	var consumables := Rect2(safe.position.x + safe.size.x * 0.5 - consumable_w * 0.5, safe.end.y - consumable_h - m, consumable_w, consumable_h)
	var combat_size := ResponsiveHudMetrics.touch_diameter(viewport, HudLayoutProfile.RATIO_FIRE_D, ResponsiveHudMetrics.min_touch_px(viewport) * 1.6, 0.28) * 1.55
	var combat := Rect2(safe.end.x - combat_size - m, safe.end.y - combat_size - m, combat_size, combat_size)
	var center_safe := _center_safe_from_regions(safe, identity, mission, zoom, movement, chat, consumables, combat, minimap, status, nav, identity.end.y + m)
	return {
		"identity": identity, "status": status, "nav": nav, "minimap": minimap, "fullscreen": fullscreen,
		"mission": mission, "zoom": zoom, "movement": movement, "chat": chat,
		"consumables": consumables, "combat": combat, "center_safe": center_safe,
	}

static func _center_safe_from_regions(safe: Rect2, identity: Rect2, mission: Rect2, zoom: Rect2, movement: Rect2, chat: Rect2, consumables: Rect2, combat: Rect2, minimap: Rect2, status: Rect2, nav: Rect2, top_y: float) -> Rect2:
	var pad := ResponsiveHudMetrics.margin(Vector2(safe.size.x, safe.size.y))
	var left := maxf(identity.end.x, maxf(mission.end.x, maxf(zoom.end.x, movement.end.x))) + pad * 0.5
	var right := minf(combat.position.x, minf(minimap.position.x, nav.position.x)) - pad * 0.5
	var top := maxf(identity.end.y, maxf(status.end.y, maxf(nav.end.y, minimap.end.y))) + pad * 0.35
	var bottom := minf(consumables.position.y, minf(combat.position.y, chat.position.y)) - pad * 0.35
	return Rect2(left, top, maxf(24.0, right - left), maxf(24.0, bottom - top))

static func _resolve_conflicts(regions: Dictionary, safe: Rect2, edge: float) -> void:
	var keys := ["identity", "status", "nav", "minimap", "fullscreen", "mission", "zoom", "movement", "chat", "consumables", "combat"]
	for i in range(keys.size()):
		for j in range(i + 1, keys.size()):
			var a: Rect2 = regions[keys[i]]
			var b: Rect2 = regions[keys[j]]
			if VisibleContentBounds.major_overlap(a, b, 0.08):
				_compact_pair(regions, keys[i], keys[j])

static func _compact_pair(regions: Dictionary, key_a: String, key_b: String) -> void:
	var secondary := ["chat", "mission", "zoom", "movement", "nav"]
	var target_key := key_b if key_b in secondary else key_a
	if target_key == "nav":
		var nav: Rect2 = regions["nav"]
		nav.size.x = maxf(24.0, nav.size.x * 0.92)
		regions["nav"] = nav
	elif target_key == "chat":
		var chat: Rect2 = regions["chat"]
		chat.size.y = maxf(24.0, chat.size.y * 0.88)
		regions["chat"] = chat
	elif target_key == "mission":
		var mission: Rect2 = regions["mission"]
		mission.size.y = maxf(28.0, mission.size.y * 0.9)
		regions["mission"] = mission

static func validate(solution: Dictionary, viewport: Vector2) -> Dictionary:
	var safe := ResponsiveHudMetrics.safe_rect(viewport)
	var edge := ResponsiveHudMetrics.safe_edge_margin(viewport)
	var overlaps: Array = []
	var offscreen: Array = []
	var keys := ["identity", "status", "nav", "minimap", "mission", "zoom", "movement", "chat", "consumables", "combat"]
	for i in range(keys.size()):
		for j in range(i + 1, keys.size()):
			var a: Rect2 = solution.get(keys[i], Rect2())
			var b: Rect2 = solution.get(keys[j], Rect2())
			if VisibleContentBounds.major_overlap(a, b):
				overlaps.append({"a": keys[i], "b": keys[j]})
	for key in keys:
		var rect: Rect2 = solution.get(key, Rect2())
		if rect.size.x <= 0.0 or rect.size.y <= 0.0:
			offscreen.append({"region": key, "status": "ZERO_SIZE"})
			continue
		if rect.position.x < safe.position.x - 1.0 or rect.position.y < safe.position.y - 1.0:
			offscreen.append({"region": key, "status": "OFFSCREEN"})
		if rect.end.x > safe.end.x + edge * 0.25 or rect.end.y > safe.end.y + edge * 0.25:
			offscreen.append({"region": key, "status": "OFFSCREEN"})
	var combat: Rect2 = solution.get("combat", Rect2())
	if combat.end.x > safe.end.x - edge * 0.5 or combat.end.y > safe.end.y - edge * 0.5:
		offscreen.append({"region": "combat", "status": "FEUER_EDGE"})
	return {"overlaps": overlaps, "offscreen": offscreen, "safe": safe}

static func qa_region_label(region: Region) -> String:
	match region:
		Region.IDENTITY: return "IDENTITY"
		Region.STATUS: return "STATUS"
		Region.NAV: return "NAV"
		Region.MINIMAP: return "MINIMAP"
		Region.MISSION: return "MISSION"
		Region.ZOOM: return "ZOOM"
		Region.MOVEMENT: return "MOVEMENT"
		Region.CHAT: return "CHAT"
		Region.CONSUMABLES: return "CONSUMABLES"
		Region.COMBAT: return "COMBAT"
		Region.CENTER_SAFE: return "CENTER_SAFE"
		_: return ""

