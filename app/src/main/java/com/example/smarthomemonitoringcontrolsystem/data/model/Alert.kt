package com.example.smarthomemonitoringcontrolsystem.data.model

data class Alert(
    val id: String = "",
    val userId: String = "",
    val deviceId: String = "",
    val floorId: String = "",
    val deviceName: String = "",
    val message: String = "",
    val timestamp: Long = 0L,
    val read: Boolean = false
)
