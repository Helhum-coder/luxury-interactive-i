import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { getDatabase, ref, set, onValue, push } from 'firebase/database';

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

export const initializeAuth = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export const saveConsoleMessage = async (userId: string, consoleId: string, message: any) => {
  try {
    const messagesRef = collection(firestore, `users/${userId}/consoles/${consoleId}/messages`);
    const docRef = await addDoc(messagesRef, {
      ...message,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving console message:', error);
    throw error;
  }
};

export const subscribeToConsoleMessages = (
  userId: string, 
  consoleId: string, 
  callback: (messages: any[]) => void
) => {
  const messagesRef = collection(firestore, `users/${userId}/consoles/${consoleId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(100));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

export const saveDashboard = async (userId: string, dashboard: any) => {
  try {
    const dashboardsRef = collection(firestore, `users/${userId}/dashboards`);
    const docRef = await addDoc(dashboardsRef, {
      ...dashboard,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving dashboard:', error);
    throw error;
  }
};

export const saveMarketingStrategy = async (userId: string, strategy: any) => {
  try {
    const strategiesRef = collection(firestore, `users/${userId}/strategies`);
    const docRef = await addDoc(strategiesRef, {
      ...strategy,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving marketing strategy:', error);
    throw error;
  }
};

export const createLiveConsoleSession = async (sessionId: string, initialData: any) => {
  try {
    const sessionRef = ref(database, `live-consoles/${sessionId}`);
    await set(sessionRef, {
      ...initialData,
      createdAt: Date.now(),
      active: true
    });
    return sessionId;
  } catch (error) {
    console.error('Error creating live console session:', error);
    throw error;
  }
};

export const subscribeToLiveConsole = (sessionId: string, callback: (data: any) => void) => {
  const sessionRef = ref(database, `live-consoles/${sessionId}`);
  return onValue(sessionRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const broadcastConsoleCommand = async (sessionId: string, command: any) => {
  try {
    const commandsRef = ref(database, `live-consoles/${sessionId}/commands`);
    const newCommandRef = push(commandsRef);
    await set(newCommandRef, {
      ...command,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error broadcasting command:', error);
    throw error;
  }
};

export default app;
