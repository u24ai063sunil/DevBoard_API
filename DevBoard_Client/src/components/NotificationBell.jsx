import { useState, useRef, useEffect } from 'react'
import useNotificationStore from '../store/notificationStore'

const typeLabels = {
  'task:assigned':   'Task assigned',
  'task:updated':    'Task updated',
  'task:completed':  'Task completed',
  'project:updated': 'Project updated',
  'member:added':    'Member added',
}

const typeColors = {
  'task:assigned':  'bg-indigo-500/10 text-indigo-400',
  'task:completed': 'bg-green-500/10 text-green-400',
  'task:updated':   'bg-blue-500/10 text-blue-400',
  'member:added':   'bg-purple-500/10 text-purple-400',
}

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)

  const { notifications, unreadCount, markAllRead, markRead, clearAll } =
    useNotificationStore()

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleOpen = () => {
    setOpen(!open)
    if (!open && unreadCount > 0) markAllRead()
  }

  const formatTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="relative" ref={ref}>

      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-800"
      >
        {/* Bell icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50">

          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
            <h3 className="text-white font-medium text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-gray-500 hover:text-gray-300 text-xs transition"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-600 text-xs mt-1">
                  You'll see alerts here when tasks are assigned
                </p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={i}
                  onClick={() => markRead(i)}
                  className={`px-4 py-3 border-b border-gray-800 last:border-0 cursor-pointer hover:bg-gray-800 transition ${
                    !n.read ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[n.type] || 'bg-gray-500/10 text-gray-400'}`}>
                        {typeLabels[n.type] || n.type}
                      </span>
                      <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                        {n.data?.message || n.data?.taskTitle || 'New notification'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!n.read && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"/>
                      )}
                      <span className="text-gray-600 text-xs">
                        {formatTime(n.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  )
}

export default NotificationBell