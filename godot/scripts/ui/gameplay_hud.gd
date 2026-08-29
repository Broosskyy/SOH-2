## DEPRECATED G0.4 — replaced by GameplayPresentationRoot (G0.5).
class_name GameplayHud
extends CanvasLayer

@export var player_path: NodePath
@export var camera_path: NodePath
@export var region_runtime_path: NodePath

@onready var player: PlayerShip = get_node(player_path)
@onready var camera: Camera3D = get_node(camera_path)
@onready var region_runtime: Node = get_node(region_runtime_path)

var _root: Control
var _profile_zone: PanelContainer
var _status_zone: PanelContainer
var _mission_panel: PanelContainer
var _target_panel: PanelContainer
var _chat_panel: PanelContainer
var _zoom_panel: PanelContainer
var _consumables_row: HBoxContainer
var _action_cluster: Control
var _mobile_combat_cluster: Control
var _nav_row: HBoxContainer
var _menu_button: Button
var _hull_bar: ProgressBar
var _shield_bar: ProgressBar
var _exp_bar: ProgressBar
var _exp_value: Label
var _hull_value: Label
var _shield_value: Label
var _gold_label: Label
var _iron_label: Label
var _pearl_label: Label
var _mission_title: Label
var _mission_heading: Label
var _mission_objective: Label
var _mission_progress: ProgressBar
var _captain_name: Label
var _captain_level: Label
var _guild_label: Label
var _target_name: Label
var _target_level: Label
var _target_hp: ProgressBar
var _chat_preview: Label
var _chat_tabs: HBoxContainer
var _fullscreen_button: Button
var _combat_cluster: Control

func _ready() -> void:
	add_to_group("gameplay_hud_root")
	layer = 5
	_build_layout()
	_refresh_status()
	TargetingSystem.target_changed.connect(func(_t): _refresh_target())
	TargetingSystem.target_cleared.connect(func(): _refresh_target())

func _process(_delta: float) -> void:
	_apply_responsive_layout()
	if Engine.get_frames_drawn() % 15 == 0:
		_refresh_status()
		_refresh_target()

func _build_layout() -> void:
	_root = Control.new()
	_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_root)
	_profile_zone = _make_zone_panel()
	_root.add_child(_profile_zone)
	_profile_zone.add_child(_make_captain_chip())
	_status_zone = _make_zone_panel()
	_root.add_child(_status_zone)
	var status_stack := VBoxContainer.new()
	status_stack.add_theme_constant_override("separation", 3)
	_status_zone.add_child(status_stack)
	_exp_bar = _make_bar(Color(0.28, 0.52, 0.95))
	status_stack.add_child(_wrap_status_bar("EXP", _exp_bar, "_exp_value"))
	_hull_bar = _make_bar(Color(0.78, 0.22, 0.2))
	status_stack.add_child(_wrap_status_bar("RUMPF", _hull_bar, "_hull_value"))
	_shield_bar = _make_bar(Color(0.28, 0.72, 0.95))
	status_stack.add_child(_wrap_status_bar("SCHUTZ", _shield_bar, "_shield_value"))
	_nav_row = _make_nav_buttons()
	_root.add_child(_nav_row)
	var currency := VBoxContainer.new()
	currency.name = "CurrencyStack"
	currency.add_theme_constant_override("separation", 2)
	_gold_label = _make_currency_label("🪙 815.6K")
	_iron_label = _make_currency_label("⚙ 12.4K")
	_pearl_label = _make_currency_label("◆ 3,250")
	currency.add_child(_gold_label)
	currency.add_child(_iron_label)
	currency.add_child(_pearl_label)
	_root.add_child(currency)
	_menu_button = Button.new()
	_menu_button.text = "☰"
	_menu_button.disabled = true
	_menu_button.tooltip_text = "Menü"
	_root.add_child(_menu_button)
	_mission_panel = _make_zone_panel()
	_root.add_child(_mission_panel)
	var mission_box := VBoxContainer.new()
	mission_box.add_theme_constant_override("separation", 3)
	_mission_panel.add_child(mission_box)
	_mission_heading = Label.new()
	_mission_heading.text = "AKTIVE MISSION"
	_mission_heading.add_theme_color_override("font_color", Color(0.82, 0.62, 0.38))
	mission_box.add_child(_mission_heading)
	_mission_title = Label.new()
	_mission_title.text = MockupCompositionProfile.HUD_MISSION_TITLE
	_mission_title.add_theme_color_override("font_color", Color(0.94, 0.9, 0.78))
	mission_box.add_child(_mission_title)
	_mission_objective = Label.new()
	_mission_objective.text = MockupCompositionProfile.HUD_MISSION_OBJECTIVE
	_mission_objective.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_mission_objective.add_theme_color_override("font_color", Color(0.78, 0.72, 0.58))
	mission_box.add_child(_mission_objective)
	_mission_progress = _make_bar(Color(0.78, 0.38, 0.22))
	_mission_progress.max_value = 1.0
	_mission_progress.value = 0.0
	mission_box.add_child(_mission_progress)
	_target_panel = _make_zone_panel()
	_target_panel.visible = false
	_root.add_child(_target_panel)
	var target_box := VBoxContainer.new()
	target_box.add_theme_constant_override("separation", 2)
	_target_panel.add_child(target_box)
	var target_heading := Label.new()
	target_heading.text = "ZIEL"
	target_heading.add_theme_color_override("font_color", Color(0.82, 0.62, 0.38))
	target_box.add_child(target_heading)
	_target_name = Label.new()
	_target_name.add_theme_color_override("font_color", Color(0.95, 0.72, 0.58))
	target_box.add_child(_target_name)
	_target_level = Label.new()
	_target_level.add_theme_color_override("font_color", Color(0.78, 0.72, 0.58))
	target_box.add_child(_target_level)
	_target_hp = _make_bar(Color(0.92, 0.28, 0.22))
	target_box.add_child(_target_hp)
	_consumables_row = HBoxContainer.new()
	_consumables_row.name = "ConsumablesRow"
	_consumables_row.add_theme_constant_override("separation", 6)
	_consumables_row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_consumables_row)
	for slot in [["🛢", "32"], ["🧪", "21"], ["💣", "18"], ["💧", "24"]]:
		_consumables_row.add_child(_make_consumable_slot(slot[0], slot[1]))
	_chat_panel = _make_zone_panel()
	_root.add_child(_chat_panel)
	var chat_stack := VBoxContainer.new()
	chat_stack.add_theme_constant_override("separation", 3)
	_chat_panel.add_child(chat_stack)
	_chat_tabs = HBoxContainer.new()
	_chat_tabs.add_theme_constant_override("separation", 4)
	for tab in ["Global", "Guild", "System"]:
		var tab_label := Label.new()
		tab_label.text = tab
		tab_label.add_theme_color_override("font_color", Color(0.72, 0.78, 0.82) if tab != "Guild" else Color(0.92, 0.82, 0.48))
		_chat_tabs.add_child(tab_label)
	chat_stack.add_child(_chat_tabs)
	_chat_preview = Label.new()
	_chat_preview.text = "[Global] CaptainX: Forming raid on Kraken!"
	_chat_preview.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_chat_preview.add_theme_color_override("font_color", Color(0.72, 0.78, 0.82))
	chat_stack.add_child(_chat_preview)
	var chat_input := Label.new()
	chat_input.text = "Tap to chat..."
	chat_input.add_theme_color_override("font_color", Color(0.55, 0.58, 0.62))
	chat_stack.add_child(chat_input)
	_zoom_panel = _make_zone_panel()
	_root.add_child(_zoom_panel)
	var zoom_col := VBoxContainer.new()
	zoom_col.add_theme_constant_override("separation", 3)
	_zoom_panel.add_child(zoom_col)
	zoom_col.add_child(_make_zoom_button("+", 0.08))
	zoom_col.add_child(_make_zoom_button("MID", 0.0))
	zoom_col.add_child(_make_zoom_button("-", -0.08))
	_fullscreen_button = Button.new()
	_fullscreen_button.text = "⛶"
	_fullscreen_button.tooltip_text = "Fullscreen"
	_fullscreen_button.pressed.connect(_request_fullscreen)
	_root.add_child(_fullscreen_button)
	_combat_cluster = _build_action_cluster("Primary")
	_root.add_child(_combat_cluster)
	_action_cluster = _combat_cluster
	_mobile_combat_cluster = _combat_cluster

func _make_zoom_button(label_text: String, delta: float) -> Button:
	var button := Button.new()
	button.text = label_text
	button.mouse_filter = Control.MOUSE_FILTER_STOP
	if delta > 0.0:
		button.pressed.connect(func(): (camera as NavalCameraController).adjust_zoom(delta))
	elif delta < 0.0:
		button.pressed.connect(func(): (camera as NavalCameraController).adjust_zoom(delta))
	else:
		button.pressed.connect(func(): (camera as NavalCameraController).zoom = MockupCompositionProfile.DEFAULT_CAMERA_ZOOM)
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.04, 0.08, 0.1, 0.9)
	style.border_color = Color(0.62, 0.48, 0.24, 0.72)
	style.set_border_width_all(1)
	style.set_corner_radius_all(6)
	button.add_theme_stylebox_override("normal", style)
	button.add_theme_color_override("font_color", Color(0.9, 0.84, 0.68))
	return button

func _request_fullscreen() -> void:
	if OS.get_name() == "Web" and ClassDB.class_exists("JavaScriptBridge"):
		JavaScriptBridge.eval(
			"""(() => {
				const root = document.documentElement;
				if (!document.fullscreenElement) root.requestFullscreen?.();
				else document.exitFullscreen?.();
			})()"""
		)
	elif DisplayServer.window_get_mode() != DisplayServer.WINDOW_MODE_FULLSCREEN:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
	else:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)

func _make_captain_chip() -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	var avatar := PanelContainer.new()
	var avatar_style := StyleBoxFlat.new()
	avatar_style.bg_color = Color(0.18, 0.12, 0.08, 0.95)
	avatar_style.border_color = Color(0.82, 0.64, 0.28, 0.9)
	avatar_style.set_border_width_all(2)
	avatar_style.set_corner_radius_all(24)
	avatar.add_theme_stylebox_override("panel", avatar_style)
	avatar.custom_minimum_size = Vector2(40, 40)
	var avatar_mark := Label.new()
	avatar_mark.text = "☠"
	avatar_mark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	avatar_mark.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	avatar_mark.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	avatar.add_child(avatar_mark)
	row.add_child(avatar)
	var copy := VBoxContainer.new()
	_captain_name = Label.new()
	_captain_name.text = MockupCompositionProfile.HUD_PLAYER_NAME
	_captain_name.add_theme_color_override("font_color", Color(0.94, 0.9, 0.78))
	copy.add_child(_captain_name)
	_captain_level = Label.new()
	_captain_level.text = "Lv. %d" % MockupCompositionProfile.HUD_PLAYER_LEVEL
	_captain_level.add_theme_color_override("font_color", Color(0.82, 0.72, 0.48))
	copy.add_child(_captain_level)
	_guild_label = Label.new()
	_guild_label.text = MockupCompositionProfile.HUD_GUILD_TAG
	_guild_label.add_theme_color_override("font_color", Color(0.72, 0.82, 0.8))
	copy.add_child(_guild_label)
	row.add_child(copy)
	return row

func _make_consumable_slot(icon: String, count: String) -> Button:
	var button := Button.new()
	button.text = "%s\n%s" % [icon, count]
	button.disabled = true
	button.custom_minimum_size = Vector2(44, 44)
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.04, 0.08, 0.1, 0.88)
	style.border_color = Color(0.62, 0.48, 0.24, 0.65)
	style.set_border_width_all(1)
	style.set_corner_radius_all(22)
	button.add_theme_stylebox_override("disabled", style)
	button.add_theme_color_override("font_disabled_color", Color(0.86, 0.8, 0.66))
	return button

func _make_zone_panel() -> PanelContainer:
	var panel := PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.02, 0.05, 0.09, 0.78)
	style.border_color = Color(0.72, 0.57, 0.27, 0.65)
	style.set_border_width_all(1)
	style.set_corner_radius_all(6)
	style.content_margin_left = 6
	style.content_margin_right = 6
	style.content_margin_top = 4
	style.content_margin_bottom = 4
	panel.add_theme_stylebox_override("panel", style)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return panel

func _make_nav_buttons() -> HBoxContainer:
	var row := HBoxContainer.new()
	row.name = "TopNavRow"
	row.add_theme_constant_override("separation", 2)
	for entry in [
		["⛵", "SHIPS", false],
		["⚓", "WERFT", false],
		["✦", "EVENTS", false],
		["◆", "QUESTS", false],
		["🏪", "SHOP", false],
		["⚔", "GUILD", false],
		["💬", "CHAT", false],
		["🏆", "ACHIEV", false],
		["📖", "LOG", false],
		["◎", "RANK", false],
		["✧", "BONUS", false],
		["☰", "MENU", false],
	]:
		row.add_child(_make_nav_button(entry[0], entry[1], entry[2]))
	return row

func _make_nav_button(icon: String, label_text: String, enabled: bool) -> Button:
	var button := Button.new()
	button.text = "%s\n%s" % [icon, label_text]
	button.disabled = not enabled
	button.mouse_filter = Control.MOUSE_FILTER_STOP
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.05, 0.1, 0.12, 0.82 if enabled else 0.35)
	style.border_color = Color(0.72, 0.57, 0.27, 0.55 if enabled else 0.2)
	style.set_border_width_all(1)
	style.set_corner_radius_all(4)
	style.content_margin_left = 2
	style.content_margin_right = 2
	style.content_margin_top = 1
	style.content_margin_bottom = 1
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

func _wrap_status_bar(title: String, bar: ProgressBar, value_var: String) -> VBoxContainer:
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 1)
	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 6)
	var label := Label.new()
	label.text = title
	label.add_theme_color_override("font_color", Color(0.78, 0.72, 0.58))
	header.add_child(label)
	var value_label := Label.new()
	value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	value_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	value_label.add_theme_color_override("font_color", Color(0.86, 0.82, 0.68))
	header.add_child(value_label)
	set(value_var, value_label)
	column.add_child(header)
	bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	column.add_child(bar)
	return column

func _make_currency_label(text: String) -> Label:
	var label := Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	label.add_theme_color_override("font_color", Color(0.92, 0.82, 0.48))
	return label

func _build_action_cluster(suffix: String) -> Control:
	var cluster := Control.new()
	cluster.name = "CombatCluster%s" % suffix
	cluster.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var fire := Button.new()
	fire.text = "🔥\nFEUER"
	fire.disabled = true
	fire.name = "FireButton"
	var fire_style := StyleBoxFlat.new()
	fire_style.bg_color = Color(0.45, 0.18, 0.1, 0.72)
	fire_style.border_color = Color(0.92, 0.62, 0.22, 0.85)
	fire_style.set_border_width_all(3)
	fire_style.set_corner_radius_all(48)
	fire.add_theme_stylebox_override("disabled", fire_style)
	fire.add_theme_color_override("font_disabled_color", Color(0.92, 0.84, 0.72))
	cluster.add_child(fire)
	for ability in ["8", "14", "11"]:
		var ability_button := Button.new()
		ability_button.text = ability
		ability_button.disabled = true
		ability_button.name = "Ability%s" % ability
		var ability_style := StyleBoxFlat.new()
		ability_style.bg_color = Color(0.08, 0.14, 0.22, 0.78)
		ability_style.border_color = Color(0.42, 0.62, 0.92, 0.72)
		ability_style.set_border_width_all(2)
		ability_style.set_corner_radius_all(22)
		ability_button.add_theme_stylebox_override("disabled", ability_style)
		cluster.add_child(ability_button)
	var shield := Button.new()
	shield.text = "🛡"
	shield.disabled = true
	shield.name = "ShieldButton"
	cluster.add_child(shield)
	var ammo := Button.new()
	ammo.text = "⚫⚫⚫"
	ammo.disabled = true
	ammo.name = "AmmoButton"
	cluster.add_child(ammo)
	return cluster

func _fit_control(control: Control) -> Vector2:
	if control == null:
		return Vector2.ZERO
	var min_size := control.get_combined_minimum_size()
	control.custom_minimum_size = min_size
	control.size = min_size
	return min_size

func _apply_responsive_layout() -> void:
	var viewport := get_viewport().get_visible_rect().size
	var safe := PlatformService.safe_rect(viewport)
	var profile := HudLayoutProfile.detect(viewport)
	var landscape_mobile := profile == HudLayoutProfile.Profile.MOBILE_LANDSCAPE
	var margin := HudLayout.panel_margin(viewport)
	_nav_row.visible = true
	_chat_panel.visible = true
	_menu_button.visible = false
	_action_cluster.visible = true
	_mobile_combat_cluster.visible = true
	var status_font := HudLayout.font_size(viewport, 12.0 if landscape_mobile else 11.0, HudLayout.Semantic.PLAYER_STATUS)
	_captain_name.add_theme_font_size_override("font_size", status_font)
	_guild_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.PLAYER_STATUS))
	_captain_level.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.PLAYER_STATUS))
	_mission_heading.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.MISSION))
	_mission_title.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 13.0 if landscape_mobile else 12.0, HudLayout.Semantic.MISSION))
	_mission_objective.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.MISSION))
	_gold_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.PLAYER_STATUS))
	_iron_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.PLAYER_STATUS))
	_pearl_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.PLAYER_STATUS))
	var status_bar_w := HudLayoutProfile.length(viewport, HudLayoutProfile.RATIO_STATUS_BAR_W, "x")
	var status_bar_h := 7.0 if landscape_mobile else 6.0
	_exp_bar.custom_minimum_size = Vector2(status_bar_w, status_bar_h)
	_hull_bar.custom_minimum_size = Vector2(status_bar_w, status_bar_h)
	_shield_bar.custom_minimum_size = Vector2(status_bar_w, status_bar_h)
	_mission_progress.custom_minimum_size = Vector2(status_bar_w * 0.72, status_bar_h)
	_mission_objective.custom_minimum_size.x = HudLayoutProfile.length(viewport, HudLayoutProfile.RATIO_MISSION_W, "x")
	var value_font := HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.PLAYER_STATUS)
	for value_label in [_exp_value, _hull_value, _shield_value]:
		if value_label != null:
			value_label.add_theme_font_size_override("font_size", value_font)
	_target_name.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 11.0, HudLayout.Semantic.TARGET_STATUS))
	_target_level.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.TARGET_STATUS))
	_target_hp.custom_minimum_size.y = status_bar_h
	var nav_size := Vector2(
		HudLayout.touch_size(viewport, 30.0 if landscape_mobile else 38.0, HudLayout.Semantic.NAVIGATION),
		HudLayout.touch_size(viewport, 26.0 if landscape_mobile else 34.0, HudLayout.Semantic.NAVIGATION)
	)
	for nav_button in _nav_row.get_children():
		if nav_button is Button:
			nav_button.custom_minimum_size = nav_size
			nav_button.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 5.0 if landscape_mobile else 6.0, HudLayout.Semantic.NAVIGATION))
	var profile_size := _fit_control(_profile_zone)
	_profile_zone.position = Vector2(safe.position.x + margin, safe.position.y + margin)
	var status_size := _fit_control(_status_zone)
	var status_x := safe.position.x + safe.size.x * 0.5 - status_size.x * 0.5
	_status_zone.position = Vector2(status_x, safe.position.y + margin)
	var nav_size_fit := _fit_control(_nav_row)
	_nav_row.position = Vector2(safe.end.x - nav_size_fit.x - margin, safe.position.y + margin)
	var currency := _root.get_node_or_null("CurrencyStack") as VBoxContainer
	if currency != null:
		var currency_size := _fit_control(currency)
		currency.position = Vector2(
			_profile_zone.position.x,
			_profile_zone.position.y + profile_size.y + 4.0
		)
		currency.visible = not landscape_mobile
	var mission_size := _fit_control(_mission_panel)
	_mission_panel.position = Vector2(
		safe.position.x + margin,
		_profile_zone.position.y + profile_size.y + (28.0 if landscape_mobile else 52.0)
	)
	_target_panel.position = Vector2(safe.position.x + safe.size.x * 0.5 - mission_size.x * 0.5, _mission_panel.position.y)
	_target_panel.custom_minimum_size = Vector2(mission_size.x * 0.75, mission_size.y * 0.75)
	var chat_w := HudLayoutProfile.length(viewport, HudLayoutProfile.RATIO_CHAT_W, "x")
	_chat_panel.custom_minimum_size.x = chat_w
	var chat_size := _fit_control(_chat_panel)
	var consumable_size := HudLayout.touch_size(viewport, 46.0 if landscape_mobile else 40.0, HudLayout.Semantic.SECONDARY_ACTION)
	for slot in _consumables_row.get_children():
		if slot is Button:
			slot.custom_minimum_size = Vector2(consumable_size, consumable_size)
			slot.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.SECONDARY_ACTION))
	var consumable_row_size := _fit_control(_consumables_row)
	_consumables_row.position = Vector2(
		safe.position.x + safe.size.x * 0.5 - consumable_row_size.x * 0.5,
		safe.end.y - consumable_row_size.y - margin
	)
	_chat_panel.position = Vector2(
		safe.position.x + margin,
		safe.end.y - consumable_row_size.y - margin - chat_size.y - 6.0
	)
	_chat_preview.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.CHAT))
	var zoom_w := HudLayoutProfile.touch_floor(viewport, HudLayoutProfile.RATIO_ZOOM_W, "x")
	_zoom_panel.custom_minimum_size = Vector2(zoom_w, zoom_w * 2.8)
	for child in _zoom_panel.get_child(0).get_children():
		if child is Button:
			child.custom_minimum_size = Vector2(zoom_w - 6.0, zoom_w - 2.0)
			child.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 11.0, HudLayout.Semantic.ZOOM))
	var zoom_size := _fit_control(_zoom_panel)
	_zoom_panel.position = Vector2(
		safe.position.x + margin,
		_mission_panel.position.y + mission_size.y + 8.0
	)
	var fs_size := HudLayout.touch_size(viewport, 36.0, HudLayout.Semantic.NAVIGATION)
	_fullscreen_button.custom_minimum_size = Vector2(fs_size, fs_size)
	_fullscreen_button.position = Vector2(safe.end.x - fs_size - margin, safe.position.y + margin + nav_size_fit.y + 4.0)
	_fullscreen_button.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 14.0, HudLayout.Semantic.NAVIGATION))
	_layout_combat_cluster(_combat_cluster, viewport, safe, landscape_mobile)

func _layout_combat_cluster(cluster: Control, viewport: Vector2, safe: Rect2, landscape_mobile: bool) -> void:
	if cluster == null:
		return
	var fire_size := HudLayoutProfile.touch_floor(viewport, HudLayoutProfile.RATIO_FIRE_D)
	var fire := cluster.get_node_or_null("FireButton") as Button
	if fire != null:
		fire.custom_minimum_size = Vector2(fire_size, fire_size)
		fire.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.PRIMARY_ACTION))
		fire.position = Vector2.ZERO
	var ability_offsets := [-fire_size * 0.72, 0.0, fire_size * 0.72]
	var ability_names := ["Ability8", "Ability14", "Ability11"]
	for index in ability_names.size():
		var ability := cluster.get_node_or_null(ability_names[index]) as Button
		if ability != null:
			var ability_size := HudLayoutProfile.touch_floor(viewport, HudLayoutProfile.RATIO_ABILITY_D)
			ability.custom_minimum_size = Vector2(ability_size, ability_size)
			ability.position = Vector2(ability_offsets[index] - ability_size * 0.5, -ability_size * 1.05)
	var shield := cluster.get_node_or_null("ShieldButton") as Button
	if shield != null:
		var utility_size := HudLayoutProfile.touch_floor(viewport, HudLayoutProfile.RATIO_ABILITY_D)
		shield.custom_minimum_size = Vector2(utility_size, utility_size)
		shield.position = Vector2(-fire_size * 0.82, fire_size * 0.18)
	var ammo := cluster.get_node_or_null("AmmoButton") as Button
	if ammo != null:
		var utility_size := HudLayoutProfile.touch_floor(viewport, HudLayoutProfile.RATIO_ABILITY_D)
		ammo.custom_minimum_size = Vector2(utility_size, utility_size)
		ammo.position = Vector2(-fire_size * 0.82, fire_size * 0.58)
	var cluster_pad := fire_size * 0.55
	cluster.position = Vector2(safe.end.x - cluster_pad, safe.end.y - cluster_pad)

func _refresh_status() -> void:
	var ship_id := str(GameState.save_data.get("shipId", "sovereign"))
	var ship_data: Dictionary = GameState.catalog.get("ships", {}).get(ship_id, {})
	var hp := float(ship_data.get("hp", MockupCompositionProfile.HUD_RUMPF_MAX))
	var shield := float(ship_data.get("shield", MockupCompositionProfile.HUD_SCHUTZ_MAX))
	_hull_bar.max_value = MockupCompositionProfile.HUD_RUMPF_MAX
	_hull_bar.value = MockupCompositionProfile.HUD_RUMPF_CURRENT
	_shield_bar.max_value = MockupCompositionProfile.HUD_SCHUTZ_MAX
	_shield_bar.value = MockupCompositionProfile.HUD_SCHUTZ_CURRENT
	_exp_bar.max_value = MockupCompositionProfile.HUD_EXP_MAX
	_exp_bar.value = MockupCompositionProfile.HUD_EXP_CURRENT
	_exp_value.text = "%s / %s" % [_format_status(MockupCompositionProfile.HUD_EXP_CURRENT), _format_status(MockupCompositionProfile.HUD_EXP_MAX)]
	_hull_value.text = "%s / %s" % [_format_status(MockupCompositionProfile.HUD_RUMPF_CURRENT), _format_status(MockupCompositionProfile.HUD_RUMPF_MAX)]
	_shield_value.text = "%s / %s" % [_format_status(MockupCompositionProfile.HUD_SCHUTZ_CURRENT), _format_status(MockupCompositionProfile.HUD_SCHUTZ_MAX)]
	_gold_label.text = "🪙 %s" % _format_number(int(GameState.save_data.get("gold", 815600)))
	_iron_label.text = "⚙ %s" % _format_number(int(GameState.save_data.get("iron", 12400)))
	_pearl_label.text = "◆ %s" % _format_number(int(GameState.save_data.get("pearls", 3250)))

func _refresh_target() -> void:
	var target := TargetingSystem.current_target
	if target == null or not target is ShipEntity:
		_target_panel.visible = false
		return
	var ship := target as ShipEntity
	_target_panel.visible = true
	_target_name.text = ship.display_name().to_upper()
	if ship is NpcShip and (ship as NpcShip).npc_definition != null:
		_target_level.text = "LV %d" % (ship as NpcShip).npc_definition.level
	else:
		_target_level.text = ""
	if ship.health != null:
		_target_hp.max_value = ship.health.max_health
		_target_hp.value = ship.health.current_health

func _format_status(value: float) -> String:
	var whole := int(value)
	var text := str(whole)
	if whole >= 1000:
		var parts: PackedStringArray = []
		var remaining := text
		while remaining.length() > 3:
			parts.insert(0, remaining.substr(remaining.length() - 3, 3))
			remaining = remaining.substr(0, remaining.length() - 3)
		parts.insert(0, remaining)
		text = ".".join(parts)
	return text

func _format_number(value: int) -> String:
	if value >= 1000000:
		return "%.1fM" % (float(value) / 1000000.0)
	if value >= 1000:
		return "%.1fK" % (float(value) / 1000.0)
	return str(value)
