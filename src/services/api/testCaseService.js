import testCasesData from '../mockData/testCases.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let testCases = [...testCasesData]

const testCaseService = {
  async getAll() {
    await delay(200)
    return [...testCases]
  },

  async getById(id) {
    await delay(150)
    const testCase = testCases.find(tc => tc.id === id)
    if (!testCase) {
      throw new Error('Test case not found')
    }
    return { ...testCase }
  },

  async getByRunId(runId) {
    await delay(250)
    const runTestCases = testCases.filter(tc => tc.runId === runId)
    return [...runTestCases]
  },

  async create(caseData) {
    await delay(300)
    const newCase = {
      id: Date.now().toString(),
      ...caseData,
      createdAt: new Date().toISOString()
    }
    testCases.unshift(newCase)
    return { ...newCase }
  },

  async update(id, data) {
    await delay(200)
    const index = testCases.findIndex(tc => tc.id === id)
    if (index === -1) {
      throw new Error('Test case not found')
    }
    testCases[index] = { ...testCases[index], ...data }
    return { ...testCases[index] }
  },

  async delete(id) {
    await delay(150)
    const index = testCases.findIndex(tc => tc.id === id)
    if (index === -1) {
      throw new Error('Test case not found')
    }
    testCases.splice(index, 1)
    return { success: true }
  }
}

export default testCaseService