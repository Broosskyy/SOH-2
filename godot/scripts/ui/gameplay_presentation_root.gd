class_name GameplayPresentationRoot
extends CanvasLayer

@export var player_path: NodePath
@export var camera_path: NodePath
@export var region_runtime_path: NodePath

@onready var player: PlayerShip = get_node(player_path)
@onready var camera: NavalCameraController = get_node(camera_path)
@onready var region_runtime: Node = get_node(region_runtime_path)

var _root: Control
var _zones: Dictionary = {}
var _last_logical := Vector2.ZERO
var _last_scale := 1.0
var _last_nav_phone := false

var _profile: PanelContainer
var _status: PanelContainer
var _nav: HBoxContainer
var _currency: HBoxContainer
var _mission: PanelContainer
var _target: PanelContainer
var _chat: PanelContainer
var _zoom: VBoxContainer
var _consumables: HBoxContainer
var _combat: Control
var _fullscreen: Button
var _minimap: Minimap

var _exp_bar: ProgressBar
var _hull_bar: ProgressBar
var _shield_bar: ProgressBar
var _exp_value: Label
var _hull_value: Label
var _shield_value: Label
var _captain_name: Label
var _captain_level: Label
var _guild_label: Label
var _gold_label: Label
var _pearl_label: Label
var _xp_label: Label
var _mission_title: Label
var _mission_objective: Label
var _mission_progress: ProgressBar
var _target_name: Label
var _target_level: Label
var _target_hp: ProgressBar
var _chat_preview: Label

const PHONE_NAV_PRIORITY := [
	["S", "SHIPS"], ["W", "WERFT"], ["E", "EVENTS"], ["Q", "QUESTS"],
	["G", "GUILD"], ["C", "CHAT"], ["M", "MENU"],
]
const DESKTOP_NAV := [
	["S", "SHIPS"], ["W", "WERFT"], ["E", "EVENTS"], ["Q", "QUESTS"],
	["P", "SHOP"], ["G", "GUILD"], ["C", "CHAT"], ["A", "ACHIEV"],
	["L", "LOG"], ["R", "RANK"], ["B", "BONUS"], ["M", "MENU"],
]

func _ready() -> void:
	add_to_group("gameplay_presentation_root")
	layer = 5
	scale = Vector2.ONE
	_build()
	_refresh()
	TargetingSystem.target_changed.connect(func(_t): _refresh_target())
	TargetingSystem.target_cleared.connect(func(): _refresh_target())
	get_viewport().size_changed.connect(_on_viewport_changed)
	if OS.get_name() == "Web":
		WebViewportContract.presentation_resized.connect(_on_viewport_changed)
	call_deferred("_on_viewport_changed")

func _process(_delta: float) -> void:
	if Engine.get_frames_drawn() % 15 == 0:
		_refresh()
		_refresh_target()

func _on_viewport_changed() -> void:
	var logical := ResponsiveHudMetrics.logical_ui_viewport_size(self)
	var pscale := ResponsiveHudMetrics.presentation_scale_uniform(self)
	if logical == _last_logical and is_equal_approx(pscale, _last_scale):
		return
	_last_logical = logical
	_last_scale = pscale
	_apply_presentation_transform(logical, pscale)
	_apply_layout(logical)

func _apply_presentation_transform(logical: Vector2, pscale: float) -> void:
	scale = Vector2.ONE
	_root.position = Vector2.ZERO
	_root.custom_minimum_size = logical
	_root.size = logical
	_root.scale = Vector2.ONE * pscale

func _build() -> void:
	_root = Control.new()
	_root.name = "PresentationRoot"
	_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.scale = Vector2.ONE
	add_child(_root)
	_zones["profile"] = _make_zone("ProfileZone")
	_zones["status"] = _make_zone("StatusZone")
	_zones["nav"] = _make_zone("NavZone")
	_zones["currency"] = _make_zone("CurrencyZone")
	_zones["mission"] = _make_zone("MissionZone")
	_zones["minimap"] = _make_zone("MinimapZone")
	_zones["zoom"] = _make_zone("ZoomZone")
	_zones["chat"] = _make_zone("ChatZone")
	_zones["consumables"] = _make_zone("ConsumablesZone")
	_zones["combat"] = _make_zone("CombatZone")
	_zones["fullscreen"] = _make_zone("FullscreenZone")
	_zones["target"] = _make_zone("TargetZone")
	_profile = _panel()
	_profile.add_child(_build_profile())
	_zones["profile"].add_child(_profile)
	_status = _panel()
	_status.add_child(_build_status())
	_zones["status"].add_child(_status)
	_nav = _build_nav()
	_zones["nav"].add_child(_nav)
	_currency = _build_currency()
	_zones["currency"].add_child(_currency)
	_mission = _panel()
	_mission.add_child(_build_mission())
	_zones["mission"].add_child(_mission)
	_target = _panel()
	_target.visible = false
	_target.add_child(_build_target())
	_zones["target"].add_child(_target)
	_chat = _panel()
	_chat.add_child(_build_chat())
	_zones["chat"].add_child(_chat)
	_zoom = _build_zoom()
	_zones["zoom"].add_child(_zoom)
	_consumables = _build_consumables()
	_zones["consumables"].add_child(_consumables)
	_combat = _build_combat()
	_zones["combat"].add_child(_combat)
	_fullscreen = Button.new()
	_fullscreen.text = "FS"
	_fullscreen.tooltip_text = "Fullscreen"
	_fullscreen.pressed.connect(_toggle_fullscreen)
	_zones["fullscreen"].add_child(_fullscreen)
	_minimap = Minimap.new()
	_minimap.region_runtime_path = region_runtime.get_path()
	_minimap.player_path = player.get_path()
	_minimap.mouse_filter = Control.MOUSE_FILTER_STOP
	_zones["minimap"].add_child(_minimap)

func _make_zone(name: String) -> Control:
	var zone := Control.new()
	zone.name = name
	zone.scale = Vector2.ONE
	zone.mouse_filter = Control.MOUSE_FILTER_IGNORE
	zone.set_script(load("res://scripts/ui/hud_zone.gd"))
	_root.add_child(zone)
	return zone

func _panel() -> PanelContainer:
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", PresentationTheme.glass_panel())
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	return panel

func _build_profile() -> HBoxContainer:
	var row := HBoxContainer.new()
	row.name = "ProfileRow"
	row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	row.add_theme_constant_override("separation", 6)
	var avatar := PanelContainer.new()
	avatar.name = "Avatar"
	avatar.add_theme_stylebox_override("panel", PresentationTheme.round_button(18.0))
	var mark := Label.new()
	mark.text = "SK"
	mark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	mark.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	mark.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	avatar.add_child(mark)
	row.add_child(avatar)
	var copy := VBoxContainer.new()
	copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	copy.add_theme_constant_override("separation", 0)
	_captain_name = Label.new()
	_captain_name.text = MockupCompositionProfile.HUD_PLAYER_NAME
	_captain_name.add_theme_color_override("font_color", PresentationTheme.label_color("name"))
	copy.add_child(_captain_name)
	_captain_level = Label.new()
	_captain_level.text = "Lv. %d" % MockupCompositionProfile.HUD_PLAYER_LEVEL
	_captain_level.add_theme_color_override("font_color", PresentationTheme.label_color("gold"))
	copy.add_child(_captain_level)
	_guild_label = Label.new()
	_guild_label.text = MockupCompositionProfile.HUD_GUILD_TAG
	_guild_label.add_theme_color_override("font_color", PresentationTheme.label_color("guild"))
	copy.add_child(_guild_label)
	row.add_child(copy)
	return row

func _build_status() -> VBoxContainer:
	var stack := VBoxContainer.new()
	stack.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	stack.add_theme_constant_override("separation", 2)
	_exp_bar = _bar(Color(0.28, 0.52, 0.95))
	stack.add_child(_status_row("EXP", _exp_bar, "_exp_value"))
	_hull_bar = _bar(Color(0.78, 0.22, 0.2))
	stack.add_child(_status_row("RUMPF", _hull_bar, "_hull_value"))
	_shield_bar = _bar(Color(0.28, 0.72, 0.95))
	stack.add_child(_status_row("SCHUTZ", _shield_bar, "_shield_value"))
	return stack

func _status_row(title: String, bar: ProgressBar, value_var: String) -> VBoxContainer:
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 1)
	var header := HBoxContainer.new()
	var label := Label.new()
	label.text = title
	label.add_theme_color_override("font_color", PresentationTheme.label_color("muted"))
	header.add_child(label)
	var value := Label.new()
	value.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	value.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	value.add_theme_color_override("font_color", PresentationTheme.label_color())
	header.add_child(value)
	set(value_var, value)
	col.add_child(header)
	bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	col.add_child(bar)
	return col

func _build_nav() -> HBoxContainer:
	var row := HBoxContainer.new()
	row.name = "TopNavRow"
	row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	row.add_theme_constant_override("separation", 1)
	for entry in DESKTOP_NAV:
		row.add_child(_nav_btn(entry[0], entry[1]))
	return row

func _rebuild_nav(viewport: Vector2) -> void:
	var is_phone := ResponsiveHudMetrics.detect_profile(viewport) == ResponsiveHudMetrics.Profile.PHONE_LANDSCAPE
	if is_phone == _last_nav_phone and _nav.get_child_count() > 0:
		return
	_last_nav_phone = is_phone
	for child in _nav.get_children():
		child.queue_free()
	var entries := PHONE_NAV_PRIORITY if is_phone else DESKTOP_NAV
	for entry in entries:
		_nav.add_child(_nav_btn(entry[0], entry[1], is_phone))

func _nav_btn(icon: String, label_text: String, compact := false) -> Button:
	var button := Button.new()
	button.text = label_text if compact else "%s\n%s" % [icon, label_text]
	button.disabled = true
	button.tooltip_text = "Coming soon"
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.add_theme_stylebox_override("normal", PresentationTheme.nav_button(false))
	button.add_theme_stylebox_override("disabled", PresentationTheme.nav_button(false))
	button.add_theme_color_override("font_disabled_color", Color(0.55, 0.58, 0.56))
	return button

func _build_currency() -> HBoxContainer:
	var row := HBoxContainer.new()
	row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	row.add_theme_constant_override("separation", 4)
	_gold_label = Label.new()
	_gold_label.add_theme_color_override("font_color", PresentationTheme.label_color("gold"))
	row.add_child(_gold_label)
	_xp_label = Label.new()
	_xp_label.add_theme_color_override("font_color", PresentationTheme.label_color("gold"))
	row.add_child(_xp_label)
	_pearl_label = Label.new()
	_pearl_label.add_theme_color_override("font_color", PresentationTheme.label_color("gold"))
	row.add_child(_pearl_label)
	return row

func _build_mission() -> HBoxContainer:
	var row := HBoxContainer.new()
	row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	row.add_theme_constant_override("separation", 8)
	var icon := Label.new()
	icon.text = "*"
	icon.add_theme_color_override("font_color", Color(0.82, 0.45, 0.32))
	row.add_child(icon)
	var copy := VBoxContainer.new()
	copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	copy.add_theme_constant_override("separation", 1)
	var heading := Label.new()
	heading.text = "AKTIVE MISSION"
	heading.add_theme_color_override("font_color", PresentationTheme.label_color("mission"))
	copy.add_child(heading)
	_mission_title = Label.new()
	_mission_title.text = MockupCompositionProfile.HUD_MISSION_TITLE
	_mission_title.add_theme_color_override("font_color", PresentationTheme.label_color("name"))
	copy.add_child(_mission_title)
	_mission_objective = Label.new()
	_mission_objective.text = MockupCompositionProfile.HUD_MISSION_OBJECTIVE
	_mission_objective.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_mission_objective.max_lines_visible = 2
	_mission_objective.clip_text = true
	_mission_objective.add_theme_color_override("font_color", PresentationTheme.label_color("muted"))
	copy.add_child(_mission_objective)
	_mission_progress = _bar(Color(0.78, 0.38, 0.22))
	_mission_progress.max_value = 1.0
	copy.add_child(_mission_progress)
	row.add_child(copy)
	return row

func _build_target() -> HBoxContainer:
	var row := HBoxContainer.new()
	row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	row.add_theme_constant_override("separation", 6)
	var icon := Label.new()
	icon.text = "X"
	row.add_child(icon)
	var copy := VBoxContainer.new()
	copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_target_name = Label.new()
	copy.add_child(_target_name)
	_target_level = Label.new()
	copy.add_child(_target_level)
	_target_hp = _bar(Color(0.92, 0.28, 0.22))
	copy.add_child(_target_hp)
	row.add_child(copy)
	return row

func _build_chat() -> VBoxContainer:
	var stack := VBoxContainer.new()
	stack.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	stack.add_theme_constant_override("separation", 2)
	var tabs := HBoxContainer.new()
	for tab in ["Global", "Guild", "System"]:
		var tab_label := Label.new()
		tab_label.text = tab
		tab_label.add_theme_color_override("font_color", PresentationTheme.label_color("gold") if tab == "Guild" else PresentationTheme.label_color("muted"))
		tabs.add_child(tab_label)
	stack.add_child(tabs)
	_chat_preview = Label.new()
	_chat_preview.text = "[Global] CaptainX: Forming raid on Kraken!"
	_chat_preview.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_chat_preview.max_lines_visible = 2
	_chat_preview.clip_text = true
	_chat_preview.add_theme_color_override("font_color", PresentationTheme.label_color("muted"))
	stack.add_child(_chat_preview)
	var hint := Label.new()
	hint.text = "Tap to chat..."
	hint.add_theme_color_override("font_color", Color(0.55, 0.58, 0.62))
	stack.add_child(hint)
	return stack

func _build_zoom() -> VBoxContainer:
	var col := VBoxContainer.new()
	col.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	col.add_theme_constant_override("separation", 3)
	col.add_child(_zoom_btn("+", 0.08))
	col.add_child(_zoom_btn("MID", 0.0))
	col.add_child(_zoom_btn("-", -0.08))
	var recenter := Button.new()
	recenter.text = "SHIP"
	recenter.size_flags_vertical = Control.SIZE_EXPAND_FILL
	recenter.pressed.connect(func(): camera.reset_pan())
	col.add_child(recenter)
	return col

func _zoom_btn(label_text: String, delta: float) -> Button:
	var button := Button.new()
	button.text = label_text
	button.size_flags_vertical = Control.SIZE_EXPAND_FILL
	if delta > 0.0:
		button.pressed.connect(func(): camera.adjust_zoom(delta))
	elif delta < 0.0:
		button.pressed.connect(func(): camera.adjust_zoom(delta))
	else:
		button.pressed.connect(func(): camera.zoom = MockupCompositionProfile.DEFAULT_CAMERA_ZOOM)
	button.add_theme_stylebox_override("normal", PresentationTheme.round_button(6.0))
	return button

func _build_consumables() -> HBoxContainer:
	var row := HBoxContainer.new()
	row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", 6)
	for slot in [["OIL", "32"], ["POT", "21"], ["BMB", "18"], ["H2O", "24"]]:
		var button := Button.new()
		button.text = "%s\n%s" % [slot[0], slot[1]]
		button.disabled = true
		button.add_theme_stylebox_override("disabled", PresentationTheme.round_button(22.0))
		row.add_child(button)
	return row

func _build_combat() -> Control:
	var cluster := Control.new()
	cluster.name = "CombatCluster"
	cluster.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	cluster.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var fire := Button.new()
	fire.name = "FireButton"
	fire.text = "FEUER"
	fire.disabled = true
	fire.add_theme_stylebox_override("disabled", PresentationTheme.round_button(42.0, Color(0.92, 0.62, 0.22, 0.85)))
	cluster.add_child(fire)
	for ability in ["8", "14", "11"]:
		var ability_button := Button.new()
		ability_button.name = "Ability%s" % ability
		ability_button.text = ability
		ability_button.disabled = true
		ability_button.add_theme_stylebox_override("disabled", PresentationTheme.round_button(20.0, Color(0.42, 0.62, 0.92, 0.72)))
		cluster.add_child(ability_button)
	for utility_name in ["TargetButton", "AutoButton", "ShieldButton", "RepairButton"]:
		var utility := Button.new()
		utility.name = utility_name
		utility.text = utility_name.substr(0, 1)
		utility.disabled = true
		cluster.add_child(utility)
	return cluster

func _bar(color: Color) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.show_percentage = false
	bar.add_theme_stylebox_override("background", PresentationTheme.bar_background())
	bar.add_theme_stylebox_override("fill", PresentationTheme.bar_fill(color))
	return bar

func _apply_layout(viewport: Vector2) -> void:
	_rebuild_nav(viewport)
	var zone_map := {
		"profile": PresentationLayout.Zone.PROFILE,
		"status": PresentationLayout.Zone.STATUS,
		"nav": PresentationLayout.Zone.NAV,
		"currency": PresentationLayout.Zone.CURRENCY,
		"mission": PresentationLayout.Zone.MISSION,
		"minimap": PresentationLayout.Zone.MINIMAP,
		"zoom": PresentationLayout.Zone.ZOOM,
		"chat": PresentationLayout.Zone.CHAT,
		"consumables": PresentationLayout.Zone.CONSUMABLES,
		"combat": PresentationLayout.Zone.COMBAT,
		"fullscreen": PresentationLayout.Zone.FULLSCREEN,
		"target": PresentationLayout.Zone.TARGET,
	}
	var qa := MobileWebDiagnostics.query_flag("qa")
	for key in zone_map.keys():
		var zone: Control = _zones[key]
		var rect := PresentationLayout.zone_rect(viewport, zone_map[key])
		PresentationLayout.apply_zone(zone, rect)
		if zone.has_method("set_qa_outline"):
			zone.call("set_qa_outline", qa)
	_style_content(viewport)
	_layout_combat(viewport)
	if _minimap != null:
		_minimap.fill_parent_zone()
	if qa:
		var audit := ResponsiveHudMetrics.content_bounds_audit(_zones, viewport)
		for key in audit.bounds.keys():
			var zone: Control = _zones.get(key)
			if zone != null and zone.has_method("set_qa_content_bounds"):
				var bounds: Rect2 = audit.bounds[key]
				var local := Rect2(bounds.position - zone.position, bounds.size)
				zone.call("set_qa_content_bounds", local)

func _style_content(viewport: Vector2) -> void:
	var is_phone := ResponsiveHudMetrics.detect_profile(viewport) == ResponsiveHudMetrics.Profile.PHONE_LANDSCAPE
	var bar_h := maxf(3.0 if is_phone else 6.0, viewport.y * (0.005 if is_phone else 0.009))
	for bar in [_exp_bar, _hull_bar, _shield_bar, _target_hp, _mission_progress]:
		if bar != null:
			bar.custom_minimum_size.y = bar_h
	var nav_h: float = (_zones["nav"] as Control).size.y * (0.88 if is_phone else 0.82)
	for child in _nav.get_children():
		if child is Button:
			child.custom_minimum_size = Vector2(0.0, nav_h)
			var nav_style := PresentationTheme.compact_nav_button(false) if is_phone else PresentationTheme.nav_button(false)
			child.add_theme_stylebox_override("normal", nav_style)
			child.add_theme_stylebox_override("disabled", nav_style)
			child.add_theme_font_size_override(
				"font_size",
				HudLayout.font_size(viewport, 11.0, HudLayout.Semantic.NAVIGATION)
			)
	var ability_ratio := HudLayoutProfile.pick(
		viewport,
		HudLayoutProfile.RATIO_ABILITY_D,
		HudLayoutProfile.PHONE_RATIO_CONSUMABLE_D
	)
	for slot in _consumables.get_children():
		if slot is Button:
			var consumable_size := ResponsiveHudMetrics.touch_diameter(
				viewport,
				ability_ratio,
				ResponsiveHudMetrics.min_touch_px(viewport) * (0.75 if is_phone else 0.85),
				0.13 if is_phone else 0.14
			)
			slot.custom_minimum_size = Vector2(consumable_size, consumable_size)
			slot.add_theme_font_size_override(
				"font_size",
				HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.SECONDARY_ACTION)
			)
	var avatar := _profile.get_node_or_null("ProfileRow/Avatar") as PanelContainer
	if avatar != null:
		var avatar_ratio := HudLayoutProfile.pick(
			viewport,
			0.055,
			HudLayoutProfile.PHONE_RATIO_AVATAR_D
		)
		var avatar_size := ResponsiveHudMetrics.touch_diameter(
			viewport,
			avatar_ratio,
			24.0 if is_phone else 32.0,
			0.10 if is_phone else 0.12
		)
		avatar.custom_minimum_size = Vector2(avatar_size, avatar_size)
	_captain_name.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 12.0, HudLayout.Semantic.PLAYER_STATUS))
	_captain_level.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.PLAYER_STATUS))
	_guild_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.SECONDARY_ACTION))
	_gold_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.SECONDARY_ACTION))
	_xp_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.SECONDARY_ACTION))
	_pearl_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.SECONDARY_ACTION))
	for value in [_exp_value, _hull_value, _shield_value]:
		if value != null:
			value.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.PLAYER_STATUS))
	for child in _mission.get_children():
		_apply_label_font(child, viewport, HudLayout.Semantic.MISSION)
	for child in _chat.get_children():
		_apply_label_font(child, viewport, HudLayout.Semantic.CHAT)
	for child in _zoom.get_children():
		if child is Button:
			(child as Button).add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.ZOOM))
	if is_phone:
		_profile.add_theme_stylebox_override("panel", PresentationTheme.compact_panel())
		_status.add_theme_stylebox_override("panel", PresentationTheme.compact_panel())
		_mission.add_theme_stylebox_override("panel", PresentationTheme.compact_panel())
		_chat.add_theme_stylebox_override("panel", PresentationTheme.compact_panel())
		_profile.add_theme_constant_override("margin_left", 2)
		_profile.add_theme_constant_override("margin_right", 2)
		_profile.add_theme_constant_override("margin_top", 1)
		_profile.add_theme_constant_override("margin_bottom", 1)
		_status.add_theme_constant_override("margin_left", 2)
		_status.add_theme_constant_override("margin_right", 2)
		_status.add_theme_constant_override("margin_top", 1)
		_status.add_theme_constant_override("margin_bottom", 1)
		_mission.add_theme_constant_override("margin_left", 2)
		_mission.add_theme_constant_override("margin_right", 2)
		_mission.add_theme_constant_override("margin_top", 1)
		_mission.add_theme_constant_override("margin_bottom", 1)
		_chat.add_theme_constant_override("margin_left", 2)
		_chat.add_theme_constant_override("margin_right", 2)
		_chat.add_theme_constant_override("margin_top", 1)
		_chat.add_theme_constant_override("margin_bottom", 1)
		(_status.get_child(0) as VBoxContainer).add_theme_constant_override("separation", 1)
	else:
		_profile.add_theme_stylebox_override("panel", PresentationTheme.glass_panel())
		_status.add_theme_stylebox_override("panel", PresentationTheme.glass_panel())
		_mission.add_theme_stylebox_override("panel", PresentationTheme.glass_panel())
		_chat.add_theme_stylebox_override("panel", PresentationTheme.glass_panel())

func _apply_label_font(node: Node, viewport: Vector2, semantic: HudLayout.Semantic) -> void:
	if node is Label:
		(node as Label).add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, semantic))
	for child in node.get_children():
		_apply_label_font(child, viewport, semantic)

func _layout_combat(viewport: Vector2) -> void:
	var rect: Vector2 = (_zones["combat"] as Control).size
	var is_phone := ResponsiveHudMetrics.detect_profile(viewport) == ResponsiveHudMetrics.Profile.PHONE_LANDSCAPE
	var fire_ratio := HudLayoutProfile.pick(
		viewport,
		HudLayoutProfile.RATIO_FIRE_D,
		HudLayoutProfile.PHONE_RATIO_FIRE_D
	)
	var ability_ratio := HudLayoutProfile.pick(
		viewport,
		HudLayoutProfile.RATIO_ABILITY_D,
		HudLayoutProfile.PHONE_RATIO_ABILITY_D
	)
	var fire := _combat.get_node_or_null("FireButton") as Button
	var fire_size := ResponsiveHudMetrics.touch_diameter(
		viewport,
		fire_ratio,
		ResponsiveHudMetrics.min_touch_px(viewport),
		0.22
	)
	if fire != null:
		fire.custom_minimum_size = Vector2(fire_size, fire_size)
		var edge := ResponsiveHudMetrics.safe_edge_margin(viewport) if is_phone else 0.0
		fire.position = Vector2(rect.x - fire_size - edge * 0.25, rect.y - fire_size - edge * 0.25)
		fire.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 10.0, HudLayout.Semantic.PRIMARY_ACTION))
	var ability_offsets: Array[Vector2] = []
	if is_phone:
		ability_offsets = [
			Vector2(-fire_size * 0.88, -fire_size * 0.05),
			Vector2(-fire_size * 0.68, -fire_size * 0.52),
			Vector2(-fire_size * 0.28, -fire_size * 0.82),
		]
	else:
		for i in range(3):
			ability_offsets.append(Vector2(rect.x - fire_size * 1.05, rect.y - fire_size * (1.35 + i * 0.42)) - Vector2.ZERO)
	for i in range(3):
		var ability_name: String = ["Ability8", "Ability14", "Ability11"][i]
		var ability := _combat.get_node_or_null(ability_name) as Button
		if ability != null:
			var ability_size := ResponsiveHudMetrics.touch_diameter(
				viewport,
				ability_ratio,
				ResponsiveHudMetrics.min_touch_px(viewport) * (0.75 if is_phone else 0.85),
				0.12
			)
			ability.custom_minimum_size = Vector2(ability_size, ability_size)
			if is_phone:
				ability.position = Vector2(rect.x - fire_size, rect.y - fire_size) + ability_offsets[i]
			else:
				ability.position = Vector2(rect.x - fire_size * 1.05, rect.y - fire_size * (1.35 + i * 0.42))
			ability.add_theme_font_size_override("font_size", HudLayout.font_size(viewport, 9.0, HudLayout.Semantic.SECONDARY_ACTION))
	var utility_offsets := [
		Vector2(-fire_size * 0.55, -fire_size * 1.02),
		Vector2(-fire_size * 1.02, -fire_size * 0.55),
		Vector2(-fire_size * 0.20, -fire_size * 1.02),
		Vector2(-fire_size * 1.02, -fire_size * 0.20),
	] if is_phone else []
	var utility_index := 0
	for utility_name in ["TargetButton", "AutoButton", "ShieldButton", "RepairButton"]:
		var utility := _combat.get_node_or_null(utility_name) as Button
		if utility == null:
			continue
		var utility_size := ResponsiveHudMetrics.touch_diameter(
			viewport,
			ability_ratio * 0.92,
			ResponsiveHudMetrics.min_touch_px(viewport) * 0.7,
			0.11
		)
		utility.custom_minimum_size = Vector2(utility_size, utility_size)
		if is_phone and utility_index < utility_offsets.size():
			utility.position = Vector2(rect.x - fire_size, rect.y - fire_size) + utility_offsets[utility_index]
		utility_index += 1

func _refresh() -> void:
	var ship_id := str(GameState.save_data.get("shipId", "sovereign"))
	var ship_data: Dictionary = GameState.catalog.get("ships", {}).get(ship_id, {})
	var max_hp := float(ship_data.get("hp", 1250.0))
	var max_shield := float(ship_data.get("shield", 350.0))
	var hp := max_hp
	var shield := max_shield
	if player != null and player.health != null:
		hp = player.health.current_health
		max_hp = player.health.max_health
	_exp_bar.max_value = MockupCompositionProfile.HUD_EXP_MAX
	_exp_bar.value = MockupCompositionProfile.HUD_EXP_CURRENT
	_hull_bar.max_value = MockupCompositionProfile.HUD_RUMPF_MAX
	_hull_bar.value = MockupCompositionProfile.HUD_RUMPF_CURRENT
	_shield_bar.max_value = MockupCompositionProfile.HUD_SCHUTZ_MAX
	_shield_bar.value = MockupCompositionProfile.HUD_SCHUTZ_CURRENT
	_exp_value.text = "%s / %s" % [_fmt(MockupCompositionProfile.HUD_EXP_CURRENT), _fmt(MockupCompositionProfile.HUD_EXP_MAX)]
	_hull_value.text = "%s / %s" % [_fmt(MockupCompositionProfile.HUD_RUMPF_CURRENT), _fmt(MockupCompositionProfile.HUD_RUMPF_MAX)]
	_shield_value.text = "%s / %s" % [_fmt(MockupCompositionProfile.HUD_SCHUTZ_CURRENT), _fmt(MockupCompositionProfile.HUD_SCHUTZ_MAX)]
	_captain_name.text = str(GameState.save_data.get("playerName", MockupCompositionProfile.HUD_PLAYER_NAME)).to_upper()
	_captain_level.text = "Lv. %d" % int(GameState.save_data.get("level", MockupCompositionProfile.HUD_PLAYER_LEVEL))
	_gold_label.text = "G %s" % _fmt_num(int(GameState.save_data.get("gold", 815600)))
	_xp_label.text = "X %s" % _fmt_num(int(GameState.save_data.get("xp", 12400)))
	_pearl_label.text = "D %d" % int(GameState.save_data.get("pearls", 3250))

func _refresh_target() -> void:
	var target := TargetingSystem.current_target
	if target == null or not target is ShipEntity:
		_target.visible = false
		return
	_target.visible = true
	var ship := target as ShipEntity
	_target_name.text = ship.display_name().to_upper()
	if ship is NpcShip and (ship as NpcShip).npc_definition != null:
		_target_level.text = "LV %d" % (ship as NpcShip).npc_definition.level
	else:
		_target_level.text = ""
	if ship.health != null:
		_target_hp.max_value = ship.health.max_health
		_target_hp.value = ship.health.current_health

func get_zones() -> Dictionary:
	return _zones

func _toggle_fullscreen() -> void:
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
	WebViewportContract.request_sync()

func _fmt(value: float) -> String:
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

func _fmt_num(value: int) -> String:
	if value >= 1000000:
		return "%.1fM" % (float(value) / 1000000.0)
	if value >= 1000:
		return "%.1fK" % (float(value) / 1000.0)
	return str(value)
