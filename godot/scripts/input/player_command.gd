class_name PlayerCommand
extends RefCounted

var steering := 0.0
var thrust := 0.0
var primary_fire := false
var harpoon_fire := false
var abilities := [false, false, false]

func copy_from(other: PlayerCommand) -> void:
	steering = clampf(other.steering, -1.0, 1.0)
	thrust = clampf(other.thrust, -1.0, 1.0)
	primary_fire = other.primary_fire
	harpoon_fire = other.harpoon_fire
	for index in abilities.size():
		abilities[index] = other.abilities[index]
