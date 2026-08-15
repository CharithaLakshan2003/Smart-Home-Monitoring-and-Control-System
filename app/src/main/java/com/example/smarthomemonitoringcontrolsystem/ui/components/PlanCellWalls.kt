package com.example.smarthomemonitoringcontrolsystem.ui.components

import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

fun Modifier.planCellWalls(
    wallColor: Color,
    lineColor: Color,
    leftWall: Boolean,
    topWall: Boolean,
    rightWall: Boolean,
    bottomWall: Boolean
): Modifier = this.drawBehind {
    val wall = 2.dp.toPx()
    val line = 0.5.dp.toPx()
    val w = size.width
    val h = size.height

    // Thin internal grid lines
    val faintLine = lineColor.copy(alpha = 0.35f)
    drawLine(faintLine, Offset(0f, 0f), Offset(w, 0f), line)
    drawLine(faintLine, Offset(0f, h), Offset(w, h), line)
    drawLine(faintLine, Offset(0f, 0f), Offset(0f, h), line)
    drawLine(faintLine, Offset(w, 0f), Offset(w, h), line)

    // Thick walls on room boundaries / outer edges
    if (topWall) drawLine(wallColor, Offset(0f, wall / 2), Offset(w, wall / 2), wall)
    if (bottomWall) drawLine(wallColor, Offset(0f, h - wall / 2), Offset(w, h - wall / 2), wall)
    if (leftWall) drawLine(wallColor, Offset(wall / 2, 0f), Offset(wall / 2, h), wall)
    if (rightWall) drawLine(wallColor, Offset(w - wall / 2, 0f), Offset(w - wall / 2, h), wall)
}
