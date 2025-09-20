// ---------------------
// Set Member Name
// ---------------------
/**
 * Set or update the display name for a user in a group.
 * @param {string} groupId - The group document ID
 * @param {string} userId - The user's UID
 * @param {string} name - The new display name
 */
export async function setMemberName(groupId, userId, name) {
  const groupDoc = doc(db, 'groups', groupId);
  // Store member names in a map: memberNames: { [userId]: name }
  await updateDoc(groupDoc, {
    [`memberNames.${userId}`]: name
  });
}
import { 
  collection, doc, addDoc, getDoc, getDocs, updateDoc, setDoc, deleteDoc,
  query, where, onSnapshot, serverTimestamp, orderBy, arrayUnion, Timestamp
} from 'firebase/firestore';

import { db } from './firebase';

// ---------------------
// References
// ---------------------
export const groupsRef = collection(db, 'groups');
export const daysRef = (groupId) => collection(db, 'groups', groupId, 'days');

// ---------------------
// Create Group
// ---------------------
export async function createGroup(groupName, userId) {
  const groupData = {
    name: groupName,
    members: [userId],
    createdBy: userId,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(groupsRef, groupData);
  return docRef.id;
}

// ---------------------
// Join Group
// ---------------------
export async function joinGroup(groupId, userId) {
  const groupDoc = doc(db, 'groups', groupId);
  await updateDoc(groupDoc, { members: arrayUnion(userId) });
  return true;
}

// ---------------------
// Get User Groups
// ---------------------
export async function getUserGroups(userId) {
  const q = query(groupsRef, where('members', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ---------------------
// Update Day Status
// ---------------------
export async function updateDayStatus(groupId, date, userId, status) {
  const dayDoc = doc(db, 'groups', groupId, 'days', date);
  try {
    await updateDoc(dayDoc, {
      [`${userId}.status`]: status,
      lastUpdated: serverTimestamp()
    });
  } catch (err) {
    // Create doc if not exists
    await setDoc(dayDoc, {
      [userId]: { status },
      lastUpdated: serverTimestamp()
    }, { merge: true });
  }
}

// ---------------------
// Add Appointment
// ---------------------
export async function addAppointment(groupId, date, userId, appointment) {
  const dayDoc = doc(db, 'groups', groupId, 'days', date);
  const safeAppointment = {
    ...appointment,
    id: crypto.randomUUID(),
    createdBy: userId,
    createdAt: Timestamp.fromDate(new Date())
  };

  const daySnap = await getDoc(dayDoc);
  if (daySnap.exists()) {
    const dayData = daySnap.data();
    const userData = dayData[userId] || {};
    const appointments = Array.isArray(userData.appointments) ? userData.appointments : [];
    await updateDoc(dayDoc, {
      [`${userId}.appointments`]: [...appointments, safeAppointment],
      lastUpdated: serverTimestamp()
    });
  } else {
    await setDoc(dayDoc, {
      [userId]: { appointments: [safeAppointment] },
      lastUpdated: serverTimestamp()
    });
  }

  return safeAppointment.id;
}

// ---------------------
// Edit Appointment
// ---------------------
export async function editAppointment(groupId, date, userId, appointmentId, updatedData) {
  const dayDoc = doc(db, 'groups', groupId, 'days', date);
  const daySnap = await getDoc(dayDoc);
  if (!daySnap.exists()) throw new Error("Day not found");

  const dayData = daySnap.data();
  const appointments = dayData[userId]?.appointments || [];
  const index = appointments.findIndex(a => a.id === appointmentId);
  if (index === -1) throw new Error("Appointment not found");

  appointments[index] = { ...appointments[index], ...updatedData, lastModified: serverTimestamp() };
  await updateDoc(dayDoc, { [`${userId}.appointments`]: appointments, lastUpdated: serverTimestamp() });
}

// ---------------------
// Delete Appointment
// ---------------------
export async function deleteAppointment(groupId, date, userId, appointmentId) {
  const dayDoc = doc(db, 'groups', groupId, 'days', date);
  const daySnap = await getDoc(dayDoc);
  if (!daySnap.exists()) throw new Error("Day not found");

  const appointments = daySnap.data()[userId]?.appointments || [];
  const newAppointments = appointments.filter(a => a.id !== appointmentId);
  await updateDoc(dayDoc, { [`${userId}.appointments`]: newAppointments, lastUpdated: serverTimestamp() });
}

// ---------------------
// Delete Group
// ---------------------
export async function deleteGroup(groupId, userId) {
  const groupDoc = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupDoc);
  if (!groupSnap.exists()) throw new Error("Group not found");
  if (groupSnap.data().createdBy !== userId) throw new Error("Only creator can delete");

  // Delete all days first
  const dayDocs = await getDocs(daysRef(groupId));
  await Promise.all(dayDocs.docs.map(d => deleteDoc(d.ref)));

  // Delete group
  await deleteDoc(groupDoc);
}

// ---------------------
// Real-time Subscriptions
// ---------------------
export function subscribeToGroupDays(groupId, callback) {
  const q = query(daysRef(groupId), orderBy('lastUpdated', 'desc'));
  return onSnapshot(q, snapshot => {
    const days = {};
    snapshot.forEach(doc => days[doc.id] = doc.data());
    callback(days);
  });
}

export function subscribeToUserGroups(userId, callback) {
  const q = query(groupsRef, where('members', 'array-contains', userId));
  return onSnapshot(q, snapshot => {
    const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(groups);
  });
}
