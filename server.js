const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Serve arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')))
}

// Rota para receber aviso
app.post('/aviso', (req, res) => {
  const { aviso } = req.body

  if (!aviso || !Array.isArray(aviso)) {
    return res.status(400).json({ error: 'Aviso deve ser um array' })
  }

  const script = `
    <script>
      if (window.receberAviso) {
        window.receberAviso(${JSON.stringify(aviso)});
        document.write('Aviso enviado com sucesso!');
      } else {
        document.write('Frontend não encontrado ou não carregado');
      }
    </script>
  `

  res.setHeader('Content-Type', 'text/html')
  res.send(script)
})

// Rota para testar se o servidor está funcionando
app.get('/status', (req, res) => {
  res.json({
    status: 'Servidor funcionando',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
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
