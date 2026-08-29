class_name MockupCompositionProfile
extends RefCounted

## G0.4 mockup-first authored frame — positions tuned for MID zoom first gameplay frame.
## Internal region remains Azurwacht; HUD presentation strings follow reference mockups.

const PLAYER_SPAWN := Vector3.ZERO
const DEFAULT_CAMERA_ZOOM := 0.90

const HUD_PLAYER_NAME := "BROSKY"
const HUD_GUILD_TAG := "[LoL] LEGENDS"
const HUD_PLAYER_LEVEL := 25
const HUD_REGION_LABEL := "1 · CARIBBEAN SEA"
const HUD_MISSION_TITLE := "ROTE SEGEL"
const HUD_MISSION_OBJECTIVE := "Besiege den Elite-Korsaren"

static func world_pos(x: float, z: float) -> Vector3:
	return Vector3(x, 0.0, z)

static func patrol_ring(center: Vector3, radius: float, count: int) -> Array[Vector3]:
	var points: Array[Vector3] = []
	for index in count:
		var angle := TAU * float(index) / float(count)
		points.append(center + Vector3(cos(angle) * radius, 0.0, sin(angle) * radius))
	return points
