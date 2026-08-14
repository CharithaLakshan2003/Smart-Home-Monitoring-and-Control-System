package com.example.smarthomemonitoringcontrolsystem.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smarthomemonitoringcontrolsystem.data.model.Device
import com.example.smarthomemonitoringcontrolsystem.data.model.Floor
import com.example.smarthomemonitoringcontrolsystem.data.model.UsageLog
import com.example.smarthomemonitoringcontrolsystem.data.repository.DeviceRepository
import com.example.smarthomemonitoringcontrolsystem.data.repository.FloorRepository
import com.example.smarthomemonitoringcontrolsystem.data.repository.UsageRepository
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class UsageUiState(
    val allLogs: List<UsageLog> = emptyList(),
    val logs: List<UsageLog> = emptyList(),
    val isLoading: Boolean = true,
    val selectedDeviceId: String? = null,
    val selectedFloorId: String? = null,
    val floorDevices: List<Device> = emptyList(),
    val floors: List<Floor> = emptyList(),
    val dateRange: DateRange = DateRange.TODAY,
    val error: String? = null
)

enum class DateRange(val displayName: String) {
    TODAY("Today"),
    THIS_WEEK("This Week"),
    THIS_MONTH("This Month")
}

class UsageViewModel : ViewModel() {
    private val repository = UsageRepository()
    private val deviceRepository = DeviceRepository()
    private val floorRepository = FloorRepository()
    private val auth = FirebaseAuth.getInstance()

    private val _uiState = MutableStateFlow(UsageUiState())
    val uiState: StateFlow<UsageUiState> = _uiState.asStateFlow()

    init {
        loadLogs()
        loadFloors()
    }

    private fun loadFloors() {
        viewModelScope.launch {
            val uid = auth.currentUser?.uid ?: return@launch
            floorRepository.getFloors(uid).collect { floors ->
                _uiState.value = _uiState.value.copy(floors = floors)
            }
        }
    }

    private fun loadLogs() {
        viewModelScope.launch {
            val uid = auth.currentUser?.uid ?: return@launch
            repository.getUsageLogs(
                _uiState.value.selectedDeviceId,
                _uiState.value.selectedFloorId,
                uid
            ).collect { rawLogs ->
                _uiState.value = _uiState.value.copy(
                    allLogs = rawLogs,
                    logs = filterByDateRange(rawLogs),
                    isLoading = false
                )
            }
        }
    }

    fun setDeviceFilter(deviceId: String?) {
        _uiState.value = _uiState.value.copy(selectedDeviceId = deviceId, isLoading = true)
        loadLogs()
    }

    fun setFloorFilter(floorId: String?) {
        _uiState.value = _uiState.value.copy(
            selectedFloorId = floorId,
            selectedDeviceId = null,
            isLoading = true
        )
        loadLogs()
        loadFloorDevices(floorId)
    }

    private fun loadFloorDevices(floorId: String?) {
        viewModelScope.launch {
            if (floorId == null) {
                _uiState.value = _uiState.value.copy(floorDevices = emptyList())
                return@launch
            }
            deviceRepository.getDevices(floorId).collect { devices ->
                _uiState.value = _uiState.value.copy(floorDevices = devices)
            }
        }
    }

    fun setDateRange(range: DateRange) {
        _uiState.value = _uiState.value.copy(
            dateRange = range,
            logs = filterByDateRange(_uiState.value.allLogs)
        )
    }

    fun buildExportData(): String {
        val sb = StringBuilder()
        sb.append("Smart Home Usage Report\n")
        sb.append("Generated: ${SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(System.currentTimeMillis())}\n")
        sb.append("Date Range: ${_uiState.value.dateRange.displayName}\n")
        sb.append("Export Date: ${SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(System.currentTimeMillis())}\n")
        sb.append("----------------------------------------\n")
        sb.append("Device,ON Time,OFF Time,Duration(s)\n")
        _uiState.value.logs.forEach { log ->
            val onTime = formatLogTime(log.onTime)
            val offTime = formatLogTime(log.offTime)
            sb.append("${log.deviceName},${onTime},${offTime},${log.durationSeconds}\n")
        }
        sb.append("----------------------------------------\n")
        sb.append("Total Duration: ${_uiState.value.logs.sumOf { it.durationSeconds }} seconds\n")
        sb.append("Total Events: ${_uiState.value.logs.size}\n")
        if (_uiState.value.logs.isNotEmpty()) {
            val avgDuration = _uiState.value.logs.sumOf { it.durationSeconds }.toDouble() / _uiState.value.logs.size
            sb.append("Average Duration: ${avgDuration.toInt()} seconds\n")
        }
        sb.append("----------------------------------------\n")
        return sb.toString()
    }

    private fun formatLogTime(timestamp: Long): String {
        return try {
            val sdf = SimpleDateFormat("HH:mm", Locale.getDefault())
            sdf.format(Date(timestamp))
        } catch (e: Exception) {
            "--:--"
        }
    }

    private fun filterByDateRange(logs: List<UsageLog>): List<UsageLog> {
        val now = System.currentTimeMillis()
        val cutoff = when (_uiState.value.dateRange) {
            DateRange.TODAY -> now - 24 * 60 * 60 * 1000L
            DateRange.THIS_WEEK -> now - 7 * 24 * 60 * 60 * 1000L
            DateRange.THIS_MONTH -> now - 30 * 24 * 60 * 60 * 1000L
        }
        return logs.filter { it.onTime >= cutoff }
    }
}
