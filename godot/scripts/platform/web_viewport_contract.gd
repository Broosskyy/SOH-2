extends Node

## G0.5.3 — Web canvas CSS contract + debounced HUD relayout notifications.

signal presentation_resized

var _last_viewport := Vector2.ZERO
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
	var viewport := ResponsiveHudMetrics.ui_viewport()
	if viewport == _last_viewport:
		return
	_last_viewport = viewport
	presentation_resized.emit()

func request_sync() -> void:
	_check_viewport()

func sync_presentation_viewport() -> void:
	request_sync()
