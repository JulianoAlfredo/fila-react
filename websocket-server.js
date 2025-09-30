const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const path = require('path')

const app = express()
const server = http.createServer(app)

// Configurar Socket.IO com CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Armazenamento em memória
let avisos = []
let contadorId = 1

// Middleware
app.use(cors())
app.use(express.json())

// Servir arquivos estáticos do React
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')))
}

// ===== ROTAS HTTP =====

// Rota para enviar aviso via HTTP POST
app.post('/api/aviso', (req, res) => {
  const { aviso } = req.body

  if (!aviso || !Array.isArray(aviso) || aviso.length !== 4) {
    return res.status(400).json({
      error: 'Aviso deve ser um array com 4 elementos: [id, null, local, nome]'
    })
  }

  const novoAviso = {
    id: contadorId++,
    dados: aviso,
    timestamp: new Date(),
    processado: false
  }

  // Adicionar à lista
  avisos.unshift(novoAviso)
  avisos = avisos.slice(0, 50) // Manter apenas últimos 50

  console.log('📢 Novo aviso recebido:', novoAviso)

  // Emitir para todos os clientes WebSocket conectados
  io.emit('novo-aviso', novoAviso)

  res.json({
    success: true,
    message: 'Aviso enviado com sucesso!',
    aviso: novoAviso,
    clientesConectados: io.engine.clientsCount
  })
})

// Rota para listar avisos
app.get('/api/avisos', (req, res) => {
  res.json({
    avisos: avisos.slice(0, 10),
    total: avisos.length
  })
})

// Rota para marcar aviso como processado
app.post('/api/avisos/:id/processar', (req, res) => {
  const avisoId = parseInt(req.params.id)
  const aviso = avisos.find(a => a.id === avisoId)

  if (aviso) {
    aviso.processado = true
    io.emit('aviso-processado', avisoId)
    res.json({ success: true, message: 'Aviso processado' })
  } else {
    res.status(404).json({ error: 'Aviso não encontrado' })
  }
})

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'WebSocket Server Online',
    clientesConectados: io.engine.clientsCount,
    totalAvisos: avisos.length,
    timestamp: new Date()
  })
})

// Rota para teste rápido
app.get('/api/teste', (req, res) => {
  const avisoTeste = [
    Date.now(),
    null,
    'Teste via GET',
    `Paciente Teste ${new Date().toLocaleTimeString()}`
  ]

  const novoAviso = {
    id: contadorId++,
    dados: avisoTeste,
    timestamp: new Date(),
    processado: false
  }

  avisos.unshift(novoAviso)
  io.emit('novo-aviso', novoAviso)

  res.json({
    success: true,
    message: 'Aviso de teste enviado!',
    aviso: novoAviso
  })
})

// ===== WEBSOCKET =====

io.on('connection', socket => {
  console.log('🔌 Cliente WebSocket conectado:', socket.id)

  // Enviar avisos não processados para novo cliente
  const avisosNaoProcessados = avisos.filter(a => !a.processado).slice(0, 5)
  if (avisosNaoProcessados.length > 0) {
    socket.emit('avisos-pendentes', avisosNaoProcessados)
  }

  // Enviar status de conexão
  socket.emit('status-conexao', {
    conectado: true,
    timestamp: new Date(),
    totalClientes: io.engine.clientsCount
  })

  // Evento: cliente marca aviso como processado
  socket.on('marcar-processado', avisoId => {
    const aviso = avisos.find(a => a.id === avisoId)
    if (aviso) {
      aviso.processado = true
      console.log(`✅ Aviso ${avisoId} marcado como processado`)
    }
  })

  // Evento: cliente solicita histórico
  socket.on('solicitar-historico', () => {
    socket.emit('historico-avisos', avisos.slice(0, 10))
  })

  socket.on('disconnect', () => {
    console.log('🔌 Cliente WebSocket desconectado:', socket.id)
  })
})

// ===== REACT APP (Produção) =====
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  })
}

// ===== INICIAR SERVIDOR =====
const PORT = process.env.PORT || 3001
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor WebSocket rodando na porta ${PORT}`)
  console.log(`📡 WebSocket: ws://localhost:${PORT}`)
  console.log(`🌐 HTTP API: http://localhost:${PORT}/api`)
  console.log(`📊 Status: http://localhost:${PORT}/api/status`)
  console.log(`📤 Enviar aviso: POST http://localhost:${PORT}/api/aviso`)
})
