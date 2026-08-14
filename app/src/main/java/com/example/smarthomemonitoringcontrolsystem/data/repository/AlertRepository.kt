package com.example.smarthomemonitoringcontrolsystem.data.repository

import com.example.smarthomemonitoringcontrolsystem.data.model.Alert
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class AlertRepository {
    private val database = FirebaseDatabase.getInstance()
    private val alertsRef = database.getReference("alerts")

    fun getAlerts(userId: String): Flow<List<Alert>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val alerts = mutableListOf<Alert>()
                for (child in snapshot.children) {
                    val alert = child.getValue(Alert::class.java)
                    if (alert != null && alert.userId == userId) {
                        alerts.add(alert.copy(id = child.key ?: ""))
                    }
                }
                // Sort by timestamp descending (newest first)
                alerts.sortByDescending { it.timestamp }
                trySend(alerts)
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        alertsRef.addValueEventListener(listener)
        awaitClose { alertsRef.removeEventListener(listener) }
    }

    fun getUnreadCount(userId: String): Flow<Int> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                var count = 0
                for (child in snapshot.children) {
                    val alert = child.getValue(Alert::class.java)
                    if (alert != null && alert.userId == userId && !alert.read) {
                        count++
                    }
                }
                trySend(count)
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        alertsRef.addValueEventListener(listener)
        awaitClose { alertsRef.removeEventListener(listener) }
    }

    suspend fun addAlert(alert: Alert): Result<String> {
        return try {
            val ref = alertsRef.push()
            ref.setValue(alert.copy(id = ref.key ?: "")).await()
            Result.success(ref.key ?: "")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun markAsRead(alertId: String): Result<Unit> {
        return try {
            alertsRef.child(alertId).child("read").setValue(true).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
