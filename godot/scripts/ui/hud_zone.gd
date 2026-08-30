extends Control

var _qa_outline := false
var _qa_content_bounds := Rect2()

func set_qa_outline(enabled: bool) -> void:
	_qa_outline = enabled
	queue_redraw()

func set_qa_content_bounds(bounds: Rect2) -> void:
	_qa_content_bounds = bounds
	queue_redraw()

func _draw() -> void:
	if _qa_outline:
		draw_rect(Rect2(Vector2.ZERO, size), Color(0.35, 0.92, 0.55, 0.28), false, 1.5)
	if _qa_content_bounds.size.x > 0.0 and _qa_content_bounds.size.y > 0.0:
		draw_rect(_qa_content_bounds, Color(0.95, 0.55, 0.22, 0.35), false, 1.0)
