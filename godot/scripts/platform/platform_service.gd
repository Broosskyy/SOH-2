extends Node

enum RuntimePlatform { WEB, ANDROID, IOS, DESKTOP }

var runtime_platform: RuntimePlatform = RuntimePlatform.DESKTOP
var mobile: bool = false

func _ready() -> void:
	var name := OS.get_name()
	if name == "Web":
		runtime_platform = RuntimePlatform.WEB
		mobile = DisplayServer.is_touchscreen_available()
	elif name == "Android":
		runtime_platform = RuntimePlatform.ANDROID
		mobile = true
	elif name == "iOS":
		runtime_platform = RuntimePlatform.IOS
		mobile = true
	else:
		runtime_platform = RuntimePlatform.DESKTOP
		mobile = false

func safe_area() -> Rect2i:
	return DisplayServer.get_display_safe_area()

func platform_name() -> String:
	return OS.get_name() + (" Touch" if mobile else "")

