class_name WorldRepository
extends RefCounted

## Backend boundary stub — region state remains local in G0.3.

func load_region_state(_region_id: String) -> Dictionary:
	return {}

func save_region_state(_region_id: String, _payload: Dictionary) -> bool:
	return false
