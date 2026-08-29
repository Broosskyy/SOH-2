class_name NavigationCommand
extends RefCounted

var steering := 0.0
var thrust := 0.0
var has_destination := false
var destination := Vector3.ZERO
var rejected := false
var rejection_reason := ""

func copy_from(other: NavigationCommand) -> void:
	steering = other.steering
	thrust = other.thrust
	has_destination = other.has_destination
	destination = other.destination
	rejected = other.rejected
	rejection_reason = other.rejection_reason
