extends Node

enum Profile { MOBILE, DESKTOP }

var profile: Profile = Profile.DESKTOP

func _ready() -> void:
	profile = _detect_profile()
	_apply_profile()

func profile_name() -> String:
	return "MOBILE" if profile == Profile.MOBILE else "DESKTOP"

func _detect_profile() -> Profile:
	var os_name := OS.get_name()
	if os_name in ["Android", "iOS"]:
		return Profile.MOBILE
	if OS.has_feature("mobile") or DisplayServer.is_touchscreen_available():
		return Profile.MOBILE
	return Profile.DESKTOP

func _apply_profile() -> void:
	if profile == Profile.MOBILE:
		Engine.max_fps = 60
	else:
		Engine.max_fps = 0
