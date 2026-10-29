extends Node3D
## M303.5 private artwork bridge: original game mechanics don't depend on art.
## Source images MUST already be decoded as ordinary PNG or WebP.
## This code neither decrypts Unity bundles nor downloads any third-party data.
const PRIVATE_RES = "res://assets/classic/private_seabattles/"
const PRIVATE_USER = "user://seabattles/"
const COMPATIBLE_2D = {
	"PlayerShip": "ships/elite8.png",
	"NPC_0": "ships/warship.png",
	"NPC_1": "ships/pinnace.png",
	"NPC_2": "ships/flyingdutchman.png",
	"NPC_3": "ships/elite8.png",
	"NPC_4": "ships/warship.png"
}
const ISLANDS = {
	"Island_0": "islands/snow.png",
	"Island_1": "islands/snow.png",
	"Island_2": "islands/rock.png",
	"Island_3": "islands/tropical.png"
}
var visual: Sprite3D
var frame_count := 8
var heading_bias := 0.0

static func _is_available(path: String) -> bool:
	return ResourceLoader.exists(path) or FileAccess.file_exists(path)

static func _path_for(relative: String) -> String:
	if relative.is_empty():
		return ""
	# The local diagnostic preview from the previous M303.3 test can be
	# placed under ships/elite8_apk_diagnostic_8dir.png as well.
	var options: Array[String] = [PRIVATE_RES + relative, PRIVATE_USER + relative]
	if relative == "ships/elite8.png":
		options.append(PRIVATE_RES + "ships/elite8_apk_diagnostic_8dir.png")
		options.append(PRIVATE_USER + "ships/elite8_apk_diagnostic_8dir.png")
	for path in options:
		if _is_available(path):
			return path
	return ""

static func has_local_ship(actor_name: String) -> bool:
	return not _path_for(str(COMPATIBLE_2D.get(actor_name, ""))).is_empty()

static func has_local_island(actor_name: String) -> bool:
	return not _path_for(str(ISLANDS.get(actor_name, ""))).is_empty()

static func local_path(actor_name: String) -> String:
	if COMPATIBLE_2D.has(actor_name):
		return _path_for(str(COMPATIBLE_2D[actor_name]))
	if ISLANDS.has(actor_name):
		return _path_for(str(ISLANDS[actor_name]))
	return ""

static func _read_texture(path: String) -> Texture2D:
	if path.is_empty():
		return null
	if path.begins_with("res://") and ResourceLoader.exists(path):
		var resource := load(path) as Texture2D
		if resource != null:
			return resource
	if FileAccess.file_exists(path):
		var bitmap := Image.new()
		if bitmap.load(path) == OK:
			return ImageTexture.create_from_image(bitmap)
	return null

func set_ship_atlas(path: String, columns: int, rows: int, world_width: float, heading_offset: float = 0.0) -> bool:
	if columns < 1 or rows < 1:
		return false
	var texture := _read_texture(path)
	if texture == null or texture.get_width() < columns or texture.get_height() < rows:
		return false
	frame_count = columns * rows
	heading_bias = heading_offset
	visual = Sprite3D.new()
	visual.name = "MultiDirectionShip"
	visual.texture = texture
	visual.hframes = columns
	visual.vframes = rows
	visual.frame = 0
	# Normalize visual width across different atlas resolutions.
	visual.pixel_size = maxf(world_width, 0.1) / float(texture.get_width() / columns)
	visual.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	visual.shaded = false
	visual.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	visual.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	visual.position = Vector3(0.0, 1.7, 0.0)
	add_child(visual)
	return true

func set_island_image(path: String, diameter: float) -> bool:
	var texture := _read_texture(path)
	if texture == null:
		return false
	visual = Sprite3D.new()
	visual.name = "IslandImage"
	visual.texture = texture
	visual.pixel_size = diameter / maxf(1.0, float(maxi(texture.get_width(), texture.get_height())))
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
