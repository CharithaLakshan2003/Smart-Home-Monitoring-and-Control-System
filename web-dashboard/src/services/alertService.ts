import { ref, push, set, update } from 'firebase/database';
import { database } from '../firebase';
import type { Alert } from '../types';

/**
 * Write operations against `alerts` — mirrors the Android AlertRepository.
 *
 * Note on `userId`: the app reads alerts with `getAlerts(userId)`, which keeps
 * only rows where `alert.userId == userId`. The dashboard has no signed-in user,
 * so an alert written with an empty userId would be invisible in the app. We
 * therefore attribute each alert to the owner of the device's floor
 * (`Floor.userId`), which is the same account the app is signed in as.
 */

export type NewAlert = Omit<Alert, 'id' | 'read'>;

/** Creates an alert under a generated push key, storing that key in `id`. */
export async function addAlert(alert: NewAlert): Promise<string> {
  const alertRef = push(ref(database, 'alerts'));
  const id = alertRef.key!;
  await set(alertRef, { ...alert, id, read: false });
  return id;
}

/** Marks a single alert read. Mirrors AlertRepository.markAsRead. */
export async function markAlertRead(alertId: string): Promise<void> {
  await set(ref(database, `alerts/${alertId}/read`), true);
}

/** Marks many alerts read in one atomic multi-path update. */
export async function markAlertsRead(alertIds: string[]): Promise<void> {
  if (alertIds.length === 0) return;
  const updates: Record<string, boolean> = {};
  for (const id of alertIds) {
    updates[`${id}/read`] = true;
  }
  await update(ref(database, 'alerts'), updates);
}
