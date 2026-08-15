# Smart Home Monitoring and Control System

A full-stack smart home solution for monitoring and controlling IoT devices across
multiple floors. It consists of an **Android app** built with Jetpack Compose and a
**web dashboard** built with React + TypeScript, both connected in real time to the
same Firebase Realtime Database.

## Features

- **Floor-based dashboards** — visual floor plans with devices positioned on a grid,
  color-coded by live state (On / Off / Error / Disconnected).
- **Device control** — toggle devices on/off from the floor plan, device list, or a
  detail screen with per-switch controls, schedules, and safety timers.
- **Supported device types**:
  - Outlet
  - Multi-Switch
  - Safety-Timed (e.g. iron, auto shut-off after a max duration)
  - Scheduled Light (scheduled on/off times)
  - Camera (snapshot + live stream)
- **Real-time alerts** — live alerts feed with read/unread tracking and per-floor
  attribution.
- **Usage reports & charts** — on-time per device and over time, with Today /
  This Week / This Month filters.
- **Firebase Authentication** — email/password sign-in; floors, devices, and alerts
  are scoped to the signed-in user.
- **Cross-platform sync** — any change made in the app or the web dashboard appears
  instantly in the other.

## Project structure

```
├── app/                    # Android app (Jetpack Compose)
│   └── src/main/java/com/example/smarthomemonitoringcontrolsystem/
│       ├── data/           # Models + Firebase repositories
│       ├── navigation/     # Bottom nav, nav graph, routes
│       ├── ui/             # Compose screens, components, theme, viewmodels
│       └── ui/screens/     # Login, floors, floor dashboard, device detail,
│                           # alerts, reports, settings, add/edit floor & device
├── web-dashboard/          # Web dashboard (Vite + React + TypeScript)
│   └── src/
│       ├── components/     # Stats, floor plan, alerts feed, usage charts, ...
│       ├── hooks/          # Real-time Firebase subscriptions
│       └── services/       # Writes that mirror the Android repositories
├── build.gradle.kts        # Android Gradle build config
├── settings.gradle.kts
├── gradle/libs.versions.toml
└── Dockerfile              # Containerized Android debug builds
```

## Android app

### Stack

- **Kotlin** + **Jetpack Compose** (Material 3)
- **Navigation Compose** for in-app navigation
- **Firebase** Auth, Realtime Database, and Storage
- **Coil** for image loading, **kotlinx.serialization** for JSON
- minSdk 24, targetSdk 37, Java 11

### Run it

```bash
# Build a debug APK
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk

# Install on a connected device/emulator
./gradlew installDebug
```

Open the project in Android Studio, connect Firebase with your
`google-services.json` in `app/`, and run on a device or emulator.

### Screens

| Screen | Purpose |
|--------|---------|
| Login | Firebase email/password sign-in |
| Floors | List of floors owned by the user |
| Floor Dashboard | Grid floor plan with live device states |
| Device Detail | Control panel: toggle, switches, schedule, safety timer, camera |
| Alerts | Real-time alert feed, mark read |
| Reports | Usage charts from `usage_logs` |
| Settings | Theme and account preferences |
| Add/Edit Floor & Device | Create and configure floors and devices |

## Web dashboard

Located in [`web-dashboard/`](web-dashboard/README.md). It connects to the same
Firebase Realtime Database, so it mirrors the app's state live in the browser.

### Stack

- **Vite + React + TypeScript**
- **Recharts** for usage charts, **lucide-react** for icons
- **Firebase SDK** (Realtime Database)

### Run it

```bash
cd web-dashboard
npm install
npm run dev      # start the dev server (Vite prints the local URL)
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```

### Dashboard sections

- **Stats overview** — total devices, devices on, devices in alert, unread alerts.
- **Floor plan** — device grid per floor, colored by state, mirroring the app.
- **Alerts feed** — live alerts, newest first.
- **Device usage** — charts from `usage_logs` with time filters.
- **Device control** — click any device to toggle it, edit switches, schedules,
  safety timers, or view the camera.

## Data model

The shared Firebase Realtime Database uses these nodes:

| Node | Description |
|------|-------------|
| `devices` | Devices, keyed by id, with `floorId`, type, state, grid position, and type-specific fields |
| `floors` | Floor definitions, keyed by id, with an owner `userId` |
| `alerts` | Alerts, keyed by id, attributed to a floor/user, with read state |
| `usage_logs` | On/off usage records used by the reports and charts |

Both clients read via real-time subscriptions, so the UI always reflects the
current state. Writes use partial updates so fields not modeled by one client are
never overwritten by the other.

## Deployment

The Android app can be built in CI or locally via the included `Dockerfile`:

```bash
docker build -t smart-home-android-build .
```

## Requirements

- **Android**: Android Studio (recent version with SDK 37), Java 11+, and a
  Firebase project (Realtime Database + Auth).
- **Web**: Node.js 18+ and `npm` (or your preferred package manager).

## License

This project is for academic purposes (SCS3311 Mobile Application Design and
Development). No license is specified.
