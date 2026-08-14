package com.example.smarthomemonitoringcontrolsystem.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smarthomemonitoringcontrolsystem.data.model.Alert
import com.example.smarthomemonitoringcontrolsystem.data.model.Device
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceState
import com.example.smarthomemonitoringcontrolsystem.data.model.UsageLog
import com.example.smarthomemonitoringcontrolsystem.data.repository.AlertRepository
import com.example.smarthomemonitoringcontrolsystem.data.repository.DeviceRepository
import com.example.smarthomemonitoringcontrolsystem.data.repository.UsageRepository
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DeviceUiState(
    val devices: List<Device> = emptyList(),
    val selectedDevice: Device? = null,
    val isLoading: Boolean = true,
    val error: String? = null
)

class DeviceViewModel : ViewModel() {
    private val repository = DeviceRepository()
    private val alertRepository = AlertRepository()
    private val usageRepository = UsageRepository()
    private val auth = FirebaseAuth.getInstance()

    private val _uiState = MutableStateFlow(DeviceUiState())
    val uiState: StateFlow<DeviceUiState> = _uiState.asStateFlow()

    private fun currentUserId(): String = auth.currentUser?.uid ?: ""

    fun loadDevices(floorId: String) {
        viewModelScope.launch {
            repository.getDevices(floorId).collect { devices ->
                _uiState.value = _uiState.value.copy(
                    devices = devices,
                    isLoading = false
                )
            }
        }
    }

    fun loadDevice(deviceId: String) {
        viewModelScope.launch {
            repository.getDevice(deviceId).collect { device ->
                _uiState.value = _uiState.value.copy(
                    selectedDevice = device,
                    isLoading = false
                )
            }
        }
    }

    fun addDevice(device: Device) {
        viewModelScope.launch {
            repository.addDevice(device)
        }
    }

    fun updateDevice(device: Device) {
        viewModelScope.launch {
            repository.updateDevice(device)
        }
    }

    fun toggleDeviceState(device: Device) {
        viewModelScope.launch {
            val newState = when (device.state) {
                DeviceState.ON -> DeviceState.OFF
                DeviceState.OFF -> DeviceState.ON
                else -> return@launch
            }
            val now = System.currentTimeMillis()
            val updatedDevice = device.copy(
                state = newState,
                lastUpdated = now,
                turnedOnAt = if (newState == DeviceState.ON) now else device.turnedOnAt
            )
            repository.updateDevice(updatedDevice)

            if (newState == DeviceState.OFF && device.state == DeviceState.ON) {
                val duration = if (device.turnedOnAt > 0) (now - device.turnedOnAt) / 1000 else 0
                usageRepository.logUsage(
                    UsageLog(
                        userId = currentUserId(),
                        deviceId = device.id,
                        deviceName = device.label,
                        floorId = device.floorId,
                        onTime = device.turnedOnAt,
                        offTime = now,
                        durationSeconds = duration
                    )
                )

                if (device.type.name == "SAFETY_TIMED" && device.autoOffTriggered) {
                    alertRepository.addAlert(
                        Alert(
                            userId = currentUserId(),
                            deviceId = device.id,
                            floorId = device.floorId,
                            deviceName = device.label,
                            message = "${device.label} auto shut-off after max duration",
                            timestamp = now
                        )
                    )
                }
            }

            if (newState == DeviceState.ON && device.state == DeviceState.OFF) {
                alertRepository.addAlert(
                    Alert(
                        userId = currentUserId(),
                        deviceId = device.id,
                        floorId = device.floorId,
                        deviceName = device.label,
                        message = "${device.label} turned on",
                        timestamp = now
                    )
                )
            }
        }
    }

    fun toggleSwitch(device: Device, switchIndex: Int) {
        viewModelScope.launch {
            if (switchIndex < device.switchStates.size) {
                val newStates = device.switchStates.toMutableList()
                val wasOn = newStates[switchIndex]
                newStates[switchIndex] = !wasOn
                val now = System.currentTimeMillis()
                val anyOn = newStates.any { it }
                val updatedDevice = device.copy(
                    switchStates = newStates,
                    state = if (anyOn) DeviceState.ON else DeviceState.OFF,
                    lastUpdated = now
                )
                repository.updateDevice(updatedDevice)

                val switchName = device.switchNames.getOrElse(switchIndex) { "Switch ${switchIndex + 1}" }
                if (!wasOn) {
                    alertRepository.addAlert(
                        Alert(
                            userId = currentUserId(),
                            deviceId = device.id,
                            floorId = device.floorId,
                            deviceName = device.label,
                            message = "$switchName turned on",
                            timestamp = now
                        )
                    )
                } else {
                    alertRepository.addAlert(
                        Alert(
                            userId = currentUserId(),
                            deviceId = device.id,
                            floorId = device.floorId,
                            deviceName = device.label,
                            message = "$switchName turned off",
                            timestamp = now
                        )
                    )
                }
            }
        }
    }

    fun setAllSwitches(device: Device, isOn: Boolean) {
        viewModelScope.launch {
            val now = System.currentTimeMillis()
            val newStates = List(device.switchCount) { isOn }
            val updatedDevice = device.copy(
                switchStates = newStates,
                state = if (isOn) DeviceState.ON else DeviceState.OFF,
                lastUpdated = now
            )
            repository.updateDevice(updatedDevice)

            alertRepository.addAlert(
                Alert(
                    userId = currentUserId(),
                    deviceId = device.id,
                    floorId = device.floorId,
                    deviceName = device.label,
                    message = if (isOn) "All switches turned on" else "All switches turned off",
                    timestamp = now
                )
            )
        }
    }

    fun deleteDevice(deviceId: String) {
        viewModelScope.launch {
            repository.deleteDevice(deviceId)
        }
    }

    fun updateMaxDuration(device: Device, seconds: Int) {
        viewModelScope.launch {
            val updatedDevice = device.copy(
                maxOnDurationSec = seconds,
                lastUpdated = System.currentTimeMillis()
            )
            repository.updateDevice(updatedDevice)
        }
    }

    fun updateSchedule(device: Device, start: String, end: String, enabled: Boolean) {
        viewModelScope.launch {
            val updatedDevice = device.copy(
                scheduleStart = start,
                scheduleEnd = end,
                scheduleEnabled = enabled,
                lastUpdated = System.currentTimeMillis()
            )
            repository.updateDevice(updatedDevice)
        }
    }
}
