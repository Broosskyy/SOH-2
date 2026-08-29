extends Node3D

@onready var camera: Camera3D = $Camera3D

func _ready() -> void:
	camera.add_to_group("boot_camera")
	MobileWebBootTelemetry.mark_stage("MAIN READY", "primitive diagnostic")
	MobileWebBootTelemetry.mark_stage("WORLD READY", "primitive mesh")
	MobileWebBootTelemetry.mark_stage("CAMERA READY", "current=%s" % camera.current)
	MobileWebBootTelemetry.mark_stage("PLAYER READY", "n/a")
	MobileWebBootTelemetry.mark_stage("KRAKEN READY", "n/a")
