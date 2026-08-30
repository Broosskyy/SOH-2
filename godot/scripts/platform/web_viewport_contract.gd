extends Node

## G0.5.4 — Web canvas contract + logical/render viewport change detection.

signal presentation_resized

var _last_logical := Vector2.ZERO
var _last_render := Vector2.ZERO
var _last_scale := 1.0
var _contract_ready := false

func _ready() -> void:
	if OS.get_name() != "Web":
		set_process(false)
		return
	call_deferred("_bootstrap")

func _bootstrap() -> void:
	ResponsiveHudMetrics.install_web_canvas_contract()
	_contract_ready = true
	_check_viewport()

func _process(_delta: float) -> void:
	if Engine.get_frames_drawn() % 20 == 0:
		_check_viewport()

func _check_viewport() -> void:
	if OS.get_name() != "Web":
		return
	if not _contract_ready:
		return
	ResponsiveHudMetrics.install_web_canvas_contract()
	var logical := ResponsiveHudMetrics.logical_ui_viewport_size()
	var render := ResponsiveHudMetrics.render_viewport_size()
	var pscale := ResponsiveHudMetrics.presentation_scale_uniform()
	if logical == _last_logical and render == _last_render and is_equal_approx(pscale, _last_scale):
		return
	_last_logical = logical
	_last_render = render
	_last_scale = pscale
	presentation_resized.emit()

func request_sync() -> void:
	_check_viewport()

func sync_presentation_viewport() -> void:
	request_sync()
