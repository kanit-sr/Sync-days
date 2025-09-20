import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  setDoc,
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  orderBy,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Groups collection
export const groupsRef = collection(db, 'groups');
export const daysRef = (groupId) => collection(db, 'groups', groupId, 'days');

// Group operations
export async function createGroup(groupName, userId) {
  try {
    const groupData = {
      name: groupName,
      members: [userId],
      createdAt: serverTimestamp(),
      createdBy: userId
    };
    
    console.log('Creating group with data:', groupData);
    const docRef = await addDoc(groupsRef, groupData);
    console.log('Group created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error in createGroup:', error);
    throw error;
  }
}

export async function joinGroup(groupId, userId) {
  const groupDoc = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupDoc);
  
  if (groupSnap.exists()) {
    const groupData = groupSnap.data();
    if (!groupData.members.includes(userId)) {
      const updatedMembers = [...groupData.members, userId];
      await updateDoc(groupDoc, { members: updatedMembers });
    }
    return true;
  }
  return false;
}

export async function getUserGroups(userId) {
  const q = query(groupsRef, where('members', 'array-contains', userId));
  const querySnapshot = await getDocs(q);
  const groups = [];
  
  querySnapshot.forEach((doc) => {
    groups.push({ id: doc.id, ...doc.data() });
  });
  
  return groups;
}

// Day operations
export async function updateDayStatus(groupId, date, userId, status) {
  const dayDoc = doc(db, 'groups', groupId, 'days', date);
  try {
    await updateDoc(dayDoc, {
      [`${userId}.status`]: status,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    // If document doesn't exist, create it
    if (error.code === 'not-found' || error.message?.includes('No document to update')) {
      await setDoc(dayDoc, {
        [`${userId}.status`]: status,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } else {
      console.error('updateDayStatus failed:', error);
      throw error;
    }
  }
}

export async function addAppointment(groupId, date, userId, appointment) {
  const dayDoc = doc(db, 'groups', groupId, 'days', date);
  
  try {
    // Add ID and metadata to appointment
    const safeAppointment = {
      ...appointment,
      id: crypto.randomUUID(), // Add unique ID
      createdBy: userId,
      createdAt: new Date() // Use JS Date instead of serverTimestamp
    };

    // Convert any Date objects to Firestore Timestamp
    if (safeAppointment.startTime instanceof Date) {
      safeAppointment.startTime = Timestamp.fromDate(safeAppointment.startTime);
    }
    if (safeAppointment.endTime instanceof Date) {
      safeAppointment.endTime = Timestamp.fromDate(safeAppointment.endTime);
    }

    const daySnap = await getDoc(dayDoc);

    if (daySnap.exists()) {
      // Document exists, update appointments array
      const dayData = daySnap.data();
      const userData = dayData[userId] || {};
      const appointments = Array.isArray(userData.appointments) ? userData.appointments : [];

      await updateDoc(dayDoc, {
        [`${userId}.appointments`]: [...appointments, safeAppointment],
        lastUpdated: serverTimestamp()
      });
    } else {
      // Document doesn't exist, create it
      await setDoc(dayDoc, {
        [userId]: {
          appointments: [safeAppointment]
        },
        lastUpdated: serverTimestamp()
      }, { merge: true });
    }

    return safeAppointment.id; // Return the new appointment ID
  } catch (error) {
    console.error('Error in addAppointment:', error);
    throw error;
  }
}

export function getDayData(groupId, date) {
  const dayDoc = doc(db, 'groups', groupId, 'days', date);
  return getDoc(dayDoc);
}

// Real-time listeners
export function subscribeToGroupDays(groupId, callback) {
  const q = query(collection(db, 'groups', groupId, 'days'), orderBy('lastUpdated', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const days = {};
    snapshot.forEach((doc) => {
      days[doc.id] = doc.data();
    });
    callback(days);
  });
}

export async function deleteGroup(groupId, userId) {
  const groupDoc = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupDoc);
  
  if (!groupSnap.exists()) {
    throw new Error('Group not found');
  }
  
  const groupData = groupSnap.data();
  if (groupData.createdBy !== userId) {
    throw new Error('Only the group creator can delete the group');
  }
  
  // Delete all days subcollection documents first
  const daysQuery = query(collection(db, 'groups', groupId, 'days'));
  const daysSnap = await getDocs(daysQuery);
  const batch = [];
  
  daysSnap.forEach((dayDoc) => {
    batch.push(deleteDoc(doc(db, 'groups', groupId, 'days', dayDoc.id)));
  });
  
  // Wait for all day documents to be deleted
  await Promise.all(batch);
  
  // Finally delete the group document
  await deleteDoc(groupDoc);
}

export async function editAppointment(groupId, date, userId, appointmentId, updatedData) {
  const dayDoc = doc(db, 'groups', groupId, 'days', date);
  const daySnap = await getDoc(dayDoc);
  
  if (!daySnap.exists()) {
    throw new Error('No appointments found for this day');
  }
  
  const dayData = daySnap.data();
  const userData = dayData[userId];
  
  if (!userData || !Array.isArray(userData.appointments)) {
    throw new Error('No appointments found for this user');
  }
  
  // Convert dates to Firestore Timestamps
  const safeUpdatedData = { ...updatedData };
  if (safeUpdatedData.startTime instanceof Date) {
    safeUpdatedData.startTime = Timestamp.fromDate(safeUpdatedData.startTime);
  }
  if (safeUpdatedData.endTime instanceof Date) {
    safeUpdatedData.endTime = Timestamp.fromDate(safeUpdatedData.endTime);
  }
  
  // Find and update the specific appointment
  const appointments = userData.appointments;
  const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
  
  if (appointmentIndex === -1) {
    throw new Error('Appointment not found');
  }
  
  // Update the appointment while preserving any existing fields not in updatedData
  appointments[appointmentIndex] = {
    ...appointments[appointmentIndex],
    ...safeUpdatedData,
    lastModified: serverTimestamp()
  };
  
  // Update the document with the modified appointments array
  await updateDoc(dayDoc, {
    [`${userId}.appointments`]: appointments,
    lastUpdated: serverTimestamp()
  });
}

export async function deleteAppointment(groupId, date, userId, appointmentId) {
  const dayDoc = doc(db, 'groups', groupId, 'days', date);
  const daySnap = await getDoc(dayDoc);
  
  if (!daySnap.exists()) {
    throw new Error('No appointments found for this day');
  }
  
  const dayData = daySnap.data();
  const userData = dayData[userId];
  
  if (!userData || !Array.isArray(userData.appointments)) {
    throw new Error('No appointments found for this user');
  }
  
  // Filter out the appointment to delete
  const appointments = userData.appointments.filter(a => a.id !== appointmentId);
  
  if (appointments.length === userData.appointments.length) {
    throw new Error('Appointment not found');
  }
  
  // Update the document with the filtered appointments array
  await updateDoc(dayDoc, {
    [`${userId}.appointments`]: appointments,
    lastUpdated: serverTimestamp()
  });
}

export function subscribeToUserGroups(userId, callback) {
  const q = query(groupsRef, where('members', 'array-contains', userId));
  return onSnapshot(q, (snapshot) => {
    const groups = [];
    snapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    callback(groups);
  });
}
