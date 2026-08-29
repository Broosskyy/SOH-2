class_name HarborState
extends RefCounted

enum PortPhase { OUTSIDE_PORT, PORT_APPROACH, IN_PORT }

var phase: PortPhase = PortPhase.OUTSIDE_PORT
var active_harbor_id: String = ""

func enter_approach(harbor_id: String) -> void:
	phase = PortPhase.PORT_APPROACH
	active_harbor_id = harbor_id

func enter_port(harbor_id: String) -> void:
	phase = PortPhase.IN_PORT
	active_harbor_id = harbor_id

func leave_port() -> void:
	phase = PortPhase.OUTSIDE_PORT
	active_harbor_id = ""

func is_in_port() -> bool:
	return phase == PortPhase.IN_PORT

func phase_name() -> String:
	match phase:
		PortPhase.OUTSIDE_PORT: return "OUTSIDE_PORT"
		PortPhase.PORT_APPROACH: return "PORT_APPROACH"
		PortPhase.IN_PORT: return "IN_PORT"
	return "UNKNOWN"
