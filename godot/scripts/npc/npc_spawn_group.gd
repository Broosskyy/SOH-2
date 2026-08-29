class_name NpcSpawnGroup
extends Resource

@export var group_id: String = ""
@export var npc_definition: NpcDefinition
@export var spawn_center: Vector3 = Vector3.ZERO
@export var spawn_radius := 120.0
@export var count := 1
@export var respawn_delay := 0.0
@export var behaviour_override: NpcBehaviourProfile
