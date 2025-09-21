# SyncDays - Calendar Sync App

SyncDays is a calendar-based app that helps multiple users track each other's availability and schedule appointments.

# https://sync-days.web.app/

## Features

- **User Authentication**: Sign in with Google via Firebase Auth
- **Groups**: Create or join groups with shared calendars
- **Calendar Interface**: Month view calendar with real-time updates
- **Status Tracking**: Mark days as Free ✅, Busy ❌, or Unknown ❔
- **Appointments**: Add appointment details with title, description, and time
- **Real-time Sync**: See changes from other group members immediately

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Firebase (Auth + Firestore + Hosting)
- **Icons**: Lucide React

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google provider
4. Enable Firestore:
   - Go to Firestore Database
   - Create database in test mode
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and add a web app
   - Copy the config object

### 2. Configure Firebase

Update `src/services/firebase.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

## Database Structure

```
groups (collection)
 └─ groupId (doc)
     ├─ name: string
     ├─ members: [userId, ...]
     ├─ createdAt: timestamp
     └─ createdBy: userId

groups/{groupId}/days (subcollection)
 └─ date (doc) - format: "YYYY-MM-DD"
     └─ userId (field)
         ├─ status: "free" | "busy" | "unknown"
         └─ appointments: [
               {
                   title: string,
                   description: string,
                   startTime: timestamp,
                   endTime: timestamp,
                   allDay: boolean,
                   createdAt: timestamp
               }
           ]
```

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize hosting:
```bash
firebase init hosting
```

4. Build and deploy:
```bash
npm run build
firebase deploy
```

## Usage

1. **Sign In**: Use Google authentication to sign in
2. **Create/Join Group**: Create a new group or join an existing one with a group ID
3. **Set Status**: Click on any day in the calendar to mark your availability
4. **Add Appointments**: Add appointment details to any day
5. **View Group**: See real-time updates from other group members


## Firestore Security Rules (2025)

Use these rules for robust group and appointment management:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // =========================
    // Groups collection
    // =========================
    match /groups/{groupId} {

      // Create: Only authenticated user can create a group; must include themselves
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.createdBy
                    && request.resource.data.members.hasAll([request.auth.uid]);

      // Read: Only group members can read group info
      allow read: if request.auth != null
                  && request.auth.uid in resource.data.members;

      // Update: Members can update non-membership fields or join themselves
      allow update: if request.auth != null
                    && (
                      // Already a member
                      request.auth.uid in resource.data.members ||
                      // Joining safely
                      request.resource.data.members.hasAll(resource.data.members) &&
                      request.resource.data.members.hasAny([request.auth.uid])
                    );

      // Delete: Only creator can delete the group
      allow delete: if request.auth != null
                    && request.auth.uid == resource.data.createdBy;

      // =========================
      // Days subcollection
      // =========================
      match /days/{date} {

        // Only group members can read/write
        allow read, write: if request.auth != null
                          && request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.members;

        // Update: Users can only modify their own status or appointments
        allow update: if request.auth != null
                      && request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.members
                      && (
                        // Update own status
                        request.resource.data[request.auth.uid].status in ["free","busy","unknown"] ||
                        // Or update appointments array
                        (request.resource.data[request.auth.uid].appointments is list)
                      );
      }
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
