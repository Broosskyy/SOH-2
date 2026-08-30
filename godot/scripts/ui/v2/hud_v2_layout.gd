class_name HudV2Layout
extends RefCounted

const BUILD_LABEL := "G0.6-HUD-V2-CLEAN-REBUILD"
const BLOCK_KEYS := [
	"profile", "status", "nav", "minimap", "fullscreen",
	"mission", "zoom", "movement", "chat", "consumables", "combat",
]

static func safe_rect(viewport: Vector2) -> Rect2:
	var margin := ResponsiveHudMetrics.safe_edge_margin(viewport)
	return Rect2(Vector2(margin, margin), viewport - Vector2(margin * 2.0, margin * 2.0))

static func solve(viewport: Vector2) -> Dictionary:
	var phone := ResponsiveHudMetrics.detect_profile(viewport) == ResponsiveHudMetrics.Profile.PHONE_LANDSCAPE
	var safe := safe_rect(viewport)
	var short := ResponsiveHudMetrics.short_edge(viewport)
	var gap := 2.0 if phone else 4.0

	var top_h := clampf(short * (0.095 if phone else 0.078), 22.0 if phone else 30.0, 48.0 if phone else 72.0)
	var map_size := clampf(top_h * (1.55 if phone else 1.35), 34.0 if phone else 52.0, safe.size.y * 0.34)
	var minimap := Rect2(Vector2(safe.end.x - map_size, safe.position.y), Vector2(map_size, map_size))

	var fs_size := clampf(top_h * 0.52, 14.0, 20.0)
	var fullscreen := Rect2(Vector2(minimap.position.x - fs_size - gap, safe.position.y), Vector2(fs_size, fs_size))

	var profile_w := clampf(safe.size.x * (0.105 if phone else 0.13), 70.0 if phone else 110.0, 170.0)
	var profile := Rect2(safe.position, Vector2(profile_w, top_h))

	var status_w := clampf(safe.size.x * (0.152 if phone else 0.17), 96.0 if phone else 130.0, 210.0)
	var status := Rect2(Vector2(profile.end.x + gap, safe.position.y), Vector2(status_w, top_h))

	var nav_x := status.end.x + gap
	var nav_w := maxf(24.0, fullscreen.position.x - gap - nav_x)
	var nav := Rect2(Vector2(nav_x, safe.position.y), Vector2(nav_w, top_h))

	var top_bottom := safe.position.y + top_h + gap
	var mission_h := clampf(short * (0.125 if phone else 0.11), 36.0 if phone else 46.0, 68.0)
	var mission := Rect2(Vector2(safe.position.x, top_bottom), Vector2(profile_w, mission_h))

	var combat_size := clampf(short * (0.128 if phone else 0.105), 40.0 if phone else 54.0, 96.0)
	var combat := Rect2(Vector2(safe.end.x - combat_size, safe.end.y - combat_size), Vector2(combat_size, combat_size))

	var cons_h := clampf(short * (0.082 if phone else 0.07), 26.0 if phone else 34.0, 46.0)
	var cons_w := clampf(safe.size.x * (0.21 if phone else 0.18), 118.0 if phone else 150.0, 240.0)
	var consumables := Rect2(
		Vector2(safe.position.x + (safe.size.x - cons_w) * 0.5, safe.end.y - cons_h),
		Vector2(cons_w, cons_h)
	)

	var chat_h := clampf(short * (0.098 if phone else 0.085), 28.0 if phone else 38.0, 54.0)
	var chat_w := clampf(safe.size.x * (0.19 if phone else 0.16), 108.0 if phone else 150.0, 280.0)
	var chat := Rect2(Vector2(safe.position.x, safe.end.y - chat_h), Vector2(chat_w, chat_h))

	var move_size := clampf(short * (0.098 if phone else 0.085), 32.0 if phone else 44.0, 62.0)
	var movement := Rect2(
		Vector2(safe.position.x, chat.position.y - move_size - gap),
		Vector2(move_size + 6.0, move_size)
	)

	var zoom_w := clampf(short * (0.088 if phone else 0.075), 28.0 if phone else 36.0, 46.0)
	var zoom_top := mission.end.y + gap
	var zoom_bottom := movement.position.y - gap
	var zoom_h := maxf(36.0, zoom_bottom - zoom_top)
	var zoom := Rect2(Vector2(safe.position.x, zoom_top), Vector2(zoom_w, zoom_h))

	var inset_x := maxf(profile.end.x, status.end.x) + safe.size.x * (0.02 if phone else 0.03)
	var inset_top := top_bottom + gap
	var inset_bottom := minf(chat.position.y, movement.position.y) - gap
	var inset_right := minf(nav.end.x, minimap.position.x) - gap
	var center_safe := Rect2(
		Vector2(inset_x, inset_top),
		Vector2(maxf(40.0, inset_right - inset_x), maxf(40.0, inset_bottom - inset_top))
	)

	return {
		"safe": safe,
		"top_band": Rect2(safe.position, Vector2(safe.size.x, top_h)),
		"profile": profile,
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
		"profile_name": "PHONE_LANDSCAPE" if phone else "DESKTOP_TABLET",
	}

static func feuer_rect(layout: Dictionary) -> Rect2:
	var combat: Rect2 = layout.get("combat", Rect2())
	if combat.size == Vector2.ZERO:
		return Rect2()
	var pad := 2.0
	var inner := Rect2(combat.position + Vector2(pad, pad), combat.size - Vector2(pad * 2.0, pad * 2.0))
	var fire := minf(inner.size.x, inner.size.y) * 0.62
	fire = maxf(18.0, fire)
	return Rect2(Vector2(inner.end.x - fire, inner.end.y - fire), Vector2(fire, fire))
