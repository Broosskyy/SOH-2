extends Node

signal save_loaded(data: Dictionary)
signal save_changed(data: Dictionary)

const CURRENT_SAVE_VERSION := 4
const CATALOG_PATH := "res://data/catalog.v1.json"

var catalog: Dictionary = {}
var save_data: Dictionary = {}

func _ready() -> void:
	catalog = _load_json(CATALOG_PATH)
	save_data = _fresh_save()

func _fresh_save() -> Dictionary:
	return {
		"version": CURRENT_SAVE_VERSION,
		"playerName": "Captain Rowan",
		"level": 1,
		"xp": 0,
		"gold": 2600,
		"pearls": 30,
		"mapId": "aster",
		"shipId": "sovereign",
		"qualityProfile": "AUTO"
	}

func replace_save(next_save: Dictionary) -> void:
	save_data = _fresh_save()
	save_data.merge(next_save, true)
	save_data["version"] = CURRENT_SAVE_VERSION
	save_changed.emit(save_data.duplicate(true))

func _load_json(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		push_error("Missing game-data catalog: %s" % path)
		return {}
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(path))
	if parsed is Dictionary:
		return parsed
	push_error("Invalid game-data catalog: %s" % path)
	return {}
