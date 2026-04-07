require('dotenv').config()
const http    = require('http')
const app     = require('./app')
const connectDB = require('./config/db')
const logger  = require('./utils/logger')
const { initSocket } = require('./config/socket')

require('./jobs/emailWorker')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  // Create HTTP server — needed for Socket.io
  const httpServer = http.createServer(app)

  // Initialize Socket.io
  initSocket(httpServer)

  // Listen on httpServer not app
  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
    logger.info('Email worker started')
    logger.info('Socket.io initialized')
  })
}

process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...')
  process.exit(0)
})

startServer()