class_name WorldScaleProfile
extends RefCounted

## G0.4 mockup-calibrated relative scale — player Kraken lock unchanged.

const PLAYER_VISUAL_SCALE := 52.0
const PLAYER_WATERLINE := 20.5
const NPC_VISUAL_ROOT_SCALE := 0.62
const NPC_UI_ANCHOR_Y := 24.0

static func island_visual_scale(size_class: IslandPresentationProfile.SizeClass) -> float:
	match size_class:
		IslandPresentationProfile.SizeClass.XS:
			return 0.28
		IslandPresentationProfile.SizeClass.SMALL:
			return 0.32
		IslandPresentationProfile.SizeClass.MEDIUM:
			return 0.34
		IslandPresentationProfile.SizeClass.LARGE:
			return 0.36
		IslandPresentationProfile.SizeClass.XL, IslandPresentationProfile.SizeClass.LANDMARK:
			return 0.38
		_:
			return 0.34

static func patrol_radius_for_npc() -> float:
	return 48.0

static func gameplay_spawn_corridor() -> Vector3:
	return MockupCompositionProfile.PLAYER_SPAWN
