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
    website: (prompt) => callFunction('generateWebsite', { prompt }),
    section: (prompt, existingSections) =>
      callFunction('generateSection', { prompt, existingSections }),
    regenerate: (sectionId, prompt) =>
      callFunction('regenerateSection', { sectionId, prompt }),
  },
}
