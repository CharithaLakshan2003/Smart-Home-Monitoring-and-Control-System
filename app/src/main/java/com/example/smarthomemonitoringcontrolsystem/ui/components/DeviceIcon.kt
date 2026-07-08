package com.example.smarthomemonitoringcontrolsystem.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Iron
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Power
import androidx.compose.material.icons.filled.ToggleOn
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceState
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceType
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceDisconnected
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceError
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOff
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOn

fun getDeviceIcon(type: DeviceType): ImageVector {
    return when (type) {
        DeviceType.OUTLET -> Icons.Filled.Power
        DeviceType.MULTI_SWITCH -> Icons.Filled.ToggleOn
        DeviceType.SAFETY_TIMED -> Icons.Filled.Iron
        DeviceType.SCHEDULED_LIGHT -> Icons.Filled.LightMode
        DeviceType.CAMERA -> Icons.Filled.CameraAlt
    }
}

fun getStateColor(state: DeviceState): Color {
    return when (state) {
        DeviceState.ON -> DeviceOn
        DeviceState.OFF -> DeviceOff
        DeviceState.ERROR -> DeviceError
        DeviceState.DISCONNECTED -> DeviceDisconnected
    }
}

@Composable
fun DeviceIcon(
    type: DeviceType,
    state: DeviceState,
    modifier: Modifier = Modifier
) {
    Icon(
        imageVector = getDeviceIcon(type),
        contentDescription = "${type.displayName} - ${state.displayName}",
        tint = getStateColor(state),
        modifier = modifier
    )
}
