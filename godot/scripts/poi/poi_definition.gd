class_name PoiDefinition
extends Resource

enum PoiType { HARBOR, OUTPOST, LANDMARK, EVENT, DANGER, QUEST }

@export var poi_id: String = ""
@export var display_name: String = ""
@export var poi_type: PoiType = PoiType.LANDMARK
@export var world_position: Vector3 = Vector3.ZERO
@export var interaction_radius := 80.0
@export var associated_region: String = ""
@export var associated_island: String = ""
@export var label_height := 42.0
