class_name IslandEntity
extends Node3D

@export var profile: IslandPresentationProfile

@onready var gameplay_root: Node3D = $GameplayRoot
@onready var visual_root: Node3D = $VisualRoot
@onready var collision_root: Node3D = $CollisionRoot
@onready var navigation_boundary: Node3D = $NavigationBoundary
@onready var label_anchor: Marker3D = $WorldLabelAnchor

func island_id() -> String:
	return profile.island_id if profile != null else name

func display_name() -> String:
	return profile.display_name if profile != null else name

func blocks_point(point: Vector3) -> bool:
	if profile == null:
		return false
	var local := GameplayPlane.flatten(point - global_position)
	var radius_x := profile.navigation_block_radius
	var radius_z := profile.gameplay_radius_z
	return absf(local.x) <= radius_x and absf(local.z) <= radius_z

func gameplay_footprint() -> AABB:
	if profile == null:
		return AABB()
	return AABB(
		Vector3(-profile.gameplay_radius_x, -5.0, -profile.gameplay_radius_z),
		Vector3(profile.gameplay_radius_x * 2.0, 10.0, profile.gameplay_radius_z * 2.0)
	)
