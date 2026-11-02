extends SceneTree
## M305.0 integration: actual imported ship images selectable without recreating ships.
var failed: Array[String] = []

func check(ok: bool, reason: String) -> void:
	if not ok:
		failed.append(reason)

func _initialize() -> void:
	call_deferred("_run")

func _png(color: Color) -> PackedByteArray:
	var img := Image.create(220, 160, false, Image.FORMAT_RGBA8)
	img.fill(Color.TRANSPARENT)
	for y in range(36, 125):
		for x in range(32, 194):
			if absf(float(y - 81)) < 44.0 - absf(float(x - 112)) * 0.22:
				img.set_pixel(x, y, color)
	return img.save_png_to_buffer()

func _make_zip(path: String) -> void:
	var manifest := {
		"version": "M305.0",
		"actors": {
			"PlayerShip": {"name": "Sternenwind", "path": "ships/standard.png", "world_length": 17.0},
			"NPC_0": {"name": "Wache", "path": "ships/enemy.png", "world_length": 14.0}
		},
		"ship_catalog": [
			{"name": "Schattenklaue", "path": "ships/schattenklaue.png", "world_length": 17.0},
			{"name": "Höllenfeuer", "path": "ships/hoellenfeuer.png", "world_length": 19.0}
		]
	}
	var entries := {
		"pack.json": JSON.stringify(manifest).to_utf8_buffer(),
		"ships/standard.png": _png(Color(0.78, 0.7, 0.5)),
		"ships/enemy.png": _png(Color(0.8, 0.25, 0.25)),
		"ships/schattenklaue.png": _png(Color(0.2, 0.7, 0.4)),
		"ships/hoellenfeuer.png": _png(Color(0.8, 0.25, 0.15))
	}
	var archive := ZIPPacker.new()
	check(archive.open(path) == OK, "test ZIP opens")
	for name in entries:
		check(archive.start_file(name) == OK, "entry opens " + name)
		check(archive.write_file(entries[name]) == OK, "entry written " + name)
		check(archive.close_file() == OK, "entry closes " + name)
	check(archive.close() == OK, "test ZIP valid")

func _run() -> void:
	root.size = Vector2i(844, 390)
	root.set_meta("m3035_graphic_mode", "private_sprite")
	var source := load("res://scenes/classic/classic_sea_map.tscn") as PackedScene
	check(source != null, "game scene is loadable")
	if source == null:
		_finish()
		return
	var game: Node3D = source.instantiate()
	root.add_child(game)
	current_scene = game
	await process_frame
	check(game.get_script().resource_path.ends_with("m3050_ship_skin_mobile_ui.gd"), "M305.0 is live game script")
	check(game._skin_button != null, "real design button is part of settings")
	var zip_path := "user://m3050_catalog.zip"
	_make_zip(zip_path)
	var result: String = game._import_zip(zip_path)
	check(result.contains("PNGs importiert"), "user art pack installed")
	check(game._skin_catalog().size() == 2, "two genuine imported skin entries")
	var ship_id: int = game.ship.get_instance_id()
	var npc_id: int = (game.enemies[0]["node"] as Node3D).get_instance_id()
	var pos: Vector3 = game.ship.position
	game.hull = 83
	game.gold = 174
	game.cannonballs = 81
	game._next_ship_skin()
	check(game._custom_actor("PlayerShip").get("path") == "ships/schattenklaue.png", "first real skin selected")
	check(game.ship.get_instance_id() == ship_id and (game.enemies[0]["node"] as Node3D).get_instance_id() == npc_id,
		"switch changes only rendered child, not game actor")
	game._next_ship_skin()
	check(game._custom_actor("PlayerShip").get("path") == "ships/hoellenfeuer.png", "second real ship selected")
	game._next_ship_skin()
	check(game._skin_index == -1 and game._custom_actor("PlayerShip").get("path") == "ships/standard.png", "back to base ship")
	check(game.ship.position == pos and game.hull == 83 and game.gold == 174 and game.cannonballs == 81, "all gameplay state survives skin cycle")
	var actor_art: Node = game.ship.get_node_or_null("ShipSprite")
	check(actor_art != null and actor_art.visual.frame == 0, "healthy reference art remains a single fixed frame")
	for dim in [Vector2i(844, 390), Vector2i(690, 310), Vector2i(1280, 720)]:
		root.size = dim
		game._layout_hud()
		var opts: Rect2 = game._options.get_global_rect()
		var buttons: Array[Button] = [
			game._pack_button, game._full_button, game._coating_button,
			game._skin_button, game._art_variants_button,
			game._import_button, game._options_close
		]
		for i in buttons.size():
			var rect: Rect2 = buttons[i].get_global_rect()
			check(opts.encloses(rect), "%s settings row %d inside" % [str(dim), i])
			for j in range(i + 1, buttons.size()):
				check(not rect.intersects(buttons[j].get_global_rect()), "%s settings controls %d and %d do not overlap" % [str(dim), i, j])
	_finish()

func _finish() -> void:
	print(JSON.stringify({"version": "M305.0", "status": "PASS" if failed.is_empty() else "FAIL",
		"scope": "10 skin catalogue path, sprite-only swap, gameplay preservation, mobile settings no overlap", "failed": failed}))
	quit(0 if failed.is_empty() else 1)
