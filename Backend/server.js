import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

app.get('/', (req, res) => {
  res.json({
    message: 'Hello ABHISHEK',
    success: true
  })
})

app.get('/health', (req, res) => {
  res.json({
    message: 'Server is healthy',
    success: true
  })
})

httpServer.listen(3000, () => {
  console.log('Server running on port 3000')
})