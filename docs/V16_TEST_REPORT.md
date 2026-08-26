# V16.1 Test Report

Date: 2026-08-25

## Passed

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npm run typecheck` | PASS |
| ESLint | `npm run lint` | PASS, zero warnings/errors |
| Production build | `npm run build` (through `npm test`) | PASS |
| Architecture contract | `npm run test:architecture` | PASS, 4/4 |
| Complete Node tests | `npm test` | PASS, 5/5 |
| Sites artifact validation | `npm run validate:artifact` | PASS |
| Patch whitespace | `git diff --check` | PASS |

The rendered-HTML test starts the built Worker, requests `/`, receives HTTP
200 and verifies the expected Abyssal Dominion shell.

The architecture suite additionally verifies X/Z gameplay-plane metadata,
camera-policy synchronization between the shared and Godot catalogs, absence
of orbit input, fixed-oblique Web composition and Godot water-height locking.

## Warnings

- The production bundler reports one client chunk above 500 kB. This is a
  non-blocking performance warning; the Three.js renderer is already loaded
  dynamically, and further panel/runtime splitting is recommended.
- npm reports a future deprecation warning for the environment's `http-proxy`
  setting. It does not affect this build.

## Not executed

Godot was not installed in the execution environment. Therefore the Godot
project received static contract/file checks only; no successful Godot parser,
scene-load, Web export, Android export or iOS export is claimed.

Native Android and iOS verification requires Godot export templates plus an
Android SDK/device, and macOS/Xcode/signing for iOS.
