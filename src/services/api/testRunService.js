import testRunsData from '../mockData/testRuns.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let testRuns = [...testRunsData]

const testRunService = {
  async getAll() {
    await delay(250)
    return [...testRuns]
  },

  async getById(id) {
    await delay(200)
    const run = testRuns.find(r => r.id === id)
    if (!run) {
      throw new Error('Test run not found')
    }
    return { ...run }
  },

  async getByProjectId(projectId) {
    await delay(300)
    const projectRuns = testRuns.filter(r => r.projectId === projectId)
    return [...projectRuns]
  },

  async create(runData) {
    await delay(350)
    const newRun = {
      id: Date.now().toString(),
      ...runData,
      startTime: new Date().toISOString(),
      testCases: []
    }
    testRuns.unshift(newRun)
    return { ...newRun }
  },

  async update(id, data) {
    await delay(250)
    const index = testRuns.findIndex(r => r.id === id)
    if (index === -1) {
      throw new Error('Test run not found')
    }
    testRuns[index] = { ...testRuns[index], ...data }
    return { ...testRuns[index] }
  },

  async delete(id) {
    await delay(200)
    const index = testRuns.findIndex(r => r.id === id)
    if (index === -1) {
      throw new Error('Test run not found')
    }
    testRuns.splice(index, 1)
    return { success: true }
  }
}

export default testRunService