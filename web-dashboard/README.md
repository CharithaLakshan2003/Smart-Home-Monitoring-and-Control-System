# Smart Home — Web Monitoring Dashboard

A monitoring **and control** dashboard for the **Smart Home Monitoring & Control
System**. It connects to the same Firebase Realtime Database as the Android app
and the hardware simulator, reflects live device state in the browser, and can
switch devices from there.

Built with **Vite + React + TypeScript**, charts by **Recharts**, icons by
**lucide-react**. This project is independent of `hardware-simulator-reactApp`.

## Sections

- **Stats overview** — KPI tiles: total devices, devices on, devices in alert, unread alerts.
- **Floor plan** — the device grid per floor (positioned by `gridX`/`gridY`), colored
  by state, mirroring the app's Floor Dashboard, with a per-floor device list.
- **Alerts feed** — live list of alerts from the `alerts` node, newest first.
- **Device usage** — charts from `usage_logs`: on-time per device and on-time over
  time, with Today / This Week / This Month filters.
- **Device control** — click any device (on the plan or in the list) to open a
  panel with an on/off toggle, per-switch controls for Multi-Switch, schedule
  editing for Scheduled Light, auto shut-off duration for Safety-Timed, and the
  snapshot/stream for Camera.

## Control & writes

Writes live in `src/services/` and mirror the Android `DeviceRepository` /
`AlertRepository` field-for-field, so the app and dashboard stay interchangeable:

- `deviceService.ts` — `toggleDevice`, `toggleSwitch`, `setAllSwitches`,
  `updateSchedule`, `updateMaxOnDuration`. All use partial `update()` writes, so
  fields the dashboard does not model are never overwritten.
- `alertService.ts` — `addAlert`, `markAlertRead`, `markAlertsRead`.

Two deliberate choices:

- **No usage logs are written here.** The app derives them from an ON→OFF
  transition observer (`DeviceViewModel.observeUsageTransitions`), so logging
  from the dashboard too would double-count every switch-off.
- **Alerts are attributed to the floor's owner.** The app reads alerts with
  `getAlerts(userId)` and drops rows whose `userId` does not match. The dashboard
  has no signed-in user, so it uses `Floor.userId` — otherwise alerts raised from
  the browser would be invisible in the app.

## Run it

```bash
npm install
npm run dev      # start the dev server (Vite prints the local URL)
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```

## Firebase

Configuration lives in `src/firebase.ts` and points at the shared
`smart-home-1c2af` Realtime Database. Data is read via `onValue` subscriptions in
`src/hooks/`, so the UI updates in real time as the app or simulator changes state.

## Data source

The dashboard uses four nodes:

| Node | Used by | Access |
|------|---------|--------|
| `devices` | stats, floor plan, control panel | read + write |
| `floors` | floor selector, stats, alert attribution | read |
| `alerts` | alerts feed, stats | read + write |
| `usage_logs` | usage charts | read |

Writes require the Realtime Database rules to permit them on `devices` and
`alerts`. If a control fails, the panel shows the Firebase error rather than
failing silently — a `PERMISSION_DENIED` message means the rules need updating.
