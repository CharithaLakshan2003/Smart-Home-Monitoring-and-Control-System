import { useState } from 'react';
import { Header } from './components/Header';
import { FloorTabs } from './components/FloorTabs';
import { DeviceGrid } from './components/DeviceGrid';
import { ActivityLog } from './components/ActivityLog';
import { useFirebaseConnection } from './hooks/useFirebaseConnection';
import { useFloors } from './hooks/useFloors';
import { useDevices } from './hooks/useDevices';

function App() {
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);

  const isConnected = useFirebaseConnection();
  const floors = useFloors();
  const { devices, activityLog, clearLog } = useDevices();

  // Determine if we're still loading (no data yet and not connected)
  const isLoading = !isConnected && Object.keys(devices).length === 0;

  return (
    <div className="max-w-[1440px] mx-auto px-6 pb-10">
      {/* Header */}
      <Header devices={devices} isConnected={isConnected} />

      {/* Floor Tabs */}
      <FloorTabs
        floors={floors}
        devices={devices}
        selectedFloorId={selectedFloorId}
        onSelectFloor={setSelectedFloorId}
      />

      {/* Main Layout: Device Grid + Activity Log */}
      <div className="grid grid-cols-[1fr_340px] gap-6 items-start max-lg:grid-cols-1">
        {/* Device Grid (includes Floor Plan View when floor is selected) */}
        <DeviceGrid
          devices={devices}
          floors={floors}
          selectedFloorId={selectedFloorId}
          isLoading={isLoading}
        />

        {/* Activity Log */}
        <ActivityLog log={activityLog} onClear={clearLog} />
      </div>
    </div>
  );
}

export default App;
