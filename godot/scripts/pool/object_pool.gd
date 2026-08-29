class_name ObjectPool
extends RefCounted

var _available: Array = []
var _factory: Callable
var _reset: Callable

func _init(factory: Callable, reset: Callable = Callable(), preload_count: int = 0) -> void:
	_factory = factory
	_reset = reset
	for _index in preload_count:
		_available.append(_factory.call())

func acquire() -> Object:
	if _available.is_empty():
		return _factory.call()
	return _available.pop_back()

func release(instance: Object) -> void:
	if instance == null:
		return
	if _reset.is_valid():
		_reset.call(instance)
	_available.append(instance)
