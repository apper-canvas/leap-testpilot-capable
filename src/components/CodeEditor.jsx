import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Editor from '@monaco-editor/react'
import ApperIcon from './ApperIcon'

const defaultScript = `// TestPilot AI - Custom Test Script
// Write your test automation code here

const testScript = {
  name: "Custom Test",
  description: "Your custom test implementation",
  
  // Test configuration
  config: {
    timeout: 5000,
    retries: 3,
    screenshot: true
  },
  
  // Main test function
  async execute(page) {
    try {
      console.log("Starting custom test execution...");
      
      // Navigate to target URL
      await page.goto("https://example.com");
      
      // Add your test logic here
      // Example: Check if page title contains expected text
      const title = await page.title();
      console.log("Page title:", title);
      
      // Example: Click a button
      // await page.click("#submit-button");
      
      // Example: Fill a form
      // await page.fill("#email", "test@example.com");
      // await page.fill("#password", "password123");
      
      // Example: Wait for element
      // await page.waitForSelector(".success-message");
      
      console.log("Test completed successfully");
      return { status: "pass", message: "Test passed" };
      
    } catch (error) {
      console.error("Test failed:", error.message);
      return { status: "fail", message: error.message };
    }
  }
};

// Export the test script
export default testScript;`

const scriptTemplates = {
  loginTest: `// Login Flow Test Template
const loginTest = {
  name: "Login Test",
  description: "Test user authentication flow",
  
  async execute(page) {
    await page.goto("https://your-site.com/login");
    
    // Fill login form
    await page.fill("#email", "test@example.com");
    await page.fill("#password", "password123");
    
    // Submit form
    await page.click("#login-button");
    
    // Verify successful login
    await page.waitForSelector(".dashboard");
    
    return { status: "pass", message: "Login successful" };
  }
};`,

  formTest: `// Form Submission Test Template
const formTest = {
  name: "Form Test",
  description: "Test form submission and validation",
  
  async execute(page) {
    await page.goto("https://your-site.com/contact");
    
    // Fill contact form
    await page.fill("#name", "John Doe");
    await page.fill("#email", "john@example.com");
    await page.fill("#message", "Test message");
    
    // Submit form
    await page.click("#submit");
    
    // Verify success message
    await page.waitForSelector(".success-message");
    
    return { status: "pass", message: "Form submitted successfully" };
  }
};`,

  navigationTest: `// Navigation Test Template
const navigationTest = {
  name: "Navigation Test",
  description: "Test website navigation and menu functionality",
  
  async execute(page) {
    await page.goto("https://your-site.com");
    
    // Test main navigation
    await page.click("#about-link");
    await page.waitForURL("**/about");
    
    await page.click("#services-link");
    await page.waitForURL("**/services");
    
    await page.click("#contact-link");
    await page.waitForURL("**/contact");
    
    return { status: "pass", message: "Navigation working correctly" };
  }
};`
}

export default function CodeEditor() {
  const [code, setCode] = useState(defaultScript)
  const [fileName, setFileName] = useState('custom-test.js')
  const [theme, setTheme] = useState('vs-dark')
  const [isLoading, setIsLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true
    })

    // Add custom keyboard shortcuts
    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => handleSave()
    })
  }

  const handleCodeChange = useCallback((value) => {
    setCode(value || '')
    setIsDirty(true)
  }, [])

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.js') && !file.name.endsWith('.ts')) {
      toast.error('Please upload a JavaScript or TypeScript file')
      return
    }

    setIsLoading(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === 'string') {
        setCode(content)
        setFileName(file.name)
        setIsDirty(false)
        toast.success(`File "${file.name}" loaded successfully`)
      } else {
        toast.error('Failed to read file content')
      }
      setIsLoading(false)
    }

    reader.onerror = () => {
      toast.error('Failed to read file')
      setIsLoading(false)
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  const handleSave = () => {
    try {
      const blob = new Blob([code], { type: 'text/javascript' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setIsDirty(false)
      toast.success(`File "${fileName}" saved successfully`)
    } catch (error) {
      toast.error('Failed to save file')
    }
  }

  const handleNewFile = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to create a new file?')) {
        return
      }
    }
    setCode(defaultScript)
    setFileName('custom-test.js')
    setIsDirty(false)
    toast.info('Created new test script')
  }

  const insertTemplate = (templateKey) => {
    const template = scriptTemplates[templateKey]
    if (template && editorRef.current) {
      const editor = editorRef.current
      const selection = editor.getSelection()
      
      editor.executeEdits('', [{
        range: selection,
        text: template
      }])
      
      setIsDirty(true)
      toast.success('Template inserted')
    }
  }

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run()
      toast.success('Code formatted')
    }
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'vs-dark' ? 'light' : 'vs-dark')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
                <ApperIcon name="Code" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Script Editor</h1>
                <p className="text-xs text-slate-500">Write & Edit Test Scripts</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-600 hidden sm:inline">
                {fileName} {isDirty && '(unsaved)'}
              </span>
              
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl glassmorphism flex items-center justify-center hover:shadow-md transition-all duration-200"
                title="Toggle theme"
              >
                <ApperIcon name={theme === 'vs-dark' ? 'Sun' : 'Moon'} className="w-5 h-5 text-slate-600" />
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-10 h-10 rounded-xl glassmorphism flex items-center justify-center hover:shadow-md transition-all duration-200"
                title="Go back"
              >
                <ApperIcon name="ArrowLeft" className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Operations */}
            <motion.div 
              className="card-glassmorphism p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <ApperIcon name="File" className="w-5 h-5 mr-2 text-primary" />
                File Operations
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleNewFile}
                  className="w-full flex items-center p-3 text-left hover:bg-slate-50/50 rounded-xl transition-all duration-200"
                >
                  <ApperIcon name="FileText" className="w-5 h-5 text-slate-500 mr-3" />
                  <span className="font-medium text-slate-700">New File</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center p-3 text-left hover:bg-slate-50/50 rounded-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  <ApperIcon name="Upload" className="w-5 h-5 text-slate-500 mr-3" />
                  <span className="font-medium text-slate-700">
                    {isLoading ? 'Loading...' : 'Upload Script'}
                  </span>
                </button>

                <button
                  onClick={handleSave}
                  className="w-full flex items-center p-3 text-left hover:bg-slate-50/50 rounded-xl transition-all duration-200"
                >
                  <ApperIcon name="Download" className="w-5 h-5 text-slate-500 mr-3" />
                  <span className="font-medium text-slate-700">Save Script</span>
                </button>

                <button
                  onClick={formatCode}
                  className="w-full flex items-center p-3 text-left hover:bg-slate-50/50 rounded-xl transition-all duration-200"
                >
                  <ApperIcon name="Code" className="w-5 h-5 text-slate-500 mr-3" />
                  <span className="font-medium text-slate-700">Format Code</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".js,.ts"
                onChange={handleFileUpload}
                className="hidden"
              />
            </motion.div>

            {/* Templates */}
            <motion.div 
              className="card-glassmorphism p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <ApperIcon name="Template" className="w-5 h-5 mr-2 text-primary" />
                Templates
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => insertTemplate('loginTest')}
                  className="w-full flex items-center p-3 text-left hover:bg-slate-50/50 rounded-xl transition-all duration-200"
                >
                  <ApperIcon name="LogIn" className="w-5 h-5 text-slate-500 mr-3" />
                  <div>
                    <p className="font-medium text-slate-700">Login Test</p>
                    <p className="text-sm text-slate-500">Authentication flow</p>
                  </div>
                </button>

                <button
                  onClick={() => insertTemplate('formTest')}
                  className="w-full flex items-center p-3 text-left hover:bg-slate-50/50 rounded-xl transition-all duration-200"
                >
                  <ApperIcon name="FileText" className="w-5 h-5 text-slate-500 mr-3" />
                  <div>
                    <p className="font-medium text-slate-700">Form Test</p>
                    <p className="text-sm text-slate-500">Form submission</p>
                  </div>
                </button>

                <button
                  onClick={() => insertTemplate('navigationTest')}
                  className="w-full flex items-center p-3 text-left hover:bg-slate-50/50 rounded-xl transition-all duration-200"
                >
                  <ApperIcon name="Navigation" className="w-5 h-5 text-slate-500 mr-3" />
                  <div>
                    <p className="font-medium text-slate-700">Navigation Test</p>
                    <p className="text-sm text-slate-500">Menu navigation</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <motion.div 
              className="card-glassmorphism p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-700">Code Editor</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-500">JavaScript</span>
                  <div className={`w-3 h-3 rounded-full ${isDirty ? 'bg-amber-400' : 'bg-secondary'}`}></div>
                </div>
              </div>

              <div className={`monaco-editor-container ${theme === 'vs-dark' ? 'monaco-editor-dark' : ''}`}>
                <Editor
                  height="600px"
                  defaultLanguage="javascript"
                  value={code}
                  theme={theme}
                  onChange={handleCodeChange}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50">
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Lines: {code.split('\n').length}</span>
                  <span>Characters: {code.length}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="btn-primary text-sm px-4 py-2"
                    disabled={!isDirty}
                  >
                    <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}