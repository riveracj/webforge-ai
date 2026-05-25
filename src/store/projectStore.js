import { create } from 'zustand'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { defaultProjectStructure, PLANS } from '../utils/constants'
import { useAuthStore } from './authStore'

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  versionHistory: [],
  loading: false,
  error: null,

  fetchProjects: async (userId) => {
    set({ loading: true })
    try {
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
      const snap = await getDocs(q)
      const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      set({ projects, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createProject: async (userId, data) => {
    const { profile, canCreateProject } = useAuthStore.getState()
    if (!canCreateProject()) {
      const plan = profile?.usage?.plan || 'free'
      const limit = PLANS[plan]?.projects || 0
      const msg = `Free plan limited to ${limit} projects. Upgrade to Pro for more.`
      set({ error: msg, loading: false })
      throw new Error(msg)
    }

    set({ loading: true })
    try {
      const projectData = {
        ...defaultProjectStructure,
        ...data,
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'draft',
        publishedUrl: null,
      }
      const docRef = await addDoc(collection(db, 'projects'), projectData)
      const newProject = { id: docRef.id, ...projectData }

      await useAuthStore.getState().incrementProjectCount()

      set((s) => ({ projects: [newProject, ...s.projects], loading: false }))
      return newProject
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  getProject: async (projectId) => {
    set({ loading: true })
    try {
      const docSnap = await getDoc(doc(db, 'projects', projectId))
      if (docSnap.exists()) {
        const project = { id: docSnap.id, ...docSnap.data() }
        set({ currentProject: project, loading: false })
        return project
      }
      set({ loading: false })
      return null
    } catch (err) {
      set({ error: err.message, loading: false })
      return null
    }
  },

  updateProject: async (projectId, updates) => {
    try {
      const data = { ...updates, updatedAt: Date.now() }
      await updateDoc(doc(db, 'projects', projectId), data)
      set((s) => {
        if (s.currentProject?.id === projectId) {
          return { currentProject: { ...s.currentProject, ...data } }
        }
        return {}
      })
    } catch (err) {
      set({ error: err.message })
    }
  },

  saveVersion: async (projectId, snapshot) => {
    try {
      const versionRef = collection(db, 'projects', projectId, 'versions')
      await addDoc(versionRef, {
        ...snapshot,
        savedAt: Date.now(),
      })
    } catch (err) {
      console.error('Save version error:', err)
    }
  },

  deleteProject: async (projectId) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId))
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== projectId),
      }))
    } catch (err) {
      set({ error: err.message })
    }
  },

  cloneProject: async (projectId, userId) => {
    const { profile, canCreateProject } = useAuthStore.getState()
    if (!canCreateProject()) {
      const plan = profile?.usage?.plan || 'free'
      const limit = PLANS[plan]?.projects || 0
      const msg = `Free plan limited to ${limit} projects. Upgrade to Pro for more.`
      set({ error: msg, loading: false })
      throw new Error(msg)
    }

    set({ loading: true })
    try {
      const original = await getDoc(doc(db, 'projects', projectId))
      if (!original.exists()) return null
      const data = original.data()
      const cloneData = {
        ...data,
        name: `${data.name} (Copy)`,
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'draft',
        publishedUrl: null,
      }
      const docRef = await addDoc(collection(db, 'projects'), cloneData)
      const clone = { id: docRef.id, ...cloneData }

      await useAuthStore.getState().incrementProjectCount()

      set((s) => ({ projects: [clone, ...s.projects], loading: false }))
      return clone
    } catch (err) {
      set({ error: err.message, loading: false })
      return null
    }
  },
}))
