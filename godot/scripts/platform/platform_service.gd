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

func safe_rect(viewport_size: Vector2) -> Rect2:
	if not mobile:
		return Rect2(Vector2.ZERO, viewport_size)
	var area := safe_area()
	if area.size == Vector2i.ZERO:
		return Rect2(Vector2.ZERO, viewport_size)
	var display_size := DisplayServer.screen_get_size()
	if display_size.x <= 0 or display_size.y <= 0:
		return Rect2(Vector2.ZERO, viewport_size)
	var display_to_viewport := Vector2(
		viewport_size.x / float(display_size.x),
		viewport_size.y / float(display_size.y)
	)
	var viewport_rect := Rect2(Vector2.ZERO, viewport_size)
	var scaled_area := Rect2(
		Vector2(area.position) * display_to_viewport,
		Vector2(area.size) * display_to_viewport
	)
	return viewport_rect.intersection(scaled_area)

func safe_margins(viewport_size: Vector2) -> Vector4:
	var rect := safe_rect(viewport_size)
	return Vector4(
		rect.position.x,
		rect.position.y,
		maxf(0.0, viewport_size.x - rect.end.x),
		maxf(0.0, viewport_size.y - rect.end.y)
	)

func platform_name() -> String:
	return OS.get_name() + (" Touch" if mobile else "")

