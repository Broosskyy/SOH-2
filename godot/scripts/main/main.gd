extends Node

func _ready() -> void:
	# Landscape is also declared in project.godot and export presets.
	if PlatformService.mobile:
		DisplayServer.screen_set_orientation(DisplayServer.SCREEN_LANDSCAPE)
	get_tree().set_auto_accept_quit(true)

