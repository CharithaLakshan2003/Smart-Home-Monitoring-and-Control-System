import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FloorPlanGrid } from './components/FloorPlanGrid';
import { DeviceDetailPanel } from './components/DeviceDetailPanel';
import { AlertsPage } from './components/AlertsFeed';
import { UsageCharts } from './components/UsageCharts';
import { useDevices } from './hooks/useDevices';
import { useFloors } from './hooks/useFloors';
import { useAlerts } from './hooks/useAlerts';
import { useUsageLogs } from './hooks/useUsageLogs';
import { useFirebaseConnection } from './hooks/useFirebaseConnection';

type View = 'dashboard' | 'alerts';

function App() {
  const isConnected = useFirebaseConnection();
  const devicesMap = useDevices();
  const floorsMap = useFloors();
  const alerts = useAlerts();
  const usageLogs = useUsageLogs();

  const devices = useMemo(() => Object.values(devicesMap), [devicesMap]);
  const floors = useMemo(() => Object.values(floorsMap), [floorsMap]);
  const unreadCount = useMemo(() => alerts.filter((a) => !a.read).length, [alerts]);

  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<View>('dashboard');

  // Resolve against the live map so the panel re-renders as writes land, and
  // closes by itself if the device is deleted from another client.
  const selectedDevice = selectedDeviceId ? devicesMap[selectedDeviceId] ?? null : null;
  // Alerts raised from the dashboard are attributed to the floor's owner, since
  // the app filters alerts by userId and the dashboard has no signed-in user.
  const selectedDeviceOwner = selectedDevice
    ? floorsMap[selectedDevice.floorId]?.userId ?? ''
    : '';

  // Default to the first floor once floors arrive.
  useEffect(() => {
    if (selectedFloorId === null && floors.length > 0) {
      setSelectedFloorId(floors[0].id);
    }
  }, [floors, selectedFloorId]);

  // Reflect the theme choice on the root element (drives the CSS variables).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        isConnected={isConnected}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        unreadCount={unreadCount}
        alertsActive={view === 'alerts'}
        onOpenAlerts={() => setView((v) => (v === 'alerts' ? 'dashboard' : 'alerts'))}
      />

      {view === 'alerts' ? (
        <AlertsPage alerts={alerts} onBack={() => setView('dashboard')} />
      ) : (
        <main
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 1440,
            margin: '0 auto',
            padding: '26px clamp(16px, 3vw, 34px) 60px',
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
          }}
        >
          <StatsOverview
            devices={devices}
            floors={floors}
            alerts={alerts}
            onOpenAlerts={() => setView('alerts')}
          />

          <FloorPlanGrid
            floors={floors}
            devices={devices}
            selectedFloorId={selectedFloorId}
            onSelectFloor={setSelectedFloorId}
            onSelectDevice={(d) => setSelectedDeviceId(d.id)}
          />

          <UsageCharts logs={usageLogs} theme={theme} />
        </main>
      )}

      {selectedDevice && (
        <DeviceDetailPanel
          device={selectedDevice}
          ownerUserId={selectedDeviceOwner}
          onClose={() => setSelectedDeviceId(null)}
        />
      )}
    </div>
  );
}

export default App;
