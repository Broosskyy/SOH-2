extends Control
## M303: small local minimap, centered on the player.
var player_position := Vector2.ZERO
var islands: Array[Dictionary] = []
var enemies: Array[Vector2] = []

func _draw() -> void:
	var center := size*0.5
	var radius := minf(size.x,size.y)*0.46
	draw_circle(center,radius+5,Color("ab8955"))
	draw_circle(center,radius+2,Color("0e2639"))
	draw_circle(center,radius-4,Color("0a3854"))
	for island in islands:
		var loc: Vector3 = island.position
		var spot := center + (Vector2(loc.x,loc.z)-player_position)*0.52
		if spot.distance_to(center) < radius-7:
			draw_circle(spot,maxf(3.0,float(island.radius)*0.24),Color("a4aeaf"))
	for position in enemies:
		var spot := center+(position-player_position)*0.52
		if spot.distance_to(center) < radius-7:
			draw_circle(spot,2.8,Color("f0a44b"))
	draw_circle(center,4.5,Color("49de83"))
	draw_arc(center,radius-3,0,TAU,80,Color("dcc28d"),2.0)
