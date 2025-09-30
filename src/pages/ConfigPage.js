import React, { useState } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'

const ConfigPage = () => {
  const { conectado, conectarWebSocket, desconectarWebSocket } = useWebSocket()
  const [configuracoes, setConfiguracoes] = useState({
    velocidadeVoz: 1.5,
    volumeVoz: 1,
    tempoExibicao: 3500,
    autoReconectar: true
  })

  const handleConfigChange = (key, value) => {
    setConfiguracoes(prev => ({
      ...prev,
      [key]: value
    }))
    localStorage.setItem(
      'filaConfig',
      JSON.stringify({
        ...configuracoes,
        [key]: value
      })
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>⚙️ Configurações do Sistema</h2>

      <div
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}
      >
        <h3>🔌 Conexão WebSocket</h3>
        <div style={{ marginBottom: '15px' }}>
          Status:
          <span
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: conectado ? '#d4edda' : '#f8d7da',
              color: conectado ? '#155724' : '#721c24'
            }}
          >
            {conectado ? '🟢 Conectado' : '🔴 Desconectado'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={conectarWebSocket}
            disabled={conectado}
            style={{
              padding: '8px 16px',
              backgroundColor: conectado ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: conectado ? 'not-allowed' : 'pointer'
            }}
          >
            {conectado ? 'Já Conectado' : 'Conectar'}
          </button>

          <button
            onClick={desconectarWebSocket}
            disabled={!conectado}
            style={{
              padding: '8px 16px',
              backgroundColor: !conectado ? '#6c757d' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !conectado ? 'not-allowed' : 'pointer'
            }}
          >
            Desconectar
          </button>
        </div>
      </div>

      <div
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}
      >
        <h3>🔊 Configurações de Voz</h3>

        <div style={{ marginBottom: '15px' }}>
          <label>Velocidade da Voz: {configuracoes.velocidadeVoz}</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={configuracoes.velocidadeVoz}
            onChange={e =>
              handleConfigChange('velocidadeVoz', parseFloat(e.target.value))
            }
            style={{ width: '100%', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Volume da Voz: {configuracoes.volumeVoz}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={configuracoes.volumeVoz}
            onChange={e =>
              handleConfigChange('volumeVoz', parseFloat(e.target.value))
            }
            style={{ width: '100%', marginTop: '5px' }}
          />
        </div>

        <button
          onClick={() => {
            if ('speechSynthesis' in window) {
              const utter = new window.SpeechSynthesisUtterance(
                'Teste de voz com as configurações atuais'
              )
              utter.lang = 'pt-BR'
              utter.rate = configuracoes.velocidadeVoz
              utter.volume = configuracoes.volumeVoz
              window.speechSynthesis.speak(utter)
            }
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔊 Testar Voz
        </button>
      </div>

      <div
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}
      >
        <h3>⏱️ Configurações de Exibição</h3>

        <div style={{ marginBottom: '15px' }}>
          <label>Tempo de Exibição do Aviso (ms): </label>
          <input
            type="number"
            value={configuracoes.tempoExibicao}
            onChange={e =>
              handleConfigChange('tempoExibicao', parseInt(e.target.value))
            }
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginLeft: '10px',
              width: '100px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              checked={configuracoes.autoReconectar}
              onChange={e =>
                handleConfigChange('autoReconectar', e.target.checked)
              }
              style={{ marginRight: '8px' }}
            />
            Auto-reconectar WebSocket
          </label>
        </div>
      </div>

      <div
        style={{
          padding: '20px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px'
        }}
      >
        <h3>💾 Backup/Restore</h3>
        <p>
          As configurações são salvas automaticamente no localStorage do
          navegador.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button
            onClick={() => {
              const config = JSON.stringify(configuracoes, null, 2)
              const blob = new Blob([config], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'fila-config.json'
              a.click()
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📥 Exportar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfigPage
