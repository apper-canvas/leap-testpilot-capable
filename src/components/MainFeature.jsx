import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import testRunService from '../services/api/testRunService'
import testCaseService from '../services/api/testCaseService'

export default function MainFeature({ onProjectCreate }) {
  const [url, setUrl] = useState('')
  const [testTypes, setTestTypes] = useState({
    login: true,
    navigation: true,
    forms: true,
    links: true
  })
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState(null)
  const [testResults, setTestResults] = useState([])
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])
  const [activeTab, setActiveTab] = useState('config')
  const [showResults, setShowResults] = useState(false)

  const testTypeLabels = {
    login: 'Login Flow',
    navigation: 'Navigation',
    forms: 'Form Submission',
    links: 'Broken Links'
  }

  const testTypeIcons = {
    login: 'LogIn',
    navigation: 'Navigation',
    forms: 'FileText',
    links: 'Link'
  }

  const handleUrlChange = (e) => {
    setUrl(e.target.value)
  }

  const handleTestTypeToggle = (type) => {
    setTestTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const validateUrl = () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL')
      return false
    }
    
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      toast.error('Please enter a valid URL')
      return false
    }
  }

  const simulateTestExecution = async () => {
    const selectedTypes = Object.entries(testTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type)

    if (selectedTypes.length === 0) {
      toast.error('Please select at least one test type')
      return
    }

    setIsRunning(true)
    setProgress(0)
    setLogs([])
    setTestResults([])
    setCurrentTest(null)
    setActiveTab('execution')

    try {
      // Create test run
      const testRun = await testRunService.create({
        projectId: 'temp-' + Date.now(),
        status: 'running',
        startTime: new Date().toISOString(),
        testCases: []
      })

      // Add initial log
      setLogs(['🚀 Starting AI test generation...', `🌐 Analyzing website: ${url}`])

      const totalSteps = selectedTypes.length
      let completedSteps = 0

      for (const testType of selectedTypes) {
        setCurrentTest(testType)
        
        // Update logs
        setLogs(prev => [...prev, `🔍 Generating ${testTypeLabels[testType]} tests...`])
        
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Simulate test case generation and execution
        const isSuccess = Math.random() > 0.3 // 70% success rate
        const duration = Math.floor(Math.random() * 3000) + 500

        const testCase = await testCaseService.create({
          name: `${testTypeLabels[testType]} Test`,
          type: testType,
          status: isSuccess ? 'pass' : 'fail',
          screenshot: `https://images.unsplash.com/800x600/?testing,${testType}`,
          logs: [
            `Navigating to ${url}`,
            `Analyzing ${testType} elements...`,
            isSuccess ? '✅ Test completed successfully' : '❌ Test failed - element not found',
            `Execution time: ${duration}ms`
          ],
          duration
        })

        setTestResults(prev => [...prev, testCase])
        
        setLogs(prev => [...prev, 
          `⚡ Executing ${testTypeLabels[testType]} test...`,
          isSuccess ? `✅ ${testTypeLabels[testType]} test PASSED` : `❌ ${testTypeLabels[testType]} test FAILED`
        ])

        completedSteps++
        setProgress((completedSteps / totalSteps) * 100)

        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Complete test run
      await testRunService.update(testRun.id, {
        status: 'completed',
        endTime: new Date().toISOString()
      })

      setCurrentTest(null)
      setLogs(prev => [...prev, '🎉 All tests completed!'])
      setShowResults(true)
      setActiveTab('results')

      // Create project if callback provided
      if (onProjectCreate) {
        const projectData = {
          name: `Test - ${new URL(url.startsWith('http') ? url : `https://${url}`).hostname}`,
          url: url,
          createdAt: new Date().toISOString()
        }
        onProjectCreate(projectData)
      }

      toast.success(`Test execution completed! ${testResults.filter(r => r.status === 'pass').length}/${testResults.length} tests passed`)

    } catch (error) {
      toast.error('Test execution failed')
      setLogs(prev => [...prev, `❌ Error: ${error.message}`])
    } finally {
      setIsRunning(false)
    }
  }

  const handleStartTesting = async () => {
    if (!validateUrl()) return
    await simulateTestExecution()
  }

  const resetTest = () => {
    setUrl('')
    setIsRunning(false)
    setCurrentTest(null)
    setTestResults([])
    setProgress(0)
    setLogs([])
    setActiveTab('config')
    setShowResults(false)
  }

  return (
    <motion.div 
      className="card-glassmorphism p-6 lg:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">AI Website Testing</h2>
          <p className="text-slate-500">Enter a URL to automatically generate and run comprehensive tests</p>
        </div>
        
        {showResults && (
          <motion.button
            onClick={resetTest}
            className="mt-4 sm:mt-0 flex items-center px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all duration-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="RotateCcw" className="w-4 h-4 mr-2" />
            New Test
          </motion.button>
        )}
      </div>

      {/* URL Input */}
      <div className="mb-6">
        <div className="relative">
          <ApperIcon name="Globe" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="w-full pl-12 pr-4 py-4 input-glassmorphism text-lg"
            disabled={isRunning}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-100/50 p-1 rounded-xl">
        {[
          { id: 'config', label: 'Configuration', icon: 'Settings' },
          { id: 'execution', label: 'Execution', icon: 'Play' },
          { id: 'results', label: 'Results', icon: 'BarChart3' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-sm font-medium'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ApperIcon name={tab.icon} className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Test Types */}
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <ApperIcon name="CheckSquare" className="w-5 h-5 mr-2 text-primary" />
                Select Test Types
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(testTypes).map(([type, enabled]) => (
                  <motion.div
                    key={type}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      enabled
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => handleTestTypeToggle(type)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                        enabled ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <ApperIcon name={testTypeIcons[type]} className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-700">{testTypeLabels[type]}</h4>
                        <p className="text-sm text-slate-500">
                          {type === 'login' && 'Test authentication flows'}
                          {type === 'navigation' && 'Check menu and page navigation'}
                          {type === 'forms' && 'Validate form submissions'}
                          {type === 'links' && 'Detect broken or invalid links'}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        enabled ? 'border-primary bg-primary' : 'border-slate-300'
                      }`}>
                        {enabled && <ApperIcon name="Check" className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <motion.button
              onClick={handleStartTesting}
              disabled={isRunning || !url.trim()}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              whileHover={{ scale: isRunning ? 1 : 1.02 }}
              whileTap={{ scale: isRunning ? 1 : 0.98 }}
            >
              {isRunning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></div>
                  Running Tests...
                </>
              ) : (
                <>
                  <ApperIcon name="Sparkles" className="w-5 h-5 mr-3" />
                  Start AI Testing
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {activeTab === 'execution' && (
          <motion.div
            key="execution"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Progress */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 * (1 - progress / 100)}
                    className="text-primary transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-700">{Math.round(progress)}%</span>
                </div>
              </div>
              
              {currentTest && (
                <div className="flex items-center justify-center mb-4">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse mr-2"></div>
                  <span className="text-slate-600">Testing {testTypeLabels[currentTest]}</span>
                </div>
              )}
            </div>

            {/* Live Logs */}
            <div className="bg-slate-900 rounded-xl p-4 h-64 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-slate-100 text-sm font-mono"
                  >
                    <span className="text-slate-400">[{new Date().toLocaleTimeString()}]</span> {log}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {testResults.length > 0 ? (
              <>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50/50 rounded-xl">
                    <div className="text-2xl font-bold text-slate-700">{testResults.length}</div>
                    <div className="text-sm text-slate-500">Total Tests</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50/50 rounded-xl">
                    <div className="text-2xl font-bold text-secondary">{testResults.filter(r => r.status === 'pass').length}</div>
                    <div className="text-sm text-slate-500">Passed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50/50 rounded-xl">
                    <div className="text-2xl font-bold text-red-600">{testResults.filter(r => r.status === 'fail').length}</div>
                    <div className="text-sm text-slate-500">Failed</div>
                  </div>
                </div>

                {/* Test Results */}
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-slate-200/50 rounded-xl p-4 hover:border-slate-300/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                            result.status === 'pass' ? 'bg-secondary text-white' : 'bg-red-500 text-white'
                          }`}>
                            <ApperIcon name={testTypeIcons[result.type]} className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-700">{result.name}</h4>
                            <p className="text-sm text-slate-500">{result.duration}ms</p>
                          </div>
                        </div>
                        <span className={result.status === 'pass' ? 'status-pass' : 'status-fail'}>
                          {result.status === 'pass' ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      
                      <div className="bg-slate-50/50 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-slate-700 mb-2">Test Logs:</h5>
                        <div className="space-y-1">
                          {result.logs?.map((log, logIndex) => (
                            <div key={logIndex} className="text-sm text-slate-600 font-mono">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <ApperIcon name="BarChart3" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">No Results Yet</h3>
                <p className="text-slate-500">Run a test to see results here</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}