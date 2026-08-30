extends Control

var _qa_outline := false
var _qa_content_bounds := Rect2()
var _qa_label := ""
var _qa_status := "PASS"

func set_qa_outline(enabled: bool, label_text: String = "", status: String = "PASS") -> void:
	_qa_outline = enabled
	_qa_label = label_text
	_qa_status = status
	queue_redraw()

func set_qa_content_bounds(bounds: Rect2) -> void:
	_qa_content_bounds = bounds
	queue_redraw()

func _draw() -> void:
	if _qa_outline:
		var reserved_color := Color(0.35, 0.92, 0.55, 0.55)
		if _qa_status == "OVERFLOW":
			reserved_color = Color(0.95, 0.45, 0.22, 0.65)
		elif _qa_status == "OFFSCREEN":
			reserved_color = Color(0.95, 0.25, 0.25, 0.65)
		draw_rect(Rect2(Vector2.ZERO, size), reserved_color, false, 1.0)
		if not _qa_label.is_empty():
			var font := ThemeDB.fallback_font
			var font_size := 8
			draw_string(font, Vector2(2.0, float(font_size) + 1.0), "%s R" % _qa_label, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, reserved_color)
	if _qa_content_bounds.size.x > 0.0 and _qa_content_bounds.size.y > 0.0:
		draw_rect(_qa_content_bounds, Color(0.95, 0.75, 0.22, 0.55), false, 1.0)
		if _qa_outline and not _qa_label.is_empty():
			var font := ThemeDB.fallback_font
			draw_string(font, Vector2(2.0, _qa_content_bounds.end.y - 2.0), "%s C" % _qa_label, HORIZONTAL_ALIGNMENT_LEFT, -1, 8, Color(0.95, 0.75, 0.22, 0.9))
