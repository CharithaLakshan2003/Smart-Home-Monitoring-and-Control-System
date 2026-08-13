package com.example.smarthomemonitoringcontrolsystem.data.repository

import com.example.smarthomemonitoringcontrolsystem.data.model.Floor
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class FloorRepository {
    companion object {
        val floorNames = mapOf(
            "floor_1" to "Ground Floor",
            "floor_2" to "First Floor",
            "floor_3" to "Second Floor",
            "floor_4" to "Third Floor"
        )
    }

    private val database = FirebaseDatabase.getInstance()
    private val floorsRef = database.getReference("floors")

    fun getFloors(userId: String): Flow<List<Floor>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val floors = mutableListOf<Floor>()
                for (child in snapshot.children) {
                    val floor = child.getValue(Floor::class.java)
                    if (floor != null) {
                        floors.add(floor.copy(id = child.key ?: ""))
                    }
                }
                trySend(floors)
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        val query = floorsRef.orderByChild("userId").equalTo(userId)
        query.addValueEventListener(listener)
        awaitClose { query.removeEventListener(listener) }
    }

    suspend fun addFloor(floor: Floor): Result<String> {
        return try {
            val ref = floorsRef.push()
            val floorWithId = floor.copy(id = ref.key ?: "")
            ref.setValue(floorWithId).await()
            Result.success(ref.key ?: "")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateFloor(floor: Floor): Result<Unit> {
        return try {
            floorsRef.child(floor.id).setValue(floor).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteFloor(floorId: String): Result<Unit> {
        return try {
            floorsRef.child(floorId).removeValue().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
