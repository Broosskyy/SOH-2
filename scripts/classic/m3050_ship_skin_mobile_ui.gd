extends "res://scripts/classic/m3049_mobile_user_art_import.gd"
## M305.0: Usable player skin catalogue from the actual curated PNG ZIP.
## Never re-create the gameplay actor. Skins, HP damage and ship class are separate.
var _skin_button: Button
var _skin_index := -1

func _ready() -> void:
	super._ready()
	_hud_header.text = "ABYSSAL DOMINION · M305.0"
	_build_label.text = "M305.0 · SCHIFFSDESIGNS & MOBILE MENÜS"
	_refresh()

func _skin_catalog() -> Array:
	if _private_reference_manifest.is_empty():
		return []
	var entries: Variant = _private_reference_manifest.get("ship_catalog", [])
	return entries if entries is Array else []

func _custom_actor(label: String) -> Dictionary:
	var config: Dictionary = super._custom_actor(label)
	if label != "PlayerShip" or _skin_index < 0:
		return config
	var catalog: Array = _skin_catalog()
	if _skin_index >= catalog.size():
		return config
	var entry: Variant = catalog[_skin_index]
	if not entry is Dictionary:
		return config
	var path := str(entry.get("path", ""))
	if not path.begins_with("ships/") or not path.ends_with(".png"):
		return config
	if not FileAccess.file_exists(_private_art_root + path):
		return config
	if _cosmetic_ship_effects:
		var effect_path := "ship_effect_variants/" + path.trim_prefix("ships/").trim_suffix(".png") + "_cosmetic.png"
		if FileAccess.file_exists(_private_art_root + effect_path):
			path = effect_path
	var result: Dictionary = config.duplicate()
	result["path"] = path
	result["name"] = str(entry.get("name", "Schiff"))
	result["world_length"] = clampf(float(entry.get("world_length", 17.0)), 7.0, 25.0)
	return result

func _make_hud() -> void:
	super._make_hud()
	_skin_button = _control("SCHIFFSDESIGN: STANDARD", Callable(self, "_next_ship_skin"))
	_skin_button.name = "PlayerShipCosmeticCatalog"
	var old_parent := _skin_button.get_parent()
	if old_parent != null:
		old_parent.remove_child(_skin_button)
	_options.add_child(_skin_button)
	_skin_button.tooltip_text = "Aus dem importierten Grafikpaket wählen; Schiff und Status bleiben erhalten"
	_skin_button.focus_mode = Control.FOCUS_NONE
	_skin_button.add_theme_font_size_override("font_size", 12)

func _next_ship_skin() -> void:
	var catalog: Array = _skin_catalog()
	if ship == null or catalog.is_empty():
		hint = "Zuerst das aufbereitete Schiffsgrafik-ZIP importieren"
		_refresh()
		return
	_skin_index += 1
	if _skin_index >= catalog.size():
		_skin_index = -1
	# Replaces only the rendering child; the ship Node, HP, loot, currency,
	# position, target, collisions and equipped class remain the same.
	_replace_visual(ship, SHIP, 0.9, "PlayerShip", CAPTAIN_ATLAS)
	var config: Dictionary = _custom_actor("PlayerShip")
	hint = "Schiffsdesign: " + str(config.get("name", "Standard"))
	_refresh()

func _import_zip(source_path: String) -> String:
	var result: String = super._import_zip(source_path)
	if result.contains("PNGs importiert"):
		_skin_index = -1
		_refresh()
	return result

func _layout_hud() -> void:
	super._layout_hud()
	if _skin_button == null or _options == null:
		return
	# Parent M304.9 placed art FX over fullscreen/coating buttons on 390px
	# mobile screens. Reflow ALL seven live controls into discrete rows.
	var width: float = _options.size.x
	var height: float = _options.size.y
	var compact := height < 350.0
	var top := 32.0 if compact else 38.0
	var gap := 3.0 if compact else 4.0
	var footer := 42.0 if compact else 68.0
	var rows: Array[Button] = [
		_pack_button, _full_button, _coating_button,
		_skin_button, _art_variants_button, _import_button, _options_close
	]
	var row_height := clampf(floorf((height - top - footer - gap * 6.0) / 7.0), 23.0, 34.0)
	_place(_options_title, 12.0, 7.0, width - 24.0, 22.0)
	for i in rows.size():
		_place(rows[i], 12.0, top + float(i) * (row_height + gap), width - 24.0, row_height)
	var after := top + 7.0 * row_height + 6.0 * gap
	_place(_pack_status, 12.0, after + 6.0, width - 24.0, 15.0)
	_import_hint.visible = not compact
	if not compact:
		_place(_import_hint, 12.0, after + 23.0, width - 24.0, 23.0)
	_place(_build_label, 12.0, height - 22.0, width - 24.0, 18.0)

func _refresh() -> void:
	super._refresh()
	if _skin_button == null:
		return
	var catalog: Array = _skin_catalog()
	_skin_button.disabled = catalog.is_empty() or _private_art_root.is_empty()
	var label := "STANDARD (WEITER)"
	if _skin_index >= 0 and _skin_index < catalog.size():
		var entry: Variant = catalog[_skin_index]
		if entry is Dictionary:
			label = str(entry.get("name", "SCHIFF")).to_upper()
	_skin_button.text = "SCHIFFSDESIGN: " + label
