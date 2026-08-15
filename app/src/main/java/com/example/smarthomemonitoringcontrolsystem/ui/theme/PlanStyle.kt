package com.example.smarthomemonitoringcontrolsystem.ui.theme

import androidx.compose.ui.graphics.Color

data class PlanStyle(
    val id: String,
    val name: String,
    val bgColor: Color,
    val borderColor: Color,
    val gridLineColor: Color
)

val PlanStyles = listOf(
    PlanStyle(
        id = "plan_1",
        name = "Blueprint",
        bgColor = Color(0xFF1A237E),
        borderColor = Color(0xFF3F51B5),
        gridLineColor = Color(0xFFC5CAE9)
    ),
    PlanStyle(
        id = "plan_2",
        name = "Modern",
        bgColor = Color(0xFF004D40),
        borderColor = Color(0xFF00897B),
        gridLineColor = Color(0xFF80CBC4)
    ),
    PlanStyle(
        id = "plan_3",
        name = "Classic",
        bgColor = Color(0xFF3E2723),
        borderColor = Color(0xFF795548),
        gridLineColor = Color(0xFFD7CCC8)
    ),
    PlanStyle(
        id = "plan_4",
        name = "Minimal",
        bgColor = Color(0xFF37474F),
        borderColor = Color(0xFF546E7A),
        gridLineColor = Color(0xFFB0BEC5)
    ),
    PlanStyle(
        id = "plan_5",
        name = "Bright",
        bgColor = Color(0xFF1B5E20),
        borderColor = Color(0xFF388E3C),
        gridLineColor = Color(0xFFA5D6A7)
    ),
    PlanStyle(
        id = "plan_6",
        name = "Rooms",
        bgColor = Color(0xFF283747),
        borderColor = Color(0xFF8FA6B8),
        gridLineColor = Color(0xFFAAB7B8)
    )
)

fun getPlanStyle(id: String): PlanStyle =
    PlanStyles.firstOrNull { it.id == id } ?: PlanStyles[0]
