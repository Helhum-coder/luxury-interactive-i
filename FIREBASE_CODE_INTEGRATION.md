# Firebase Integration - Quick Setup

Firebase is now wired into the codebase and will auto-initialize when environment variables are present.

## Install Firebase SDK

```bash
npm install firebase
```

## Configure Environment Variables

Create `.env.local` in the project root:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=device-streaming-f6c287f6
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Get your credentials from: https://console.firebase.google.com/u/0/project/device-streaming-f6c287f6/settings/general

## Seed Firebase Config for CLI

```bash
npm run firebase:seed-studio:copy
```

This creates the directory with `.firebaserc`, `firebase.json`, `firestore.rules`, and `firestore.indexes.json`.

## Test Firebase Connection

Start the dev server:

```bash
npm run dev
```

Open DevTools Console and look for:
- ✅ `Firebase initialized successfully` (if configured)
- ℹ️ `Firebase not configured` (if env vars missing)

## Deploy to Firebase

```bash
cd ~/studio  # or wherever you seeded the config
firebase login
firebase deploy
```

## Code Integration Status

✅ `src/lib/firebase.ts` - Active, with null-safe initialization
✅ `src/lib/firebase-auth.ts` - Active, with graceful degradation if not configured
✅ Auto-detects environment and only initializes when configured
✅ Logs clear messages about Firebase availability

## Next Steps

1. Run `npm install firebase`
2. Add Firebase credentials to `.env.local`
3. Restart dev server (`npm run dev`)
4. Check console for "Firebase initialized successfully"
5. Use Firebase services in your components via imports from `@/lib/firebase`
