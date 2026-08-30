extends Node

func platform_name() -> String:
	return OS.get_name()

func is_touch_primary() -> bool:
	var os_name := OS.get_name()
	return os_name in ["Android", "iOS"] or DisplayServer.is_touchscreen_available()

func input_mode_name() -> String:
	return "MOBILE_JOYSTICK" if is_touch_primary() else "DESKTOP_KEYBOARD"

func safe_inset() -> Vector4:
	if DisplayServer.has_method("get_display_safe_area"):
		var safe: Rect2i = DisplayServer.get_display_safe_area()
		var screen: Rect2i = DisplayServer.screen_get_usable_rect()
		if screen.size.x > 0 and screen.size.y > 0:
			return Vector4(
				float(safe.position.x),
				float(safe.position.y),
				float(screen.size.x - safe.end.x),
				float(screen.size.y - safe.end.y)
			)
	return Vector4(12.0, 12.0, 12.0, 12.0)
