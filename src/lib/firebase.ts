// Firebase Configuration for TypeScript/React
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId)
}

// Initialize Firebase only if configured
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    console.log('✅ Firebase initialized successfully')
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error)
  }
} else {
  console.info('ℹ️ Firebase not configured. Add environment variables to enable.')
}

// Export services (may be null if not configured)
export { auth, db, storage }

// Team configuration - integrated with your environment system
export const TEAM_CONFIG = {
  helhum: {
    email: 'helhum@hotmail.com',
    github: 'Helhum-coder'
  },
  helbs: {
    email: 'helbslozroj@gmail.com', 
    github: 'HelbsLozroj'
  }
}

export { isFirebaseConfigured }
export default app