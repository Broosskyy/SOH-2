class_name PresentationLayout
extends RefCounted

enum Zone {
	PROFILE,
	STATUS,
	NAV,
	CURRENCY,
	MISSION,
	MINIMAP,
	ZOOM,
	CHAT,
	CONSUMABLES,
	COMBAT,
	FULLSCREEN,
	TARGET,
}

const BUILD_LABEL := "G0.5.8-RUNTIME-CONTENT-CONTAINMENT"
const GIT_SHA := "g058"

static func zone_rect(viewport: Vector2, zone: Zone) -> Rect2:
	return ResponsiveHudLayoutSolver.zone_rect(viewport, zone)

static func solve(viewport: Vector2) -> Dictionary:
	return ResponsiveHudLayoutSolver.solve(viewport)

static func apply_zone(control: Control, rect: Rect2) -> void:
	if control == null or rect.size.x <= 0.0 or rect.size.y <= 0.0:
		return
	control.scale = Vector2.ONE
	control.position = rect.position
	control.size = rect.size
	control.custom_minimum_size = rect.size
