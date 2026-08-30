class_name VisibleContentBounds
extends RefCounted

## G0.5.7 — recursive union of visible Control descendant rects.

static func global_bounds_for(control: Control) -> Rect2:
	var local := bounds_for(control)
	if local.size == Vector2.ZERO:
		return Rect2()
	return Rect2(control.global_position + local.position, local.size)

static func content_exceeds_region(control: Control, reserved: Rect2, threshold := 0.04) -> bool:
	var actual := global_bounds_for(control)
	if actual.size == Vector2.ZERO:
		return false
	if reserved.encloses(actual):
		return false
	var intersection := actual.intersection(reserved)
	var actual_area := actual.size.x * actual.size.y
	if actual_area <= 0.0:
		return false
	var outside_area := actual_area - intersection.size.x * intersection.size.y
	return outside_area / actual_area > threshold

static func bounds_for(control: Control) -> Rect2:
	if control == null or not control.visible:
		return Rect2()
	return _accumulate(control, control)

static func overlap_ratio(a: Rect2, b: Rect2) -> float:
	if a.size.x <= 0.0 or a.size.y <= 0.0 or b.size.x <= 0.0 or b.size.y <= 0.0:
		return 0.0
	var intersection := a.intersection(b)
	if intersection.size.x <= 0.0 or intersection.size.y <= 0.0:
		return 0.0
	var inter_area := intersection.size.x * intersection.size.y
	var min_area := minf(a.size.x * a.size.y, b.size.x * b.size.y)
	return inter_area / min_area if min_area > 0.0 else 0.0

static func major_overlap(a: Rect2, b: Rect2, threshold := 0.12) -> bool:
	return overlap_ratio(a, b) > threshold

static func _accumulate(root: Control, node: Control) -> Rect2:
	if node == null or not node.visible:
		return Rect2()
	var union := Rect2()
	if node != root:
		union = _control_rect(node)
	for child in node.get_children():
		if child is Control:
			union = _union_rect(union, _accumulate(root, child as Control))
	return union

static func _control_rect(node: Control) -> Rect2:
	if not node.visible:
		return Rect2()
	var size := node.size
	size.x = maxf(size.x, node.custom_minimum_size.x)
	size.y = maxf(size.y, node.custom_minimum_size.y)
	if size.x <= 0.0 and size.y <= 0.0:
		return Rect2()
	return Rect2(node.position, size)

static func _union_rect(a: Rect2, b: Rect2) -> Rect2:
	if a.size == Vector2.ZERO:
		return b
	if b.size == Vector2.ZERO:
		return a
	var min_pos := Vector2(minf(a.position.x, b.position.x), minf(a.position.y, b.position.y))
	var max_pos := Vector2(maxf(a.end.x, b.end.x), maxf(a.end.y, b.end.y))
	return Rect2(min_pos, max_pos - min_pos)
