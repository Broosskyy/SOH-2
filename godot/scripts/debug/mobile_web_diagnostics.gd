extends Node

const PRIMITIVE_BOOT_SCENE := "res://scenes/debug/MobileWebPrimitive.tscn"

var _params: Dictionary = {}

func _ready() -> void:
	_params = _load_params()
	if OS.get_name() == "Web" and boot_mode() == "primitive":
		call_deferred("_boot_primitive_scene")

func boot_mode() -> String:
	return str(_params.get("boot", "")).strip_edges().to_lower()

func isolation_step() -> int:
	if query_flag("no_kraken"):
		return 3
	var raw := int(str(_params.get("isolate", "7")).strip_edges())
	return clampi(raw, 1, 7)

func query_flag(name: String) -> bool:
	return str(_params.get(name, "")).strip_edges().to_lower() in ["1", "true", "yes", "on"]

func hide_kraken() -> bool:
	return query_flag("no_kraken") or isolation_step() < 4

func force_low_quality() -> bool:
	return query_flag("force_low")

func force_high_quality() -> bool:
	return query_flag("force_high")

func param(name: String, default_value: String = "") -> String:
	return str(_params.get(name, default_value))

func params() -> Dictionary:
	return _params.duplicate(true)

func _boot_primitive_scene() -> void:
	get_tree().change_scene_to_file(PRIMITIVE_BOOT_SCENE)

func _load_params() -> Dictionary:
	if OS.get_name() == "Web":
		return _read_web_params()
	return _read_env_params()

func _read_env_params() -> Dictionary:
	var params := {}
	for key in ["boot", "isolate", "diag", "qa", "no_kraken", "force_low", "force_high"]:
		var value := OS.get_environment("ABYSSAL_%s" % key.to_upper())
		if not value.is_empty():
			params[key] = value
	return params

func _read_web_params() -> Dictionary:
	if not ClassDB.class_exists("JavaScriptBridge"):
		return {}
	var raw: Variant = JavaScriptBridge.eval(
		"(() => { const params = new URLSearchParams(window.location.search || ''); const out = {}; for (const [key, value] of params.entries()) out[key] = value; return JSON.stringify(out); })()"
	)
	if raw is String and not raw.is_empty():
		var parsed: Variant = JSON.parse_string(raw)
		if parsed is Dictionary:
			return parsed
	return {}
