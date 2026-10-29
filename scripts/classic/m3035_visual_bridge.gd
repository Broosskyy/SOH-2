extends Node3D
## M303.5 ship/island art bridge. Neither this script nor its assets can
## apply movement, health, loot, XP, PvP or network state.
## Supports public GLB placeholders, public vector atlases and private
## PNG/WebP directional sprite atlases (8=4x2, 16=16x1).
var _sprite: Sprite3D
var _columns := 1
var _rows := 1
var _heading_offset := 0.0
var _base_width := 5.5

func configure(texture: Texture2D, columns: int, rows: int, world_width: float, heading_offset_degrees: float = 0.0) -> bool:
	if texture == null or columns < 1 or rows < 1:
		return false
	if texture.get_width() < columns or texture.get_height() < rows:
		return false
	_columns = columns
	_rows = rows
	_heading_offset = heading_offset_degrees
	_base_width = world_width
	_sprite = Sprite3D.new()
	_sprite.name = "Sprite"
	_sprite.texture = texture
	_sprite.hframes = columns
	_sprite.vframes = rows
	_sprite.pixel_size = world_width / float(texture.get_width() / columns)
	_sprite.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_sprite.shaded = false
	_sprite.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	_sprite.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	_sprite.position.y = 2.0
	add_child(_sprite)
	return true

func set_heading(yaw_radians: float) -> void:
	if _sprite == null:
		return
	var count := _columns * _rows
	if count <= 1:
		return
	var degrees := wrapf(rad_to_deg(yaw_radians) + _heading_offset, 0.0, 360.0)
	_sprite.frame = posmod(roundi(degrees / 360.0 * count), count)

func set_visual_width(world_width: float) -> void:
	if _sprite == null:
		return
	_sprite.pixel_size = world_width / float(_sprite.texture.get_width() / _columns)
