class_name GameplayHud
extends CanvasLayer

@export var player_path: NodePath
@export var camera_path: NodePath
@export var region_runtime_path: NodePath

@onready var player: PlayerShip = get_node(player_path)
@onready var camera: Camera3D = get_node(camera_path)
@onready var region_runtime: Node = get_node(region_runtime_path)

var _root: Control
var _top_bar: PanelContainer
var _mission_panel: PanelContainer
var _action_cluster: Control
var _hp_bar: ProgressBar
var _shield_bar: ProgressBar
var _gold_label: Label
var _pearl_label: Label
var _mission_title: Label
var _mission_progress: ProgressBar
var _region_label: Label

func _ready() -> void:
	layer = 5
	_build_layout()
	_refresh_status()

func _process(_delta: float) -> void:
	_apply_responsive_layout()
	if Engine.get_frames_drawn() % 15 == 0:
		_refresh_status()

func _build_layout() -> void:
	_root = Control.new()
	_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_root)
	_top_bar = _make_panel()
	_root.add_child(_top_bar)
	var top_row := HBoxContainer.new()
	top_row.add_theme_constant_override("separation", 8)
	_top_bar.add_child(top_row)
	var captain := _make_captain_chip()
	top_row.add_child(captain)
	var bars := VBoxContainer.new()
	bars.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bars.add_theme_constant_override("separation", 4)
	_hp_bar = _make_bar(Color(0.78, 0.22, 0.2), "RUMPF")
	_shield_bar = _make_bar(Color(0.28, 0.72, 0.95), "SCHUTZ")
	bars.add_child(_wrap_labeled_bar("RUMPF", _hp_bar))
	bars.add_child(_wrap_labeled_bar("SCHUTZ", _shield_bar))
	top_row.add_child(bars)
	var nav := _make_nav_buttons()
	top_row.add_child(nav)
	var currency := VBoxContainer.new()
	currency.add_theme_constant_override("separation", 2)
	_gold_label = _make_currency_label("◆ 0")
	_pearl_label = _make_currency_label("◇ 0")
	currency.add_child(_gold_label)
	currency.add_child(_pearl_label)
	top_row.add_child(currency)
	_mission_panel = _make_panel()
	_root.add_child(_mission_panel)
	var mission_box := VBoxContainer.new()
	mission_box.add_theme_constant_override("separation", 3)
	_mission_panel.add_child(mission_box)
	var mission_heading := Label.new()
	mission_heading.text = "AKTIVE MISSION"
	mission_heading.add_theme_font_size_override("font_size", 9)
	mission_heading.add_theme_color_override("font_color", Color(0.82, 0.62, 0.38))
	mission_box.add_child(mission_heading)
	_mission_title = Label.new()
	_mission_title.text = "Vorhut im Sturm"
	_mission_title.add_theme_font_size_override("font_size", 13)
	_mission_title.add_theme_color_override("font_color", Color(0.94, 0.9, 0.78))
	mission_box.add_child(_mission_title)
	_mission_progress = _make_bar(Color(0.78, 0.38, 0.22), "")
	_mission_progress.max_value = 1.0
	_mission_progress.value = 0.35
	mission_box.add_child(_mission_progress)
	_action_cluster = _build_action_cluster()
	_root.add_child(_action_cluster)
	_region_label = Label.new()
	_region_label.text = "1 · Azurwacht"
	_region_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_region_label.add_theme_font_size_override("font_size", 11)
	_region_label.add_theme_color_override("font_color", Color(0.86, 0.78, 0.58))
	_root.add_child(_region_label)

func _make_panel() -> PanelContainer:
	var panel := PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.02, 0.06, 0.08, 0.82)
	style.border_color = Color(0.62, 0.48, 0.24, 0.75)
	style.set_border_width_all(1)
	style.set_corner_radius_all(4)
	style.content_margin_left = 8
	style.content_margin_right = 8
	style.content_margin_top = 6
	style.content_margin_bottom = 6
	panel.add_theme_stylebox_override("panel", style)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return panel

func _make_captain_chip() -> PanelContainer:
	var panel := _make_panel()
	panel.custom_minimum_size = Vector2(148, 52)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	panel.add_child(row)
	var mark := Label.new()
	mark.text = "AD"
	mark.custom_minimum_size = Vector2(34, 34)
	mark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	mark.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	mark.add_theme_font_size_override("font_size", 14)
	mark.add_theme_color_override("font_color", Color(0.92, 0.76, 0.38))
	row.add_child(mark)
	var copy := VBoxContainer.new()
	var name := Label.new()
	name.text = str(GameState.save_data.get("playerName", "Captain Rowan")).to_upper()
	name.add_theme_font_size_override("font_size", 12)
	name.add_theme_color_override("font_color", Color(0.94, 0.9, 0.78))
	copy.add_child(name)
	var level := Label.new()
	level.text = "LV %d" % int(GameState.save_data.get("level", 1))
	level.add_theme_font_size_override("font_size", 10)
	level.add_theme_color_override("font_color", Color(0.72, 0.82, 0.8))
	copy.add_child(level)
	row.add_child(copy)
	return panel

func _make_nav_buttons() -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 4)
	for entry in [
		["⚓", "WERFT", false],
		["✦", "MISSION", true],
		["◎", "SEEKARTE", false],
		["◆", "GESCHÄFT", false],
	]:
		row.add_child(_make_nav_button(entry[0], entry[1], entry[2]))
	return row

func _make_nav_button(icon: String, label_text: String, enabled: bool) -> Button:
	var button := Button.new()
	button.text = "%s\n%s" % [icon, label_text]
	button.custom_minimum_size = Vector2(54, 46)
	button.disabled = not enabled
	button.add_theme_font_size_override("font_size", 8)
	button.mouse_filter = Control.MOUSE_FILTER_STOP
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.05, 0.1, 0.12, 0.9 if enabled else 0.45)
	style.border_color = Color(0.62, 0.48, 0.24, 0.65 if enabled else 0.25)
	style.set_border_width_all(1)
	style.set_corner_radius_all(3)
	button.add_theme_stylebox_override("normal", style)
	button.add_theme_stylebox_override("disabled", style)
	button.add_theme_color_override("font_color", Color(0.9, 0.84, 0.68) if enabled else Color(0.55, 0.58, 0.56))
	button.add_theme_color_override("font_disabled_color", Color(0.55, 0.58, 0.56))
	return button

func _make_bar(color: Color, _label: String) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.custom_minimum_size = Vector2(120, 8)
	bar.show_percentage = false
	var background := StyleBoxFlat.new()
	background.bg_color = Color(0.03, 0.07, 0.09, 0.95)
	background.set_corner_radius_all(2)
	var fill := StyleBoxFlat.new()
	fill.bg_color = color
	fill.set_corner_radius_all(2)
	bar.add_theme_stylebox_override("background", background)
	bar.add_theme_stylebox_override("fill", fill)
	return bar

func _wrap_labeled_bar(title: String, bar: ProgressBar) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	var label := Label.new()
	label.text = title
	label.custom_minimum_size.x = 48
	label.add_theme_font_size_override("font_size", 8)
	label.add_theme_color_override("font_color", Color(0.78, 0.72, 0.58))
	row.add_child(label)
	bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(bar)
	return row

func _make_currency_label(text: String) -> Label:
	var label := Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	label.add_theme_font_size_override("font_size", 11)
	label.add_theme_color_override("font_color", Color(0.92, 0.82, 0.48))
	return label

func _build_action_cluster() -> Control:
	var cluster := Control.new()
	cluster.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var fire := Button.new()
	fire.text = "FEUER\nZIEL WÄHLEN"
	fire.disabled = true
	fire.custom_minimum_size = Vector2(84, 84)
	fire.add_theme_font_size_override("font_size", 9)
	var fire_style := StyleBoxFlat.new()
	fire_style.bg_color = Color(0.45, 0.18, 0.1, 0.55)
	fire_style.border_color = Color(0.72, 0.48, 0.22, 0.45)
	fire_style.set_border_width_all(2)
	fire_style.set_corner_radius_all(42)
	fire.add_theme_stylebox_override("disabled", fire_style)
	fire.add_theme_color_override("font_disabled_color", Color(0.62, 0.58, 0.54))
	cluster.add_child(fire)
	for index in 3:
		var ability := Button.new()
		ability.text = str(3 - index)
		ability.disabled = true
		ability.custom_minimum_size = Vector2(38, 38)
		ability.position = Vector2(-52 + index * 44, -48)
		cluster.add_child(ability)
	return cluster

func _apply_responsive_layout() -> void:
	var viewport := get_viewport().get_visible_rect().size
	var safe := PlatformService.safe_rect(viewport)
	var mobile := PlatformService.mobile or viewport.x < 920.0
	_top_bar.position = Vector2(safe.position.x + 10.0, safe.position.y + 8.0)
	_top_bar.size = Vector2(viewport.x - safe.position.x - safe.end.x + viewport.x - 20.0, 58.0)
	_top_bar.custom_minimum_size.x = viewport.x - 20.0
	_mission_panel.position = Vector2(safe.position.x + 10.0, safe.position.y + 74.0)
	_mission_panel.custom_minimum_size = Vector2(250 if not mobile else 210, 58)
	_action_cluster.position = Vector2(safe.end.x - 96.0, safe.end.y - 96.0)
	_region_label.position = Vector2(viewport.x * 0.5 - 70.0, safe.end.y - 28.0)
	for child in _top_bar.get_child(0).get_children():
		if child is HBoxContainer and child.get_child_count() > 2:
			var nav := child.get_child(2)
			if nav is HBoxContainer:
				for button in nav.get_children():
					if button is Button:
						(button as Button).text = (button as Button).text.split("\n")[0] if mobile else (button as Button).text

func _refresh_status() -> void:
	var ship_id := str(GameState.save_data.get("shipId", "sovereign"))
	var ship_data: Dictionary = GameState.catalog.get("ships", {}).get(ship_id, {})
	var hp := float(ship_data.get("hp", 1250.0))
	var shield := float(ship_data.get("shield", 350.0))
	_hp_bar.max_value = hp
	_hp_bar.value = hp
	_shield_bar.max_value = shield
	_shield_bar.value = shield
	_gold_label.text = "◆ %s" % _format_number(int(GameState.save_data.get("gold", 5010)))
	_pearl_label.text = "◇ %d" % int(GameState.save_data.get("pearls", 94))
	if region_runtime != null and region_runtime.has_method("region_id"):
		_region_label.text = "1 · %s" % region_runtime.region_definition.display_name if region_runtime.region_definition != null else "Azurwacht"

func _format_number(value: int) -> String:
	if value >= 1000:
		return "%.1fK" % (float(value) / 1000.0)
	return str(value)
