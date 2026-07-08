package com.example.smarthomemonitoringcontrolsystem.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Analytics
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.smarthomemonitoringcontrolsystem.data.model.UsageLog
import com.example.smarthomemonitoringcontrolsystem.ui.components.EmptyState
import com.example.smarthomemonitoringcontrolsystem.ui.components.LoadingOverlay
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOn
import com.example.smarthomemonitoringcontrolsystem.ui.theme.PrimaryDark
import com.example.smarthomemonitoringcontrolsystem.ui.theme.SecondaryDark
import com.example.smarthomemonitoringcontrolsystem.ui.theme.TertiaryDark
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.DateRange
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.UsageViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportsScreen(
    usageViewModel: UsageViewModel,
    contentPadding: PaddingValues = PaddingValues()
) {
    val uiState by usageViewModel.uiState.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(contentPadding)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
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

            Box(modifier = Modifier.weight(1f)) {
                if (uiState.isLoading) {
                    LoadingOverlay(isLoading = true)
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize()
                    ) {
                        item {
                            // Date range chips
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
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
                                // Bar chart
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
                                        Spacer(modifier = Modifier.height(12.dp))
                                        UsageBarChart(
                                            logs = uiState.logs,
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .height(180.dp)
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
}

@Composable
private fun UsageBarChart(
    logs: List<UsageLog>,
    modifier: Modifier = Modifier
) {
    // Group by device and sum durations
    val deviceDurations = logs.groupBy { it.deviceName }
        .mapValues { (_, logs) -> logs.sumOf { it.durationSeconds } }
        .toList()
        .sortedByDescending { it.second }
        .take(6)

    val maxDuration = deviceDurations.maxOfOrNull { it.second }?.toFloat() ?: 1f
    val barColors = listOf(PrimaryDark, SecondaryDark, TertiaryDark, DeviceOn, Color(0xFFFF7043), Color(0xFF8D6E63))

    val onSurfaceVariant = MaterialTheme.colorScheme.onSurfaceVariant

    Canvas(modifier = modifier) {
        if (deviceDurations.isEmpty()) return@Canvas

        val barWidth = (size.width - 40f) / deviceDurations.size
        val maxBarHeight = size.height - 40f

        deviceDurations.forEachIndexed { index, (name, duration) ->
            val barHeight = (duration / maxDuration) * maxBarHeight
            val x = 20f + index * barWidth
            val y = maxBarHeight - barHeight

            // Draw bar
            drawRoundRect(
                color = barColors.getOrElse(index) { PrimaryDark },
                topLeft = Offset(x + barWidth * 0.15f, y),
                size = Size(barWidth * 0.7f, barHeight),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(8f, 8f)
            )

            // Draw label
            drawContext.canvas.nativeCanvas.drawText(
                name.take(8),
                x + barWidth / 2,
                size.height - 4f,
                android.graphics.Paint().apply {
                    color = onSurfaceVariant.hashCode()
                    textSize = 24f
                    textAlign = android.graphics.Paint.Align.CENTER
                }
            )
        }
    }
}

@Composable
private fun UsageLogItem(log: UsageLog) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
