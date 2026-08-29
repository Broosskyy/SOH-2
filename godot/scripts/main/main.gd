extends Node

func _ready() -> void:
	if OS.get_name() in ["Android", "iOS"]:
		DisplayServer.screen_set_orientation(DisplayServer.SCREEN_LANDSCAPE)
	get_tree().set_auto_accept_quit(true)
	MobileWebBootTelemetry.mark_stage("MAIN READY")
