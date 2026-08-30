class_name HudV2Typography
extends RefCounted

enum Tier {
	PROFILE_PRIMARY,
	PROFILE_SECONDARY,
	STATUS,
	NAV,
	MISSION,
	CHAT,
	WORLD_PLAYER,
	WORLD_NPC,
	WORLD_POI,
	PRIMARY_ACTION,
	SECONDARY_ACTION,
	ZOOM,
}

static func font_size(viewport: Vector2, tier: Tier) -> int:
	var phone := ResponsiveHudMetrics.detect_profile(viewport) == ResponsiveHudMetrics.Profile.PHONE_LANDSCAPE
	match tier:
		Tier.PROFILE_PRIMARY:
			return ResponsiveHudMetrics.font_px(viewport, 0.034 if phone else 0.028, 9 if phone else 12, 14 if phone else 20)
		Tier.PROFILE_SECONDARY:
			return ResponsiveHudMetrics.font_px(viewport, 0.028 if phone else 0.022, 8 if phone else 10, 12 if phone else 16)
		Tier.STATUS:
			return ResponsiveHudMetrics.font_px(viewport, 0.026 if phone else 0.022, 7 if phone else 10, 10 if phone else 14)
		Tier.NAV:
			return ResponsiveHudMetrics.font_px(viewport, 0.024 if phone else 0.020, 6 if phone else 9, 9 if phone else 13)
		Tier.MISSION:
			return ResponsiveHudMetrics.font_px(viewport, 0.027 if phone else 0.022, 7 if phone else 10, 10 if phone else 14)
		Tier.CHAT:
			return ResponsiveHudMetrics.font_px(viewport, 0.025 if phone else 0.020, 7 if phone else 9, 9 if phone else 12)
		Tier.WORLD_PLAYER:
			return ResponsiveHudMetrics.font_px(viewport, 0.030 if phone else 0.024, 8 if phone else 11, 11 if phone else 16)
		Tier.WORLD_NPC, Tier.WORLD_POI:
			return ResponsiveHudMetrics.font_px(viewport, 0.024 if phone else 0.020, 7 if phone else 9, 9 if phone else 12)
		Tier.PRIMARY_ACTION:
			return ResponsiveHudMetrics.font_px(viewport, 0.030 if phone else 0.026, 8 if phone else 11, 11 if phone else 15)
		Tier.SECONDARY_ACTION, Tier.ZOOM:
			return ResponsiveHudMetrics.font_px(viewport, 0.024 if phone else 0.020, 7 if phone else 9, 9 if phone else 12)
		_:
			return ResponsiveHudMetrics.font_px(viewport, 0.026, 8, 12)
