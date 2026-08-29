class_name ShipEntity
extends CharacterBody3D

@export var identity: UnitIdentity
@export var presentation_profile: ShipPresentationProfile

@onready var gameplay_root: Node3D = $GameplayRoot if has_node("GameplayRoot") else self
@onready var visual_root: Node3D = $VisualRoot
@onready var ui_anchor: Marker3D = $UIAnchor
@onready var health: HealthComponent = $HealthComponent
@onready var targetable: TargetableComponent = $TargetableComponent
@onready var weapon_anchors: Node3D = get_node_or_null("WeaponAnchors") as Node3D

func unit_id() -> String:
	return identity.unit_id if identity != null else name

func display_name() -> String:
	return identity.display_name if identity != null else name

func faction() -> UnitFaction.Allegiance:
	return identity.faction if identity != null else UnitFaction.Allegiance.NEUTRAL

func apply_presentation_profile() -> void:
	if presentation_profile == null or visual_root == null:
		return
	visual_root.scale = Vector3.ONE * presentation_profile.visual_scale
	visual_root.rotation_degrees.y = presentation_profile.visual_yaw_degrees
	visual_root.position.y = presentation_profile.waterline_offset
	if ui_anchor != null:
		ui_anchor.position.y = presentation_profile.ui_anchor_height

func heading_degrees() -> float:
	return wrapf(-rad_to_deg(rotation.y), 0.0, 360.0)

func set_heading_degrees(value: float) -> void:
	rotation.y = -deg_to_rad(wrapf(value, 0.0, 360.0))

func speed() -> float:
	return Vector2(velocity.x, velocity.z).length()
