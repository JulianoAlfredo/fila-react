const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(express.json())

// Rota para receber aviso
app.post('/aviso', (req, res) => {
  const { aviso } = req.body
  if (!aviso || !Array.isArray(aviso)) {
    return res.status(400).json({ error: 'Aviso inválido' })
  }
  io.emit('novo-aviso', aviso)
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
