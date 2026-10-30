extends SceneTree
## Used only to surface nested GDScript dependency parse errors in CI logs.
func _initialize() -> void:
	var parent := load("res://scripts/classic/m3041_chainshot_combat.gd")
	print("M3041_PARENT_LOAD ", parent)
	var child := load("res://scripts/classic/m3042_navigation_hud_stability.gd")
	print("M3042_CHILD_LOAD ", child)
	quit(0 if parent != null and child != null else 1)
