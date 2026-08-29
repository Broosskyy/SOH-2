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
}

const DESIGN_SHORT_EDGE := 1080.0
const MIN_TOUCH_PX := 48.0

static func is_mobile_layout(viewport: Vector2) -> bool:
	return PlatformService.mobile or minf(viewport.x, viewport.y) < 620.0 or viewport.x < 960.0

static func semantic_scale(viewport: Vector2, semantic: Semantic) -> float:
	var short_edge := minf(viewport.x, viewport.y)
	var normalized := short_edge / DESIGN_SHORT_EDGE
	var mobile := is_mobile_layout(viewport)
	match semantic:
		Semantic.FLOATING_PLAYER, Semantic.FLOATING_NPC:
			return clampf(normalized * 1.05, 0.92, 1.18)
		Semantic.TARGET_STATUS:
			return clampf(normalized * 1.1, 0.95, 1.25)
		Semantic.MISSION:
			return clampf(normalized * (1.35 if mobile else 1.05), 1.0, 1.55 if mobile else 1.15)
		Semantic.MINIMAP:
			return clampf(normalized * (1.3 if mobile else 1.05), 1.0, 1.5 if mobile else 1.12)
		Semantic.PLAYER_STATUS:
			return clampf(normalized * (1.25 if mobile else 1.0), 0.98, 1.45 if mobile else 1.1)
		Semantic.PRIMARY_ACTION, Semantic.SECONDARY_ACTION:
			return clampf(normalized * (1.2 if mobile else 1.0), 1.0, 1.35)
		Semantic.NAVIGATION, Semantic.REGION:
			return clampf(normalized, 0.95, 1.12)
		_:
			return clampf(normalized, 0.95, 1.15)

static func scale_factor(viewport: Vector2) -> float:
	return semantic_scale(viewport, Semantic.PLAYER_STATUS)

static func font_size(viewport: Vector2, desktop_px: float, semantic: Semantic = Semantic.PLAYER_STATUS) -> int:
	return maxi(8, int(round(desktop_px * semantic_scale(viewport, semantic))))

static func touch_size(viewport: Vector2, desired: float, semantic: Semantic = Semantic.PRIMARY_ACTION) -> float:
	return maxf(desired * semantic_scale(viewport, semantic), MIN_TOUCH_PX)

static func panel_margin(viewport: Vector2) -> float:
	return 10.0 * semantic_scale(viewport, Semantic.PLAYER_STATUS)

static func floating_width(viewport: Vector2, player: bool) -> float:
	var base := 108.0 if player else 92.0
	if is_mobile_layout(viewport):
		base += 8.0
	return base * semantic_scale(viewport, Semantic.FLOATING_PLAYER if player else Semantic.FLOATING_NPC)
