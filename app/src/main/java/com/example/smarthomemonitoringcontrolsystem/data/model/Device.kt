package com.example.smarthomemonitoringcontrolsystem.data.model

data class Device(
    val id: String = "",
    val floorId: String = "",
    val label: String = "",
    val type: DeviceType = DeviceType.OUTLET,
    val state: DeviceState = DeviceState.OFF,
    val gridX: Int = 0,
    val gridY: Int = 0,
    // Multi-Switch fields
    val switchCount: Int = 1,
    val switchNames: List<String> = emptyList(),
    val switchStates: List<Boolean> = emptyList(),
    // Safety-Timed (Iron) fields
    val maxOnDurationSec: Int = 1800, // 30 minutes default
    val turnedOnAt: Long = 0L,
    val autoOffTriggered: Boolean = false,
    // Scheduled Light fields
    val scheduleStart: String = "18:00",
    val scheduleEnd: String = "23:00",
    val scheduleEnabled: Boolean = true,
    // Camera fields
    val snapshotUrl: String = "",
    val streamUrl: String = "",
    // Common
    val lastUpdated: Long = System.currentTimeMillis()
)

enum class DeviceType(val displayName: String) {
    OUTLET("Outlet"),
    MULTI_SWITCH("Multi-Switch"),
    SAFETY_TIMED("Safety-Timed"),
    SCHEDULED_LIGHT("Scheduled Light"),
    CAMERA("Camera")
}

enum class DeviceState(val displayName: String) {
    ON("On"),
    OFF("Off"),
    ERROR("Error"),
    DISCONNECTED("Disconnected")
}
