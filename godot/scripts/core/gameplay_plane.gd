class_name GameplayPlane
extends RefCounted

## Binding 2.5D gameplay contract. Visual nodes may use height, but navigation,
## targeting, range and combat resolve on the horizontal X/Z water plane.
const WATER_Y := 0.0

static func flatten(position_3d: Vector3) -> Vector3:
	return Vector3(position_3d.x, WATER_Y, position_3d.z)

static func direction(from_position: Vector3, to_position: Vector3) -> Vector3:
	return (flatten(to_position) - flatten(from_position)).normalized()

static func distance(from_position: Vector3, to_position: Vector3) -> float:
	return flatten(from_position).distance_to(flatten(to_position))
