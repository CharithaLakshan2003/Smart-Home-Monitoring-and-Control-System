package com.example.smarthomemonitoringcontrolsystem.ui.screens

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.smarthomemonitoringcontrolsystem.data.model.Device
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceState
import com.example.smarthomemonitoringcontrolsystem.ui.components.DeviceGridBadge
import com.example.smarthomemonitoringcontrolsystem.ui.components.EmptyState
import com.example.smarthomemonitoringcontrolsystem.ui.components.LoadingOverlay
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceDisconnected
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceError
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOff
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOn
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.DeviceViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FloorDashboardScreen(
    floorId: String,
    floorName: String = "Floor",
    gridRows: Int = 4,
    gridCols: Int = 4,
    deviceViewModel: DeviceViewModel,
    onAddDevice: () -> Unit,
    onDeviceClick: (String) -> Unit,
    onNavigateBack: () -> Unit
) {
    val uiState by deviceViewModel.uiState.collectAsState()
    var selectedFilter by remember { mutableStateOf("All") }

    LaunchedEffect(floorId) {
        deviceViewModel.loadDevices(floorId)
    }

    val filteredDevices = when (selectedFilter) {
        "ON" -> uiState.devices.filter { it.state == DeviceState.ON }
        "Alerts" -> uiState.devices.filter { it.state == DeviceState.ERROR || it.state == DeviceState.DISCONNECTED }
        else -> uiState.devices
    }

    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            TopAppBar(
                title = {
                    Text(
                        text = floorName,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
            // Filter chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("All", "ON", "Alerts").forEach { filter ->
                    AssistChip(
                        onClick = { selectedFilter = filter },
                        label = {
                            Text(
                                text = when (filter) {
                                    "All" -> "All (${uiState.devices.size})"
                                    "ON" -> "ON (${uiState.devices.count { it.state == DeviceState.ON }})"
                                    "Alerts" -> "Alerts (${uiState.devices.count { it.state == DeviceState.ERROR || it.state == DeviceState.DISCONNECTED }})"
                                    else -> filter
                                },
                                style = MaterialTheme.typography.labelMedium
                            )
                        },
                        leadingIcon = if (filter == selectedFilter) {
                            {
                                Icon(
                                    Icons.Filled.FilterList,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        } else null,
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = if (filter == selectedFilter)
                                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                            else
                                MaterialTheme.colorScheme.surfaceVariant
                        )
                    )
                }
            }

            if (uiState.isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(300.dp),
                    contentAlignment = Alignment.Center
                ) {
                    LoadingOverlay(isLoading = true)
                }
            } else if (uiState.devices.isEmpty()) {
                EmptyState(
                    icon = Icons.Filled.Add,
                    title = "No devices yet",
                    subtitle = "Tap the + button to add a device to this floor",
                    modifier = Modifier.padding(top = 64.dp)
                )
            } else {
                // Floor plan grid with device overlay
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .aspectRatio(gridCols.toFloat() / gridRows.toFloat())
                        .clip(RoundedCornerShape(16.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .border(
                            1.dp,
                            MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                            RoundedCornerShape(16.dp)
                        )
                ) {
                    // Draw grid
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.SpaceEvenly
                    ) {
                        repeat(gridRows) { row ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f),
                                horizontalArrangement = Arrangement.SpaceEvenly
                            ) {
                                repeat(gridCols) { col ->
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .aspectRatio(1f)
                                            .padding(2.dp)
                                            .border(
                                                0.5.dp,
                                                MaterialTheme.colorScheme.outline.copy(alpha = 0.15f),
                                                RoundedCornerShape(4.dp)
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        // Find device at this grid position
                                        val device = filteredDevices.find { it.gridX == col && it.gridY == row }
                                        if (device != null) {
                                            DeviceGridBadge(
                                                device = device,
                                                onClick = { onDeviceClick(device.id) }
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Legend
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    LegendItem(color = DeviceOn, label = "ON")
                    LegendItem(color = DeviceOff, label = "OFF")
                    LegendItem(color = DeviceError, label = "Error")
                    LegendItem(color = DeviceDisconnected, label = "Disconnected")
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Device list summary below grid
                Text(
                    text = "Devices (${filteredDevices.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
                    color = MaterialTheme.colorScheme.onSurface
                )

                filteredDevices.forEach { device ->
                    DeviceListItem(
                        device = device,
                        onClick = { onDeviceClick(device.id) }
                    )
                }

                Spacer(modifier = Modifier.height(80.dp))
            }
        }

        FloatingActionButton(
            onClick = onAddDevice,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary
        ) {
            Icon(Icons.Filled.Add, contentDescription = "Add Device")
        }
    }
}

@Composable
private fun LegendItem(color: Color, label: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .clip(CircleShape)
                .background(color)
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun DeviceListItem(
    device: Device,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            com.example.smarthomemonitoringcontrolsystem.ui.components.DeviceIcon(
                type = device.type,
                state = device.state,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = device.label,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "${device.type.displayName} · Grid (${device.gridX},${device.gridY})",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            com.example.smarthomemonitoringcontrolsystem.ui.components.StatusChip(
                state = device.state
            )
        }
    }
}
