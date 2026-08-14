package com.example.smarthomemonitoringcontrolsystem.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Analytics
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.smarthomemonitoringcontrolsystem.data.model.Device
import com.example.smarthomemonitoringcontrolsystem.data.model.UsageLog
import com.example.smarthomemonitoringcontrolsystem.ui.components.EmptyState
import com.example.smarthomemonitoringcontrolsystem.ui.components.LoadingOverlay
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOn
import com.example.smarthomemonitoringcontrolsystem.ui.theme.PrimaryDark
import com.example.smarthomemonitoringcontrolsystem.ui.theme.SecondaryDark
import com.example.smarthomemonitoringcontrolsystem.ui.theme.TertiaryDark
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.DateRange
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.UsageViewModel
import com.example.smarthomemonitoringcontrolsystem.data.repository.FloorRepository
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportsScreen(
    usageViewModel: UsageViewModel,
    contentPadding: PaddingValues = PaddingValues()
) {
    val uiState by usageViewModel.uiState.collectAsState()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.exportSuccessful) {
        if (uiState.exportSuccessful) {
            snackbarHostState.showSnackbar("Report exported successfully")
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Reports",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        modifier = Modifier.padding(contentPadding)
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (uiState.isLoading) {
                LoadingOverlay(isLoading = true)
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(bottom = 16.dp)
                ) {
                    item {
                        // Date range chips: Today / This Week / This Month
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState())
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            DateRange.entries.forEach { range ->
                                FilterChip(
                                    selected = uiState.dateRange == range,
                                    onClick = { usageViewModel.setDateRange(range) },
                                    label = { Text(range.displayName) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                                    )
                                )
                            }
                        }
                    }

                    item {
                        // Floor selector: All Floors + every floor
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState())
                                .padding(horizontal = 16.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FilterChip(
                                selected = uiState.selectedFloorId == null,
                                onClick = { usageViewModel.setFloorFilter(null) },
                                label = { Text("All Floors") },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                                )
                            )
                            uiState.floors.forEach { floor ->
                                FilterChip(
                                    selected = uiState.selectedFloorId == floor.id,
                                    onClick = { usageViewModel.setFloorFilter(floor.id) },
                                    label = { Text(floor.name) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                                    )
                                )
                            }
                        }
                    }

                    item {
                        // Export button
                        Button(
                            onClick = {
                                usageViewModel.exportReport(context)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 8.dp)
                            ) {
                                Text(
                                    text = "Export Report",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium
                                )
                        }
                    }

                    val selectedFloorName = uiState.selectedFloorId?.let { id ->
                        uiState.floors.firstOrNull { it.id == id }?.name
                            ?: FloorRepository.floorNames[id]
                            ?: "Floor $id"
                    }

                    // Device list for the selected floor
                    if (uiState.selectedFloorId != null) {
                        item {
                            Text(
                                text = "Devices on $selectedFloorName",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                            )
                        }
                        if (uiState.floorDevices.isEmpty()) {
                            item {
                                Text(
                                    text = "No devices found on this floor",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 16.dp, vertical = 4.dp)
                                )
                            }
                        } else {
                            items(uiState.floorDevices) { device ->
                                FloorDeviceItem(
                                    device = device,
                                    logs = uiState.logs.filter { it.deviceId == device.id }
                                )
                            }
                        }
                    }

                    if (uiState.logs.isEmpty()) {
                        item {
                            EmptyState(
                                icon = Icons.Outlined.Analytics,
                                title = "No usage data",
                                subtitle = "Usage logs will appear here once devices are used"
                            )
                        }
                    } else {
                        item {
                            StatisticsSummary(
                                logs = uiState.logs,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp, 8.dp)
                            )
                        }

                        item {
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                                )
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "Usage Duration",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = buildRangeDescription(uiState.dateRange),
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                    UsageBarChart(
                                        logs = uiState.logs,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }
                            }
                        }

                        item {
                            Text(
                                text = "Activity Log",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                            )
                        }

                        items(uiState.logs) { log ->
                            UsageLogItem(log = log)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FloorDeviceItem(
    device: Device,
    logs: List<UsageLog>
) {
    val totalDuration = logs.sumOf { it.durationSeconds }
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(10.dp),
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
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = device.label,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = device.type.displayName,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = if (logs.isEmpty()) "No usage" else formatLogDuration(totalDuration),
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold,
                    color = if (logs.isEmpty()) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.primary
                )
                Text(
                    text = if (logs.isEmpty()) "in selected range" else "${logs.size} event(s)",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.End
                )
            }
        }
    }
}

@Composable
private fun UsageBarChart(
    logs: List<UsageLog>,
    modifier: Modifier = Modifier
) {
    val deviceDurations = logs.groupBy { it.deviceName }
        .mapValues { (_, deviceLogs) -> deviceLogs.sumOf { it.durationSeconds } }
        .toList()
        .sortedByDescending { it.second }
        .take(6)

    if (deviceDurations.isEmpty()) return

    val maxDuration = deviceDurations.maxOfOrNull { it.second } ?: 1L
    val barColors = listOf(PrimaryDark, SecondaryDark, TertiaryDark, DeviceOn, Color(0xFFFF7043), Color(0xFF8D6E63))
    val trackColor = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.12f)
    val labelColor = MaterialTheme.colorScheme.onSurfaceVariant

    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        deviceDurations.forEachIndexed { index, (name, duration) ->
            val fraction = if (maxDuration > 0L) {
                (duration.toFloat() / maxDuration).coerceAtLeast(0.02f)
            } else {
                0f
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = name,
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Medium,
                    color = labelColor,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.width(92.dp)
                )
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(20.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(trackColor)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxHeight()
                            .fillMaxWidth(fraction)
                            .clip(RoundedCornerShape(6.dp))
                            .background(barColors.getOrElse(index) { PrimaryDark })
                    )
                }
                Text(
                    text = formatLogDuration(duration),
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    textAlign = TextAlign.End,
                    modifier = Modifier.width(76.dp)
                )
            }
        }
    }
}

private fun buildRangeDescription(range: DateRange): String {
    val now = Calendar.getInstance()
    val formatter = SimpleDateFormat("MMM d", Locale.getDefault())
    val today = formatter.format(now.time)
    return when (range) {
        DateRange.TODAY -> "Today, $today"
        DateRange.THIS_WEEK -> {
            val start = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -6) }
            "Last 7 days (${formatter.format(start.time)} – $today)"
        }
        DateRange.THIS_MONTH -> {
            val start = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -29) }
            "Last 30 days (${formatter.format(start.time)} – $today)"
        }
    }
}

@Composable
private fun StatisticsSummary(
    logs: List<UsageLog>,
    modifier: Modifier = Modifier
) {
    val totalDuration = logs.sumOf { it.durationSeconds }
    val numEvents = logs.size
    val avgDuration = if (numEvents > 0) totalDuration / numEvents else 0

    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp, 8.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Usage Summary",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Total: ${formatLogDuration(totalDuration)}",
                    style = MaterialTheme.typography.bodySmall
                )
                Text(
                    text = "Events: $numEvents",
                    style = MaterialTheme.typography.bodySmall
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Avg/Event: ${formatLogDuration(avgDuration.toLong())}",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

@Composable
private fun UsageLogItem(log: UsageLog) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(10.dp),
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
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = log.deviceName,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "ON: ${formatLogTime(log.onTime)} → OFF: ${formatLogTime(log.offTime)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Text(
                text = formatLogDuration(log.durationSeconds),
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

private fun formatLogTime(timestamp: Long): String {
    return try {
        val sdf = SimpleDateFormat("HH:mm", Locale.getDefault())
        sdf.format(Date(timestamp))
    } catch (e: Exception) {
        "--:--"
    }
}

private fun formatLogDuration(seconds: Long): String {
    val hours = seconds / 3600
    val minutes = (seconds % 3600) / 60
    return if (hours > 0) "${hours}h ${minutes}m" else "${minutes}m"
}
