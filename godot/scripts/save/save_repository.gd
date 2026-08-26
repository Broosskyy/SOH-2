class_name SaveRepository
extends RefCounted

func load_profile(_profile_id: String = "captain") -> Dictionary:
	push_error("SaveRepository.load_profile must be implemented")
	return {}

func write_profile(_data: Dictionary, _profile_id: String = "captain") -> Error:
	push_error("SaveRepository.write_profile must be implemented")
	return ERR_UNAVAILABLE

func remove_profile(_profile_id: String = "captain") -> Error:
	push_error("SaveRepository.remove_profile must be implemented")
	return ERR_UNAVAILABLE

