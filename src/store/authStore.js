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
import { PLANS, DEFAULT_USAGE, SIGNUP_CREDIT_GRANTS } from '../utils/constants'

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

  deductCredits: async (modelCredits) => {
    const { user, profile } = get()
    if (!user || !profile?.usage) return
    const u = profile.usage
    const freeAvail = (u.freeCreditsTotal || 0) - (u.freeCreditsUsed || 0)
    const updates = {}
    const local = { ...u }

    if (freeAvail >= modelCredits) {
      updates['usage.freeCreditsUsed'] = increment(modelCredits)
      local.freeCreditsUsed = (u.freeCreditsUsed || 0) + modelCredits
    } else if (freeAvail > 0) {
      updates['usage.freeCreditsUsed'] = increment(freeAvail)
      local.freeCreditsUsed = (u.freeCreditsUsed || 0) + freeAvail
      const remaining = modelCredits - freeAvail
      updates['usage.purchasedCredits'] = increment(-remaining)
      local.purchasedCredits = (u.purchasedCredits || 0) - remaining
    } else {
      updates['usage.purchasedCredits'] = increment(-modelCredits)
      local.purchasedCredits = (u.purchasedCredits || 0) - modelCredits
    }
    updates['usage.aiGenerationsUsed'] = increment(1)

    await updateDoc(doc(db, 'users', user.uid), updates)
    set({
      profile: profile ? { ...profile, usage: local } : null,
    })
  },

  getCreditBalance: () => {
    const { profile } = get()
    const u = profile?.usage || DEFAULT_USAGE
    const freeAvail = (u.freeCreditsTotal || 0) - (u.freeCreditsUsed || 0)
    return { free: Math.max(0, freeAvail), purchased: u.purchasedCredits || 0, total: Math.max(0, freeAvail) + (u.purchasedCredits || 0) }
  },

  canGenerateAi: () => {
    return true
  },

  canAffordGeneration: (modelCredits) => {
    const { profile } = get()
    const u = profile?.usage || DEFAULT_USAGE
    const freeAvail = (u.freeCreditsTotal || 0) - (u.freeCreditsUsed || 0)
    return Math.max(0, freeAvail) + (u.purchasedCredits || 0) >= modelCredits
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
}))
