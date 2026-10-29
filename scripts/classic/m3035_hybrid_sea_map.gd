extends "res://scripts/classic/m3034_fullscreen_sea_map.gd"
## M303.5 - Classic SeaBattles-look art integration layer, still locally simulated.
## Public repo: clean-room code and replaceable fallback artwork.
## Private test: optional privately supplied 4x2 8-view PNG ship atlases
## or complete GLBs loaded through user:// / res:// folders. No third-party
## Unity payload, code or graphics are committed to GitHub.
const VISUAL_BRIDGE = preload("res://scripts/classic/m3035_visual_bridge.gd")
var _sprite_mode := true
var _render_records: Array[Dictionary] = []
var _art_toggle: Button
var _art_message := ""

func _asset(file: String, where: Vector3, scale_factor: float, label: String, atlas_path: String = "") -> Node3D:
	var holder := Node3D.new()
	holder.name = label
	holder.position = where
	add_child(holder)
	var record := {
		"holder": holder,
		"file": file,
		"scale": scale_factor,
		"label": label,
		"atlas": atlas_path
	}
	_render_records.append(record)
	_render_art(record)
	return holder


func _texture(paths: Array[String]) -> Texture2D:
	for path in paths:
		# res:// is imported by Godot at editor/export time.
		if path.begins_with("res://") and ResourceLoader.exists(path):
			var asset := load(path) as Texture2D
			if asset != null:
				return asset
		# user:// is writable, including on Android. A decoded PNG can
		# be placed there without adding the original files to public git.
		if FileAccess.file_exists(path):
			var image := Image.new()
			if image.load(path) == OK:
				return ImageTexture.create_from_image(image)
	return null


func _private_paths(stem: String) -> Array[String]:
	return [
		"res://assets/private/seabattles/" + stem + ".png",
		"res://assets/private/seabattles/" + stem + ".webp",
		"user://seabattles/" + stem + ".png",
		"user://seabattles/" + stem + ".webp"
	]


func _visual_config(record: Dictionary) -> Dictionary:
	var label := str(record["label"])
	var atlas := str(record["atlas"])
	var candidates: Array[String] = []
	var columns := 1
	var rows := 1
	var width := 5.6 * float(record["scale"])
	if label == "PlayerShip":
		candidates.append_array(_private_paths("elite8_8dir"))
		candidates.append_array(_private_paths("elite8_apk_diagnostic_8dir"))
		columns = 4
		rows = 2
	elif label.begins_with("NPC_"):
		var names := ["Pinnace_8dir", "Warship_8dir", "Carrack_8dir", "FlyingDutchman_8dir", "elite8_8dir"]
		var npc_idx := int(label.trim_prefix("NPC_"))
		candidates.append_array(_private_paths(names[npc_idx % names.size()]))
		columns = 4
		rows = 2
	elif label.begins_with("Island_"):
		var island_idx := int(label.trim_prefix("Island_"))
		var keys := ["island_snow", "island_snow", "island_rock", "island_tropical"]
		candidates.append_array(_private_paths(keys[island_idx % keys.size()]))
		width = 24.0 * float(record["scale"])
	else:
		# No inferred SeaBattles monster sprite; keep known local GLB.
		return {}
	var art := _texture(candidates)
	if art != null:
		return {"texture": art, "columns": columns, "rows": rows, "width": width, "private": true}
	# Existing original Abyssal-Dominion fallback vectors. SVG is
	# 16x1, not an eight-direction SeaBattles atlas.
	if not atlas.is_empty() and ResourceLoader.exists(atlas):
		art = load(atlas) as Texture2D
		if art != null:
			return {"texture": art, "columns": 16, "rows": 1, "width": width, "private": false}
	return {}


func _render_art(record: Dictionary) -> void:
	var holder: Node3D = record["holder"]
	if not is_instance_valid(holder):
		return
	# The target nameplate is not part of the replaceable visual.
	for child in holder.get_children():
		if bool(child.get_meta("m3035_render_child", false)):
			child.name = "__retired_visual"
			child.queue_free()
	var rendered := false
	if _sprite_mode:
		var source := _visual_config(record)
		if not source.is_empty():
			var sprite := VISUAL_BRIDGE.new()
			sprite.name = "ShipSprite" if not str(record["label"]).begins_with("Island_") else "IslandSprite"
			holder.add_child(sprite)
			sprite.set_meta("m3035_render_child", true)
			if sprite.configure(source["texture"], int(source["columns"]), int(source["rows"]), float(source["width"])):
				sprite.set_heading(holder.rotation.y)
				rendered = true
				if bool(source.get("private", false)):
					_art_message = "Lokale SeaBattles-Diagnosegrafiken aktiv"
			else:
				sprite.name = "__unavailable_visual"
				sprite.queue_free()
	if not rendered:
		var file := str(record["file"])
		var scene := load(file) as PackedScene if ResourceLoader.exists(file) else null
		if scene != null:
			var mesh := scene.instantiate() as Node3D
			if mesh != null:
				mesh.name = "ArtModel"
				holder.add_child(mesh)
				mesh.scale = Vector3.ONE * float(record["scale"])
				mesh.set_meta("m3035_render_child", true)


func _swap_render_mode() -> void:
	_sprite_mode = not _sprite_mode
	_art_message = ""
	for record in _render_records:
		_render_art(record)
	if _art_toggle != null:
		_art_toggle.text = "GRAFIK: 2D" if _sprite_mode else "GRAFIK: 3D"
	hint = _art_message if not _art_message.is_empty() else ("2D-Sprite-Darstellung" if _sprite_mode else "3D-Modell-Darstellung")
	_refresh()


func _make_hud() -> void:
	super._make_hud()
	_art_toggle = _control("GRAFIK: 2D", Callable(self, "_swap_render_mode"))
	_art_toggle.name = "RenderModeToggle"


func _layout_hud() -> void:
	super._layout_hud()
	if _art_toggle == null:
		return
	var screen := get_viewport().get_visible_rect().size
	# The center slot only shows if there is actually enough space
	# between the independently anchored left and right combat clusters.
	var compact := screen.x < 1024.0 or screen.y < 540.0
	var left_end := (10.0 + 73.0 + 4.0 * 40.0 + 5.0 * 5.0) if compact else (16.0 + 98.0 + 4.0 * 52.0 + 5.0 * 8.0)
	var right_start := screen.x - (10.0 + 90.0 + 86.0 + 103.0 + 2.0 * 5.0) if compact else screen.x - (16.0 + 122.0 + 122.0 + 144.0 + 2.0 * 8.0)
	var free := right_start - left_end
	_art_toggle.visible = free >= 118.0 and screen.x > screen.y
	if _art_toggle.visible:
		_place(_art_toggle, left_end + (free - 110.0) / 2.0, screen.y - (44.0 if compact else 56.0) - (10.0 if compact else 16.0), 110.0, 44.0 if compact else 56.0)


func _refresh() -> void:
	super._refresh()
	if status != null:
		status.text = status.text.replace("M303.1", "M303.5")


func _unhandled_input(event: InputEvent) -> void:
	# Desktop-only shortcut when the center button is hidden.
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_V:
		_swap_render_mode()
		get_viewport().set_input_as_handled()
		return
	super._unhandled_input(event)
