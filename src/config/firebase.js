import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const env = (key, fallback) => import.meta.env[key] || fallback

const firebaseConfig = {
  apiKey: env('VITE_FIREBASE_API_KEY', 'YOUR_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN', 'YOUR_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID', 'YOUR_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET', 'YOUR_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID', 'YOUR_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID', 'YOUR_APP_ID'),
}

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => v.startsWith('YOUR_'))
  .map(([k]) => k)

if (missing.length > 0) {
  console.warn(
    `Firebase config incomplete. Missing: ${missing.join(', ')}.\n` +
    'Copy .env.example to .env and fill in your Firebase project credentials.'
  )
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)
export default app
