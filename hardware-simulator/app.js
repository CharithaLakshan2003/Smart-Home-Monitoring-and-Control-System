// Using the same Firebase project as the mobile app
const firebaseConfig = {
  apiKey: "AIzaSyDoTPNjXnYksZ9TqqpH4VOgddPe7iO1rw0",
  databaseURL: "https://smart-home-1c2af-default-rtdb.firebaseio.com",
  projectId: "smart-home-1c2af",
  storageBucket: "smart-home-1c2af.firebasestorage.app",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ── Application State ──
const state = {
  floors: {},       // { floorId: floorObject }
  devices: {},      // { deviceId: deviceObject }
  selectedFloorId: null,  // null means "All Floors"
  activityLog: [],  // Array of log entries
  isConnected: false,
  timerIntervals: {},  // Track countdown intervals for safety-timed devices
};

// Device type icons (Bootstrap Icons)
const DEVICE_ICONS = {
  OUTLET: '<i class="bi bi-plug-fill"></i>',
  MULTI_SWITCH: '<i class="bi bi-toggles"></i>',
  SAFETY_TIMED: '<i class="bi bi-fire"></i>',
  SCHEDULED_LIGHT: '<i class="bi bi-lightbulb-fill"></i>',
  CAMERA: '<i class="bi bi-camera-video-fill"></i>',
};

// Device type display names
const DEVICE_TYPE_NAMES = {
  OUTLET: 'Electrical Outlet',
  MULTI_SWITCH: 'Multi-Switch Unit',
  SAFETY_TIMED: 'Safety-Timed Device',
  SCHEDULED_LIGHT: 'Scheduled Light',
  CAMERA: 'Security Camera',
};

// ── DOM References ──
const dom = {
  floorTabs: document.getElementById('floor-tabs'),
  deviceGrid: document.getElementById('device-grid'),
  activityLog: document.getElementById('activity-log'),
  activityCount: document.getElementById('activity-count'),
  connectionStatus: document.getElementById('connection-status'),
  connectionText: document.getElementById('connection-text'),
  deviceCounter: document.getElementById('device-counter'),
  clearLogBtn: document.getElementById('clear-log-btn'),
};

// ── Initialization ──
function init() {
  monitorConnection();
  listenToFloors();
  listenToDevices();
  setupEventListeners();
}

function setupEventListeners() {
  dom.clearLogBtn.addEventListener('click', () => {
    state.activityLog = [];
    renderActivityLog();
  });
}

// ── Firebase Connection Monitor ──
function monitorConnection() {
  db.ref('.info/connected').on('value', (snap) => {
    state.isConnected = snap.val() === true;
    updateConnectionUI();
  });
}

function updateConnectionUI() {
  const el = dom.connectionStatus;
  const textEl = dom.connectionText;
  if (state.isConnected) {
    el.className = 'connection-status connected';
    textEl.textContent = 'Connected';
  } else {
    el.className = 'connection-status disconnected';
    textEl.textContent = 'Disconnected';
  }
}

// ── Firebase Listeners ──
function listenToFloors() {
  db.ref('floors').on('value', (snapshot) => {
    state.floors = {};
    snapshot.forEach((child) => {
      state.floors[child.key] = { id: child.key, ...child.val() };
    });
    renderFloorTabs();
    renderDeviceGrid();
  });
}

function listenToDevices() {
  db.ref('devices').on('value', (snapshot) => {
    const oldDevices = { ...state.devices };
    state.devices = {};
    snapshot.forEach((child) => {
      const deviceData = child.val();
      state.devices[child.key] = {
        id: child.key,
        ...deviceData,
      };
    });

    // Detect changes for activity log
    detectChanges(oldDevices, state.devices);

    renderDeviceGrid();
    updateDeviceCounter();
  });
}

// ── Change Detection for Activity Log ──
function detectChanges(oldDevices, newDevices) {
  for (const id in newDevices) {
    const newDev = newDevices[id];
    const oldDev = oldDevices[id];

    if (!oldDev) {
      // New device added
      addLogEntry(newDev.label || id, `Device added (${newDev.type || 'OUTLET'})`, 'on');
      continue;
    }

    // State change
    if (oldDev.state !== newDev.state) {
      const stateClass = (newDev.state || 'OFF').toLowerCase();
      addLogEntry(
        newDev.label || id,
        `State changed: ${oldDev.state || 'OFF'} → ${newDev.state || 'OFF'}`,
        stateClass === 'on' ? 'on' : stateClass === 'error' ? 'error' : stateClass === 'disconnected' ? 'disconnected' : 'off'
      );
    }

    // Switch state changes (multi-switch)
    if (newDev.switchStates && oldDev.switchStates) {
      for (let i = 0; i < newDev.switchStates.length; i++) {
        if (oldDev.switchStates[i] !== newDev.switchStates[i]) {
          const switchName = (newDev.switchNames && newDev.switchNames[i]) || `Switch ${i + 1}`;
          addLogEntry(
            newDev.label || id,
            `${switchName}: ${newDev.switchStates[i] ? 'ON' : 'OFF'}`,
            'switch'
          );
        }
      }
    }

    // Auto-off triggered
    if (!oldDev.autoOffTriggered && newDev.autoOffTriggered) {
      addLogEntry(newDev.label || id, 'Auto-off triggered (safety cutoff)', 'error');
    }
  }

  // Detect deleted devices
  for (const id in oldDevices) {
    if (!newDevices[id]) {
      addLogEntry(oldDevices[id].label || id, 'Device removed', 'off');
    }
  }
}

function addLogEntry(deviceName, message, iconType) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  state.activityLog.unshift({ deviceName, message, iconType, time });

  // Keep last 100 entries
  if (state.activityLog.length > 100) {
    state.activityLog.pop();
  }

  renderActivityLog();
}

// ── Rendering: Floor Tabs ──
function renderFloorTabs() {
  const floors = Object.values(state.floors);

  let html = `
    <button class="floor-tab floor-tab-all ${state.selectedFloorId === null ? 'active' : ''}"
            onclick="selectFloor(null)">
      All Floors
      <span class="tab-badge">${Object.keys(state.devices).length}</span>
    </button>
  `;

  floors.forEach((floor) => {
    const devCount = Object.values(state.devices).filter((d) => d.floorId === floor.id).length;
    html += `
      <button class="floor-tab ${state.selectedFloorId === floor.id ? 'active' : ''}"
              onclick="selectFloor('${floor.id}')">
        ${escapeHtml(floor.name || 'Unnamed Floor')}
        <span class="tab-badge">${devCount}</span>
      </button>
    `;
  });

  dom.floorTabs.innerHTML = html;
}

function selectFloor(floorId) {
  state.selectedFloorId = floorId;
  renderFloorTabs();
  renderDeviceGrid();
}

// ── Rendering: Device Grid ──
function renderDeviceGrid() {
  // Clear existing timer intervals
  Object.values(state.timerIntervals).forEach(clearInterval);
  state.timerIntervals = {};

  let devices = Object.values(state.devices);

  // Filter by floor if one is selected
  if (state.selectedFloorId) {
    devices = devices.filter((d) => d.floorId === state.selectedFloorId);
  }

  if (devices.length === 0) {
    dom.deviceGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i class="bi bi-house-door"></i></div>
        <div class="empty-state-title">No devices found</div>
        <div class="empty-state-text">
          ${state.selectedFloorId
            ? 'No devices are assigned to this floor. Add devices from the mobile app.'
            : 'No devices in the system yet. Add devices from the mobile app to see them here.'}
        </div>
      </div>
    `;
    return;
  }

  // Sort: by type, then by label
  devices.sort((a, b) => {
    const typeOrder = ['OUTLET', 'MULTI_SWITCH', 'SAFETY_TIMED', 'SCHEDULED_LIGHT', 'CAMERA'];
    const aIdx = typeOrder.indexOf(a.type || 'OUTLET');
    const bIdx = typeOrder.indexOf(b.type || 'OUTLET');
    if (aIdx !== bIdx) return aIdx - bIdx;
    return (a.label || '').localeCompare(b.label || '');
  });

  let html = '';
  devices.forEach((device) => {
    html += renderDeviceCard(device);
  });

  dom.deviceGrid.innerHTML = html;

  // Start timer intervals for safety-timed devices
  devices.forEach((device) => {
    if ((device.type === 'SAFETY_TIMED') && (device.state === 'ON') && device.turnedOnAt > 0) {
      startSafetyTimer(device.id, device.turnedOnAt, device.maxOnDurationSec || 1800);
    }
  });
}

function renderDeviceCard(device) {
  const type = device.type || 'OUTLET';
  const deviceState = device.state || 'OFF';
  const icon = DEVICE_ICONS[type] || '<i class="bi bi-plug-fill"></i>';
  const typeName = DEVICE_TYPE_NAMES[type] || type;
  const floor = state.floors[device.floorId];
  const floorName = floor ? floor.name : 'Unknown Floor';
  const isOn = deviceState === 'ON';
  const isDisabled = deviceState === 'ERROR' || deviceState === 'DISCONNECTED';
  const lastUpdated = device.lastUpdated
    ? new Date(device.lastUpdated).toLocaleString()
    : 'Unknown';

  let cardBody = '';

  switch (type) {
    case 'OUTLET':
      cardBody = renderOutletBody(device, isOn, isDisabled);
      break;
    case 'MULTI_SWITCH':
      cardBody = renderMultiSwitchBody(device, isDisabled);
      break;
    case 'SAFETY_TIMED':
      cardBody = renderSafetyTimedBody(device, isOn, isDisabled);
      break;
    case 'SCHEDULED_LIGHT':
      cardBody = renderScheduledLightBody(device, isOn, isDisabled);
      break;
    case 'CAMERA':
      cardBody = renderCameraBody(device, isOn, isDisabled);
      break;
  }

  return `
    <div class="device-card" data-type="${type}" data-state="${deviceState}" data-id="${device.id}">
      <div class="card-header">
        <div class="card-info">
          <div class="card-icon">${icon}</div>
          <div class="card-text">
            <div class="card-label">${escapeHtml(device.label || 'Unnamed Device')}</div>
            <div class="card-type">${typeName}</div>
            <div class="card-floor-badge"><i class="bi bi-geo-alt-fill"></i> ${escapeHtml(floorName)}</div>
          </div>
        </div>
        <span class="state-badge ${deviceState.toLowerCase()}">
          <span class="state-dot"></span>
          ${deviceState}
        </span>
      </div>

      ${cardBody}

      <div class="last-updated">Last updated: ${lastUpdated}</div>

      <div class="card-actions">
        <button class="action-btn danger" onclick="simulateState('${device.id}', 'ERROR')" title="Simulate Error">
          <i class="bi bi-exclamation-triangle-fill"></i> Error
        </button>
        <button class="action-btn warning" onclick="simulateState('${device.id}', 'DISCONNECTED')" title="Simulate Disconnect">
          <i class="bi bi-wifi-off"></i> Disconnect
        </button>
        ${deviceState === 'ERROR' || deviceState === 'DISCONNECTED' ? `
          <button class="action-btn" onclick="simulateState('${device.id}', 'OFF')" title="Recover to OFF">
            <i class="bi bi-arrow-counterclockwise"></i> Recover
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// ── Device-Type Specific Renderers ──
function renderOutletBody(device, isOn, isDisabled) {
  return `
    <div class="toggle-container">
      <span class="toggle-label">Power</span>
      <label class="toggle-switch">
        <input type="checkbox" ${isOn ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}
               onchange="toggleDevice('${device.id}', this.checked)">
        <span class="toggle-slider"></span>
      </label>
    </div>
  `;
}

function renderMultiSwitchBody(device, isDisabled) {
  const switchCount = device.switchCount || 1;
  const switchNames = device.switchNames || [];
  const switchStates = device.switchStates || [];

  let switchesHtml = '';
  for (let i = 0; i < switchCount; i++) {
    const name = switchNames[i] || `Switch ${i + 1}`;
    const isOn = switchStates[i] === true;
    switchesHtml += `
      <div class="multi-switch-row">
        <span class="switch-name">${escapeHtml(name)}</span>
        <label class="switch-toggle">
          <input type="checkbox" ${isOn ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}
                 onchange="toggleSwitch('${device.id}', ${i}, this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    `;
  }

  // Main toggle for all switches
  const allOn = switchStates.length > 0 && switchStates.every((s) => s === true);

  return `
    <div class="toggle-container">
      <span class="toggle-label">Master (All)</span>
      <label class="toggle-switch">
        <input type="checkbox" ${allOn ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}
               onchange="toggleAllSwitches('${device.id}', ${switchCount}, this.checked)">
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div class="multi-switch-panel">
      ${switchesHtml}
    </div>
  `;
}

function renderSafetyTimedBody(device, isOn, isDisabled) {
  const maxDuration = device.maxOnDurationSec || 1800;
  const turnedOnAt = device.turnedOnAt || 0;
  const autoOffTriggered = device.autoOffTriggered || false;

  let timerHtml = '';
  if (isOn && turnedOnAt > 0) {
    const elapsed = Math.floor((Date.now() - turnedOnAt) / 1000);
    const remaining = Math.max(0, maxDuration - elapsed);
    const percentage = Math.min(100, (elapsed / maxDuration) * 100);
    const isCritical = remaining < 60;

    timerHtml = `
      <div class="safety-timer">
        <div class="timer-row">
          <span class="timer-label">Time Remaining</span>
          <span class="timer-value ${isCritical ? 'critical' : ''}" id="timer-${device.id}">
            ${formatDuration(remaining)}
          </span>
        </div>
        <div class="timer-bar">
          <div class="timer-bar-fill" id="timer-bar-${device.id}" style="width: ${percentage}%"></div>
        </div>
        <div class="timer-row" style="margin-top: 6px;">
          <span class="timer-label">Max Duration</span>
          <span style="font-size: 0.78rem; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace;">
            ${formatDuration(maxDuration)}
          </span>
        </div>
      </div>
    `;
  } else if (autoOffTriggered) {
    timerHtml = `
      <div class="safety-timer">
        <div class="auto-off-badge"><i class="bi bi-exclamation-triangle-fill"></i> Auto-off was triggered (safety cutoff)</div>
        <div class="timer-row" style="margin-top: 8px;">
          <span class="timer-label">Max Duration</span>
          <span style="font-size: 0.78rem; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace;">
            ${formatDuration(maxDuration)}
          </span>
        </div>
      </div>
    `;
  } else {
    timerHtml = `
      <div class="safety-timer">
        <div class="timer-row">
          <span class="timer-label">Max Duration</span>
          <span style="font-size: 0.78rem; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace;">
            ${formatDuration(maxDuration)}
          </span>
        </div>
      </div>
    `;
  }

  return `
    <div class="toggle-container">
      <span class="toggle-label">Power</span>
      <label class="toggle-switch">
        <input type="checkbox" ${isOn ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}
               onchange="toggleSafetyDevice('${device.id}', this.checked)">
        <span class="toggle-slider"></span>
      </label>
    </div>
    ${timerHtml}
  `;
}

function renderScheduledLightBody(device, isOn, isDisabled) {
  const scheduleStart = device.scheduleStart || '18:00';
  const scheduleEnd = device.scheduleEnd || '23:00';
  const scheduleEnabled = device.scheduleEnabled !== false;

  return `
    <div class="toggle-container">
      <span class="toggle-label">Power</span>
      <label class="toggle-switch">
        <input type="checkbox" ${isOn ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}
               onchange="toggleDevice('${device.id}', this.checked)">
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div class="schedule-panel">
      <div class="schedule-times">
        <span><i class="bi bi-clock"></i> ${scheduleStart}</span>
        <span class="schedule-arrow"><i class="bi bi-arrow-right"></i></span>
        <span><i class="bi bi-clock-fill"></i> ${scheduleEnd}</span>
      </div>
      <div class="schedule-enabled">
        <span class="schedule-enabled-label">Schedule Active</span>
        <label class="switch-toggle">
          <input type="checkbox" ${scheduleEnabled ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}
                 onchange="toggleSchedule('${device.id}', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  `;
}

function renderCameraBody(device, isOn, isDisabled) {
  const snapshotUrl = device.snapshotUrl || '';
  const streamUrl = device.streamUrl || '';

  return `
    <div class="toggle-container">
      <span class="toggle-label">Camera Feed</span>
      <label class="toggle-switch">
        <input type="checkbox" ${isOn ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}
               onchange="toggleDevice('${device.id}', this.checked)">
        <span class="toggle-slider"></span>
      </label>
    </div>
    <div class="camera-panel">
      <div class="camera-feed ${isOn ? 'active' : ''}">
        ${snapshotUrl
          ? `<img src="${escapeHtml(snapshotUrl)}" alt="Camera snapshot"
                  style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div style="display:none;flex-direction:column;align-items:center;gap:8px;">
               <span class="camera-feed-icon"><i class="bi ${isOn ? 'bi-camera-video-fill' : 'bi-camera-video-off'}"></i></span>
               <span class="camera-feed-text">${isOn ? 'Live Feed Active' : 'Camera Off'}</span>
             </div>`
          : `<span class="camera-feed-icon"><i class="bi ${isOn ? 'bi-camera-video-fill' : 'bi-camera-video-off'}"></i></span>
             <span class="camera-feed-text">${isOn ? 'Live Feed Active' : 'Camera Off'}</span>`
        }
      </div>
      ${streamUrl ? `<div class="camera-url">Stream: ${escapeHtml(streamUrl)}</div>` : ''}
      ${snapshotUrl ? `<div class="camera-url">Snapshot: ${escapeHtml(snapshotUrl)}</div>` : ''}
    </div>
  `;
}

// ── Device Actions (Write to Firebase) ──
function toggleDevice(deviceId, isOn) {
  const updates = {
    state: isOn ? 'ON' : 'OFF',
    lastUpdated: Date.now(),
  };
  db.ref(`devices/${deviceId}`).update(updates).catch((err) => {
    console.error('Failed to toggle device:', err);
    addLogEntry(state.devices[deviceId]?.label || deviceId, `Toggle failed: ${err.message}`, 'error');
  });
}

function toggleSafetyDevice(deviceId, isOn) {
  const updates = {
    state: isOn ? 'ON' : 'OFF',
    turnedOnAt: isOn ? Date.now() : 0,
    autoOffTriggered: false,
    lastUpdated: Date.now(),
  };
  db.ref(`devices/${deviceId}`).update(updates).catch((err) => {
    console.error('Failed to toggle safety device:', err);
    addLogEntry(state.devices[deviceId]?.label || deviceId, `Toggle failed: ${err.message}`, 'error');
  });
}

function toggleSwitch(deviceId, switchIndex, isOn) {
  db.ref(`devices/${deviceId}/switchStates/${switchIndex}`).set(isOn).then(() => {
    return db.ref(`devices/${deviceId}/lastUpdated`).set(Date.now());
  }).catch((err) => {
    console.error('Failed to toggle switch:', err);
  });
}

function toggleAllSwitches(deviceId, count, isOn) {
  const newStates = Array(count).fill(isOn);
  db.ref(`devices/${deviceId}`).update({
    switchStates: newStates,
    state: isOn ? 'ON' : 'OFF',
    lastUpdated: Date.now(),
  }).catch((err) => {
    console.error('Failed to toggle all switches:', err);
  });
}

function toggleSchedule(deviceId, enabled) {
  db.ref(`devices/${deviceId}`).update({
    scheduleEnabled: enabled,
    lastUpdated: Date.now(),
  }).catch((err) => {
    console.error('Failed to toggle schedule:', err);
  });
}

function simulateState(deviceId, newState) {
  const updates = {
    state: newState,
    lastUpdated: Date.now(),
  };
  // If recovering, also clear auto-off
  if (newState === 'OFF') {
    updates.autoOffTriggered = false;
    updates.turnedOnAt = 0;
  }
  db.ref(`devices/${deviceId}`).update(updates).catch((err) => {
    console.error('Failed to simulate state:', err);
  });
}

// ── Safety Timer Countdown ──
function startSafetyTimer(deviceId, turnedOnAt, maxDuration) {
  // Clear any existing interval
  if (state.timerIntervals[deviceId]) {
    clearInterval(state.timerIntervals[deviceId]);
  }

  state.timerIntervals[deviceId] = setInterval(() => {
    const timerEl = document.getElementById(`timer-${deviceId}`);
    const barEl = document.getElementById(`timer-bar-${deviceId}`);

    if (!timerEl || !barEl) {
      clearInterval(state.timerIntervals[deviceId]);
      return;
    }

    const elapsed = Math.floor((Date.now() - turnedOnAt) / 1000);
    const remaining = Math.max(0, maxDuration - elapsed);
    const percentage = Math.min(100, (elapsed / maxDuration) * 100);
    const isCritical = remaining < 60;

    timerEl.textContent = formatDuration(remaining);
    timerEl.className = `timer-value ${isCritical ? 'critical' : ''}`;
    barEl.style.width = `${percentage}%`;

    if (remaining <= 0) {
      clearInterval(state.timerIntervals[deviceId]);
    }
  }, 1000);
}

// ── Rendering: Activity Log ──
function renderActivityLog() {
  const logEl = dom.activityLog;
  dom.activityCount.textContent = state.activityLog.length;

  if (state.activityLog.length === 0) {
    logEl.innerHTML = `
      <div class="activity-empty">
        <div class="activity-empty-icon"><i class="bi bi-journal-text"></i></div>
        <div>No activity yet</div>
        <div style="font-size:0.75rem; margin-top:4px; color:var(--text-dim);">
          Device state changes will appear here
        </div>
      </div>
    `;
    return;
  }

  let html = '';
  state.activityLog.forEach((entry) => {
    const iconMap = {
      on: '<i class="bi bi-check-circle-fill"></i>',
      off: '<i class="bi bi-circle"></i>',
      error: '<i class="bi bi-exclamation-circle-fill"></i>',
      disconnected: '<i class="bi bi-wifi-off"></i>',
      switch: '<i class="bi bi-toggles"></i>',
    };
    html += `
      <div class="log-entry">
        <div class="log-icon ${entry.iconType}">${iconMap[entry.iconType] || '<i class="bi bi-pencil-square"></i>'}</div>
        <div class="log-content">
          <div class="log-device">${escapeHtml(entry.deviceName)}</div>
          <div class="log-message">${escapeHtml(entry.message)}</div>
        </div>
        <div class="log-time">${entry.time}</div>
      </div>
    `;
  });

  logEl.innerHTML = html;
}

// ── Update Device Counter ──
function updateDeviceCounter() {
  const total = Object.keys(state.devices).length;
  const onCount = Object.values(state.devices).filter((d) => d.state === 'ON').length;
  dom.deviceCounter.innerHTML = `<strong>${onCount}</strong> ON / <strong>${total}</strong> Total`;
}

// ── Utility Functions ──
function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Start the Application ──
document.addEventListener('DOMContentLoaded', init);
