import testProjectsData from '../mockData/testProjects.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let testProjects = [...testProjectsData]

const testProjectService = {
  async getAll() {
    await delay(300)
    return [...testProjects]
  },

  async getById(id) {
    await delay(200)
    const project = testProjects.find(p => p.id === id)
    if (!project) {
      throw new Error('Test project not found')
    }
    return { ...project }
  },

  async create(projectData) {
    await delay(400)
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toISOString(),
      testRuns: []
    }
    testProjects.unshift(newProject)
    return { ...newProject }
  },

  async update(id, data) {
    await delay(300)
    const index = testProjects.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Test project not found')
    }
    testProjects[index] = { ...testProjects[index], ...data }
    return { ...testProjects[index] }
  },

  async delete(id) {
    await delay(250)
    const index = testProjects.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Test project not found')
    }
    testProjects.splice(index, 1)
    return { success: true }
  }
}

export default testProjectService