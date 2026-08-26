# Binding Gameplay and Camera Contract

Status: **ACCEPTED AND BINDING** for Web, Godot Web, Android and iOS.

## Product rule

Abyssal Dominion is a 2D/2.5D naval combat game rendered with a full 3D scene.
It is not a freely navigable third-person ship simulator.

- Navigation, steering, target range, collision and combat resolve on the
  horizontal X/Z water plane.
- Y is the visual height axis and is not a player-controlled gameplay axis.
- Ships, islands, ports, monsters, buildings, wrecks, props, water, lighting,
  fog, particles and VFX may use full 3D geometry and height.
- Mobile and desktop use the same world and gameplay rules.

## Camera rule

The gameplay camera is a controlled fixed-oblique perspective camera:

- smooth follow of the player ship;
- fixed world-space viewing direction;
- zoom within a bounded range;
- more overview for bosses and special events without changing the angle;
- subtle bounded camera shake for important impacts;
- no player-controlled orbit;
- no behind-the-ship chase camera;
- no first-person camera.

The composition must keep the player, relevant targets, projectiles, loot,
objectives, hazards and nearby world geometry readable at the same time.

## Web implementation

- Policy: `app/game/camera/cameraPolicy.ts`
- Renderer: `app/threeRenderer.ts`
- Navigation picking intersects the X/Z water plane.
- Boss selection and the Abyss event map increase overview distance.
- Impact shake is visual only and cannot change gameplay coordinates.

## Godot implementation

- Plane utility: `godot/scripts/core/gameplay_plane.gd`
- Camera: `godot/scripts/camera/camera_controller.gd`
- Player movement: `godot/scripts/ships/player_ship.gd`
- Player Y is forced to `GameplayPlane.WATER_Y` before and after physics.
- Camera angle is not mapped to any mouse, touch or keyboard orbit action.
- Combat/world systems can request boss/event overview or bounded shake through
  camera methods without gaining free camera control.

## Acceptance rules

A camera change is rejected if it introduces free orbit, first-person view,
ship-relative chase view, free vertical movement or different gameplay worlds
for mobile and desktop. Visual 3D improvements are accepted when they preserve
tactical overview and the X/Z gameplay plane.
