import { functions } from '../config/firebase'
import { httpsCallable } from 'firebase/functions'

const callFunction = (name, data) => {
  const fn = httpsCallable(functions, name)
  return fn(data)
}

export const api = {
  projects: {
    list: (userId) => callFunction('listProjects', { userId }),
    create: (data) => callFunction('createProject', data),
    get: (projectId) => callFunction('getProject', { projectId }),
    update: (projectId, data) => callFunction('updateProject', { projectId, ...data }),
    delete: (projectId) => callFunction('deleteProject', { projectId }),
    publish: (projectId) => callFunction('publishProject', { projectId }),
  },

  generate: {
    website: (data) => callFunction('generateWebsite', data),
  },

  billing: {
    createCheckoutSession: (data) => callFunction('createCheckoutSession', data),
  },
}
