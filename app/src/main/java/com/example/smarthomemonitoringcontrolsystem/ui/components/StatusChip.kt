package com.example.smarthomemonitoringcontrolsystem.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.LinkOff
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceState
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceDisconnected
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceError
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOff
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DeviceOn

@Composable
fun StatusChip(
    state: DeviceState,
    modifier: Modifier = Modifier
) {
    val backgroundColor by animateColorAsState(
        targetValue = when (state) {
            DeviceState.ON -> DeviceOn.copy(alpha = 0.15f)
            DeviceState.OFF -> DeviceOff.copy(alpha = 0.15f)
            DeviceState.ERROR -> DeviceError.copy(alpha = 0.15f)
            DeviceState.DISCONNECTED -> DeviceDisconnected.copy(alpha = 0.15f)
        },
        label = "chipBgColor"
    )

    val contentColor by animateColorAsState(
        targetValue = when (state) {
            DeviceState.ON -> DeviceOn
            DeviceState.OFF -> DeviceOff
            DeviceState.ERROR -> DeviceError
            DeviceState.DISCONNECTED -> DeviceDisconnected
        },
        label = "chipContentColor"
    )

    val icon = when (state) {
        DeviceState.ON -> Icons.Filled.Check
        DeviceState.OFF -> Icons.Filled.Close
        DeviceState.ERROR -> Icons.Filled.Error
        DeviceState.DISCONNECTED -> Icons.Filled.LinkOff
    }

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(backgroundColor)
            .padding(horizontal = 10.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = state.displayName,
            tint = contentColor,
            modifier = Modifier.size(14.dp)
        )
        Text(
            text = state.displayName,
            style = MaterialTheme.typography.labelSmall,
            color = contentColor
        )
    }
}
