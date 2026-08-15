package com.example.smarthomemonitoringcontrolsystem.ui.screens

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material3.AlertDialog
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
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smarthomemonitoringcontrolsystem.data.model.Device
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceState
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceType
import com.example.smarthomemonitoringcontrolsystem.ui.components.DeviceGridBadge
import com.example.smarthomemonitoringcontrolsystem.ui.components.DeviceIcon
import com.example.smarthomemonitoringcontrolsystem.ui.components.EmptyState
import com.example.smarthomemonitoringcontrolsystem.ui.components.LoadingOverlay
import com.example.smarthomemonitoringcontrolsystem.ui.components.StatusChip
import com.example.smarthomemonitoringcontrolsystem.ui.components.planCellWalls
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DefaultRoomZones
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceDisconnected
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceError
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOff
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOn
import com.example.smarthomemonitoringcontrolsystem.ui.theme.getPlanStyle
import com.example.smarthomemonitoringcontrolsystem.ui.theme.roomForCell
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.DeviceViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FloorDashboardScreen(
    floorId: String,
    floorName: String = "Floor",
    gridRows: Int = 4,
    gridCols: Int = 4,
    planStyleId: String = "plan_1",
    deviceViewModel: DeviceViewModel,
    onAddDevice: () -> Unit,
    onDeviceClick: (String) -> Unit,
    onNavigateBack: () -> Unit
) {
    val uiState by deviceViewModel.uiState.collectAsState()
    var selectedFilter by remember { mutableStateOf("All") }
    
    // State for multiple device selection
    var devicesToPick by remember { mutableStateOf<List<Device>?>(null) }

    val planStyle = getPlanStyle(planStyleId)

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
                BoxWithConstraints(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .aspectRatio(gridCols.toFloat() / gridRows.toFloat())
                        .clip(RoundedCornerShape(16.dp))
                        .background(planStyle.bgColor)
                        .border(
                            1.dp,
                            planStyle.borderColor.copy(alpha = 0.6f),
                            RoundedCornerShape(16.dp)
                        )
                ) {
                    val isRoomsStyle = planStyle.id == "plan_6"
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
                                    // Find devices at this grid position
                                    val devicesAtPos = filteredDevices.filter { it.gridX == col && it.gridY == row }
                                    val hasAlert = devicesAtPos.any {
                                        it.state == DeviceState.ERROR || it.state == DeviceState.DISCONNECTED
                                    }
                                    Box(
                                        modifier = if (isRoomsStyle) {
                                            val room = roomForCell(row, col, gridRows, gridCols)
                                            val rightRoom = if (col + 1 < gridCols) {
                                                roomForCell(row, col + 1, gridRows, gridCols)
                                            } else null
                                            val bottomRoom = if (row + 1 < gridRows) {
                                                roomForCell(row + 1, col, gridRows, gridCols)
                                            } else null
                                            Modifier
                                                .weight(1f)
                                                .aspectRatio(1f)
                                                .background(
                                                    if (hasAlert) DeviceError.copy(alpha = 0.2f)
                                                    else room?.color?.copy(alpha = 0.14f) ?: Color.Transparent
                                                )
                                                .planCellWalls(
                                                    wallColor = planStyle.borderColor,
                                                    lineColor = planStyle.gridLineColor,
                                                    leftWall = col == 0,
                                                    topWall = row == 0,
                                                    rightWall = col == gridCols - 1 || room?.name != rightRoom?.name,
                                                    bottomWall = row == gridRows - 1 || room?.name != bottomRoom?.name
                                                )
                                        } else {
                                            Modifier
                                                .weight(1f)
                                                .aspectRatio(1f)
                                                .padding(2.dp)
                                                .background(
                                                    if (hasAlert) DeviceError.copy(alpha = 0.18f)
                                                    else Color.Transparent,
                                                    RoundedCornerShape(4.dp)
                                                )
                                                .border(
                                                    if (hasAlert) 1.dp else 0.5.dp,
                                                    if (hasAlert) DeviceError.copy(alpha = 0.7f)
                                                    else planStyle.gridLineColor.copy(alpha = 0.35f),
                                                    RoundedCornerShape(4.dp)
                                                )
                                        },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (devicesAtPos.isNotEmpty()) {
                                            if (devicesAtPos.size == 1) {
                                                DeviceGridBadge(
                                                    device = devicesAtPos[0],
                                                    onClick = { onDeviceClick(devicesAtPos[0].id) }
                                                )
                                            } else {
                                                DeviceCellCluster(
                                                    devices = devicesAtPos,
                                                    onClick = { devicesToPick = devicesAtPos }
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Room labels overlay
                    if (isRoomsStyle) {
                        DefaultRoomZones.forEach { zone ->
                            Text(
                                text = zone.name,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.SemiBold,
                                color = planStyle.gridLineColor.copy(alpha = 0.9f),
                                textAlign = TextAlign.Center,
                                modifier = Modifier
                                    .width(110.dp)
                                    .offset {
                                        IntOffset(
                                            x = ((zone.colStart + zone.colEnd) / 2f * constraints.maxWidth - 55).toInt(),
                                            y = ((zone.rowStart + zone.rowEnd) / 2f * constraints.maxHeight - 10).toInt()
                                        )
                                    }
                            )
                        }
                    }
                }

                // Legend
                Spacer(modifier = Modifier.height(8.dp))
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        LegendItem(color = DeviceOn, label = "ON")
                        LegendItem(color = DeviceOff, label = "OFF")
                        LegendItem(color = DeviceError, label = "Error")
                        LegendItem(color = DeviceDisconnected, label = "Disconnected")
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(DeviceError.copy(alpha = 0.18f))
                                .border(1.dp, DeviceError.copy(alpha = 0.7f), RoundedCornerShape(3.dp))
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Red zone = device in alert (error / disconnected)",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = com.example.smarthomemonitoringcontrolsystem.ui.components.getDeviceIcon(com.example.smarthomemonitoringcontrolsystem.data.model.DeviceType.SAFETY_TIMED),
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Safety-Timed Device",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
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

    // Pick Device Dialog
    devicesToPick?.let { devices ->
        AlertDialog(
            onDismissRequest = { devicesToPick = null },
            title = { Text("Select Device") },
            text = {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(devices) { device ->
                        DeviceListItem(
                            device = device,
                            onClick = {
                                devicesToPick = null
                                onDeviceClick(device.id)
                            }
                        )
                    }
                }
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { devicesToPick = null }) {
                    Text("Close")
                }
            }
        )
    }
}

@Composable
fun DeviceCellCluster(
    devices: List<Device>,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .clickable(onClick = onClick)
            .padding(2.dp),
        contentAlignment = Alignment.Center
    ) {
        // Show a 2x2 grid of mini icons
        Column(
            verticalArrangement = Arrangement.spacedBy(2.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                DeviceGridBadge(device = devices[0], onClick = onClick, size = 18.dp)
                if (devices.size > 1) {
                    DeviceGridBadge(device = devices[1], onClick = onClick, size = 18.dp)
                }
            }
            if (devices.size > 2) {
                Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                    DeviceGridBadge(device = devices[2], onClick = onClick, size = 18.dp)
                    if (devices.size > 3) {
                        if (devices.size == 4) {
                            DeviceGridBadge(device = devices[3], onClick = onClick, size = 18.dp)
                        } else {
                            // Show count for more than 4
                            Box(
                                modifier = Modifier
                                    .size(18.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.secondary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "+${devices.size - 3}",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontSize = 8.sp,
                                    color = Color.White
                                )
                            }
                        }
                    }
                }
            }
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
            DeviceIcon(
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
            StatusChip(
                state = device.state
            )
        }
    }
}
