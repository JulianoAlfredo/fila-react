const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Armazenamento em memória para os avisos
let ultimosAvisos = []
let contadorAviso = 0

// Middleware
app.use(express.json())
app.use(cors())

// Serve arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')))
}

// Rota para receber aviso via POST
app.post('/aviso', (req, res) => {
  const { aviso } = req.body

  if (!aviso || !Array.isArray(aviso)) {
    return res.status(400).json({ error: 'Aviso deve ser um array' })
  }

  // Armazena o aviso com timestamp e ID único
  const novoAviso = {
    id: ++contadorAviso,
    dados: aviso,
    timestamp: new Date(),
    processado: false
  }

  // Adiciona na lista (mantém apenas os últimos 10)
  ultimosAvisos.unshift(novoAviso)
  if (ultimosAvisos.length > 10) {
    ultimosAvisos = ultimosAvisos.slice(0, 10)
  }

  console.log('Aviso recebido:', novoAviso)

  // Emite o aviso via WebSocket para todos os clientes conectados
  io.emit('novo-aviso', novoAviso)

  res.json({
    success: true,
    message: 'Aviso recebido com sucesso!',
    id: novoAviso.id,
    timestamp: novoAviso.timestamp,
    websocketEmitido: true
  })
})

// Rota para o frontend buscar avisos não processados
app.get('/avisos/novos', (req, res) => {
  const avisosNaoProcessados = ultimosAvisos.filter(aviso => !aviso.processado)
  res.json(avisosNaoProcessados)
})

// Rota para marcar aviso como processado
app.post('/avisos/:id/processar', (req, res) => {
  const { id } = req.params
  const aviso = ultimosAvisos.find(a => a.id === parseInt(id))

  if (aviso) {
    aviso.processado = true
    res.json({ success: true, message: 'Aviso marcado como processado' })
  } else {
    res.status(404).json({ error: 'Aviso não encontrado' })
  }
})

// Rota para listar todos os avisos
app.get('/avisos', (req, res) => {
  res.json(ultimosAvisos)
})

// Rota para testar se o servidor está funcionando
app.get('/status', (req, res) => {
  res.json({
    status: 'Servidor funcionando',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 10000,
    totalAvisos: ultimosAvisos.length,
    ultimoAviso: ultimosAvisos[0] || null,
    uptime: process.uptime()
  })
})

// Rota de health check para o Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  })
})

// Rota raiz para verificação básica
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, serve o React app
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  } else {
    // Em desenvolvimento, mostra info da API
    res.json({
      message: 'API Sistema de Fila Ammarhes',
      endpoints: {
        status: '/status',
        health: '/health',
        enviarAviso: 'POST /aviso',
        buscarAvisos: '/avisos/novos',
        listarAvisos: '/avisos',
        testeAviso: '/teste-aviso'
      },
      exemplo: {
        url: 'POST /aviso',
        body: {
          aviso: [1, null, 'Consultório 1', 'João Silva']
        }
      }
    })
  }
})

// Rota para testar envio de aviso via GET (apenas para testes)
app.get('/teste-aviso', (req, res) => {
  const avisoTeste = [1, null, 'Consultório de Teste', 'Paciente Teste']

  const novoAviso = {
    id: ++contadorAviso,
    dados: avisoTeste,
    timestamp: new Date(),
    processado: false
  }

  ultimosAvisos.unshift(novoAviso)
  if (ultimosAvisos.length > 10) {
    ultimosAvisos = ultimosAvisos.slice(0, 10)
  }

  console.log('Aviso de teste criado:', novoAviso)

  res.json({
    success: true,
    message: 'Aviso de teste criado!',
    aviso: novoAviso,
    instrucoes: {
      enviarViaPost: 'POST /aviso',
      formatoJson: {
        aviso: [1, null, 'Local', 'Nome do Paciente']
      }
    }
  })
})

// Serve o React app em produção (deve vir depois das rotas da API)
// Captura todas as rotas que não são da API para servir o React
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Se não for uma rota de API, serve o React app
    if (
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/aviso') &&
      !req.path.startsWith('/status') &&
      !req.path.startsWith('/health') &&
      !req.path.startsWith('/teste-')
    ) {
      res.sendFile(path.join(__dirname, 'build', 'index.html'))
    } else {
      res.status(404).json({ error: 'Rota não encontrada' })
    }
  })
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Cliente WebSocket conectado:', socket.id)
  
  // Envia avisos não processados para o cliente recém-conectado
  const avisosNaoProcessados = ultimosAvisos.filter(aviso => !aviso.processado)
  if (avisosNaoProcessados.length > 0) {
    socket.emit('avisos-pendentes', avisosNaoProcessados)
  }
  
  socket.on('disconnect', () => {
    console.log('Cliente WebSocket desconectado:', socket.id)
  })
  
  // Permite marcar aviso como processado via WebSocket
  socket.on('marcar-processado', (avisoId) => {
    const aviso = ultimosAvisos.find(a => a.id === avisoId)
    if (aviso) {
      aviso.processado = true
      console.log(`Aviso ${avisoId} marcado como processado via WebSocket`)
    }
  })
})

const PORT = process.env.PORT || 10000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`WebSocket habilitado`)
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Servidor vinculado ao host 0.0.0.0:${PORT}`)
  
  if (process.env.NODE_ENV === 'production') {
    console.log('Servidor pronto para receber requisições do Render')
  } else {
    console.log(`Teste local: http://localhost:${PORT}/status`)
    console.log(`Enviar aviso: POST http://localhost:${PORT}/aviso`)
  }
})