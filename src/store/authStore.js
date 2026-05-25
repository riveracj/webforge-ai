import { create } from 'zustand'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, 'users', user.uid))
        set({ user, profile: docSnap.data() || null, loading: false })
      } else {
        set({ user: null, profile: null, loading: false })
      }
    })
    return unsubscribe
  },

  register: async (email, password, name) => {
    set({ error: null, loading: true })
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const profile = { uid: cred.user.uid, email, name, role: 'user', createdAt: Date.now() }
      await setDoc(doc(db, 'users', cred.user.uid), profile)
      set({ user: cred.user, profile, loading: false })
      return profile
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  login: async (email, password) => {
    set({ error: null, loading: true })
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const docSnap = await getDoc(doc(db, 'users', cred.user.uid))
      set({ user: cred.user, profile: docSnap.data(), loading: false })
      return docSnap.data()
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  logout: async () => {
    await signOut(auth)
    set({ user: null, profile: null })
  },
}))
