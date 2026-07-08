package com.example.smarthomemonitoringcontrolsystem

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.smarthomemonitoringcontrolsystem.navigation.BottomNavBar
import com.example.smarthomemonitoringcontrolsystem.navigation.NavGraph
import com.example.smarthomemonitoringcontrolsystem.navigation.Screen
import com.example.smarthomemonitoringcontrolsystem.ui.theme.SmartHomeMonitoringControlSystemTheme
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.AlertViewModel
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.AuthViewModel
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.DeviceViewModel
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.FloorViewModel
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.UsageViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SmartHomeMonitoringControlSystemTheme {
                SmartHomeApp()
            }
        }
    }
}

@Composable
fun SmartHomeApp() {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = viewModel()
    val floorViewModel: FloorViewModel = viewModel()
    val deviceViewModel: DeviceViewModel = viewModel()
    val alertViewModel: AlertViewModel = viewModel()
    val usageViewModel: UsageViewModel = viewModel()

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Bottom nav tabs - these routes show the bottom bar
    val bottomNavRoutes = listOf(
        Screen.FloorList.route,
        Screen.Alerts.route,
        Screen.Reports.route,
        Screen.Settings.route
    )
    val showBottomBar = currentRoute in bottomNavRoutes

    // Alert badge count
    val alertState by alertViewModel.uiState.collectAsState()

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            if (showBottomBar) {
                BottomNavBar(
                    currentRoute = currentRoute,
                    unreadAlerts = alertState.unreadCount,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            popUpTo(Screen.FloorList.route) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { innerPadding ->
        NavGraph(
            navController = navController,
            authViewModel = authViewModel,
            floorViewModel = floorViewModel,
            deviceViewModel = deviceViewModel,
            alertViewModel = alertViewModel,
            usageViewModel = usageViewModel,
            contentPadding = if (showBottomBar) innerPadding else innerPadding
        )
    }
}