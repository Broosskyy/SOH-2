export type GameAction =
  | "moveForward"
  | "moveBackward"
  | "steerLeft"
  | "steerRight"
  | "selectTarget"
  | "cycleTarget"
  | "primaryFire"
  | "harpoonFire"
  | "ability1"
  | "ability2"
  | "ability3"
  | "interact"
  | "cancelNavigation"
  | "zoomIn"
  | "zoomOut"
  | "openMap"
  | "openShipyard"
  | "closePanel";

const KEYBOARD_ACTIONS: Record<string, GameAction> = {
  w: "moveForward",
  arrowup: "moveForward",
  s: "moveBackward",
  arrowdown: "moveBackward",
  a: "steerLeft",
  arrowleft: "steerLeft",
  d: "steerRight",
  arrowright: "steerRight",
  tab: "cycleTarget",
  c: "cancelNavigation",
  escape: "closePanel",
  "1": "ability1",
  "2": "ability2",
  "3": "ability3",
  m: "openMap",
  v: "openShipyard",
  e: "interact",
  "+": "zoomIn",
  "-": "zoomOut",
};

export function resolveKeyboardAction(event: KeyboardEvent): GameAction | null {
  if (event.code === "Space") return "primaryFire";
  return KEYBOARD_ACTIONS[event.key.toLowerCase()] ?? null;
}

export const CONTINUOUS_ACTIONS = new Set<GameAction>([
  "moveForward",
  "moveBackward",
  "steerLeft",
  "steerRight",
]);

export const GODOT_INPUT_ACTIONS: readonly GameAction[] = [
  "moveForward",
  "moveBackward",
  "steerLeft",
  "steerRight",
  "selectTarget",
  "cycleTarget",
  "primaryFire",
  "harpoonFire",
  "ability1",
  "ability2",
  "ability3",
  "interact",
  "cancelNavigation",
  "zoomIn",
  "zoomOut",
  "openMap",
  "openShipyard",
];

