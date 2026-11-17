# Dependency maintenance

Reviewed on 17 November 2026. Install with Node 26.13.1 LTS and pnpm 12.21.0
using the committed `.nvmrc`, `packageManager`, workspace policy, and lockfile.

## Compatibility constraints

- TypeScript 6.0.3 is the newest compiler supported by typescript-eslint's
  `>=4.8.4 <6.1.0` peer range. Upgrade to TypeScript 7 when the parser supports it.
- typescript-eslint 8.72.2 is the newest release outside the 24-hour quarantine
  at review time. Version 8.73.0 was published on 16 November at 17:07 UTC.
- Expo SDK 58.0.25 selects React/React DOM 19.3.0, React Native 0.88.1,
  AsyncStorage 2.2.0, SVG 15.16.0, and its matching Expo modules. Keep public and
  website React aligned with the native renderer. `expo install --check` and
  `expo-doctor` must pass after changes.
- Babel 7.29.13 core and 7.29.14 runtime are the latest compatible Babel 7
  patches. Expo's preset still depends on Babel 7; Babel 8 is not a drop-in update.
- Android Gradle, AGP, Kotlin, NDK, and SDK settings come from Expo's template.
  Upgrade them with Expo. The host pins patched JDK 17 and verifies Gradle's
  official distribution SHA-256 after every native regeneration.

## Temporary exceptions

- The public parser and Expo fingerprint each require minimatch 10, affected by
  [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
  Parent-specific overrides select 11.0.8. Linting, type checking, Expo
  fingerprinting, tests, exports, and native builds validate the consumers.
  Remove each override when its parent adopts a patched version.
- Expo's `ua-parser-js@1.0.41` transitive dependency is the last MIT-licensed
  1.x release. Its npm-signed 2025 tarball predates provenance on 2.x. Only that
  exact version is exempt from provenance downgrade detection; integrity and
  advisory checks remain active. Do not broaden this exception or switch to the
  differently licensed 2.x line without reviewing its parent dependency.
- Expo still brings Gson 2.8.6 and Commons IO 1.4 into Android. The host's
  `withAndroidToolchain` plugin selects Gson 2.15.0 and Commons IO 2.22.0 and
  persists the constraints through prebuild. Remove them once upstream resolves
  patched versions, then rerun the native OSV scan and release build.

## Verification

Run `pnpm check` and `pnpm audit:deps` in the public workspace. Each private host
also exposes `check` and `audit:deps`. Expo additionally exposes `audit:android`,
which regenerates Android, resolves the complete release runtime graph, and
fails on unresolved libraries, OSV request errors, or any advisory match. It
writes machine-readable results to `mobile-expo/artifacts/security/`.

Use frozen installs after updating lockfiles. Retain the narrow build-script
allowlists and release-age policy. A clean advisory scan covers known database
entries; device upgrades, iOS native libraries, and deployed hosting still need
their own validation. Signing credentials stay outside the repositories.
