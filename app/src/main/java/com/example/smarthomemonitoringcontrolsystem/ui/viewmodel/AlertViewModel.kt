package com.example.smarthomemonitoringcontrolsystem.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smarthomemonitoringcontrolsystem.data.model.Alert
import com.example.smarthomemonitoringcontrolsystem.data.repository.AlertRepository
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AlertUiState(
    val alerts: List<Alert> = emptyList(),
    val unreadCount: Int = 0,
    val isLoading: Boolean = true,
    val error: String? = null
)

class AlertViewModel : ViewModel() {
    private val repository = AlertRepository()
    private val auth = FirebaseAuth.getInstance()

    private val _uiState = MutableStateFlow(AlertUiState())
    val uiState: StateFlow<AlertUiState> = _uiState.asStateFlow()
    private var alertsJob: Job? = null
    private var unreadJob: Job? = null

    init {
        observeAuth()
    }

    private fun observeAuth() {
        auth.addAuthStateListener { firebaseAuth ->
            val uid = firebaseAuth.currentUser?.uid ?: ""
            alertsJob?.cancel()
            unreadJob?.cancel()
            if (uid.isNotEmpty()) {
                alertsJob = loadAlerts(uid)
                unreadJob = loadUnreadCount(uid)
            } else {
                _uiState.value = AlertUiState()
            }
        }
    }

    private fun loadAlerts(userId: String): Job = viewModelScope.launch {
        repository.getAlerts(userId).collect { alerts ->
            _uiState.value = _uiState.value.copy(
                alerts = alerts,
                isLoading = false
            )
        }
    }

    private fun loadUnreadCount(userId: String): Job = viewModelScope.launch {
        repository.getUnreadCount(userId).collect { count ->
            _uiState.value = _uiState.value.copy(unreadCount = count)
        }
    }

    fun markAsRead(alertId: String) {
        viewModelScope.launch {
            repository.markAsRead(alertId)
        }
    }
}
