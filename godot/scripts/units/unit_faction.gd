class_name UnitFaction
extends Object

enum Allegiance { NEUTRAL, FRIENDLY, HOSTILE, PLAYER }

static func allegiance_name(value: Allegiance) -> String:
	match value:
		Allegiance.NEUTRAL: return "neutral"
		Allegiance.FRIENDLY: return "friendly"
		Allegiance.HOSTILE: return "hostile"
		Allegiance.PLAYER: return "player"
	return "unknown"

static func can_target(attacker: Allegiance, defender: Allegiance) -> bool:
	if defender == Allegiance.PLAYER:
		return false
	if attacker == Allegiance.PLAYER:
		return defender == Allegiance.HOSTILE
	return false
