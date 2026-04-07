const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')

let io

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
      ],
      credentials: true,
    },
  })

  // Auth middleware — verify JWT before allowing connection
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication required'))
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      socket.userId = decoded.id  // attach userId to socket
      socket.userRole = decoded.role
      next()
    } catch (err) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.userId}`)

    socket.join(`user:${socket.userId}`)

    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`)

      // Broadcast to project room that someone joined
      const room    = io.sockets.adapter.rooms.get(`project:${projectId}`)
      const count   = room ? room.size : 1

      io.to(`project:${projectId}`).emit('room:members', {
        projectId,
        count,
      })
    })

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`)

      const room  = io.sockets.adapter.rooms.get(`project:${projectId}`)
      const count = room ? room.size : 0

      io.to(`project:${projectId}`).emit('room:members', {
        projectId,
        count,
      })
    })

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.userId}`)
  })
})

  return io
}

// Get io instance anywhere in the app
const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

module.exports = { initSocket, getIO }