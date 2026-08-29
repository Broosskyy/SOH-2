class_name GameUnit
extends Node3D

@export var identity: UnitIdentity

@onready var gameplay_root: Node3D = get_node_or_null("GameplayRoot") as Node3D
@onready var visual_root: Node3D = get_node_or_null("VisualRoot") as Node3D
@onready var collision_root: Node3D = get_node_or_null("CollisionRoot") as Node3D
@onready var ui_anchor: Node3D = get_node_or_null("UIAnchor") as Node3D
@onready var vfx_root: Node3D = get_node_or_null("VFXRoot") as Node3D
@onready var health: HealthComponent = get_node_or_null("HealthComponent") as HealthComponent
@onready var targetable: TargetableComponent = get_node_or_null("TargetableComponent") as TargetableComponent

func unit_id() -> String:
	return identity.unit_id if identity != null else name

func display_name() -> String:
	return identity.display_name if identity != null else name

func faction() -> UnitFaction.Allegiance:
	return identity.faction if identity != null else UnitFaction.Allegiance.NEUTRAL

func gameplay_node() -> Node3D:
	return gameplay_root if gameplay_root != null else self
