package com.example.smarthomemonitoringcontrolsystem.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.smarthomemonitoringcontrolsystem.data.model.Device
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceState
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceDisconnected
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceError
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOff
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOn
import com.example.smarthomemonitoringcontrolsystem.ui.theme.GlowAmber
import com.example.smarthomemonitoringcontrolsystem.ui.theme.GlowCyan
import com.example.smarthomemonitoringcontrolsystem.ui.theme.GlowGreen
import com.example.smarthomemonitoringcontrolsystem.ui.theme.GlowRed
import com.example.smarthomemonitoringcontrolsystem.ui.theme.SurfaceContainerHighDark

@Composable
fun DeviceGridBadge(
    device: Device,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val borderColor by animateColorAsState(
        targetValue = when (device.state) {
            DeviceState.ON -> DeviceOn
            DeviceState.OFF -> DeviceOff
            DeviceState.ERROR -> DeviceError
            DeviceState.DISCONNECTED -> DeviceDisconnected
        },
        label = "badgeBorder"
    )

    val glowColor = when (device.state) {
        DeviceState.ON -> GlowGreen
        DeviceState.OFF -> Color.Transparent
        DeviceState.ERROR -> GlowRed
        DeviceState.DISCONNECTED -> GlowAmber
    }

    Box(
        modifier = modifier
            .size(44.dp)
            .shadow(
                elevation = if (device.state == DeviceState.ON) 8.dp else 2.dp,
                shape = CircleShape,
                ambientColor = glowColor,
                spotColor = glowColor
            )
            .clip(CircleShape)
            .background(SurfaceContainerHighDark)
            .border(2.dp, borderColor, CircleShape)
            .clickable(onClick = onClick)
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        DeviceIcon(
            type = device.type,
            state = device.state,
            modifier = Modifier.size(22.dp)
        )
    }
}
