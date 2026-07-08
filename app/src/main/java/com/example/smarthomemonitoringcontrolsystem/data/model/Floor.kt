package com.example.smarthomemonitoringcontrolsystem.data.model

data class Floor(
    val id: String = "",
    val name: String = "",
    val imageUrl: String = "sample_plan_1",
    val gridRows: Int = 4,
    val gridCols: Int = 4,
    val userId: String = "",
    val deviceCount: Int = 0,
    val onCount: Int = 0,
    val alertCount: Int = 0
)
