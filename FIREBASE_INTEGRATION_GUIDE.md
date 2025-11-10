# Firebase Integration Guide for LUXE IDE

## Overview
This guide explains how to integrate your LUXE IDE with Firebase for production deployment with live server capabilities, authentication, and real-time data synchronization.

## Important Note
**This Spark environment is client-side only and cannot directly integrate with Firebase servers.** However, this guide prepares your application for Firebase integration when you deploy it to your own hosting environment.

## Firebase Project Details
- **Project**: device-streaming-f6c287f6
- **Console URL**: https://console.firebase.google.com/u/0/project/device-streaming-f6c287f6/overview

## Prerequisites

### 1. Firebase Services to Enable
Go to your Firebase Console and enable:
- ✅ **Authentication** (for user management)
- ✅ **Firestore Database** (for real-time data storage)
- ✅ **Hosting** (for deploying your app)
- ✅ **Functions** (optional, for server-side logic)
- ✅ **Realtime Database** (optional, for live console streaming)

### 2. Get Firebase Configuration
1. Go to Project Settings > General
2. Scroll to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Register your app with nickname "LUXE IDE"
5. Copy the Firebase config object - you'll need these values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "device-streaming-f6c287f6.firebaseapp.com",
  projectId: "device-streaming-f6c287f6",
  storageBucket: "device-streaming-f6c287f6.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

## Integration Steps (To Do Outside This Environment)

### Step 1: Install Firebase SDK
In your local development environment, run:
```bash
npm install firebase
```

### Step 2: Create Firebase Configuration File
Create `/src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const database = getDatabase(app);
export default app;
```

### Step 3: Create Environment Variables
Create `.env.local` file in your project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=device-streaming-f6c287f6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=device-streaming-f6c287f6
VITE_FIREBASE_STORAGE_BUCKET=device-streaming-f6c287f6.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

**⚠️ NEVER commit `.env.local` to version control!** Add it to `.gitignore`.

### Step 4: Set Up Firestore Security Rules
In Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Console messages - authenticated users can read/write their own
    match /users/{userId}/consoles/{consoleId}/messages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Dashboards - authenticated users can read/write their own
    match /users/{userId}/dashboards/{dashboardId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Marketing strategies - authenticated users can read/write their own
    match /users/{userId}/strategies/{strategyId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Shared/public dashboards (optional)
    match /public/dashboards/{dashboardId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
  }
}
```

### Step 5: Set Up Realtime Database Rules (Optional)
For live console streaming, in Firebase Console > Realtime Database > Rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "live-consoles": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

## Data Structure Recommendations

### Firestore Collections Structure:
```
users/{userId}/
  ├── consoles/{consoleId}/
  │   └── messages/{messageId}
  │       ├── type: string
  │       ├── content: string
  │       ├── timestamp: number
  │       └── consoleId: string
  │
  ├── dashboards/{dashboardId}
  │   ├── id: string
  │   ├── type: string
  │   ├── title: string
  │   ├── data: object
  │   ├── position: object
  │   ├── chartConfig: object
  │   └── createdAt: timestamp
  │
  └── strategies/{strategyId}
      ├── id: string
      ├── productName: string
      ├── targetAudience: string
      ├── campaigns: array
      ├── trends: array
      └── createdAt: timestamp
```

## Deployment to Firebase Hosting

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in Your Project
```bash
firebase init
```
Select:
- ✅ Hosting
- ✅ Firestore (if using)
- ✅ Functions (if using)

### 4. Configure firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### 5. Build and Deploy
```bash
# Build your app
npm run build

# Deploy to Firebase
firebase deploy
```

Your app will be live at: `https://device-streaming-f6c287f6.firebaseapp.com`

## GitHub Actions Workflow for Continuous Deployment

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
      - master

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: device-streaming-f6c287f6
```

### Setting Up GitHub Secrets:
1. Go to your GitHub repository
2. Settings > Secrets and variables > Actions
3. Add these secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `FIREBASE_SERVICE_ACCOUNT` (get from Firebase Console > Project Settings > Service Accounts)

## Live Server Features

### Real-time Console Synchronization
Users can share console sessions in real-time using Firebase Realtime Database.

### Multi-user Collaboration
Multiple users can work on the same dashboards simultaneously with Firestore's real-time listeners.

### Persistent State
All console messages, dashboards, and strategies are automatically saved to Firebase.

### Authentication
Add user authentication to restrict access and personalize experiences.

## Next Steps After Integration

1. ✅ Set up Firebase project and enable required services
2. ✅ Add Firebase SDK to your local project
3. ✅ Create environment variables with your Firebase config
4. ✅ Set up Firestore and Realtime Database rules
5. ✅ Build and test locally
6. ✅ Deploy to Firebase Hosting
7. ✅ Set up GitHub Actions for continuous deployment
8. ✅ Configure custom domain (optional)
9. ✅ Set up monitoring and analytics

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Firestore Setup](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## Troubleshooting

### Common Issues:
- **401 Unauthorized**: Check your security rules
- **CORS errors**: Ensure your domain is authorized in Firebase Console
- **Build fails**: Verify all environment variables are set correctly
- **Data not syncing**: Check Firestore rules and network connection

---

**Created for LUXE IDE v2.0**  
For questions about this integration, refer to Firebase documentation or your development team.
