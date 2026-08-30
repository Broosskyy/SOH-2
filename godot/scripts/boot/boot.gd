extends Node

const GAME_SCENE := preload("res://scenes/game/Game.tscn")

func _ready() -> void:
	get_tree().change_scene_to_packed(GAME_SCENE)
