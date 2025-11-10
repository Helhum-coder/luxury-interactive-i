# 🔥 Firebase Deployment Quick Start Guide

## ⚠️ Important Notice
This guide is for deploying LUXE IDE to **your own local development environment** and then to Firebase. The current Spark environment cannot directly integrate with Firebase, but your application is **ready to be deployed** once you follow these steps.

---

## 🚀 Quick Start (5 Steps to Live Deployment)

### Step 1: Clone to Your Local Environment
```bash
# Clone this repository to your local machine
git clone [your-repo-url]
cd spark-template

# Install dependencies
npm install
```

### Step 2: Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com/u/0/project/device-streaming-f6c287f6/settings/general)
2. Scroll to "Your apps" section
3. Click the **Web app** icon (</>)
4. Register app as "LUXE IDE"
5. Copy the config values

### Step 3: Set Up Environment Variables
```bash
# Copy the example file
cp EXAMPLE_.env.local .env.local

# Edit .env.local with your actual Firebase credentials
# Use any text editor (VS Code, nano, vim, etc.)
```

Your `.env.local` should look like:
```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=device-streaming-f6c287f6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=device-streaming-f6c287f6
VITE_FIREBASE_STORAGE_BUCKET=device-streaming-f6c287f6.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
```

### Step 4: Install Firebase SDK
```bash
# Install Firebase packages
npm install firebase
```

### Step 5: Set Up Firebase Files
```bash
# Copy example files to actual files (remove "EXAMPLE_" prefix)
cp EXAMPLE_firebase.json firebase.json
cp EXAMPLE_firestore.rules firestore.rules
cp EXAMPLE_firestore.indexes.json firestore.indexes.json
cp EXAMPLE_database.rules.json database.rules.json

# Copy the Firebase integration file to src/lib/
cp EXAMPLE_firebase.ts src/lib/firebase.ts
```

---

## 🏗️ Build and Deploy

### Local Testing
```bash
# Test the build locally
npm run build

# Preview the production build
npm run preview
```

### Deploy to Firebase
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# ✅ Hosting
# ✅ Firestore
# ✅ Database
# Use existing project: device-streaming-f6c287f6

# Deploy!
firebase deploy
```

Your app will be live at:
**https://device-streaming-f6c287f6.firebaseapp.com**

---

## 🔐 Enable Firebase Services

### 1. Firestore Database
```bash
# In Firebase Console
1. Go to Firestore Database
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select a location (us-central1 recommended)
5. Click "Enable"

# Deploy security rules
firebase deploy --only firestore:rules
```

### 2. Realtime Database
```bash
# In Firebase Console
1. Go to Realtime Database
2. Click "Create Database"
3. Choose "Start in locked mode"
4. Click "Enable"

# Deploy security rules
firebase deploy --only database
```

### 3. Authentication (Optional but Recommended)
```bash
# In Firebase Console
1. Go to Authentication
2. Click "Get Started"
3. Enable "Anonymous" sign-in method
4. (Optional) Enable other methods: Google, Email/Password, etc.
```

---

## 🔄 Continuous Deployment with GitHub Actions

### Set Up GitHub Actions
1. Copy workflow files to `.github/workflows/`:
```bash
mkdir -p .github/workflows
cp EXAMPLE_firebase-hosting-merge.yml .github/workflows/firebase-hosting-merge.yml
cp EXAMPLE_firebase-hosting-pull-request.yml .github/workflows/firebase-hosting-pull-request.yml
```

2. Get Firebase Service Account Key:
```bash
# In Firebase Console
1. Go to Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely
```

3. Add GitHub Secrets:
```bash
# Go to your GitHub repository
# Settings > Secrets and variables > Actions
# Add these secrets:

VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
FIREBASE_SERVICE_ACCOUNT (paste the entire JSON from step 2)
```

4. Push to GitHub:
```bash
git add .
git commit -m "Configure Firebase deployment"
git push origin main
```

Now every push to `main` or `master` automatically deploys to Firebase! 🎉

---

## 🔧 Using Firebase in Your Code

### Initialize Firebase (Already set up in EXAMPLE_firebase.ts)
```typescript
import { auth, firestore, database } from '@/lib/firebase';
```

### Save Console Messages to Firestore
```typescript
import { saveConsoleMessage } from '@/lib/firebase';

const user = await initializeAuth();
await saveConsoleMessage(user.uid, 'system', {
  type: 'info',
  content: 'Hello Firebase!',
  timestamp: Date.now(),
  consoleId: 'system'
});
```

### Real-time Console Sync
```typescript
import { subscribeToConsoleMessages } from '@/lib/firebase';

const user = await initializeAuth();
const unsubscribe = subscribeToConsoleMessages(
  user.uid, 
  'system',
  (messages) => {
    console.log('New messages:', messages);
  }
);
```

### Save Dashboards
```typescript
import { saveDashboard } from '@/lib/firebase';

const user = await initializeAuth();
await saveDashboard(user.uid, {
  id: 'dashboard-1',
  type: 'line',
  title: 'Analytics Dashboard',
  data: [...],
  position: { x: 0, y: 0, w: 4, h: 2 }
});
```

---

## 📊 Monitoring Your App

### Firebase Console Dashboard
- **Hosting**: View deployment history and traffic
- **Firestore**: Browse and edit database documents
- **Realtime Database**: Monitor live connections
- **Authentication**: See active users
- **Analytics**: Track user behavior (if enabled)

### Firebase CLI Commands
```bash
# View hosting domains
firebase hosting:sites:list

# Check deployment status
firebase hosting:channel:list

# View Firestore data
firebase firestore:indexes

# View Realtime Database data
firebase database:get /

# View logs
firebase functions:log
```

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

### Deployment Errors
```bash
# Make sure you're logged in
firebase login --reauth

# Check current project
firebase projects:list

# Use correct project
firebase use device-streaming-f6c287f6

# Try deploying specific services
firebase deploy --only hosting
firebase deploy --only firestore
```

### CORS Issues
```bash
# In Firebase Console > Firestore > Rules
# Make sure rules allow your operations

# For development, you can temporarily use:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Environment Variables Not Working
```bash
# Make sure .env.local exists and has correct values
cat .env.local

# Restart development server
npm run dev

# For production, make sure GitHub secrets are set
```

---

## 🎯 Next Steps

1. ✅ Complete the 5 Quick Start steps above
2. ✅ Deploy to Firebase Hosting
3. ✅ Enable Firestore and Realtime Database
4. ✅ Set up GitHub Actions for continuous deployment
5. ✅ Configure custom domain (optional)
6. ✅ Enable authentication
7. ✅ Add monitoring and analytics
8. ✅ Optimize performance
9. ✅ Set up staging environment

---

## 📚 Useful Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [GitHub Actions for Firebase](https://github.com/FirebaseExtended/action-hosting-deploy)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## 💡 Pro Tips

1. **Use Firebase Emulators** for local development:
   ```bash
   firebase emulators:start
   ```

2. **Set up multiple environments**:
   - Production: `device-streaming-f6c287f6`
   - Staging: Create another Firebase project

3. **Enable Firebase Analytics** for user insights

4. **Use Firebase Performance Monitoring** to track app speed

5. **Set up budget alerts** in Google Cloud Console

---

**Need Help?** 
- Check `FIREBASE_INTEGRATION_GUIDE.md` for detailed instructions
- Review example files (EXAMPLE_*.*)
- Visit Firebase documentation
- Check GitHub Actions logs for deployment issues

**Ready to deploy?** Start with Step 1! 🚀
