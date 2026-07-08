package com.example.smarthomemonitoringcontrolsystem.navigation

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.smarthomemonitoringcontrolsystem.ui.screens.AddDeviceScreen
import com.example.smarthomemonitoringcontrolsystem.ui.screens.AddEditFloorScreen
import com.example.smarthomemonitoringcontrolsystem.ui.screens.AlertsScreen
import com.example.smarthomemonitoringcontrolsystem.ui.screens.DeviceDetailScreen
import com.example.smarthomemonitoringcontrolsystem.ui.screens.FloorDashboardScreen
import com.example.smarthomemonitoringcontrolsystem.ui.screens.FloorListScreen
import com.example.smarthomemonitoringcontrolsystem.ui.screens.LoginScreen
import com.example.smarthomemonitoringcontrolsystem.ui.screens.ReportsScreen
import com.example.smarthomemonitoringcontrolsystem.ui.screens.SettingsScreen
import com.example.smarthomemonitoringcontrolsystem.ui.screens.SplashScreen
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.AlertViewModel
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.AuthViewModel
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.DeviceViewModel
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.FloorViewModel
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.UsageViewModel

@Composable
fun NavGraph(
    navController: NavHostController,
    authViewModel: AuthViewModel,
    floorViewModel: FloorViewModel,
    deviceViewModel: DeviceViewModel,
    alertViewModel: AlertViewModel,
    usageViewModel: UsageViewModel,
    contentPadding: PaddingValues
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        // Splash
        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToHome = {
                    navController.navigate(Screen.FloorList.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        // Login
        composable(Screen.Login.route) {
            LoginScreen(
                authViewModel = authViewModel,
                onLoginSuccess = {
                    navController.navigate(Screen.FloorList.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        // Floor List (Home)
        composable(Screen.FloorList.route) {
            FloorListScreen(
                floorViewModel = floorViewModel,
                onFloorClick = { floorId ->
                    navController.navigate(Screen.FloorDashboard.createRoute(floorId))
                },
                onAddFloor = {
                    navController.navigate(Screen.AddEditFloor.createRoute("new"))
                },
                onSettings = {
                    navController.navigate(Screen.Settings.route)
                },
                onLogout = {
                    authViewModel.signOut()
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                contentPadding = contentPadding
            )
        }

        // Add/Edit Floor
        composable(Screen.AddEditFloor.route) { backStackEntry ->
            val floorId = backStackEntry.arguments?.getString("floorId")
            AddEditFloorScreen(
                floorViewModel = floorViewModel,
                floorId = floorId,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Floor Dashboard
        composable(Screen.FloorDashboard.route) { backStackEntry ->
            val floorId = backStackEntry.arguments?.getString("floorId") ?: ""
            FloorDashboardScreen(
                floorId = floorId,
                deviceViewModel = deviceViewModel,
                onAddDevice = {
                    navController.navigate(Screen.AddDevice.createRoute(floorId))
                },
                onDeviceClick = { deviceId ->
                    navController.navigate(Screen.DeviceDetail.createRoute(deviceId, floorId))
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Add Device
        composable(Screen.AddDevice.route) { backStackEntry ->
            val floorId = backStackEntry.arguments?.getString("floorId") ?: ""
            AddDeviceScreen(
                floorId = floorId,
                deviceViewModel = deviceViewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Device Detail
        composable(Screen.DeviceDetail.route) { backStackEntry ->
            val deviceId = backStackEntry.arguments?.getString("deviceId") ?: ""
            val floorId = backStackEntry.arguments?.getString("floorId") ?: ""
            DeviceDetailScreen(
                deviceId = deviceId,
                floorId = floorId,
                deviceViewModel = deviceViewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Alerts
        composable(Screen.Alerts.route) {
            AlertsScreen(
                alertViewModel = alertViewModel,
                onAlertClick = { deviceId, floorId ->
                    navController.navigate(Screen.DeviceDetail.createRoute(deviceId, floorId))
                },
                contentPadding = contentPadding
            )
        }

        // Reports
        composable(Screen.Reports.route) {
            ReportsScreen(
                usageViewModel = usageViewModel,
                contentPadding = contentPadding
            )
        }

        // Settings
        composable(Screen.Settings.route) {
            SettingsScreen(
                onLogout = {
                    authViewModel.signOut()
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                contentPadding = contentPadding
            )
        }
    }
}
