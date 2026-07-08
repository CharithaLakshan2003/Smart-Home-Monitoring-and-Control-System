package com.example.smarthomemonitoringcontrolsystem.navigation

sealed class Screen(val route: String) {
    data object Splash : Screen("splash")
    data object Login : Screen("login")
    data object FloorList : Screen("floor_list")
    data object AddEditFloor : Screen("add_edit_floor/{floorId}") {
        fun createRoute(floorId: String = "new") = "add_edit_floor/$floorId"
    }
    data object FloorDashboard : Screen("floor_dashboard/{floorId}") {
        fun createRoute(floorId: String) = "floor_dashboard/$floorId"
    }
    data object AddDevice : Screen("add_device/{floorId}") {
        fun createRoute(floorId: String) = "add_device/$floorId"
    }
    data object DeviceDetail : Screen("device_detail/{deviceId}/{floorId}") {
        fun createRoute(deviceId: String, floorId: String) = "device_detail/$deviceId/$floorId"
    }
    data object Alerts : Screen("alerts")
    data object Reports : Screen("reports")
    data object Settings : Screen("settings")
}
