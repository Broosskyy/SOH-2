class_name NavalNavigation
extends RefCounted

const ARRIVAL_RADIUS := 18.0

static func command_to_destination(
		player_position: Vector3,
		player_basis: Basis,
		destination: Vector3
	) -> Vector2:
	var delta := GameplayPlane.flatten(destination - player_position)
	var distance := delta.length()
	if distance <= ARRIVAL_RADIUS:
		return Vector2.ZERO
	var desired := Vector2(delta.x, delta.z).normalized()
	var forward_3d := -player_basis.z
	var forward := Vector2(forward_3d.x, forward_3d.z).normalized()
	var angle := forward.angle_to(desired)
	var steering := clampf(angle / deg_to_rad(70.0), -1.0, 1.0)
	var absolute_angle := absf(rad_to_deg(angle))
	var thrust := 1.0
	if absolute_angle > 135.0:
		thrust = 0.22
	elif absolute_angle > 75.0:
		thrust = 0.52
	elif absolute_angle > 35.0:
		thrust = 0.78
	if distance < ARRIVAL_RADIUS * 3.0:
		thrust *= clampf((distance - ARRIVAL_RADIUS) / (ARRIVAL_RADIUS * 2.0), 0.18, 1.0)
	return Vector2(steering, thrust)
