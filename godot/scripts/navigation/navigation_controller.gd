class_name NavigationController
extends RefCounted

const NavalNavigationLogic = preload("res://scripts/navigation/naval_navigation.gd")

static func flatten_destination(value: Vector3) -> Vector3:
	return GameplayPlane.flatten(value)

static func is_destination_blocked(destination: Vector3, boundaries: Array) -> bool:
	for boundary in boundaries:
		if boundary is Callable:
			if boundary.call(destination):
				return true
		elif boundary.has_method("blocks_point"):
			if boundary.blocks_point(destination):
				return true
	return false

static func command_to_destination(
		player_position: Vector3,
		player_basis: Basis,
		destination: Vector3,
		boundaries: Array = []
	) -> NavigationCommand:
	var command := NavigationCommand.new()
	var flat_destination := flatten_destination(destination)
	if is_destination_blocked(flat_destination, boundaries):
		command.rejected = true
		command.rejection_reason = "blocked"
		return command
	command.destination = flat_destination
	command.has_destination = true
	var nav := NavalNavigationLogic.command_to_destination(
		player_position,
		player_basis,
		flat_destination
	)
	command.steering = nav.x
	command.thrust = nav.y
	if nav == Vector2.ZERO:
		command.has_destination = false
	return command
