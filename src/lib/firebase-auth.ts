// Firebase Authentication utilities with error handling
import { auth } from './firebase'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { globalErrorHandler } from './error-handler'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()

export class FirebaseAuthService {
  
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<User> {
    if (!auth) throw new Error('Firebase Auth not initialized. Add Firebase config to .env.local')
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      const handledError = globalErrorHandler.handleError(error, { 
        action: 'signIn', 
        email 
      })
      throw new Error(handledError.userMessage)
    }
  }

  // Create new user with email and password
  static async signUp(email: string, password: string): Promise<User> {
    if (!auth) throw new Error('Firebase Auth not initialized. Add Firebase config to .env.local')
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      const handledError = globalErrorHandler.handleError(error, { 
        action: 'signUp', 
        email 
      })
      throw new Error(handledError.userMessage)
    }
  }

  // Sign in with Google
  static async signInWithGoogle(): Promise<User> {
    if (!auth) throw new Error('Firebase Auth not initialized. Add Firebase config to .env.local')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (error) {
      const handledError = globalErrorHandler.handleError(error, { 
        action: 'googleSignIn' 
      })
      throw new Error(handledError.userMessage)
    }
  }

  // Sign out user
  static async signOut(): Promise<void> {
    if (!auth) throw new Error('Firebase Auth not initialized')
    try {
      await signOut(auth)
    } catch (error) {
      const handledError = globalErrorHandler.handleError(error, { 
        action: 'signOut' 
      })
      throw new Error(handledError.userMessage)
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void) {
    if (!auth) {
      console.warn('Firebase Auth not initialized')
      return () => {}
    }
    return onAuthStateChanged(auth, callback)
  }

  // Get current user
  static getCurrentUser(): User | null {
    if (!auth) return null
    return auth.currentUser
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (!auth) {
      console.warn('Firebase Auth not initialized')
      return false
    }
    return !!auth.currentUser
  }

  // Check if Firebase is available
  static isAvailable(): boolean {
    return !!auth
  }
}

export default FirebaseAuthService