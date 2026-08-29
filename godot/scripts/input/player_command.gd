class_name PlayerCommand
extends RefCounted

var steering := 0.0
var thrust := 0.0
var primary_fire := false
var harpoon_fire := false
var abilities := [false, false, false]
var has_destination := false
var destination_point := Vector3.ZERO

func copy_from(other: PlayerCommand) -> void:
	steering = clampf(other.steering, -1.0, 1.0)
	thrust = clampf(other.thrust, -1.0, 1.0)
	primary_fire = other.primary_fire
	harpoon_fire = other.harpoon_fire
	has_destination = other.has_destination
	destination_point = GameplayPlane.flatten(other.destination_point)
	for index in abilities.size():
		abilities[index] = other.abilities[index]
