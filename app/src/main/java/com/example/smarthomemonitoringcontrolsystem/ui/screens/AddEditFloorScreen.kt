package com.example.smarthomemonitoringcontrolsystem.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import com.example.smarthomemonitoringcontrolsystem.ui.components.planCellWalls
import com.example.smarthomemonitoringcontrolsystem.ui.theme.DefaultRoomZones
import com.example.smarthomemonitoringcontrolsystem.ui.theme.PlanStyles
import com.example.smarthomemonitoringcontrolsystem.ui.theme.roomForCell
import com.example.smarthomemonitoringcontrolsystem.ui.viewmodel.FloorViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditFloorScreen(
    floorViewModel: FloorViewModel,
    floorId: String?,
    onNavigateBack: () -> Unit
) {
    val isEditing = floorId != null && floorId != "new"
    var floorName by remember { mutableStateOf("") }
    var selectedPlan by remember { mutableStateOf(PlanStyles[0]) }
    var gridRows by remember { mutableFloatStateOf(4f) }
    var gridCols by remember { mutableFloatStateOf(4f) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = if (isEditing) "Edit Floor" else "Add Floor",
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Spacer(modifier = Modifier.height(8.dp))

            // Floor name input
            Text(
                text = "Floor Name",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            OutlinedTextField(
                value = floorName,
                onValueChange = { floorName = it },
                placeholder = { Text("e.g., Ground Floor") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                )
            )

            // Floor plan selector
            Text(
                text = "Floor Plan Style",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(PlanStyles) { planStyle ->
                    val isSelected = selectedPlan.id == planStyle.id
                    Card(
                        onClick = { selectedPlan = planStyle },
                        modifier = Modifier
                            .size(width = 100.dp, height = 92.dp)
                            .then(
                                if (isSelected) Modifier.border(
                                    2.dp,
                                    MaterialTheme.colorScheme.primary,
                                    RoundedCornerShape(12.dp)
                                ) else Modifier
                            ),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = planStyle.bgColor)
                    ) {
                        Column(
                            modifier = Modifier.fillMaxSize(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            // Mini grid preview in the plan style's colors
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f)
                                    .padding(start = 10.dp, end = 10.dp, top = 6.dp, bottom = 2.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                if (planStyle.id == "plan_6") {
                                    // Rooms style: 2x2 zones with a wall cross
                                    Column(
                                        modifier = Modifier.fillMaxSize(),
                                        verticalArrangement = Arrangement.SpaceEvenly
                                    ) {
                                        repeat(2) { r ->
                                            Row(
                                                modifier = Modifier.fillMaxWidth().weight(1f),
                                                horizontalArrangement = Arrangement.SpaceEvenly
                                            ) {
                                                repeat(2) { c ->
                                                    Box(
                                                        modifier = Modifier
                                                            .weight(1f)
                                                            .padding(2.dp)
                                                            .background(
                                                                roomForCell(r, c, 2, 2)
                                                                    ?.color
                                                                    ?.copy(alpha = 0.25f)
                                                                    ?: Color.Transparent
                                                            )
                                                    )
                                                }
                                            }
                                        }
                                    }
                                    // Wall cross
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(2.dp)
                                            .background(planStyle.borderColor)
                                    )
                                    Box(
                                        modifier = Modifier
                                            .fillMaxHeight()
                                            .width(2.dp)
                                            .background(planStyle.borderColor)
                                    )
                                } else {
                                    Column(
                                        modifier = Modifier.fillMaxSize(),
                                        verticalArrangement = Arrangement.SpaceEvenly
                                    ) {
                                        repeat(2) {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceEvenly
                                            ) {
                                                repeat(3) {
                                                    Box(
                                                        modifier = Modifier
                                                            .weight(1f)
                                                            .aspectRatio(1f)
                                                            .padding(2.dp)
                                                            .border(
                                                                0.5.dp,
                                                                planStyle.gridLineColor.copy(alpha = 0.8f),
                                                                RoundedCornerShape(2.dp)
                                                            )
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 4.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                if (isSelected) {
                                    Icon(
                                        Icons.Filled.Check,
                                        contentDescription = "Selected",
                                        tint = Color.White,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                                Text(
                                    text = planStyle.name,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Color.White.copy(alpha = 0.95f)
                                )
                            }
                        }
                    }
                }
            }

            // Grid size
            Text(
                text = "Grid Size",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )

            // Rows slider
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Rows",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${gridRows.toInt()}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                Slider(
                    value = gridRows,
                    onValueChange = { gridRows = it },
                    valueRange = 2f..8f,
                    steps = 5,
                    colors = SliderDefaults.colors(
                        thumbColor = MaterialTheme.colorScheme.primary,
                        activeTrackColor = MaterialTheme.colorScheme.primary
                    )
                )
            }

            // Cols slider
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Columns",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${gridCols.toInt()}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                Slider(
                    value = gridCols,
                    onValueChange = { gridCols = it },
                    valueRange = 2f..8f,
                    steps = 5,
                    colors = SliderDefaults.colors(
                        thumbColor = MaterialTheme.colorScheme.primary,
                        activeTrackColor = MaterialTheme.colorScheme.primary
                    )
                )
            }

            // Grid preview
            Text(
                text = "Preview",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            BoxWithConstraints(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1.5f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(selectedPlan.bgColor)
                    .border(1.dp, selectedPlan.borderColor, RoundedCornerShape(12.dp))
            ) {
                val isRoomsStyle = selectedPlan.id == "plan_6"
                val rows = gridRows.toInt()
                val cols = gridCols.toInt()

                // Draw grid cells
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.SpaceEvenly
                ) {
                    repeat(rows) { row ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            repeat(cols) { col ->
                                Box(
                                    modifier = if (isRoomsStyle) {
                                        val room = roomForCell(row, col, rows, cols)
                                        val rightRoom = if (col + 1 < cols) {
                                            roomForCell(row, col + 1, rows, cols)
                                        } else null
                                        val bottomRoom = if (row + 1 < rows) {
                                            roomForCell(row + 1, col, rows, cols)
                                        } else null
                                        Modifier
                                            .weight(1f)
                                            .aspectRatio(1f)
                                            .background(
                                                room?.color?.copy(alpha = 0.14f) ?: Color.Transparent
                                            )
                                            .planCellWalls(
                                                wallColor = selectedPlan.borderColor,
                                                lineColor = selectedPlan.gridLineColor,
                                                leftWall = col == 0,
                                                topWall = row == 0,
                                                rightWall = col == cols - 1 || room?.name != rightRoom?.name,
                                                bottomWall = row == rows - 1 || room?.name != bottomRoom?.name
                                            )
                                    } else {
                                        Modifier
                                            .weight(1f)
                                            .aspectRatio(1f)
                                            .padding(2.dp)
                                            .clip(RoundedCornerShape(4.dp))
                                            .border(
                                                1.dp,
                                                selectedPlan.gridLineColor.copy(alpha = 0.7f),
                                                RoundedCornerShape(4.dp)
                                            )
                                    }
                                )
                            }
                        }
                    }
                }

                // Room labels overlay
                if (isRoomsStyle) {
                    DefaultRoomZones.forEach { zone ->
                        Text(
                            text = zone.name,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.SemiBold,
                            color = selectedPlan.gridLineColor.copy(alpha = 0.9f),
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .width(110.dp)
                                .offset {
                                    IntOffset(
                                        x = ((zone.colStart + zone.colEnd) / 2f * constraints.maxWidth - 55).toInt(),
                                        y = ((zone.rowStart + zone.rowEnd) / 2f * constraints.maxHeight - 10).toInt()
                                    )
                                }
                        )
                    }
                }
            }

            // Save button
            Button(
                onClick = {
                    if (floorName.isNotBlank()) {
                        floorViewModel.addFloor(
                            name = floorName,
                            imageUrl = selectedPlan.id,
                            gridRows = gridRows.toInt(),
                            gridCols = gridCols.toInt()
                        )
                        onNavigateBack()
                    }
                },
                enabled = floorName.isNotBlank(),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "Save Floor",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
