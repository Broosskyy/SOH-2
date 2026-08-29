class_name IslandPresentationProfile
extends Resource

enum SizeClass { SMALL, MEDIUM, LARGE, LANDMARK }

@export var island_id: String = ""
@export var display_name: String = ""
@export var category: String = "island"
@export var biome: String = "tropical"
@export var size_class: SizeClass = SizeClass.MEDIUM
@export var world_position: Vector3 = Vector3.ZERO
@export var visual_scene: PackedScene
@export var visual_scale := 1.0
@export var waterline_offset := 0.0
@export var gameplay_radius_x := 120.0
@export var gameplay_radius_z := 90.0
@export var navigation_block_radius := 110.0
@export var world_label_height := 42.0
@export var harbor_anchor: Vector3 = Vector3.ZERO
@export var poi_anchors: Array[Vector3] = []
@export var spawn_anchors: Array[Vector3] = []
@export var quality_policy := "AUTO"
@export var use_proxy_geometry := true
