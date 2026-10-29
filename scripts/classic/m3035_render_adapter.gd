extends Node3D
## M303.5 rendering adapter: detached from navigation, combat and save data.
## Optional private graphic assets are only consumed when locally provided.
## Never requires or downloads third-party graphics at runtime.
const LOCAL := "res://assets/classic/private_seabattles/"
const COMPATIBLE_2D := {
	"PlayerShip": "ships/elite8.png",
	"NPC_0": "ships/warship.png",
	"NPC_1": "ships/pinnace.png",
	"NPC_2": "ships/flyingdutchman.png",
	"NPC_3": "ships/elite8.png",
	"NPC_4": "ships/warship.png"
}
const ISLANDS := {
	"Island_0": "islands/snow.png",
	"Island_1": "islands/snow.png",
	"Island_2": "islands/rock.png",
	"Island_3": "islands/tropical.png"
}

var visual: Sprite3D
var mode := "private_sprite"
var frame_count := 8
var heading_bias := 0.0


static func has_local_ship(actor_name: String) -> bool:
	var key: String = str(COMPATIBLE_2D.get(actor_name, ""))
	return not key.is_empty() and ResourceLoader.exists(LOCAL + key)


static func has_local_island(actor_name: String) -> bool:
	var key: String = str(ISLANDS.get(actor_name, ""))
	return not key.is_empty() and ResourceLoader.exists(LOCAL + key)


static func local_path(actor_name: String) -> String:
	if COMPATIBLE_2D.has(actor_name):
		return LOCAL + str(COMPATIBLE_2D[actor_name])
	if ISLANDS.has(actor_name):
		return LOCAL + str(ISLANDS[actor_name])
	return ""


func set_ship_atlas(path: String, columns: int, rows: int, pixel_scale: float, heading_offset: float = 0.0) -> bool:
	if columns < 1 or rows < 1 or not ResourceLoader.exists(path):
		return false
	var texture := load(path) as Texture2D
	if texture == null:
		return false
	frame_count = columns * rows
	heading_bias = heading_offset
	visual = Sprite3D.new()
	visual.name = "MultiDirectionShip"
	visual.texture = texture
	visual.hframes = columns
	visual.vframes = rows
	visual.frame = 0
	visual.pixel_size = pixel_scale
	visual.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	visual.shaded = false
	visual.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	visual.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	visual.position = Vector3(0.0, 1.7, 0.0)
	add_child(visual)
	return true


func set_island_image(path: String, diameter: float) -> bool:
	if not ResourceLoader.exists(path):
		return false
	var texture := load(path) as Texture2D
	if texture == null:
		return false
	visual = Sprite3D.new()
	visual.name = "IslandImage"
	visual.texture = texture
	visual.pixel_size = diameter / maxf(1.0, float(maxi(texture.get_width(),texture.get_height())))
	visual.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	visual.shaded = false
	visual.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	visual.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	visual.position.y = 1.4
	add_child(visual)
	return true


func set_heading(world_yaw: float) -> void:
	if visual == null or frame_count < 2:
		return
	var degrees := wrapf(rad_to_deg(world_yaw) + heading_bias, 0.0, 360.0)
	visual.frame = posmod(roundi(degrees / 360.0 * float(frame_count)), frame_count)
