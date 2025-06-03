import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import MainFeature from '../components/MainFeature'
import testProjectService from '../services/api/testProjectService'
import testRunService from '../services/api/testRunService'

export default function Home() {
  const [recentProjects, setRecentProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTests: 0,
    successRate: 0
  })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const projects = await testProjectService.getAll()
        setRecentProjects(projects?.slice(0, 3) || [])
        
        // Calculate stats
        const totalProjects = projects?.length || 0
        const allRuns = await testRunService.getAll()
        const activeTests = allRuns?.filter(run => run.status === 'running')?.length || 0
        const completedRuns = allRuns?.filter(run => run.status === 'completed') || []
        const successRate = completedRuns.length > 0 
          ? Math.round((completedRuns.filter(run => 
              run.testCases?.every(tc => tc.status === 'pass')
            ).length / completedRuns.length) * 100)
          : 0

        setStats({
          totalProjects,
          activeTests,
          successRate
        })
      } catch (err) {
        setError(err?.message || 'Failed to load data')
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleNewProject = async (projectData) => {
    try {
      const newProject = await testProjectService.create(projectData)
      setRecentProjects(prev => [newProject, ...prev.slice(0, 2)])
      setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }))
      toast.success('Test project created successfully!')
    } catch (err) {
      toast.error('Failed to create project')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading TestPilot AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glassmorphism border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-glow">
                <ApperIcon name="Bot" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">TestPilot AI</h1>
                <p className="text-xs text-slate-500">Automated Testing Platform</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-700">{stats.totalProjects}</div>
                  <div className="text-xs text-slate-500">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-accent">{stats.activeTests}</div>
                  <div className="text-xs text-slate-500">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-secondary">{stats.successRate}%</div>
                  <div className="text-xs text-slate-500">Success</div>
                </div>
              </div>
              
              <button className="w-10 h-10 rounded-xl glassmorphism flex items-center justify-center hover:shadow-md transition-all duration-200">
                <ApperIcon name="Settings" className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feature - URL Testing */}
          <div className="lg:col-span-2">
            <MainFeature onProjectCreate={handleNewProject} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div 
              className="card-glassmorphism p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <ApperIcon name="BarChart3" className="w-5 h-5 mr-2 text-primary" />
                Dashboard Overview
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <ApperIcon name="FolderOpen" className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-slate-600">Total Projects</span>
                  </div>
                  <span className="font-semibold text-slate-700">{stats.totalProjects}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                      <ApperIcon name="Play" className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-slate-600">Running Tests</span>
                  </div>
                  <span className="font-semibold text-accent">{stats.activeTests}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                      <ApperIcon name="TrendingUp" className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-slate-600">Success Rate</span>
                  </div>
                  <span className="font-semibold text-secondary">{stats.successRate}%</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Projects */}
            <motion.div 
              className="card-glassmorphism p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <ApperIcon name="Clock" className="w-5 h-5 mr-2 text-primary" />
                Recent Projects
              </h3>
              
              {recentProjects?.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project, index) => (
                    <motion.div 
                      key={project.id}
                      className="p-3 border border-slate-200/50 rounded-xl hover:border-primary/30 transition-all duration-200 cursor-pointer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-700 truncate">{project.name}</p>
                          <p className="text-sm text-slate-500 truncate">{project.url}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <ApperIcon name="ExternalLink" className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ApperIcon name="FolderOpen" className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No projects yet</p>
                  <p className="text-sm text-slate-400">Create your first test project above</p>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              className="card-glassmorphism p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <ApperIcon name="Zap" className="w-5 h-5 mr-2 text-primary" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
<button 
                  onClick={() => window.location.href = '/editor'}
                  className="w-full flex items-center p-3 text-left hover:bg-slate-50/50 rounded-xl transition-all duration-200"
                >
                  <ApperIcon name="Upload" className="w-5 h-5 text-slate-500 mr-3" />
                  <div>
                    <p className="font-medium text-slate-700">Upload Test Script</p>
                    <p className="text-sm text-slate-500">Import existing test files</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-slate-50/50 rounded-xl transition-all duration-200">
                  <ApperIcon name="FileText" className="w-5 h-5 text-slate-500 mr-3" />
                  <div>
                    <p className="font-medium text-slate-700">View Test History</p>
                    <p className="text-sm text-slate-500">Browse past test results</p>
                  </div>
                </button>

                <button className="w-full flex items-center p-3 text-left hover:bg-slate-50/50 rounded-xl transition-all duration-200">
                  <ApperIcon name="Settings" className="w-5 h-5 text-slate-500 mr-3" />
                  <div>
                    <p className="font-medium text-slate-700">Configure AI Settings</p>
                    <p className="text-sm text-slate-500">Customize test generation</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}