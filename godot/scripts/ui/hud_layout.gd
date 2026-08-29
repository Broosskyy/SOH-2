class_name HudLayout
extends RefCounted

enum Semantic {
	PLAYER_STATUS,
	MISSION,
	MINIMAP,
	FLOATING_PLAYER,
	FLOATING_NPC,
	PRIMARY_ACTION,
	SECONDARY_ACTION,
	NAVIGATION,
	TARGET_STATUS,
	REGION,
	ZOOM,
	CHAT,
}

const DESIGN_SHORT_EDGE := 1080.0
const MIN_TOUCH_PX := 48.0

static func is_mobile_layout(viewport: Vector2) -> bool:
	return HudLayoutProfile.detect(viewport) != HudLayoutProfile.Profile.DESKTOP

static func is_mobile_landscape(viewport: Vector2) -> bool:
	return HudLayoutProfile.detect(viewport) == HudLayoutProfile.Profile.MOBILE_LANDSCAPE

static func layout_profile(viewport: Vector2) -> String:
	return HudLayoutProfile.profile_name(viewport)

static func semantic_scale(viewport: Vector2, semantic: Semantic) -> float:
	var profile := HudLayoutProfile.detect(viewport)
	var short_edge := minf(viewport.x, viewport.y)
	var long_edge := maxf(viewport.x, viewport.y)
	var normalized := short_edge / DESIGN_SHORT_EDGE
	if profile == HudLayoutProfile.Profile.MOBILE_LANDSCAPE:
		normalized = maxf(normalized, short_edge / 607.0)
		match semantic:
			Semantic.PLAYER_STATUS, Semantic.MISSION, Semantic.NAVIGATION, Semantic.CHAT, Semantic.REGION:
				return clampf(long_edge / 1920.0, 1.0, 1.35)
			Semantic.MINIMAP:
				return clampf(viewport.y / 1080.0, 1.0, 1.25)
			Semantic.PRIMARY_ACTION:
				return clampf(viewport.y / 1080.0, 1.05, 1.3)
			Semantic.SECONDARY_ACTION, Semantic.ZOOM:
				return clampf(viewport.y / 1080.0, 1.0, 1.2)
			Semantic.FLOATING_PLAYER, Semantic.FLOATING_NPC:
				return clampf(viewport.x / 1920.0, 1.0, 1.2)
			_:
				return clampf(normalized * 1.15, 1.0, 1.3)
	match semantic:
		Semantic.FLOATING_PLAYER, Semantic.FLOATING_NPC:
			return clampf(normalized * 1.05, 0.92, 1.18)
		Semantic.TARGET_STATUS:
			return clampf(normalized * 1.1, 0.95, 1.25)
		Semantic.MISSION:
			return clampf(normalized * 1.05, 1.0, 1.15)
		Semantic.MINIMAP:
			return clampf(normalized * 1.05, 1.0, 1.12)
		Semantic.PLAYER_STATUS:
			return clampf(normalized, 0.98, 1.1)
		Semantic.PRIMARY_ACTION, Semantic.SECONDARY_ACTION:
			return clampf(normalized, 1.0, 1.15)
		Semantic.NAVIGATION, Semantic.REGION, Semantic.ZOOM, Semantic.CHAT:
			return clampf(normalized, 0.95, 1.12)
		_:
			return clampf(normalized, 0.95, 1.15)

static func scale_factor(viewport: Vector2) -> float:
	return semantic_scale(viewport, Semantic.PLAYER_STATUS)

static func font_size(viewport: Vector2, desktop_px: float, semantic: Semantic = Semantic.PLAYER_STATUS) -> int:
	return maxi(9, int(round(desktop_px * semantic_scale(viewport, semantic))))

static func touch_size(viewport: Vector2, desired: float, semantic: Semantic = Semantic.PRIMARY_ACTION) -> float:
	return maxf(desired * semantic_scale(viewport, semantic), MIN_TOUCH_PX)

static func panel_margin(viewport: Vector2) -> float:
	return maxf(8.0, 10.0 * semantic_scale(viewport, Semantic.PLAYER_STATUS))

static func floating_width(viewport: Vector2, player: bool) -> float:
	var base := HudLayoutProfile.length(viewport, HudLayoutProfile.RATIO_FLOATING_PLAYER_W, "x")
	if not player:
		base *= 0.84
	return maxf(base, 92.0)
