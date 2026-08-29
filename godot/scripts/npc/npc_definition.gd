class_name NpcDefinition
extends Resource

@export var npc_id: String = ""
@export var display_name: String = ""
@export var catalog_kind: String = ""
@export var faction: UnitFaction.Allegiance = UnitFaction.Allegiance.HOSTILE
@export var max_health := 520.0
@export var max_speed := 34.0
@export var turn_speed := 1.1
@export var visual_color := Color(0.72, 0.28, 0.22)
@export var behaviour: NpcBehaviourProfile
