import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const Footer = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <footer className="border-t border-gray-800 bg-gray-900 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <span className="text-white font-bold">DevBoard</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A full-stack project management tool built with the MERN stack.
              Manage projects, track tasks and collaborate with your team.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-sm font-medium mb-3">Navigation</h4>
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard"  className="text-gray-400 hover:text-white text-sm transition">Dashboard</Link>
                  <Link to="/analytics"  className="text-gray-400 hover:text-white text-sm transition">Analytics</Link>
                  <Link to="/profile"    className="text-gray-400 hover:text-white text-sm transition">Profile</Link>
                </>
              ) : (
                <>
                  <Link to="/login"    className="text-gray-400 hover:text-white text-sm transition">Login</Link>
                  <Link to="/register" className="text-gray-400 hover:text-white text-sm transition">Register</Link>
                </>
              )}
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <h4 className="text-white text-sm font-medium mb-3">Built with</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'React', 'Node.js', 'Express', 'MongoDB',
                'Redis', 'Socket.io', 'BullMQ', 'Tailwind',
              ].map((tech) => (
                <span
                  key={tech}
                  className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">
            {new Date().getFullYear()} DevBoard. Built for internship preparation.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs">
              v1.0.0
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white text-xs transition"
            >
              GitHub
            </a>
            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white text-xs transition"
            >
              API Docs
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer