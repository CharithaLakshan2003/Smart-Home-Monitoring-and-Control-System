package com.example.smarthomemonitoringcontrolsystem.ui.theme

import androidx.compose.ui.graphics.Color

data class RoomZone(
    val name: String,
    val rowStart: Float,
    val colStart: Float,
    val rowEnd: Float,
    val colEnd: Float,
    val color: Color
)

// 2x2 zoning: Kitchen (top-left), Bedroom (top-right), Bathroom (bottom-left), Living Area (bottom-right)
val DefaultRoomZones = listOf(
    RoomZone("Kitchen", 0f, 0f, 0.5f, 0.5f, Color(0xFFFFB74D)),
    RoomZone("Bedroom", 0f, 0.5f, 0.5f, 1f, Color(0xFF64B5F6)),
    RoomZone("Bathroom", 0.5f, 0f, 1f, 0.5f, Color(0xFF4DB6AC)),
    RoomZone("Living Area", 0.5f, 0.5f, 1f, 1f, Color(0xFF81C784))
)

fun roomForCell(row: Int, col: Int, gridRows: Int, gridCols: Int): RoomZone? {
    val fr = (row + 0.5f) / gridRows
    val fc = (col + 0.5f) / gridCols
    return DefaultRoomZones.firstOrNull { zone ->
        fr >= zone.rowStart && fr < zone.rowEnd && fc >= zone.colStart && fc < zone.colEnd
    }
}
