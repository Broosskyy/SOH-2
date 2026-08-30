class_name InputSource
extends Node

signal command_changed(command: PlayerCommand)

var command := PlayerCommand.new()

func poll_command() -> PlayerCommand:
	return command.duplicate_command()

func _emit_command() -> void:
	command_changed.emit(command.duplicate_command())
