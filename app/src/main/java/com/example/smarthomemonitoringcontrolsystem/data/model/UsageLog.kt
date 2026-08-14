package com.example.smarthomemonitoringcontrolsystem.data.model

data class UsageLog(
    val id: String = "",
    val userId: String = "",
    val deviceId: String = "",
    val deviceName: String = "",
    val floorId: String = "",
    val onTime: Long = 0L,
    val offTime: Long = 0L,
    val durationSeconds: Long = 0L
)
