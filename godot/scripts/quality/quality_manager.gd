extends Node

enum QualityLevel { LOW, MEDIUM, HIGH, ULTRA }
const PROFILE_NAMES := ["LOW", "MEDIUM", "HIGH", "ULTRA"]

const PROFILES := {
	QualityLevel.LOW: {"scale": 1.0, "shadows": false, "lod": 2.0, "particles": 0.35},
	QualityLevel.MEDIUM: {"scale": 1.0, "shadows": true, "lod": 1.35, "particles": 0.65},
	QualityLevel.HIGH: {"scale": 1.15, "shadows": true, "lod": 1.0, "particles": 1.0},
	QualityLevel.ULTRA: {"scale": 1.35, "shadows": true, "lod": 0.75, "particles": 1.35}
}

var current_level: QualityLevel = QualityLevel.HIGH

func _ready() -> void:
	current_level = _recommended_level()
	apply(current_level)

func _recommended_level() -> QualityLevel:
	if OS.get_name() in ["Android", "iOS"]:
		return QualityLevel.MEDIUM
	if OS.get_name() == "Web":
		return QualityLevel.LOW if DisplayServer.is_touchscreen_available() else QualityLevel.HIGH
	return QualityLevel.ULTRA

func apply(level: QualityLevel) -> void:
	current_level = level
	var profile: Dictionary = PROFILES[level]
	get_viewport().scaling_3d_scale = profile.scale
	get_viewport().mesh_lod_threshold = profile.lod
	RenderingServer.directional_shadow_atlas_set_size(2048 if profile.shadows else 0, true)

func apply_forced(level: QualityLevel) -> void:
	apply(level)

func level_from_name(value: String) -> QualityLevel:
	var normalized := value.strip_edges().to_upper()
	var index := PROFILE_NAMES.find(normalized)
	return (index if index >= 0 else QualityLevel.HIGH) as QualityLevel

func profile() -> Dictionary:
	return PROFILES[current_level].duplicate(true)

func cycle_profile() -> void:
	apply(((current_level + 1) % PROFILES.size()) as QualityLevel)

func profile_name() -> String:
	return PROFILE_NAMES[current_level]

func lod_bias() -> float:
	return float(PROFILES[current_level].lod)

func particle_multiplier() -> float:
	return float(PROFILES[current_level].particles)

