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
var _left_status: PanelContainer
var _mission_panel: PanelContainer
var _target_panel: PanelContainer
var _bottom_dock: PanelContainer
var _chat_panel: PanelContainer
var _action_cluster: Control
var _mobile_combat_cluster: Control
var _nav_row: HBoxContainer
var _menu_button: Button
var _hull_bar: ProgressBar
var _hp_bar: ProgressBar
var _shield_bar: ProgressBar
var _exp_bar: ProgressBar
var _gold_label: Label
var _iron_label: Label
var _pearl_label: Label
var _mission_title: Label
var _mission_heading: Label
var _mission_objective: Label
var _mission_progress: ProgressBar
var _region_label: Label
var _captain_name: Label
var _captain_level: Label
var _guild_label: Label
var _target_name: Label
var _target_level: Label
var _target_hp: ProgressBar
var _chat_preview: Label

func _ready() -> void:
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
	_left_status = _make_panel()
	_root.add_child(_left_status)
	var left_stack := VBoxContainer.new()
	left_stack.add_theme_constant_override("separation", 4)
	_left_status.add_child(left_stack)
	_exp_bar = _make_bar(Color(0.28, 0.52, 0.95))
	left_stack.add_child(_wrap_labeled_bar("EXP", _exp_bar))
	_hp_bar = _make_bar(Color(0.35, 0.88, 0.48))
	left_stack.add_child(_wrap_labeled_bar("HP", _hp_bar))
	_top_bar = _make_panel()
	_root.add_child(_top_bar)
	var top_row := HBoxContainer.new()
	top_row.add_theme_constant_override("separation", 8)
	_top_bar.add_child(top_row)
	top_row.add_child(_make_captain_chip())
	var bars := VBoxContainer.new()
	bars.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bars.add_theme_constant_override("separation", 4)
	var hull_bar := _make_bar(Color(0.78, 0.22, 0.2))
	_hull_bar = hull_bar
	_shield_bar = _make_bar(Color(0.28, 0.72, 0.95))
	bars.add_child(_wrap_labeled_bar("RUMPF", hull_bar))
	bars.add_child(_wrap_labeled_bar("SCHUTZ", _shield_bar))
	top_row.add_child(bars)
	_nav_row = _make_nav_buttons()
	top_row.add_child(_nav_row)
	var currency := VBoxContainer.new()
	currency.add_theme_constant_override("separation", 2)
	_gold_label = _make_currency_label("🪙 815.6K")
	_iron_label = _make_currency_label("⚙ 12.4K")
	_pearl_label = _make_currency_label("◆ 3,250")
	currency.add_child(_gold_label)
	currency.add_child(_iron_label)
	currency.add_child(_pearl_label)
	top_row.add_child(currency)
	_menu_button = Button.new()
	_menu_button.text = "☰"
	_menu_button.disabled = true
	_menu_button.tooltip_text = "Menü"
	top_row.add_child(_menu_button)
	_mission_panel = _make_panel()
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
	_mission_progress.value = 0.35
	mission_box.add_child(_mission_progress)
	_target_panel = _make_panel()
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
	_bottom_dock = _make_panel()
	_root.add_child(_bottom_dock)
	var dock_row := HBoxContainer.new()
	dock_row.add_theme_constant_override("separation", 8)
	_bottom_dock.add_child(dock_row)
	dock_row.add_child(_make_consumable_slot("🛢", "32"))
	dock_row.add_child(_make_consumable_slot("🧪", "21"))
	dock_row.add_child(_make_consumable_slot("💣", "18"))
	dock_row.add_child(_make_consumable_slot("💧", "24"))
	var region_box := VBoxContainer.new()
	region_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_region_label = Label.new()
	_region_label.text = MockupCompositionProfile.HUD_REGION_LABEL
	_region_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_region_label.add_theme_color_override("font_color", Color(0.92, 0.84, 0.62))
	region_box.add_child(_region_label)
	dock_row.add_child(region_box)
	dock_row.add_child(_make_utility_button("⚓"))
	dock_row.add_child(_make_utility_button("🔧"))
	_chat_panel = _make_panel()
	_root.add_child(_chat_panel)
	_chat_preview = Label.new()
	_chat_preview.text = "[Guild] CaptainX: Forming raid on Kraken!"
	_chat_preview.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_chat_preview.add_theme_color_override("font_color", Color(0.72, 0.78, 0.82))
	_chat_panel.add_child(_chat_preview)
	_action_cluster = _build_action_cluster("Desktop")
	_root.add_child(_action_cluster)
	_mobile_combat_cluster = _build_action_cluster("Mobile")
	_root.add_child(_mobile_combat_cluster)

func _make_captain_chip() -> PanelContainer:
	var panel := _make_panel()
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	panel.add_child(row)
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
	_guild_label = Label.new()
	_guild_label.text = MockupCompositionProfile.HUD_GUILD_TAG
	_guild_label.add_theme_color_override("font_color", Color(0.72, 0.82, 0.8))
	copy.add_child(_guild_label)
	_captain_level = Label.new()
	_captain_level.text = "LV %d" % MockupCompositionProfile.HUD_PLAYER_LEVEL
	_captain_level.add_theme_color_override("font_color", Color(0.82, 0.72, 0.48))
	copy.add_child(_captain_level)
	row.add_child(copy)
	return panel

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

func _make_utility_button(icon: String) -> Button:
	var button := Button.new()
	button.text = icon
	button.disabled = true
	button.custom_minimum_size = Vector2(40, 40)
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.04, 0.08, 0.1, 0.88)
	style.border_color = Color(0.62, 0.48, 0.24, 0.65)
	style.set_border_width_all(1)
	style.set_corner_radius_all(20)
	button.add_theme_stylebox_override("disabled", style)
	return button

func _make_panel() -> PanelContainer:
	var panel := PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.02, 0.05, 0.09, 0.82)
	style.border_color = Color(0.72, 0.57, 0.27, 0.72)
	style.set_border_width_all(2)
	style.set_corner_radius_all(6)
	style.content_margin_left = 8
	style.content_margin_right = 8
	style.content_margin_top = 6
	style.content_margin_bottom = 6
	panel.add_theme_stylebox_override("panel", style)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return panel

func _make_nav_buttons() -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 3)
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
	row.add_theme_constant_override("separation", 6)
	var label := Label.new()
	label.text = title
	label.add_theme_color_override("font_color", Color(0.78, 0.72, 0.58))
	row.add_child(label)
	bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(bar)
	return row

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

func _apply_responsive_layout() -> void:
	var viewport := get_viewport().get_visible_rect().size
	var safe := PlatformService.safe_rect(viewport)
	var mobile := HudLayout.is_mobile_layout(viewport)
	var status_scale := HudLayout.semantic_scale(viewport, HudLayout.Semantic.PLAYER_STATUS)
	var mission_scale := HudLayout.semantic_scale(viewport, HudLayout.Semantic.MISSION)
	var margin := HudLayout.panel_margin(viewport)
	var top_height := 64.0 * status_scale
	_top_bar.position = Vector2(safe.position.x + margin, safe.position.y + margin)
	_top_bar.size = Vector2(safe.size.x, top_height)
	_top_bar.custom_minimum_size = Vector2(safe.size.x, top_height)
	_left_status.position = Vector2(safe.position.x + margin, safe.position.y + margin + top_height + 6.0)
	_left_status.custom_minimum_size = Vector2(118.0 * status_scale, 52.0 * status_scale)
	_left_status.visible = not mobile
	_mission_panel.position = Vector2(
		safe.position.x + margin + (0.0 if mobile else 126.0 * status_scale),
		safe.position.y + margin + top_height + 6.0
	)
	_mission_panel.custom_minimum_size = Vector2(240.0 * mission_scale, 78.0 * mission_scale)
	_target_panel.position = Vector2(safe.position.x + safe.size.x * 0.5 - 90.0 * mission_scale, safe.position.y + margin + top_height + 6.0)
	_target_panel.custom_minimum_size = Vector2(180.0 * mission_scale, 58.0 * mission_scale)
	_nav_row.visible = not mobile
	_menu_button.visible = mobile
	_action_cluster.visible = not mobile
	_mobile_combat_cluster.visible = mobile
	_captain_name.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 12.0, HudLayout.Semantic.PLAYER_STATUS))
	_guild_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.PLAYER_STATUS))
	_captain_level.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.PLAYER_STATUS))
	_mission_heading.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.MISSION))
	_mission_title.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 13.0, HudLayout.Semantic.MISSION))
	_mission_objective.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.MISSION))
	_gold_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.PLAYER_STATUS))
	_iron_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.PLAYER_STATUS))
	_pearl_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.PLAYER_STATUS))
	_hp_bar.custom_minimum_size = Vector2(88.0 * status_scale, 6.0 * status_scale)
	_hull_bar.custom_minimum_size = Vector2(120.0 * status_scale, 8.0 * status_scale)
	_shield_bar.custom_minimum_size = Vector2(120.0 * status_scale, 6.0 * status_scale)
	_exp_bar.custom_minimum_size = Vector2(88.0 * status_scale, 6.0 * status_scale)
	_mission_progress.custom_minimum_size.y = 8.0 * mission_scale
	_target_name.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 12.0, HudLayout.Semantic.TARGET_STATUS))
	_target_level.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.TARGET_STATUS))
	_target_hp.custom_minimum_size.y = 7.0 * mission_scale
	for nav_button in _nav_row.get_children():
		if nav_button is Button:
			nav_button.custom_minimum_size = Vector2(46.0 * status_scale, 42.0 * status_scale)
			nav_button.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 7.0, HudLayout.Semantic.NAVIGATION))
	var dock_height := 54.0 * status_scale
	_bottom_dock.position = Vector2(safe.position.x + safe.size.x * 0.5 - 220.0 * status_scale, safe.end.y - dock_height - margin)
	_bottom_dock.custom_minimum_size = Vector2(440.0 * status_scale, dock_height)
	_region_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 12.0, HudLayout.Semantic.REGION))
	_chat_panel.position = Vector2(safe.position.x + margin, safe.end.y - dock_height - margin - 52.0 * status_scale)
	_chat_panel.custom_minimum_size = Vector2(280.0 * status_scale, 44.0 * status_scale)
	_chat_panel.visible = not mobile
	_chat_preview.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.NAVIGATION))
	_layout_combat_cluster(_action_cluster, viewport, safe, false)
	_layout_combat_cluster(_mobile_combat_cluster, viewport, safe, true)

func _layout_combat_cluster(cluster: Control, viewport: Vector2, safe: Rect2, mobile: bool) -> void:
	if not cluster.visible:
		return
	var fire := cluster.get_node_or_null("FireButton") as Button
	if fire != null:
		var fire_size := HudLayout.touch_size(viewport, 76.0 if mobile else 92.0, HudLayout.Semantic.PRIMARY_ACTION)
		fire.custom_minimum_size = Vector2(fire_size, fire_size)
		fire.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.PRIMARY_ACTION))
		fire.position = Vector2.ZERO
	var ability_offsets := [-56.0, 0.0, 56.0]
	var ability_names := ["Ability8", "Ability14", "Ability11"]
	for index in ability_names.size():
		var ability := cluster.get_node_or_null(ability_names[index]) as Button
		if ability != null:
			var ability_size := HudLayout.touch_size(viewport, 38.0 if mobile else 42.0, HudLayout.Semantic.SECONDARY_ACTION)
			ability.custom_minimum_size = Vector2(ability_size, ability_size)
			ability.position = Vector2(ability_offsets[index] - ability_size * 0.5, -52.0)
	var shield := cluster.get_node_or_null("ShieldButton") as Button
	if shield != null:
		var utility_size := HudLayout.touch_size(viewport, 36.0, HudLayout.Semantic.SECONDARY_ACTION)
		shield.custom_minimum_size = Vector2(utility_size, utility_size)
		shield.position = Vector2(-58.0, 18.0)
	var ammo := cluster.get_node_or_null("AmmoButton") as Button
	if ammo != null:
		var utility_size := HudLayout.touch_size(viewport, 36.0, HudLayout.Semantic.SECONDARY_ACTION)
		ammo.custom_minimum_size = Vector2(utility_size, utility_size)
		ammo.position = Vector2(-58.0, 58.0)
	cluster.position = Vector2(safe.end.x - (86.0 if mobile else 108.0), safe.end.y - (92.0 if mobile else 108.0))

func _refresh_status() -> void:
	var ship_id := str(GameState.save_data.get("shipId", "sovereign"))
	var ship_data: Dictionary = GameState.catalog.get("ships", {}).get(ship_id, {})
	var hp := float(ship_data.get("hp", 1450.0))
	var shield := float(ship_data.get("shield", 375.0))
	_hp_bar.max_value = hp
	_hp_bar.value = hp
	_hull_bar.max_value = hp
	_hull_bar.value = hp
	_shield_bar.max_value = shield
	_shield_bar.value = shield
	_exp_bar.max_value = 1.0
	_exp_bar.value = 0.85
	_gold_label.text = "🪙 %s" % _format_number(int(GameState.save_data.get("gold", 815600)))
	_iron_label.text = "⚙ %s" % _format_number(int(GameState.save_data.get("iron", 12400)))
	_pearl_label.text = "◆ %s" % _format_number(int(GameState.save_data.get("pearls", 3250)))
	_region_label.text = MockupCompositionProfile.HUD_REGION_LABEL

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

func _format_number(value: int) -> String:
	if value >= 1000000:
		return "%.1fM" % (float(value) / 1000000.0)
	if value >= 1000:
		return "%.1fK" % (float(value) / 1000.0)
	return str(value)
