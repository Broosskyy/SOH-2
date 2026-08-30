class_name PlayerCommand
extends RefCounted

var throttle: float = 0.0
var steer: float = 0.0

func reset() -> void:
	throttle = 0.0
	steer = 0.0

func duplicate_command() -> PlayerCommand:
	var copy := PlayerCommand.new()
	copy.throttle = throttle
	copy.steer = steer
	return copy
