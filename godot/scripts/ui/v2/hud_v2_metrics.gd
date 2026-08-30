class_name HudV2Metrics
extends RefCounted

const MAJOR_KEYS := HudV2Layout.BLOCK_KEYS
const OVERLAP_THRESHOLD := 0.12

static func apply_block_rect(control: Control, rect: Rect2) -> void:
	if control == null or rect.size.x <= 0.0 or rect.size.y <= 0.0:
		return
	control.position = rect.position
	control.size = rect.size
	control.custom_minimum_size = rect.size

static func audit(layout: Dictionary, viewport: Vector2) -> Dictionary:
	var safe: Rect2 = layout.get("safe", Rect2())
	var regions: Dictionary = {}
	var overlaps: Array[String] = []
	var offscreen: Array[String] = []

	for key in MAJOR_KEYS:
		var rect: Rect2 = layout.get(key, Rect2())
		var status := "PASS"
		if not safe.encloses(rect.grow(-0.5)):
			status = "OFFSCREEN"
			offscreen.append(key)
		regions[key] = {"rect": rect, "status": status}

	for i in range(MAJOR_KEYS.size()):
		for j in range(i + 1, MAJOR_KEYS.size()):
			var a_key: String = MAJOR_KEYS[i]
			var b_key: String = MAJOR_KEYS[j]
			if a_key == "fullscreen" or b_key == "fullscreen":
				continue
			var a: Rect2 = layout.get(a_key, Rect2())
			var b: Rect2 = layout.get(b_key, Rect2())
			if _major_overlap(a, b):
				overlaps.append("%s+%s" % [a_key, b_key])
				if regions[a_key].status == "PASS":
					regions[a_key].status = "OVERLAP"
				if regions[b_key].status == "PASS":
					regions[b_key].status = "OVERLAP"

	var feuer := HudV2Layout.feuer_rect(layout)
	if not safe.encloses(feuer):
		offscreen.append("feuer")

	return {
		"profile_name": layout.get("profile_name", ResponsiveHudMetrics.profile_name(viewport)),
		"logical_ui": viewport,
		"safe_rect": safe,
		"regions": regions,
		"overlap_count": overlaps.size(),
		"overlaps": overlaps,
		"offscreen_count": offscreen.size(),
		"offscreen": offscreen,
		"feuer_onscreen": safe.encloses(feuer),
		"mission_below_top": _mission_below_top(layout),
	}

static func qa_summary_lines(audit: Dictionary) -> PackedStringArray:
	var lines: PackedStringArray = []
	var logical: Vector2 = audit.get("logical_ui", Vector2.ZERO)
	lines.append("PROFILE: %s" % audit.get("profile_name", "?"))
	lines.append("LOGICAL_UI: %dx%d" % [int(logical.x), int(logical.y)])
	var safe: Rect2 = audit.get("safe_rect", Rect2())
	lines.append("SAFE_RECT: %dx%d" % [int(safe.size.x), int(safe.size.y)])
	lines.append("OVERLAP_COUNT: %d" % int(audit.get("overlap_count", 0)))
	lines.append("OFFSCREEN_COUNT: %d" % int(audit.get("offscreen_count", 0)))
	for key in MAJOR_KEYS:
		if key == "fullscreen":
			continue
		var entry: Dictionary = audit.get("regions", {}).get(key, {})
		lines.append("%s: %s" % [key.to_upper(), entry.get("status", "?")])
	lines.append("FEUER: %s" % ("PASS" if audit.get("feuer_onscreen", false) else "OFFSCREEN"))
	return lines

static func _major_overlap(a: Rect2, b: Rect2) -> bool:
	if a.size == Vector2.ZERO or b.size == Vector2.ZERO:
		return false
	var inter := a.intersection(b)
	if inter.size == Vector2.ZERO:
		return false
	var min_area := minf(a.get_area(), b.get_area())
	return inter.get_area() / maxf(min_area, 1.0) > OVERLAP_THRESHOLD

static func _mission_below_top(layout: Dictionary) -> bool:
	var mission: Rect2 = layout.get("mission", Rect2())
	var top: Rect2 = layout.get("top_band", Rect2())
	return mission.position.y >= top.end.y - 0.5
