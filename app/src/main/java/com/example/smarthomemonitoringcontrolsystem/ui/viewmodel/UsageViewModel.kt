package com.example.smarthomemonitoringcontrolsystem.ui.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smarthomemonitoringcontrolsystem.data.model.UsageLog
import com.example.smarthomemonitoringcontrolsystem.data.repository.UsageRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.Locale

data class UsageUiState(
    val logs: List<UsageLog> = emptyList(),
    val isLoading: Boolean = true,
    val selectedDeviceId: String? = null,
    val selectedFloorId: String? = null,
    val dateRange: DateRange = DateRange.TODAY,
    val error: String? = null,
    val exportSuccessful: Boolean = false,
    val exportData: String = "",
    val exportedFile: String = ""
)

enum class DateRange(val displayName: String) {
    TODAY("Today"),
    THIS_WEEK("This Week"),
    THIS_MONTH("This Month"),
    CUSTOM("Custom Range")
}

class UsageViewModel : ViewModel() {
    private val repository = UsageRepository()

    private val _uiState = MutableStateFlow(UsageUiState())
    val uiState: StateFlow<UsageUiState> = _uiState.asStateFlow()

    init {
        loadLogs()
    }

    private fun loadLogs() {
        viewModelScope.launch {
            repository.getUsageLogs(
                _uiState.value.selectedDeviceId,
                _uiState.value.selectedFloorId
            ).collect { logs ->
                _uiState.value = _uiState.value.copy(
                    logs = filterByDateRange(logs),
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
        _uiState.value = _uiState.value.copy(selectedFloorId = floorId, isLoading = true)
        loadLogs()
    }

    fun setDateRange(range: DateRange) {
        _uiState.value = _uiState.value.copy(dateRange = range)
        loadLogs()
    }

    fun exportReport(context: Context) {
        val data = collectExportData()
        val filePath = saveReportToFile(context, data)
        _uiState.value = _uiState.value.copy(
            exportSuccessful = true,
            exportData = data,
            exportedFile = filePath
        )
    }

    private fun saveReportToFile(context: Context, reportData: String): String {
        val dateFolder = "SmartHomeReports"
        val exportsDir = File(context.filesDir, dateFolder)
        if (!exportsDir.exists()) {
            exportsDir.mkdirs()
        }
        val dateFormat = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())
        val fileName = "usage_report_${dateFormat.format(System.currentTimeMillis())}.csv"
        val file = File(exportsDir, fileName)
        return try {
            file.writeText(reportData)
            file.absolutePath
        } catch (e: Exception) {
            e.printStackTrace()
            ""
        }
    }

    private fun collectExportData(): String {
        val sb = StringBuilder()
        sb.append("Smart Home Usage Report\n")
        sb.append("Generated: ${SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(System.currentTimeMillis())}\n")
        sb.append("Date Range: ${_uiState.value.dateRange.displayName}\n")
        sb.append("----------------------------------------\n")
        sb.append("Device,ON Time,OFF Time,Duration(s)\n")
        _uiState.value.logs.forEach { log ->
            sb.append("${log.deviceName},${log.onTime},${log.offTime},${log.durationSeconds}\n")
        }
        sb.append("----------------------------------------\n")
        sb.append("Total Duration: ${_uiState.value.logs.sumOf { it.durationSeconds }} seconds\n")
        return sb.toString()
    }

    private fun filterByDateRange(logs: List<UsageLog>): List<UsageLog> {
        val now = System.currentTimeMillis()
        val cutoff = when (_uiState.value.dateRange) {
            DateRange.TODAY -> now - 24 * 60 * 60 * 1000L
            DateRange.THIS_WEEK -> now - 7 * 24 * 60 * 60 * 1000L
            DateRange.THIS_MONTH -> now - 30 * 24 * 60 * 60 * 1000L
            DateRange.CUSTOM -> now - 30 * 24 * 60 * 60 * 1000L
        }
        return logs.filter { it.onTime >= cutoff }
    }
}
