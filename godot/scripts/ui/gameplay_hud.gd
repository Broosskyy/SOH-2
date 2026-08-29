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
var _nav_row: HBoxContainer
var _hp_bar: ProgressBar
var _shield_bar: ProgressBar
var _gold_label: Label
var _pearl_label: Label
var _mission_title: Label
var _mission_heading: Label
var _mission_progress: ProgressBar
var _region_label: Label
var _captain_name: Label
var _captain_level: Label

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
	top_row.add_theme_constant_override("separation", 10)
	_top_bar.add_child(top_row)
	var captain := _make_captain_chip()
	top_row.add_child(captain)
	var bars := VBoxContainer.new()
	bars.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bars.add_theme_constant_override("separation", 5)
	_hp_bar = _make_bar(Color(0.78, 0.22, 0.2))
	_shield_bar = _make_bar(Color(0.28, 0.72, 0.95))
	bars.add_child(_wrap_labeled_bar("RUMPF", _hp_bar))
	bars.add_child(_wrap_labeled_bar("SCHUTZ", _shield_bar))
	top_row.add_child(bars)
	_nav_row = _make_nav_buttons()
	top_row.add_child(_nav_row)
	var currency := VBoxContainer.new()
	currency.add_theme_constant_override("separation", 3)
	_gold_label = _make_currency_label("◆ 0")
	_pearl_label = _make_currency_label("◇ 0")
	currency.add_child(_gold_label)
	currency.add_child(_pearl_label)
	top_row.add_child(currency)
	_mission_panel = _make_panel()
	_root.add_child(_mission_panel)
	var mission_box := VBoxContainer.new()
	mission_box.add_theme_constant_override("separation", 4)
	_mission_panel.add_child(mission_box)
	_mission_heading = Label.new()
	_mission_heading.text = "AKTIVE MISSION"
	_mission_heading.add_theme_color_override("font_color", Color(0.82, 0.62, 0.38))
	mission_box.add_child(_mission_heading)
	_mission_title = Label.new()
	_mission_title.text = "Vorhut im Sturm"
	_mission_title.add_theme_color_override("font_color", Color(0.94, 0.9, 0.78))
	mission_box.add_child(_mission_title)
	_mission_progress = _make_bar(Color(0.78, 0.38, 0.22))
	_mission_progress.max_value = 1.0
	_mission_progress.value = 0.35
	mission_box.add_child(_mission_progress)
	_action_cluster = _build_action_cluster()
	_root.add_child(_action_cluster)
	_region_label = Label.new()
	_region_label.text = "1 · Azurwacht"
	_region_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_region_label.add_theme_color_override("font_color", Color(0.86, 0.78, 0.58))
	_root.add_child(_region_label)

func _make_panel() -> PanelContainer:
	var panel := PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.02, 0.06, 0.08, 0.86)
	style.border_color = Color(0.72, 0.57, 0.27, 0.78)
	style.set_border_width_all(2)
	style.set_corner_radius_all(5)
	style.content_margin_left = 10
	style.content_margin_right = 10
	style.content_margin_top = 7
	style.content_margin_bottom = 7
	panel.add_theme_stylebox_override("panel", style)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return panel

func _make_captain_chip() -> PanelContainer:
	var panel := _make_panel()
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	panel.add_child(row)
	var mark := Label.new()
	mark.text = "AD"
	mark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	mark.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	mark.add_theme_color_override("font_color", Color(0.92, 0.76, 0.38))
	row.add_child(mark)
	mark.name = "Mark"
	var copy := VBoxContainer.new()
	_captain_name = Label.new()
	_captain_name.text = str(GameState.save_data.get("playerName", "Captain Rowan")).to_upper()
	_captain_name.add_theme_color_override("font_color", Color(0.94, 0.9, 0.78))
	copy.add_child(_captain_name)
	_captain_level = Label.new()
	_captain_level.text = "LV %d" % int(GameState.save_data.get("level", 1))
	_captain_level.add_theme_color_override("font_color", Color(0.72, 0.82, 0.8))
	copy.add_child(_captain_level)
	row.add_child(copy)
	return panel

func _make_nav_buttons() -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 5)
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
	button.disabled = not enabled
	button.mouse_filter = Control.MOUSE_FILTER_STOP
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.05, 0.1, 0.12, 0.9 if enabled else 0.45)
	style.border_color = Color(0.72, 0.57, 0.27, 0.65 if enabled else 0.25)
	style.set_border_width_all(1)
	style.set_corner_radius_all(4)
	button.add_theme_stylebox_override("normal", style)
	button.add_theme_stylebox_override("disabled", style)
	button.add_theme_color_override("font_color", Color(0.9, 0.84, 0.68) if enabled else Color(0.55, 0.58, 0.56))
	button.add_theme_color_override("font_disabled_color", Color(0.55, 0.58, 0.56))
	return button

func _make_bar(color: Color) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.show_percentage = false
	var background := StyleBoxFlat.new()
	background.bg_color = Color(0.03, 0.07, 0.09, 0.95)
	background.set_corner_radius_all(3)
	var fill := StyleBoxFlat.new()
	fill.bg_color = color
	fill.set_corner_radius_all(3)
	bar.add_theme_stylebox_override("background", background)
	bar.add_theme_stylebox_override("fill", fill)
	return bar

func _wrap_labeled_bar(title: String, bar: ProgressBar) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	var label := Label.new()
	label.text = title
	label.add_theme_color_override("font_color", Color(0.78, 0.72, 0.58))
	row.add_child(label)
	label.name = title
	bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(bar)
	return row

func _make_currency_label(text: String) -> Label:
	var label := Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	label.add_theme_color_override("font_color", Color(0.92, 0.82, 0.48))
	return label

func _build_action_cluster() -> Control:
	var cluster := Control.new()
	cluster.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var fire := Button.new()
	fire.text = "FEUER\nZIEL WÄHLEN"
	fire.disabled = true
	fire.name = "FireButton"
	var fire_style := StyleBoxFlat.new()
	fire_style.bg_color = Color(0.45, 0.18, 0.1, 0.55)
	fire_style.border_color = Color(0.72, 0.48, 0.22, 0.45)
	fire_style.set_border_width_all(2)
	fire_style.set_corner_radius_all(48)
	fire.add_theme_stylebox_override("disabled", fire_style)
	fire.add_theme_color_override("font_disabled_color", Color(0.62, 0.58, 0.54))
	cluster.add_child(fire)
	for index in 3:
		var ability := Button.new()
		ability.text = str(3 - index)
		ability.disabled = true
		ability.name = "Ability%d" % index
		cluster.add_child(ability)
	return cluster

func _apply_responsive_layout() -> void:
	var viewport := get_viewport().get_visible_rect().size
	var safe := PlatformService.safe_rect(viewport)
	var mobile := HudLayout.is_mobile_layout(viewport)
	var scale := HudLayout.scale_factor(viewport)
	var margin := HudLayout.panel_margin(viewport)
	var top_height := 64.0 * scale
	_top_bar.position = Vector2(safe.position.x + margin, safe.position.y + margin)
	_top_bar.size = Vector2(safe.size.x, top_height)
	_top_bar.custom_minimum_size = Vector2(safe.size.x, top_height)
	_mission_panel.position = Vector2(safe.position.x + margin, safe.position.y + margin + top_height + 8.0)
	_mission_panel.custom_minimum_size = Vector2(280.0 * scale if not mobile else 240.0 * scale, 72.0 * scale)
	_nav_row.visible = not mobile
	_action_cluster.visible = not mobile
	_region_label.visible = not mobile
	if not mobile:
		var fire := _action_cluster.get_node_or_null("FireButton") as Button
		if fire != null:
			var fire_size := HudLayout.touch_size(viewport, 92.0)
			fire.custom_minimum_size = Vector2(fire_size, fire_size)
			fire.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0))
			fire.position = Vector2.ZERO
		for index in 3:
			var ability := _action_cluster.get_node_or_null("Ability%d" % index) as Button
			if ability != null:
				var ability_size := HudLayout.touch_size(viewport, 42.0)
				ability.custom_minimum_size = Vector2(ability_size, ability_size)
				ability.position = Vector2(-58.0 * scale + index * 50.0 * scale, -52.0 * scale)
		_action_cluster.position = Vector2(safe.end.x - 110.0 * scale, safe.end.y - 110.0 * scale)
		_region_label.position = Vector2(viewport.x * 0.5 - 80.0 * scale, safe.end.y - 32.0 * scale)
		_region_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 12.0))
	_captain_name.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 13.0))
	_captain_level.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 11.0))
	_mission_heading.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0))
	_mission_title.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 14.0))
	_gold_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 12.0))
	_pearl_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 12.0))
	_hp_bar.custom_minimum_size = Vector2(140.0 * scale, 10.0 * scale)
	_shield_bar.custom_minimum_size = Vector2(140.0 * scale, 8.0 * scale)
	_mission_progress.custom_minimum_size.y = 10.0 * scale
	for nav_button in _nav_row.get_children():
		if nav_button is Button:
			nav_button.custom_minimum_size = Vector2(58.0 * scale, 50.0 * scale)
			nav_button.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0))

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
	if region_runtime != null and region_runtime.region_definition != null:
		_region_label.text = "1 · %s" % region_runtime.region_definition.display_name

func _format_number(value: int) -> String:
	if value >= 1000:
		return "%.1fK" % (float(value) / 1000.0)
	return str(value)
