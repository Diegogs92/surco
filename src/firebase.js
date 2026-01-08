import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { enableIndexedDbPersistence, initializeFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
})

enableIndexedDbPersistence(db).catch(() => {
  // La persistencia puede fallar en modo privado o en multiples pestañas.
})

const auth = getAuth(app)

export { app, auth, db }
