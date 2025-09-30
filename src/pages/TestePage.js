import React, { useState } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'

const TestePage = () => {
  const { avisosRecebidos, conectado, enviarAviso, enviarAvisoViaAPI } = useWebSocket()
  const [testeForm, setTesteForm] = useState({
    nome: 'João Silva',
    local: 'Consultório 1'
  })

  const handleEnviarTeste = async () => {
    const avisoTeste = [
      Date.now(), // ID único
      null, // Campo reservado
      testeForm.local,
      testeForm.nome
    ]

    try {
      await enviarAviso(avisoTeste)
      console.log('✅ Aviso enviado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao enviar aviso:', error)
      alert('Erro ao enviar aviso: ' + error.message)
    }
  }

  const gerarAvisoAleatorio = async () => {
    const nomes = [
      'Ana Silva',
      'Carlos Souza',
      'Maria Santos',
      'Pedro Oliveira',
      'Julia Costa'
    ]
    const locais = [
      'Consultório 1',
      'Consultório 2',
      'Enfermagem',
      'Recepção',
      'Sala VIP'
    ]

    const nomeAleatorio = nomes[Math.floor(Math.random() * nomes.length)]
    const localAleatorio = locais[Math.floor(Math.random() * locais.length)]

    const avisoAleatorio = [Date.now(), null, localAleatorio, nomeAleatorio]
    
    try {
      await enviarAviso(avisoAleatorio)
      console.log('✅ Aviso aleatório enviado!')
    } catch (error) {
      console.error('❌ Erro ao enviar aviso aleatório:', error)
    }
  }

  const testarAPI = async () => {
    const avisoAPI = [
      Date.now(),
      null,
      'API Test',
      'Teste via HTTP API'
    ]

    try {
      const resultado = await enviarAvisoViaAPI(avisoAPI)
      console.log('✅ Teste API bem-sucedido:', resultado)
      alert('Teste API realizado com sucesso!')
    } catch (error) {
      console.error('❌ Erro no teste API:', error)
      alert('Erro no teste API: ' + error.message)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 Página de Testes WebSocket</h2>

      {/* Status da Conexão */}
      <div
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}
      >
        <h3>📡 Status da Conexão</h3>
        <div
          style={{
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: conectado ? '#d4edda' : '#f8d7da',
            color: conectado ? '#155724' : '#721c24',
            textAlign: 'center',
            fontSize: '18px'
          }}
        >
          {conectado ? '🟢 WebSocket Conectado' : '🔴 WebSocket Desconectado'}
        </div>
      </div>

      {/* Formulário de Teste */}
      <div
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px'
        }}
      >
        <h3>📢 Enviar Aviso de Teste</h3>

        <div style={{ marginBottom: '15px' }}>
          <label>Nome do Paciente:</label>
          <input
            type="text"
            value={testeForm.nome}
            onChange={e =>
              setTesteForm(prev => ({ ...prev, nome: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            placeholder="Ex: João Silva"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Local:</label>
          <input
            type="text"
            value={testeForm.local}
            onChange={e =>
              setTesteForm(prev => ({ ...prev, local: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            placeholder="Ex: Consultório 1"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleEnviarTeste}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📢 Enviar Aviso
          </button>

          <button
            onClick={gerarAvisoAleatorio}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🎲 Aviso Aleatório
          </button>

          <button
            onClick={testarAPI}
            style={{
              padding: '10px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🌐 Testar API HTTP
          </button>
        </div>

        <div style={{ marginTop: '15px', fontSize: '14px', color: '#6c757d' }}>
          <strong>Preview:</strong> "{testeForm.nome} chamado para{' '}
          {testeForm.local}"
        </div>
      </div>

      {/* Avisos Recentes */}
      <div
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}
      >
        <h3>📋 Avisos Recentes ({avisosRecebidos.length})</h3>

        {avisosRecebidos.length === 0 ? (
          <div
            style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}
          >
            Nenhum aviso recebido ainda. Envie um teste acima!
          </div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {avisosRecebidos.map((aviso, index) => (
              <div
                key={aviso.id}
                style={{
                  padding: '10px',
                  margin: '10px 0',
                  backgroundColor: index === 0 ? '#d4edda' : '#ffffff',
                  border: `1px solid ${index === 0 ? '#c3e6cb' : '#dee2e6'}`,
                  borderRadius: '4px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong>{aviso.dados[3]}</strong> → {aviso.dados[2]}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    {new Date(aviso.timestamp).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
                {index === 0 && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#155724',
                      marginTop: '5px'
                    }}
                  >
                    ✅ Mais recente
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Testes Automáticos */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px'
        }}
      >
        <h3>🤖 Testes Automáticos</h3>
        <p>Funcionalidades para testar o sistema automaticamente:</p>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '15px'
          }}
        >
          <button
            onClick={() => {
              for (let i = 0; i < 3; i++) {
                setTimeout(() => gerarAvisoAleatorio(), i * 1000)
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔥 3 Avisos Sequenciais
          </button>

          <button
            onClick={() => {
              const interval = setInterval(() => {
                gerarAvisoAleatorio()
              }, 2000)

              setTimeout(() => clearInterval(interval), 10000)
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6610f2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ⚡ Stress Test (10s)
          </button>
        </div>

        <div style={{ marginTop: '15px', fontSize: '14px', color: '#856404' }}>
          <strong>Nota:</strong> Os testes simulam o recebimento de avisos via
          WebSocket
        </div>
      </div>
    </div>
  )
}

export default TestePage
