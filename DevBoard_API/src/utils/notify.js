const { getIO } = require('../config/socket')
const logger    = require('./logger')

// Notification types
const NOTIFICATION_TYPES = {
  TASK_ASSIGNED:    'task:assigned',
  TASK_UPDATED:     'task:updated',
  TASK_COMPLETED:   'task:completed',
  PROJECT_UPDATED:  'project:updated',
  MEMBER_ADDED:     'member:added',
}

// Send notification to specific user
const notifyUser = (userId, type, data) => {
  try {
    const io = getIO()
    io.to(`user:${userId}`).emit('notification', {
      type,
      data,
      timestamp: new Date().toISOString(),
      read: false,
    })
    logger.info(`Notification sent to user ${userId}: ${type}`)
  } catch (err) {
    logger.error(`Failed to send notification: ${err.message}`)
  }
}

// Send update to all users in a project room
const notifyProject = (projectId, type, data) => {
  try {
    const io = getIO()
    io.to(`project:${projectId}`).emit('project:update', {
      type,
      data,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    logger.error(`Failed to notify project: ${err.message}`)
  }
}

module.exports = { notifyUser, notifyProject, NOTIFICATION_TYPES }