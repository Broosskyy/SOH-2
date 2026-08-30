class_name BuildInfo
extends RefCounted

const BUILD_MARKER := "M0-CLEAN-NATIVE-FOUNDATION"
const GIT_SHA := "m0"

static func label() -> String:
	return "%s (%s)" % [BUILD_MARKER, GIT_SHA]
