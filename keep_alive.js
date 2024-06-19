const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

let messages = []

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

io.on('connection', (socket) => {
  console.log('New client connected')

  // Send the last 10000 messages to the client
  socket.emit('init', messages.slice(-1000))

  socket.on('sendMessage', (msg) => {
    const message = {
      username: 'You',
      text: msg,
      time: new Date().toLocaleTimeString()
    }
    messages.push(message)
    io.emit('message', message)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
})

server.listen(8080, () => {
  console.log("Server is running on port 8080")
})

module.exports = {
  addMessage: (username, text) => {
    const message = {
      username,
      text,
      time: new Date().toLocaleTimeString()
    }
    messages.push(message)
    io.emit('message', message)
  }
}
