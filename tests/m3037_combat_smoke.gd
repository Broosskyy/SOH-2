extends SceneTree
## M303.7 headless gameplay tests (Godot 4.7.2).
## Dynamic projectile damage is applied on impact, not at trigger time.
var failures: Array[String] = []

func check(condition: bool, label: String) -> void:
	if not condition:
		failures.append(label)

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	root.set_meta("m3035_graphic_mode", "private_sprite")
	var packed := load("res://scenes/classic/classic_sea_map.tscn") as PackedScene
	check(packed != null, "main scene loads")
	if packed == null:
		_finish()
		return
	var scene: Node3D = packed.instantiate()
	root.add_child(scene)
	current_scene = scene
	await process_frame
	check(scene._projectile_layer != null, "M303.7 projectile effect layer")
	check(scene.get_node_or_null("UnifiedOcean") != null, "M303.6 ocean retained")
	check(scene._ui_root != null, "M303.6 shared HUD retained")

	# Navigation: turn toward eastern waypoint before advancing, no lateral teleport.
	scene.route.clear()
	scene.ship.position = Vector3(0.0, 0.65, 0.0)
	scene.ship.rotation.y = 0.0
	scene._sea_speed = 0.0
	var from: Vector3 = scene.ship.position
	scene._course(from + Vector3(12.0, 0.0, 0.0))
	for i in 18:
		scene._sail(1.0 / 60.0)
	check(scene.ship.position.distance_to(from) < 1.0, "no sideways travel while initial heading is far off course")
	for i in 102:
		scene._sail(1.0 / 60.0)
	check(scene.ship.position.distance_to(from) > 3.0, "ship accelerates after aligning bow")
	check(scene.ship.position.x > from.x, "ship travels east after turning")
	check(scene.zoom == 82.0, "default camera zoom unchanged")
	scene._zoom_in()
	for i in 8:
		scene._zoom_in()
	check(scene.zoom < 44.0 and scene.zoom >= 34.5, "closer zoom limit reachable")

	# Real shot flight: ammo immediately, HP only after visible projectile arrival.
	scene.route.clear()
	scene._sea_speed = 0.0
	scene.ship.position = scene.enemies[0].node.position + Vector3(8.0, 0.0, 0.0)
	scene.target = 0
	scene.firing = false
	scene.weapon_mode = "cannon"
	var hp_before: int = scene.enemies[0].hp
	var ammo_before: int = scene.cannonballs
	scene._fire()
	check(scene.cannonballs == ammo_before - 1, "shot consumes one cannonball")
	check(int(scene.enemies[0].hp) == hp_before, "damage is not applied before flight")
	check(scene._active_shots > 0, "visible projectile spawned")
	await create_timer(1.15).timeout
	check(int(scene.enemies[0].hp) == hp_before - 24, "damage applied on impact")
	check(scene._active_shots == 0, "projectile cleaned up")

	# Targeting a ship with harpoons must not silently damage it.
	scene.weapon_mode = "harpoon"
	var harpoons_before: int = scene.harpoons
	hp_before = scene.enemies[0].hp
	scene._fire()
	check(scene.harpoons == harpoons_before and int(scene.enemies[0].hp) == hp_before,
		"invalid weapon type causes no invisible damage")

	# The source-pack swap should keep an airborne projectile and combat state.
	scene.weapon_mode = "cannon"
	scene.target = 0
	scene._fire()
	var after_fire_ammo: int = scene.cannonballs
	var after_fire_route: Array = scene.route.duplicate()
	var ship_id: int = scene.ship.get_instance_id()
	var mode_before: String = scene._asset_mode
	scene._switch_graphics()
	check(scene._asset_mode != mode_before, "graphics pack changes without scene reload")
	check(ship_id == scene.ship.get_instance_id(), "ship identity retained after swap")
	check(scene.cannonballs == after_fire_ammo and scene.route == after_fire_route,
		"ammo and course unchanged after swap")
	await create_timer(1.15).timeout
	check(int(scene.enemies[0].hp) == hp_before - 24, "airborne shot hits despite graphics swap")

	# NPCs must fire visible projectiles instead of subtracting HP instantly.
	scene.firing = false
	scene.target = -1
	scene.ship.position = scene.enemies[0].node.position + Vector3(4.0, 0.0, 0.0)
	scene.hull = 100
	scene._enemy_attack()
	check(scene.hull == 100, "NPC does not instantly subtract hull")
	check(scene._active_shots > 0, "NPC projectile visible")
	await create_timer(1.15).timeout
	check(scene.hull < 100, "NPC projectile deals damage at impact")
	_finish()

func _finish() -> void:
	var report := {
		"status": "PASS" if failures.is_empty() else "FAIL",
		"engine": Engine.get_version_info().string,
		"failed": failures,
		"scope": "M303.7 turn-then-move, closer zoom, projectile animation, delayed damage, graphics-swap stability, enemy cannon shots"
	}
	print(JSON.stringify(report))
	var file := OS.get_environment("M3037_QA_REPORT")
	if not file.is_empty():
		FileAccess.open(file, FileAccess.WRITE).store_string(JSON.stringify(report, "  "))
	quit(0 if failures.is_empty() else 1)
