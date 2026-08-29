class_name RegionDefinition
extends Resource

@export var region_id: String = "aster"
@export var display_name: String = "Azurwacht"
@export var world_bounds: Vector2 = Vector2(3000, 2200)
@export var environment_profile: String = "clear"
@export var player_spawn: Vector3 = Vector3.ZERO
@export var islands: Array[IslandPresentationProfile] = []
@export var pois: Array[PoiDefinition] = []
@export var harbors: Array[HarborDefinition] = []
@export var npc_spawn_groups: Array[NpcSpawnGroup] = []
@export var quality_policy: String = "AUTO"
