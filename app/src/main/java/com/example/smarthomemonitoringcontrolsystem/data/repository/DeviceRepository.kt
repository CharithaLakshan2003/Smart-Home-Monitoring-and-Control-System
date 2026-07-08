package com.example.smarthomemonitoringcontrolsystem.data.repository

import com.example.smarthomemonitoringcontrolsystem.data.model.Device
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceState
import com.example.smarthomemonitoringcontrolsystem.data.model.DeviceType
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class DeviceRepository {
    private val database = FirebaseDatabase.getInstance()
    private val devicesRef = database.getReference("devices")

    fun getDevices(floorId: String): Flow<List<Device>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val devices = mutableListOf<Device>()
                for (child in snapshot.children) {
                    try {
                        val map = child.value as? Map<*, *> ?: continue
                        val device = mapToDevice(child.key ?: "", map)
                        devices.add(device)
                    } catch (e: Exception) {
                        // Skip malformed entries
                    }
                }
                trySend(devices)
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        val query = devicesRef.orderByChild("floorId").equalTo(floorId)
        query.addValueEventListener(listener)
        awaitClose { query.removeEventListener(listener) }
    }

    fun getDevice(deviceId: String): Flow<Device?> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val map = snapshot.value as? Map<*, *>
                if (map != null) {
                    trySend(mapToDevice(snapshot.key ?: "", map))
                } else {
                    trySend(null)
                }
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        devicesRef.child(deviceId).addValueEventListener(listener)
        awaitClose { devicesRef.child(deviceId).removeEventListener(listener) }
    }

    fun getAllDevices(): Flow<List<Device>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val devices = mutableListOf<Device>()
                for (child in snapshot.children) {
                    try {
                        val map = child.value as? Map<*, *> ?: continue
                        val device = mapToDevice(child.key ?: "", map)
                        devices.add(device)
                    } catch (e: Exception) {
                        // Skip malformed entries
                    }
                }
                trySend(devices)
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        devicesRef.addValueEventListener(listener)
        awaitClose { devicesRef.removeEventListener(listener) }
    }

    suspend fun addDevice(device: Device): Result<String> {
        return try {
            val ref = devicesRef.push()
            val deviceWithId = device.copy(id = ref.key ?: "")
            ref.setValue(deviceToMap(deviceWithId)).await()
            Result.success(ref.key ?: "")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateDevice(device: Device): Result<Unit> {
        return try {
            devicesRef.child(device.id).setValue(deviceToMap(device)).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateDeviceState(deviceId: String, state: DeviceState): Result<Unit> {
        return try {
            val updates = mapOf(
                "state" to state.name,
                "lastUpdated" to System.currentTimeMillis()
            )
            devicesRef.child(deviceId).updateChildren(updates).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateSwitchState(deviceId: String, switchIndex: Int, isOn: Boolean): Result<Unit> {
        return try {
            devicesRef.child(deviceId).child("switchStates").child(switchIndex.toString())
                .setValue(isOn).await()
            devicesRef.child(deviceId).child("lastUpdated")
                .setValue(System.currentTimeMillis()).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteDevice(deviceId: String): Result<Unit> {
        return try {
            devicesRef.child(deviceId).removeValue().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun deviceToMap(device: Device): Map<String, Any?> {
        return mapOf(
            "id" to device.id,
            "floorId" to device.floorId,
            "label" to device.label,
            "type" to device.type.name,
            "state" to device.state.name,
            "gridX" to device.gridX,
            "gridY" to device.gridY,
            "switchCount" to device.switchCount,
            "switchNames" to device.switchNames,
            "switchStates" to device.switchStates,
            "maxOnDurationSec" to device.maxOnDurationSec,
            "turnedOnAt" to device.turnedOnAt,
            "autoOffTriggered" to device.autoOffTriggered,
            "scheduleStart" to device.scheduleStart,
            "scheduleEnd" to device.scheduleEnd,
            "scheduleEnabled" to device.scheduleEnabled,
            "snapshotUrl" to device.snapshotUrl,
            "streamUrl" to device.streamUrl,
            "lastUpdated" to device.lastUpdated
        )
    }

    private fun mapToDevice(id: String, map: Map<*, *>): Device {
        @Suppress("UNCHECKED_CAST")
        return Device(
            id = id,
            floorId = map["floorId"] as? String ?: "",
            label = map["label"] as? String ?: "",
            type = try {
                DeviceType.valueOf(map["type"] as? String ?: "OUTLET")
            } catch (e: Exception) {
                DeviceType.OUTLET
            },
            state = try {
                DeviceState.valueOf(map["state"] as? String ?: "OFF")
            } catch (e: Exception) {
                DeviceState.OFF
            },
            gridX = (map["gridX"] as? Long)?.toInt() ?: 0,
            gridY = (map["gridY"] as? Long)?.toInt() ?: 0,
            switchCount = (map["switchCount"] as? Long)?.toInt() ?: 1,
            switchNames = (map["switchNames"] as? List<*>)?.mapNotNull { it as? String }
                ?: emptyList(),
            switchStates = (map["switchStates"] as? List<*>)?.mapNotNull { it as? Boolean }
                ?: emptyList(),
            maxOnDurationSec = (map["maxOnDurationSec"] as? Long)?.toInt() ?: 1800,
            turnedOnAt = map["turnedOnAt"] as? Long ?: 0L,
            autoOffTriggered = map["autoOffTriggered"] as? Boolean ?: false,
            scheduleStart = map["scheduleStart"] as? String ?: "18:00",
            scheduleEnd = map["scheduleEnd"] as? String ?: "23:00",
            scheduleEnabled = map["scheduleEnabled"] as? Boolean ?: true,
            snapshotUrl = map["snapshotUrl"] as? String ?: "",
            streamUrl = map["streamUrl"] as? String ?: "",
            lastUpdated = map["lastUpdated"] as? Long ?: System.currentTimeMillis()
        )
    }
}
