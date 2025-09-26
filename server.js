const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

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

  res.json({
    success: true,
    message: 'Aviso recebido com sucesso!',
    id: novoAviso.id,
    timestamp: novoAviso.timestamp
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
    totalAvisos: ultimosAvisos.length,
    ultimoAviso: ultimosAvisos[0] || null
  })
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
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  })
}

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Teste: http://localhost:${PORT}/status`)
  console.log(`Enviar aviso: POST http://localhost:${PORT}/aviso`)
})
