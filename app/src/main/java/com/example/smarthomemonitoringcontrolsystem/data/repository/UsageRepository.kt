package com.example.smarthomemonitoringcontrolsystem.data.repository

import com.example.smarthomemonitoringcontrolsystem.data.model.UsageLog
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class UsageRepository {
    private val database = FirebaseDatabase.getInstance()
    private val usageRef = database.getReference("usage_logs")

    fun getUsageLogs(deviceId: String? = null): Flow<List<UsageLog>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val logs = mutableListOf<UsageLog>()
                for (child in snapshot.children) {
                    val log = child.getValue(UsageLog::class.java)
                    if (log != null) {
                        logs.add(log.copy(id = child.key ?: ""))
                    }
                }
                logs.sortByDescending { it.onTime }
                trySend(logs)
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }

        val query = if (deviceId != null) {
            usageRef.orderByChild("deviceId").equalTo(deviceId)
        } else {
            usageRef.orderByChild("onTime")
        }
        query.addValueEventListener(listener)
        awaitClose { query.removeEventListener(listener) }
    }

    suspend fun logUsage(log: UsageLog): Result<String> {
        return try {
            val ref = usageRef.push()
            ref.setValue(log.copy(id = ref.key ?: "")).await()
            Result.success(ref.key ?: "")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
