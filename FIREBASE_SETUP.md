# Firebase Setup Guide for SyncDays

This guide will walk you through setting up Firebase for the SyncDays application.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `sync-days` (or your preferred name)
4. Enable/disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In the Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Click on **Google**
5. Toggle **Enable**
6. Set **Project support email** (use your email)
7. Click **Save**

## Step 3: Set up Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location close to your users
5. Click **Done**

## Step 4: Configure Web App

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web** icon (`</>`)
4. Register app with nickname: `sync-days-web`
5. Copy the Firebase configuration object

## Step 5: Update Application Config

Replace the placeholder config in `src/services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 6: Set up Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Groups collection
    match /groups/{groupId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
      
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.createdBy;
    }
    
    // Days subcollection
    match /groups/{groupId}/days/{date} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.members;
    }
  }
}
```

3. Click **Publish**

## Step 7: Test the Application

1. Run `npm run dev`
2. Open `http://localhost:3000`
3. Try signing in with Google
4. Create a test group
5. Add some calendar entries

## Step 8: Deploy to Firebase Hosting

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
   - Select your project
   - Set public directory to `dist`
   - Configure as single-page app: **Yes**
   - Overwrite index.html: **No**

4. Build and deploy:
```bash
npm run build
firebase deploy
```

## Troubleshooting

### Authentication Issues
- Make sure Google sign-in is enabled in Firebase Console
- Check that your domain is authorized in Authentication settings
- Verify the Firebase config is correct

### Firestore Permission Errors
- Ensure security rules are published
- Check that users are authenticated before accessing data
- Verify group membership in Firestore

### Build Issues
- Make sure all dependencies are installed: `npm install`
- Check for TypeScript/ESLint errors
- Verify Vite configuration

## Production Considerations

1. **Security Rules**: Review and tighten security rules for production
2. **Authentication**: Add domain restrictions in Firebase Console
3. **Monitoring**: Enable Firebase Analytics and Crashlytics
4. **Backup**: Set up Firestore backup schedules
5. **Performance**: Monitor Firestore usage and optimize queries

## Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Review browser console for client-side errors
3. Verify Firebase configuration matches your project
4. Ensure all required services are enabled
