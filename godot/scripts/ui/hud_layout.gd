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

const MIN_TOUCH_PX := 48.0

static func is_mobile_layout(viewport: Vector2) -> bool:
	return ResponsiveHudMetrics.detect_profile(viewport) == ResponsiveHudMetrics.Profile.PHONE_LANDSCAPE

static func is_mobile_landscape(viewport: Vector2) -> bool:
	return is_mobile_layout(viewport)

static func layout_profile(viewport: Vector2) -> String:
	return ResponsiveHudMetrics.profile_name(viewport)

static func semantic_scale(_viewport: Vector2, _semantic: Semantic) -> float:
	return 1.0

static func scale_factor(viewport: Vector2) -> float:
	return 1.0

static func font_size(viewport: Vector2, desktop_px: float, _semantic: Semantic = Semantic.PLAYER_STATUS) -> int:
	return ResponsiveHudMetrics.font_px(viewport, desktop_px / maxf(ResponsiveHudMetrics.short_edge(viewport), 1.0))

static func touch_size(viewport: Vector2, desired: float, _semantic: Semantic = Semantic.PRIMARY_ACTION) -> float:
	return maxf(desired, ResponsiveHudMetrics.min_touch_px(viewport))

static func panel_margin(viewport: Vector2) -> float:
	return ResponsiveHudMetrics.margin(viewport)

static func floating_width(viewport: Vector2, player: bool) -> float:
	var base := ResponsiveHudMetrics.clamp_length(viewport, HudLayoutProfile.RATIO_FLOATING_PLAYER_W, "x", 92.0, 0.16)
	if not player:
		base *= 0.84
	return base
