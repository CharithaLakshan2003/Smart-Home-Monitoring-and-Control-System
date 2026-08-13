package com.example.smarthomemonitoringcontrolsystem.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smarthomemonitoringcontrolsystem.data.model.Device
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceState
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceType
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceDisconnected
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceError
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOff
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOn
import com.example.smarthomemonitoringcontrolsystem.ui.theme.GlowAmber
import com.example.smarthomemonitoringcontrolsystem.ui.theme.GlowGreen
import com.example.smarthomemonitoringcontrolsystem.ui.theme.GlowRed
import com.example.smarthomemonitoringcontrolsystem.ui.theme.SurfaceContainerHighDark

@Composable
fun DeviceGridBadge(
    device: Device,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = 44.dp
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

    val isMini = size < 40.dp
    val iconSize = if (isMini) (size.value * 0.55f).dp else if (device.type == DeviceType.SAFETY_TIMED) 18.dp else 22.dp

    Box(
        modifier = modifier
            .size(size)
            .shadow(
                elevation = if (device.state == DeviceState.ON) (if (isMini) 4.dp else 8.dp) else 2.dp,
                shape = CircleShape,
                ambientColor = glowColor,
                spotColor = glowColor
            )
            .clip(CircleShape)
            .background(SurfaceContainerHighDark)
            .border(if (isMini) 1.dp else 2.dp, borderColor, CircleShape)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            if (device.type == DeviceType.SAFETY_TIMED && !isMini) {
                Text(
                    text = "TIMER",
                    style = MaterialTheme.typography.labelSmall,
                    fontSize = 7.sp,
                    color = if (device.state == DeviceState.ON) DeviceOn else borderColor.copy(alpha = 0.7f),
                    lineHeight = 8.sp
                )
            }
            DeviceIcon(
                type = device.type,
                state = device.state,
                modifier = Modifier.size(iconSize)
            )
        }
    }
}
