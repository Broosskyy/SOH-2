extends Control

var _qa_outline := false

func set_qa_outline(enabled: bool) -> void:
	_qa_outline = enabled
	queue_redraw()

func _draw() -> void:
	if not _qa_outline:
		return
	draw_rect(Rect2(Vector2.ZERO, size), Color(0.35, 0.92, 0.55, 0.28), false, 1.5)
