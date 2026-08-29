class_name WorldScaleProfile
extends RefCounted

## Canonical relative scale — calibrate presentation without touching Kraken lock.

const PLAYER_VISUAL_SCALE := 52.0
const PLAYER_WATERLINE := 20.5
const NPC_VISUAL_ROOT_SCALE := 0.38
const NPC_UI_ANCHOR_Y := 22.0

static func island_visual_scale(size_class: IslandPresentationProfile.SizeClass) -> float:
	match size_class:
		IslandPresentationProfile.SizeClass.XS:
			return 0.30
		IslandPresentationProfile.SizeClass.SMALL:
			return 0.34
		IslandPresentationProfile.SizeClass.MEDIUM:
			return 0.38
		IslandPresentationProfile.SizeClass.LARGE:
			return 0.42
		IslandPresentationProfile.SizeClass.XL, IslandPresentationProfile.SizeClass.LANDMARK:
			return 0.46
		_:
			return 0.38

static func patrol_radius_for_npc() -> float:
	return 72.0

static func gameplay_spawn_corridor() -> Vector3:
	return Vector3(-620.0, 0.0, -40.0)
