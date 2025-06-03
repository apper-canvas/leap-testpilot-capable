import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-glassmorphism p-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
            <ApperIcon name="AlertTriangle" className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Page Not Found</h2>
          <p className="text-slate-500 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link
            to="/"
            className="btn-primary inline-flex items-center"
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Back to TestPilot AI
          </Link>
        </motion.div>
      </div>
    </div>
  )
}