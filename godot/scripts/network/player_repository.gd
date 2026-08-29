class_name PlayerRepository
extends RefCounted

## Backend boundary stub — no network transport in G0.3.

func load_player_profile(_player_id: String) -> Dictionary:
	return {}

func save_player_profile(_player_id: String, _payload: Dictionary) -> bool:
	return false
