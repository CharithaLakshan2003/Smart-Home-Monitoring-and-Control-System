package com.example.smarthomemonitoringcontrolsystem.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smarthomemonitoringcontrolsystem.data.model.UsageLog
import com.example.smarthomemonitoringcontrolsystem.data.repository.UsageRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class UsageUiState(
    val logs: List<UsageLog> = emptyList(),
    val isLoading: Boolean = true,
    val selectedDeviceId: String? = null,
    val dateRange: DateRange = DateRange.TODAY,
    val error: String? = null
)

enum class DateRange(val displayName: String) {
    TODAY("Today"),
    THIS_WEEK("This Week")
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
            repository.getUsageLogs(_uiState.value.selectedDeviceId).collect { logs ->
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

    fun setDateRange(range: DateRange) {
        _uiState.value = _uiState.value.copy(dateRange = range)
        loadLogs()
    }

    private fun filterByDateRange(logs: List<UsageLog>): List<UsageLog> {
        val now = System.currentTimeMillis()
        val cutoff = when (_uiState.value.dateRange) {
            DateRange.TODAY -> now - 24 * 60 * 60 * 1000L
            DateRange.THIS_WEEK -> now - 7 * 24 * 60 * 60 * 1000L
        }
        return logs.filter { it.onTime >= cutoff }
    }
}
