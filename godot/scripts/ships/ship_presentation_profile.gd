class_name ShipPresentationProfile
extends Resource

## Visual-only calibration. Gameplay position, heading and collision never depend
## on these values.
@export_group("Visual")
@export var visual_scale := 52.0
@export var visual_yaw_degrees := 180.0
@export var waterline_offset := 20.5
@export var wake_stern_offset := 58.0

@export_group("Floating HUD")
@export var ui_anchor_height := 68.0
@export var ui_safe_gap := 10.0
@export var nameplate_offset := Vector2(0.0, -4.0)

@export_group("Presentation Envelope")
@export var half_length := 52.0
@export var half_width := 18.0
@export var visual_top_height := 55.0

@export_group("Camera")
@export_enum("Perspective Naval", "Low-FOV Perspective", "Orthographic") var camera_profile := 0
