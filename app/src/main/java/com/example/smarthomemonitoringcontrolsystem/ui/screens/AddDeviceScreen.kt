package com.example.smarthomemonitoringcontrolsystem.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.smarthomemonitoringcontrolsystem.data.model.Device
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceState
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceType
import com.example.smarthomemonitoringcontrolsystem.ui.components.getDeviceIcon
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.DeviceViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddDeviceScreen(
    floorId: String,
    gridRows: Int = 4,
    gridCols: Int = 4,
    deviceViewModel: DeviceViewModel,
    onNavigateBack: () -> Unit
) {
    var deviceLabel by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf(DeviceType.OUTLET) }
    var dropdownExpanded by remember { mutableStateOf(false) }
    var selectedGridX by remember { mutableIntStateOf(-1) }
    var selectedGridY by remember { mutableIntStateOf(-1) }

    // Multi-Switch fields
    var switchCount by remember { mutableIntStateOf(2) }
    var switchNames by remember { mutableStateOf(listOf("Switch 1", "Switch 2")) }

    // Safety-Timed fields
    var maxDurationMin by remember { mutableFloatStateOf(30f) }

    // Scheduled Light fields
    var scheduleStart by remember { mutableStateOf("18:00") }
    var scheduleEnd by remember { mutableStateOf("23:00") }

    // Camera fields
    var snapshotUrl by remember { mutableStateOf("") }
    var streamUrl by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Add Device", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Spacer(modifier = Modifier.height(4.dp))

            // Device type selector
            Text(
                "Device Type",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold
            )
            ExposedDropdownMenuBox(
                expanded = dropdownExpanded,
                onExpandedChange = { dropdownExpanded = it }
            ) {
                OutlinedTextField(
                    value = selectedType.displayName,
                    onValueChange = {},
                    readOnly = true,
                    leadingIcon = {
                        Icon(
                            getDeviceIcon(selectedType),
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )
                    },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = dropdownExpanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(MenuAnchorType.PrimaryNotEditable),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline
                    )
                )
                ExposedDropdownMenu(
                    expanded = dropdownExpanded,
                    onDismissRequest = { dropdownExpanded = false }
                ) {
                    DeviceType.entries.forEach { type ->
                        DropdownMenuItem(
                            text = { Text(type.displayName) },
                            onClick = {
                                selectedType = type
                                dropdownExpanded = false
                            },
                            leadingIcon = {
                                Icon(
                                    getDeviceIcon(type),
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary
                                )
                            }
                        )
                    }
                }
            }

            // Device label
            Text(
                "Device Label",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold
            )
            OutlinedTextField(
                value = deviceLabel,
                onValueChange = { deviceLabel = it },
                placeholder = { Text("e.g., Living Room Outlet") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                )
            )

            // Grid position picker
            Text(
                "Grid Position",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = if (selectedGridX >= 0) "Selected: (${selectedGridX}, ${selectedGridY})" else "Tap a cell to place the device",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(gridCols.toFloat() / gridRows.toFloat())
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(12.dp))
            ) {
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
                                val isSelected = selectedGridX == col && selectedGridY == row
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .aspectRatio(1f)
                                        .padding(2.dp)
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(
                                            if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
                                            else MaterialTheme.colorScheme.surface.copy(alpha = 0.3f)
                                        )
                                        .border(
                                            if (isSelected) 2.dp else 0.5.dp,
                                            if (isSelected) MaterialTheme.colorScheme.primary
                                            else MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
                                            RoundedCornerShape(4.dp)
                                        )
                                        .clickable {
                                            selectedGridX = col
                                            selectedGridY = row
                                        },
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (isSelected) {
                                        Icon(
                                            Icons.Filled.Check,
                                            contentDescription = "Selected",
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Type-specific config
            when (selectedType) {
                DeviceType.MULTI_SWITCH -> {
                    Text(
                        "Number of Switches",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        IconButton(
                            onClick = {
                                if (switchCount > 1) {
                                    switchCount--
                                    switchNames = switchNames.dropLast(1)
                                }
                            },
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                        ) {
                            Icon(Icons.Filled.Remove, "Decrease")
                        }
                        Text(
                            text = "$switchCount",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        IconButton(
                            onClick = {
                                if (switchCount < 8) {
                                    switchCount++
                                    switchNames = switchNames + "Switch $switchCount"
                                }
                            },
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                        ) {
                            Icon(Icons.Filled.Add, "Increase")
                        }
                    }

                    switchNames.forEachIndexed { index, name ->
                        OutlinedTextField(
                            value = name,
                            onValueChange = { newName ->
                                switchNames = switchNames.toMutableList().also { it[index] = newName }
                            },
                            label = { Text("Switch ${index + 1} Name") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }

                DeviceType.SAFETY_TIMED -> {
                    Text(
                        "Max ON Duration",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            "Duration",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            "${maxDurationMin.toInt()} min",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Slider(
                        value = maxDurationMin,
                        onValueChange = { maxDurationMin = it },
                        valueRange = 5f..120f,
                        steps = 22,
                        colors = SliderDefaults.colors(
                            thumbColor = MaterialTheme.colorScheme.primary,
                            activeTrackColor = MaterialTheme.colorScheme.primary
                        )
                    )
                }

                DeviceType.SCHEDULED_LIGHT -> {
                    Text(
                        "Schedule",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        OutlinedTextField(
                            value = scheduleStart,
                            onValueChange = { scheduleStart = it },
                            label = { Text("Start Time") },
                            placeholder = { Text("HH:mm") },
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        )
                        OutlinedTextField(
                            value = scheduleEnd,
                            onValueChange = { scheduleEnd = it },
                            label = { Text("End Time") },
                            placeholder = { Text("HH:mm") },
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }

                DeviceType.CAMERA -> {
                    Text(
                        "Camera URLs",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    OutlinedTextField(
                        value = snapshotUrl,
                        onValueChange = { snapshotUrl = it },
                        label = { Text("Snapshot URL (optional)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                    OutlinedTextField(
                        value = streamUrl,
                        onValueChange = { streamUrl = it },
                        label = { Text("Stream URL (optional)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                else -> { /* OUTLET needs no extra config */ }
            }

            // Save button
            Button(
                onClick = {
                    if (deviceLabel.isNotBlank() && selectedGridX >= 0) {
                        val device = Device(
                            floorId = floorId,
                            label = deviceLabel,
                            type = selectedType,
                            state = DeviceState.OFF,
                            gridX = selectedGridX,
                            gridY = selectedGridY,
                            switchCount = if (selectedType == DeviceType.MULTI_SWITCH) switchCount else 1,
                            switchNames = if (selectedType == DeviceType.MULTI_SWITCH) switchNames else emptyList(),
                            switchStates = if (selectedType == DeviceType.MULTI_SWITCH) List(switchCount) { false } else emptyList(),
                            maxOnDurationSec = if (selectedType == DeviceType.SAFETY_TIMED) (maxDurationMin * 60).toInt() else 1800,
                            scheduleStart = scheduleStart,
                            scheduleEnd = scheduleEnd,
                            snapshotUrl = snapshotUrl,
                            streamUrl = streamUrl
                        )
                        deviceViewModel.addDevice(device)
                        onNavigateBack()
                    }
                },
                enabled = deviceLabel.isNotBlank() && selectedGridX >= 0,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    "Save Device",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
