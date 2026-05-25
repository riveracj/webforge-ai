import { create } from 'zustand'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { PLANS } from '../utils/constants'

const DEFAULT_USAGE = {
  projectCount: 0,
  aiGenerationsUsed: 0,
  plan: 'free',
}

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
      const profile = { uid: cred.user.uid, email, name, role: 'user', createdAt: Date.now(), usage: DEFAULT_USAGE }
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

  signInWithGoogle: async () => {
    set({ error: null, loading: true })
    try {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      const { uid, displayName, email, photoURL } = cred.user
      const docSnap = await getDoc(doc(db, 'users', uid))
      if (!docSnap.exists()) {
        const profile = { uid, email, name: displayName || email?.split('@')[0] || 'User', photoURL, role: 'user', createdAt: Date.now(), usage: DEFAULT_USAGE }
        await setDoc(doc(db, 'users', uid), profile)
        set({ user: cred.user, profile, loading: false })
        return profile
      }
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

  incrementProjectCount: async () => {
    const { user, profile } = get()
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), {
      'usage.projectCount': increment(1),
    })
    set({
      profile: profile ? { ...profile, usage: { ...profile.usage, projectCount: (profile.usage?.projectCount || 0) + 1 } } : null,
    })
  },

  incrementAiGenerations: async () => {
    const { user, profile } = get()
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), {
      'usage.aiGenerationsUsed': increment(1),
    })
    set({
      profile: profile ? { ...profile, usage: { ...profile.usage, aiGenerationsUsed: (profile.usage?.aiGenerationsUsed || 0) + 1 } } : null,
    })
  },

  getPlan: () => {
    const { profile } = get()
    return profile?.usage?.plan || 'free'
  },

  canCreateProject: () => {
    const { profile } = get()
    const usage = profile?.usage || DEFAULT_USAGE
    const plan = usage.plan || 'free'
    return usage.projectCount < PLANS[plan]?.projects
  },

  canGenerateAi: () => {
    const { profile } = get()
    const usage = profile?.usage || DEFAULT_USAGE
    const plan = usage.plan || 'free'
    return usage.aiGenerationsUsed < PLANS[plan]?.aiGenerations
  },
}))
