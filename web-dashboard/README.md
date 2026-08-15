# Smart Home — Web Monitoring Dashboard

A read-only monitoring dashboard for the **Smart Home Monitoring & Control System**.
It connects to the same Firebase Realtime Database as the Android app and the
hardware simulator, and reflects live device state in the browser.

Built with **Vite + React + TypeScript**, charts by **Recharts**, icons by
**lucide-react**. This project is independent of `hardware-simulator-reactApp` — it
only *reads* from Firebase and never writes (monitor-only).

## Sections

- **Stats overview** — KPI tiles: total devices, devices on, devices in alert, unread alerts.
- **Floor plan** — the device grid per floor (positioned by `gridX`/`gridY`), colored
  by state, mirroring the app's Floor Dashboard, with a per-floor device list.
- **Alerts feed** — live list of alerts from the `alerts` node, newest first.
- **Device usage** — charts from `usage_logs`: on-time per device and on-time over
  time, with Today / This Week / This Month filters.

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

The dashboard reads four nodes:

| Node | Used by |
|------|---------|
| `devices` | stats, floor plan |
| `floors` | floor selector, stats |
| `alerts` | alerts feed, stats |
| `usage_logs` | usage charts |
