class_name LocalSaveRepository
extends SaveRepository

const DIRECTORY := "user://profiles"

func load_profile(profile_id: String = "captain") -> Dictionary:
	var path := _path(profile_id)
	if not FileAccess.file_exists(path):
		return {}
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(path))
	return parsed if parsed is Dictionary else {}

func write_profile(data: Dictionary, profile_id: String = "captain") -> Error:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(DIRECTORY))
	var file := FileAccess.open(_path(profile_id), FileAccess.WRITE)
	if file == null:
		return FileAccess.get_open_error()
	file.store_string(JSON.stringify(data, "  "))
	return OK

func remove_profile(profile_id: String = "captain") -> Error:
	var path := _path(profile_id)
	return DirAccess.remove_absolute(path) if FileAccess.file_exists(path) else OK

func _path(profile_id: String) -> String:
	return "%s/%s.json" % [DIRECTORY, profile_id.validate_filename()]
