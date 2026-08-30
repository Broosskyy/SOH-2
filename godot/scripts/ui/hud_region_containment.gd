class_name HudRegionContainment
extends RefCounted

const BUILD_LABEL := "G0.5.8-RUNTIME-CONTENT-CONTAINMENT"
const DECOR_TOLERANCE := 1.5

static func local_content_rect(zone: Control) -> Rect2:
	if zone == null or not zone.visible:
		return Rect2()
	return VisibleContentBounds.bounds_for(zone)

static func content_overflows_zone(zone: Control, tolerance := DECOR_TOLERANCE) -> bool:
	if zone == null or zone.size.x <= 0.0 or zone.size.y <= 0.0:
		return false
	var content := local_content_rect(zone)
	if content.size == Vector2.ZERO:
		return false
	var allowed := Rect2(
		Vector2(tolerance, tolerance),
		Vector2(
			maxf(0.0, zone.size.x - tolerance * 2.0),
			maxf(0.0, zone.size.y - tolerance * 2.0)
		)
	)
	return not allowed.encloses(content)

static func clamp_position_in_rect(position: Vector2, size: Vector2, bounds: Rect2) -> Vector2:
	return Vector2(
		clampf(position.x, bounds.position.x, bounds.end.x - size.x),
		clampf(position.y, bounds.position.y, bounds.end.y - size.y)
	)

static func layout_combat_cluster(
		cluster: Control,
		zone_size: Vector2,
		fire: Button,
		ability_nodes: Array,
		utility_nodes: Array,
		fire_size_hint: float
	) -> Rect2:
	var pad := 2.0
	var inner := Rect2(Vector2(pad, pad), Vector2(maxf(8.0, zone_size.x - pad * 2.0), maxf(8.0, zone_size.y - pad * 2.0)))
	var fire_size := minf(fire_size_hint, minf(inner.size.x, inner.size.y) * 0.62)
	fire_size = maxf(18.0, fire_size)
	var secondary := clampf(fire_size * 0.34, 12.0, fire_size * 0.42)
	var fire_pos := Vector2(inner.end.x - fire_size, inner.end.y - fire_size)
	if fire != null:
		fire.custom_minimum_size = Vector2(fire_size, fire_size)
		fire.size = Vector2(fire_size, fire_size)
		fire.position = fire_pos
	var ability_slots: Array[Vector2] = [
		Vector2(fire_pos.x - secondary * 0.95, fire_pos.y + fire_size * 0.18),
		Vector2(fire_pos.x + fire_size * 0.12, fire_pos.y - secondary * 0.95),
		Vector2(fire_pos.x - secondary * 0.55, fire_pos.y - secondary * 0.55),
	]
	for i in range(mini(ability_nodes.size(), ability_slots.size())):
		var ability: Button = ability_nodes[i]
		if ability == null:
			continue
		ability.custom_minimum_size = Vector2(secondary, secondary)
		ability.size = Vector2(secondary, secondary)
		ability.position = clamp_position_in_rect(ability_slots[i], Vector2(secondary, secondary), inner)
	var utility_slots: Array[Vector2] = [
		Vector2(fire_pos.x - secondary * 1.35, fire_pos.y + fire_size * 0.42),
		Vector2(fire_pos.x + fire_size * 0.42, fire_pos.y - secondary * 1.35),
	]
	for i in range(mini(utility_nodes.size(), utility_slots.size())):
		var utility: Button = utility_nodes[i]
		if utility == null:
			continue
		utility.custom_minimum_size = Vector2(secondary * 0.9, secondary * 0.9)
		utility.size = utility.custom_minimum_size
		utility.position = clamp_position_in_rect(utility_slots[i], utility.custom_minimum_size, inner)
	for i in range(2, utility_nodes.size()):
		var extra: Button = utility_nodes[i]
		if extra != null:
			extra.visible = false
	return local_content_rect(cluster)

static func audit_regions(zones: Dictionary, viewport: Vector2) -> Dictionary:
	var solution := ResponsiveHudLayoutSolver.solve(viewport)
	var safe := ResponsiveHudMetrics.safe_rect(viewport)
	var region_keys := {
		"profile": "identity",
		"status": "status",
		"nav": "nav",
		"minimap": "minimap",
		"mission": "mission",
		"zoom": "zoom",
		"movement": "movement",
		"chat": "chat",
		"consumables": "consumables",
		"combat": "combat",
	}
	var regions: Dictionary = {}
	var overflows: Array = []
	var offscreen: Array = []
	var statuses: Dictionary = {}
	for key in region_keys.keys():
		var zone: Control = zones.get(key)
		if zone == null:
			continue
		var reserved: Rect2 = solution.get(region_keys[key], Rect2())
		var content_local := local_content_rect(zone)
		var content_global := Rect2(zone.position + content_local.position, content_local.size)
		var combined := zone.get_combined_minimum_size() if zone is Container else zone.custom_minimum_size
		var overflow := content_overflows_zone(zone)
		var outside_safe := not _inside_safe(content_global, safe)
		var status := "PASS"
		if overflow:
			status = "OVERFLOW"
			overflows.append(key)
		elif outside_safe:
			status = "OFFSCREEN"
			offscreen.append(key)
		elif combined.x > reserved.size.x + 1.0 or combined.y > reserved.size.y + 1.0:
			status = "MIN_SIZE"
		regions[key] = {
			"reserved": reserved,
			"content": content_global,
			"content_local": content_local,
			"combined_minimum": combined,
			"status": status,
		}
		statuses[key] = status
	var overlaps := _content_overlap_pairs(regions)
	return {
		"safe": safe,
		"regions": regions,
		"statuses": statuses,
		"overflows": overflows,
		"offscreen": offscreen,
		"overlap_pairs": overlaps,
		"overlap_count": overlaps.size(),
		"overflow_count": overflows.size(),
		"offscreen_count": offscreen.size(),
	}

static func qa_summary_lines(audit: Dictionary, viewport: Vector2) -> PackedStringArray:
	var lines := PackedStringArray([
		"PROFILE: %s" % ResponsiveHudMetrics.profile_name(viewport),
		"LOGICAL_UI: %dx%d" % [int(viewport.x), int(viewport.y)],
		"SAFE_RECT: %.0fx%.0f" % [audit.safe.size.x, audit.safe.size.y],
		"OVERLAP_COUNT: %d" % audit.overlap_count,
		"OVERFLOW_COUNT: %d" % audit.overflow_count,
		"OFFSCREEN_COUNT: %d" % audit.offscreen_count,
	])
	for key in audit.statuses.keys():
		lines.append("%s: %s" % [key.to_upper(), audit.statuses[key]])
	return lines

static func _inside_safe(rect: Rect2, safe: Rect2) -> bool:
	if rect.size == Vector2.ZERO:
		return true
	return (
		rect.position.x >= safe.position.x - DECOR_TOLERANCE
		and rect.position.y >= safe.position.y - DECOR_TOLERANCE
		and rect.end.x <= safe.end.x + DECOR_TOLERANCE
		and rect.end.y <= safe.end.y + DECOR_TOLERANCE
	)

static func _content_overlap_pairs(regions: Dictionary) -> Array:
	var pairs := [
		["profile", "status"],
		["profile", "mission"],
		["status", "nav"],
		["mission", "zoom"],
		["consumables", "combat"],
	]
	var hits: Array = []
	for pair in pairs:
		var a: Dictionary = regions.get(pair[0], {})
		var b: Dictionary = regions.get(pair[1], {})
		var ra: Rect2 = a.get("content", Rect2())
		var rb: Rect2 = b.get("content", Rect2())
		if VisibleContentBounds.major_overlap(ra, rb, 0.10):
			hits.append({"a": pair[0], "b": pair[1]})
	return hits
