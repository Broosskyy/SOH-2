extends Node3D

@export var player_path: NodePath
@export var camera_rig_path: NodePath
@export var debug_hud_path: NodePath

@onready var player: PlayerShip = get_node(player_path)
@onready var camera_rig: NavalCameraRig = get_node(camera_rig_path)
@onready var debug_hud: CanvasLayer = get_node(debug_hud_path)

func _ready() -> void:
	if debug_hud != null and debug_hud.has_method("bind"):
		debug_hud.call("bind", player)
