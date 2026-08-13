import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
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

  const isLoading = !isConnected && Object.keys(devices).length === 0;

  return (
    <div className="w-full min-h-screen bg-[#000] flex text-[var(--text-primary)] p-0 sm:p-4 md:p-6 lg:p-8">
      <div className="flex-1 flex w-full max-w-[1920px] mx-auto bg-[var(--bg-primary)] rounded-[32px] overflow-hidden border border-[var(--border-subtle)] shadow-2xl relative">
        {/* Sidebar Navigation */}
      <Sidebar 
        floors={floors}
        devices={devices}
        selectedFloorId={selectedFloorId}
        onSelectFloor={setSelectedFloorId}
      />

      {/* Main Layout Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pl-5">
        {/* Global Header */}
        <Header devices={devices} isConnected={isConnected} />

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 flex gap-8 max-xl:flex-col relative">
          
          {/* Main Grid Area */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            <DeviceGrid
              devices={devices}
              floors={floors}
              selectedFloorId={selectedFloorId}
              isLoading={isLoading}
            />
          </div>

          {/* Activity Sidebar */}
          <div className="w-[380px] shrink-0 max-xl:w-full">
            <ActivityLog log={activityLog} onClear={clearLog} />
          </div>

        </div>
        </main>
      </div>
    </div>
  );
}

export default App;
