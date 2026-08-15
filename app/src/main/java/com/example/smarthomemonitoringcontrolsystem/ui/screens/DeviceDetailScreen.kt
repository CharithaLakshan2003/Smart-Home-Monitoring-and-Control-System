package com.example.smarthomemonitoringcontrolsystem.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.example.smarthomemonitoringcontrolsystem.data.model.Device
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceState
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceType
import com.example.smarthomemonitoringcontrolsystem.ui.components.DeviceIcon
import com.example.smarthomemonitoringcontrolsystem.ui.components.StatusChip
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceDisconnected
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceError
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOn
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.DeviceViewModel
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeviceDetailScreen(
    deviceId: String,
    floorId: String,
    deviceViewModel: DeviceViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by deviceViewModel.uiState.collectAsState()
    var showDeleteDialog by remember { mutableStateOf(false) }

    LaunchedEffect(deviceId) {
        deviceViewModel.loadDevice(deviceId)
    }

    val device = uiState.selectedDevice

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Device Detail", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showDeleteDialog = true }) {
                        Icon(
                            Icons.Filled.Delete,
                            "Delete",
                            tint = MaterialTheme.colorScheme.error
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { innerPadding ->
        if (device == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .verticalScroll(rememberScrollState())
            ) {
                // Common header
                DeviceDetailHeader(device = device)

                Spacer(modifier = Modifier.height(16.dp))

                // Type-specific body
                when (device.type) {
                    DeviceType.OUTLET -> OutletDetail(
                        device = device,
                        onToggle = { deviceViewModel.toggleDeviceState(device) }
                    )
                    DeviceType.MULTI_SWITCH -> MultiSwitchDetail(
                        device = device,
                        onToggleSwitch = { index -> deviceViewModel.toggleSwitch(device, index) },
                        onAllOn = { deviceViewModel.setAllSwitches(device, true) },
                        onAllOff = { deviceViewModel.setAllSwitches(device, false) }
                    )
                    DeviceType.SAFETY_TIMED -> SafetyTimedDetail(
                        device = device,
                        onToggle = { deviceViewModel.toggleDeviceState(device) },
                        onUpdateDuration = { seconds -> deviceViewModel.updateMaxDuration(device, seconds) }
                    )
                    DeviceType.SCHEDULED_LIGHT -> ScheduledLightDetail(
                        device = device,
                        onToggle = { deviceViewModel.toggleDeviceState(device) },
                        onUpdateSchedule = { start, end, enabled ->
                            deviceViewModel.updateSchedule(device, start, end, enabled)
                        }
                    )
                    DeviceType.CAMERA -> CameraDetail(
                        device = device,
                        onToggle = { deviceViewModel.toggleDeviceState(device) },
                        onRefresh = {
                            deviceViewModel.updateDevice(
                                device.copy(lastUpdated = System.currentTimeMillis())
                            )
                        }
                    )
                }

                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }

    // Delete confirmation
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete Device") },
            text = { Text("Are you sure you want to delete \"${device?.label}\"?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        device?.let { deviceViewModel.deleteDevice(it.id) }
                        showDeleteDialog = false
                        onNavigateBack()
                    }
                ) {
                    Text("Delete", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun DeviceDetailHeader(device: Device) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Device icon
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)),
                contentAlignment = Alignment.Center
            ) {
                DeviceIcon(
                    type = device.type,
                    state = device.state,
                    modifier = Modifier.size(32.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Device label
            Text(
                text = device.label,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Type name
            Text(
                text = device.type.displayName,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Status chip
            StatusChip(state = device.state)

            Spacer(modifier = Modifier.height(8.dp))

            // Last updated
            Text(
                text = "Last updated: ${formatTimestamp(device.lastUpdated)}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
        }
    }
}

// ========== 7a. Outlet Detail ==========
@Composable
private fun OutletDetail(
    device: Device,
    onToggle: () -> Unit
) {
    val isDisconnected = device.state == DeviceState.DISCONNECTED || device.state == DeviceState.ERROR

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Power Control",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(20.dp))

            // Big toggle
            Switch(
                checked = device.state == DeviceState.ON,
                onCheckedChange = { if (!isDisconnected) onToggle() },
                enabled = !isDisconnected,
                modifier = Modifier.size(width = 64.dp, height = 36.dp),
                colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.White,
                    checkedTrackColor = DeviceOn,
                    uncheckedThumbColor = Color.White,
                    uncheckedTrackColor = MaterialTheme.colorScheme.outline
                )
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = if (device.state == DeviceState.ON) "ON" else "OFF",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = if (device.state == DeviceState.ON) DeviceOn else MaterialTheme.colorScheme.onSurfaceVariant
            )

            if (isDisconnected) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Device is ${device.state.displayName.lowercase()} — cannot toggle",
                    style = MaterialTheme.typography.bodySmall,
                    color = DeviceDisconnected,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}

// ========== 7b. Multi-Switch Detail ==========
@Composable
private fun MultiSwitchDetail(
    device: Device,
    onToggleSwitch: (Int) -> Unit,
    onAllOn: () -> Unit,
    onAllOff: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            // Quick actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = onAllOn,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = DeviceOn)
                ) {
                    Text("All On", fontWeight = FontWeight.SemiBold)
                }
                OutlinedButton(
                    onClick = onAllOff,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("All Off", fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Individual switches
            device.switchNames.forEachIndexed { index, name ->
                if (index > 0) {
                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = 4.dp),
                        color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                    )
                }
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = name,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Switch(
                        checked = device.switchStates.getOrElse(index) { false },
                        onCheckedChange = { onToggleSwitch(index) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = DeviceOn,
                            uncheckedThumbColor = Color.White,
                            uncheckedTrackColor = MaterialTheme.colorScheme.outline
                        )
                    )
                }
            }
        }
    }
}

// ========== 7c. Safety-Timed (Iron) Detail ==========
@Composable
private fun SafetyTimedDetail(
    device: Device,
    onToggle: () -> Unit,
    onUpdateDuration: (Int) -> Unit
) {
    var durationSlider by remember { mutableFloatStateOf(device.maxOnDurationSec / 60f) }
    var remainingSeconds by remember { mutableLongStateOf(0L) }

    // Calculate remaining time
    LaunchedEffect(device.state, device.turnedOnAt) {
        if (device.state == DeviceState.ON && device.turnedOnAt > 0) {
            while (true) {
                val elapsed = (System.currentTimeMillis() - device.turnedOnAt) / 1000
                val remaining = device.maxOnDurationSec - elapsed
                remainingSeconds = if (remaining > 0) remaining else 0
                delay(1000)
            }
        } else {
            remainingSeconds = 0
        }
    }

    val progress = if (device.state == DeviceState.ON && device.maxOnDurationSec > 0) {
        (remainingSeconds.toFloat() / device.maxOnDurationSec).coerceIn(0f, 1f)
    } else 0f

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Auto-off warning
            if (device.autoOffTriggered) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = DeviceError.copy(alpha = 0.15f)
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Filled.Warning,
                            "Warning",
                            tint = DeviceError,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "This device was auto-shut-off for safety",
                            style = MaterialTheme.typography.bodySmall,
                            color = DeviceError
                        )
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Countdown ring
            Box(
                modifier = Modifier.size(160.dp),
                contentAlignment = Alignment.Center
            ) {
                // Background ring
                CircularProgressIndicator(
                    progress = { 1f },
                    modifier = Modifier.size(160.dp),
                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
                    strokeWidth = 8.dp,
                    strokeCap = StrokeCap.Round
                )
                // Progress ring
                CircularProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.size(160.dp),
                    color = if (progress < 0.2f && device.state == DeviceState.ON) DeviceError else DeviceOn,
                    strokeWidth = 8.dp,
                    strokeCap = StrokeCap.Round
                )
                // Time remaining
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    if (device.state == DeviceState.ON) {
                        Text(
                            text = formatDuration(remainingSeconds),
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "remaining",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    } else {
                        Text(
                            text = "OFF",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Toggle
            Switch(
                checked = device.state == DeviceState.ON,
                onCheckedChange = { onToggle() },
                colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.White,
                    checkedTrackColor = DeviceOn
                )
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Max duration setting
            Text(
                text = "Max Duration: ${durationSlider.toInt()} min",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )
            Slider(
                value = durationSlider,
                onValueChange = { durationSlider = it },
                onValueChangeFinished = {
                    onUpdateDuration((durationSlider * 60).toInt())
                },
                valueRange = 5f..120f,
                steps = 22,
                colors = SliderDefaults.colors(
                    thumbColor = MaterialTheme.colorScheme.primary,
                    activeTrackColor = MaterialTheme.colorScheme.primary
                )
            )
        }
    }
}

// ========== 7d. Scheduled Light Detail ==========
@Composable
private fun ScheduledLightDetail(
    device: Device,
    onToggle: () -> Unit,
    onUpdateSchedule: (String, String, Boolean) -> Unit
) {
    var scheduleStart by remember { mutableStateOf(device.scheduleStart) }
    var scheduleEnd by remember { mutableStateOf(device.scheduleEnd) }
    var scheduleEnabled by remember { mutableStateOf(device.scheduleEnabled) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Manual override toggle
            Text(
                text = "Manual Override",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(12.dp))
            Switch(
                checked = device.state == DeviceState.ON,
                onCheckedChange = { onToggle() },
                colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.White,
                    checkedTrackColor = DeviceOn
                )
            )

            Spacer(modifier = Modifier.height(24.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
            Spacer(modifier = Modifier.height(16.dp))

            // Schedule section
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Filled.Schedule,
                        "Schedule",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Schedule",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Switch(
                    checked = scheduleEnabled,
                    onCheckedChange = {
                        scheduleEnabled = it
                        onUpdateSchedule(scheduleStart, scheduleEnd, it)
                    },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = MaterialTheme.colorScheme.primary
                    )
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Schedule display
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (scheduleEnabled)
                        MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                    else
                        MaterialTheme.colorScheme.surface
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            "ON at",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = scheduleStart,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = if (scheduleEnabled) DeviceOn else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Text(
                        "→",
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            "OFF at",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = scheduleEnd,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = if (scheduleEnabled) DeviceError else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

// ========== 7e. Camera Detail ==========
@Composable
private fun CameraDetail(
    device: Device,
    onToggle: () -> Unit,
    onRefresh: () -> Unit
) {
    val isDisconnected = device.state == DeviceState.DISCONNECTED || device.state == DeviceState.ERROR
    val snapshotUrl = device.snapshotUrl
    var refreshKey by remember { mutableIntStateOf(0) }
    val context = LocalContext.current

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Camera feed toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Camera Feed",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = if (device.state == DeviceState.ON) "Live" else "Off",
                        style = MaterialTheme.typography.bodySmall,
                        color = if (device.state == DeviceState.ON) DeviceOn
                        else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Switch(
                    checked = device.state == DeviceState.ON,
                    onCheckedChange = { if (!isDisconnected) onToggle() },
                    enabled = !isDisconnected,
                    modifier = Modifier.size(width = 56.dp, height = 32.dp),
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = DeviceOn,
                        uncheckedThumbColor = Color.White,
                        uncheckedTrackColor = MaterialTheme.colorScheme.outline
                    )
                )
            }

            if (isDisconnected) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Camera is ${device.state.displayName.lowercase()} — cannot toggle",
                    style = MaterialTheme.typography.bodySmall,
                    color = DeviceDisconnected,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Snapshot area
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surface),
                contentAlignment = Alignment.Center
            ) {
                if (snapshotUrl.isNotEmpty()) {
                    val painter = rememberAsyncImagePainter(
                        model = ImageRequest.Builder(context)
                            .data(snapshotUrl)
                            .memoryCacheKey("$snapshotUrl#$refreshKey")
                            .diskCacheKey("$snapshotUrl#$refreshKey")
                            .crossfade(true)
                            .build(),
                        contentScale = ContentScale.Crop
                    )
                    Image(
                        painter = painter,
                        contentDescription = "Camera snapshot",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Filled.CameraAlt,
                            "Camera",
                            modifier = Modifier.size(48.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No Snapshot URL configured",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Status overlay
                if (device.state == DeviceState.ON && snapshotUrl.isNotEmpty()) {
                    Text(
                        text = "● REC",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = DeviceError,
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(8.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Refresh button
            Button(
                onClick = {
                    refreshKey++
                    onRefresh()
                },
                enabled = snapshotUrl.isNotEmpty(),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Filled.Refresh, "Refresh", modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Refresh Snapshot")
            }

            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
            Spacer(modifier = Modifier.height(16.dp))

            // Stream section
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Filled.PlayArrow,
                    "Stream",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "Live Stream",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = if (device.streamUrl.isNotEmpty()) device.streamUrl
                else "No stream URL configured",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Timestamp
            Text(
                text = "Last snapshot: ${formatTimestamp(device.lastUpdated)}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
        }
    }
}

// ========== Utility functions ==========
private fun formatTimestamp(timestamp: Long): String {
    return try {
        val sdf = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault())
        sdf.format(Date(timestamp))
    } catch (e: Exception) {
        "Unknown"
    }
}

private fun formatDuration(seconds: Long): String {
    val min = seconds / 60
    val sec = seconds % 60
    return "${min}:${sec.toString().padStart(2, '0')}"
}
