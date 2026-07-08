package com.example.smarthomemonitoringcontrolsystem.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smarthomemonitoringcontrolsystem.data.model.Floor
import com.example.smarthomemonitoringcontrolsystem.data.repository.FloorRepository
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

data class FloorUiState(
    val floors: List<Floor> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null
)

class FloorViewModel : ViewModel() {
    private val repository = FloorRepository()
    private val auth = FirebaseAuth.getInstance()

    private val _uiState = MutableStateFlow(FloorUiState())
    val uiState: StateFlow<FloorUiState> = _uiState.asStateFlow()
    private var floorsJob: Job? = null

    init {
        observeAuth()
    }

    private fun observeAuth() {
        auth.addAuthStateListener { firebaseAuth ->
            val uid = firebaseAuth.currentUser?.uid ?: ""
            floorsJob?.cancel()
            if (uid.isNotEmpty()) {
                floorsJob = loadFloors(uid)
            } else {
                _uiState.value = FloorUiState(floors = emptyList(), isLoading = false)
            }
        }
    }

    private fun loadFloors(userId: String): Job = viewModelScope.launch {
        _uiState.value = _uiState.value.copy(isLoading = true)
        repository.getFloors(userId).collect { floors ->
            _uiState.value = FloorUiState(
                floors = floors,
                isLoading = false
            )
        }
    }

    fun addFloor(name: String, imageUrl: String, gridRows: Int, gridCols: Int) {
        viewModelScope.launch {
            val userId = auth.currentUser?.uid ?: return@launch
            val floor = Floor(
                name = name,
                imageUrl = imageUrl,
                gridRows = gridRows,
                gridCols = gridCols,
                userId = userId
            )
            repository.addFloor(floor)
        }
    }

    fun updateFloor(floor: Floor) {
        viewModelScope.launch {
            repository.updateFloor(floor)
        }
    }

    fun deleteFloor(floorId: String) {
        viewModelScope.launch {
            repository.deleteFloor(floorId)
        }
    }
}
