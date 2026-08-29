class_name MockupCompositionProfile
extends RefCounted

## G0.4 mockup-first authored frame — positions tuned for MID zoom first gameplay frame.
## Internal region remains Azurwacht; HUD presentation strings follow reference mockups.

const PLAYER_SPAWN := Vector3.ZERO
const DEFAULT_CAMERA_ZOOM := 0.94

const HUD_PLAYER_NAME := "BROSKY"
const HUD_GUILD_TAG := "[LoL] LEGENDS"
const HUD_PLAYER_LEVEL := 25
const HUD_FLOATING_NAME := "[LoL] BROSKY"
const HUD_MISSION_TITLE := "Rote Segel"
const HUD_MISSION_OBJECTIVE := "Besiege den Elite-Korsaren"

const HUD_EXP_CURRENT := 233000.0
const HUD_EXP_MAX := 300000.0
const HUD_RUMPF_CURRENT := 80000.0
const HUD_RUMPF_MAX := 80000.0
const HUD_SCHUTZ_CURRENT := 50000.0
const HUD_SCHUTZ_MAX := 50000.0

static func world_pos(x: float, z: float) -> Vector3:
	return Vector3(x, 0.0, z)

static func patrol_ring(center: Vector3, radius: float, count: int) -> Array[Vector3]:
	var points: Array[Vector3] = []
	for index in count:
		var angle := TAU * float(index) / float(count)
		points.append(center + Vector3(cos(angle) * radius, 0.0, sin(angle) * radius))
	return points
