class_name IslandPresentationProfile
extends Resource

enum SizeClass { XS, SMALL, MEDIUM, LARGE, XL, LANDMARK }

enum ShapeClass {
	TINY_PALM_ISLET,
	LONG_SAND_SPIT,
	NARROW_ROCK_RIDGE,
	CRESCENT_COVE,
	L_SHAPED,
	S_SHAPED,
	TWIN_ISLANDS,
	WIDE_FLAT,
	TALL_CLIFF,
	TRIANGLE,
	HARBOR,
	LONG_JUNGLE,
	RUGGED_PENINSULA,
	HORSESHOE_ATOLL,
	DOUBLE_LOBE,
	FORTRESS,
	MINI_ROCK_SPIRE,
	HUGE_TROPICAL,
	HOOK,
	Y_FORK,
	GENERIC,
}

@export_group("Identity")
@export var island_id: String = ""
@export var display_name: String = ""
@export var category: String = "island"
@export var biome: String = "tropical"
@export var size_class: SizeClass = SizeClass.MEDIUM
@export var shape_class: ShapeClass = ShapeClass.GENERIC
@export var world_position: Vector3 = Vector3.ZERO

@export_group("Visual")
@export var visual_scene: PackedScene
@export var visual_scale := 1.0
@export var waterline_offset := 0.0
@export var use_proxy_geometry := true

@export_group("Gameplay")
@export var gameplay_radius_x := 120.0
@export var gameplay_radius_z := 90.0
@export var navigation_block_radius := 110.0
@export var collision_profile := "ellipse"
@export var world_label_height := 42.0

@export_group("Sockets")
@export var harbor_anchor: Vector3 = Vector3.ZERO
@export var poi_anchors: Array[Vector3] = []
@export var spawn_anchors: Array[Vector3] = []
@export var tower_sockets: Array[Vector3] = []
@export var boss_spawn_sockets: Array[Vector3] = []
@export var loot_sockets: Array[Vector3] = []
@export var ambient_fx_sockets: Array[Vector3] = []

@export_group("Quality")
@export var quality_policy := "AUTO"
@export var lod_policy := "distance"
@export var lod_distances: Array[float] = [600.0, 1200.0, 2200.0]

func visual_seed() -> int:
	return absi(island_id.hash()) if not island_id.is_empty() else 1

func footprint_radius() -> float:
	return maxf(gameplay_radius_x, gameplay_radius_z)
