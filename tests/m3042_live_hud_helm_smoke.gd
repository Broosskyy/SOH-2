extends SceneTree
## M304.2 in-engine regression: healthy ship frames, non-overlapping touch HUD,
## M304.1 chainshot wiring and helm movement. No screenshot-only assertions.
var failures: Array[String] = []

func check(condition: bool, description: String) -> void:
	if not condition:
		failures.append(description)

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	root.set_meta("m3035_graphic_mode", "private_sprite")
	var scene_file := load("res://scenes/classic/classic_sea_map.tscn") as PackedScene
	check(scene_file != null, "M304.2 boot scene loads")
	if scene_file == null:
		_finish()
		return
	var game: Node3D = scene_file.instantiate()
	root.add_child(game)
	current_scene = game
	await process_frame
	var inherited_script: Script = game.get_script()
	var has_m3042 := false
	while inherited_script != null:
		if inherited_script.resource_path.ends_with("m3042_navigation_hud_stability.gd"):
			has_m3042 = true
			break
		inherited_script = inherited_script.get_base_script()
	check(has_m3042, "M304.2 behavior remains active in the inherited M304.3 scene")
	check(game._ammo_cannon != null and game._ammo_harpoon != null and game._ammo_chain != null,
		"three independent functional ammo buttons")
	check(game._ammo_backplate != null and game._ammo_heading != null, "new ammo HUD exists")
	check(not game.harpoon_button.visible, "redundant overlapping weapon button removed")
	check(game._yard_buttons.size() == 3 and game._restock_chain_button != null,
		"previous shipyard and chainshot restock preserved")
	game._select_chain()
	check(game.weapon_mode == "chain", "chain ammo can be selected")
	game._choose_cannon()
	check(game.weapon_mode == "cannon", "switch from chain to iron cannon")
	game._choose_harpoon()
	check(game.weapon_mode == "harpoon", "harpoon selectable")
	var adapter: Node = game.ship.get_node_or_null("ShipSprite")
	check(adapter != null, "ship sprite adapter exists")
	if adapter != null:
		var sprite: Sprite3D = adapter.get("visual") as Sprite3D
		check(sprite != null, "ship has actual sprite visual")
		if sprite != null:
			adapter.set_heading(0.0)
			var healthy_frame := sprite.frame
			adapter.set_moving(true)
			check(sprite.frame == healthy_frame, "healthy ship never flips atlas row while starting motion")
			adapter.set_moving(false)
			check(sprite.frame == healthy_frame, "healthy ship never flips atlas row while stopping")
			adapter.set_heading(PI)
			check(sprite.frame < sprite.hframes, "all heading changes remain on intact atlas row")
			adapter.set_heading(0.0)
	# A real mid-range viewport check rather than assuming 1280px desktop.
	root.size = Vector2i(844, 390)
	await process_frame
	game._layout_hud()
	var actionable: Array[Control] = [
		game._hud_controls["center"], game._hud_controls["zoom_out"],
		game._hud_controls["zoom_in"], game._ammo_cannon,
		game._ammo_harpoon, game._ammo_chain,
		game._hud_controls["repair"], game.attack_button
	]
	for i in actionable.size():
		var a := actionable[i]
		print("M3042_TOUCH_RECT ", a.name, " ", a.position, " ", a.size)
		if not a.visible:
			continue
		for j in range(i + 1, actionable.size()):
			var b := actionable[j]
			if b.visible:
				check(not Rect2(a.position, a.size).intersects(Rect2(b.position, b.size)),
					"touch controls do not overlap %s / %s" % [a.name, b.name])
	check(game._quest_frame.position.y >= game._hud_player_frame.position.y + game._hud_player_frame.size.y,
		"quest starts below captain card")
	check(game._restock_chain_button.position.y >= game._yard_buttons[2].position.y + game._yard_buttons[2].size.y,
		"shipyard restock no longer overlaps last ship choice")
	check(game._yard_close.position.y >= game._restock_chain_button.position.y + game._restock_chain_button.size.y,
		"shipyard close no longer overlaps restock")
	# Basic heading-smoothed navigation is integrated in the playable scene.
	var starting_heading: float = game.ship.rotation.y
	game.route.clear()
	game.route.append(game.ship.position + Vector3(20.0, 0.0, 0.0))
	game._sail(0.016)
	check(absf(angle_difference(starting_heading, game.ship.rotation.y)) < deg_to_rad(110.0) * 0.016,
		"helmsman turns within the limited yaw rate")
	check(game._sea_speed >= 0.0 and game._sea_speed <= game.SEA_MAX_SPEED,
		"speed remains inside physically safe range")
	_finish()

func _finish() -> void:
	print(JSON.stringify({
		"status": "PASS" if failures.is_empty() else "FAIL",
		"version": "M304.2",
		"scope": "scene, chain ammo, atlas-frame stability, non-overlapping buttons, shipyard, helm",
		"failed": failures
	}))
	quit(0 if failures.is_empty() else 1)
