import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './assets/pages/DashboardTV.css'
import logoAmmarhes from './public/img/LogoAmmarhes.png'
import returnFilaById from './utils/returnFilaById'

const DashboardTV = () => {
  const [filas, setFilas] = useState({
    recepcao: [],
    enfermagem: [],
    medico: [],
    finalizacao: ['']
  })
  const [estatisticas, setEstatisticas] = useState({
    totalPacientes: 0,
    aguardando: 0,
    emAtendimento: 0,
    finalizado: 0
  })
  const [socket, setSocket] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [aviso, setAviso] = useState([null, null, null, null])
  const [avisosRecebidos, setAvisosRecebidos] = useState([])

  // Busca novos avisos do servidor a cada 2 segundos
  useEffect(() => {
    const buscarAvisos = async () => {
      try {
        const response = await axios.get('/avisos/novos')
        if (response.data.length > 0) {
          const novoAviso = response.data[0] // Pega o mais recente
          setAviso(novoAviso.dados)
          setAvisosRecebidos(prev => [novoAviso, ...prev.slice(0, 9)]) // Mantém últimos 10

          // Marca como processado
          await axios.post(`/avisos/${novoAviso.id}/processar`)
        }
      } catch (error) {
        console.error('Erro ao buscar avisos:', error)
      }
    }

    // Busca imediatamente e depois a cada 2 segundos
    buscarAvisos()
    const interval = setInterval(buscarAvisos, 2000)

    return () => clearInterval(interval)
  }, [])

  // Fala aviso
  useEffect(() => {
    if (aviso[0] && aviso[3] && aviso[2]) {
      const mensagem = `${aviso[3]} chamado para ${aviso[2]}`
      if ('speechSynthesis' in window) {
        const speak = () => {
          window.speechSynthesis.cancel()
          const utter = new window.SpeechSynthesisUtterance(mensagem)
          utter.lang = 'pt-BR'
          utter.rate = 1.5
          utter.pitch = 1
          utter.volume = 1
          const voices = window.speechSynthesis.getVoices()
          const vozBR =
            voices.find(v => v.lang === 'pt-BR') ||
            voices.find(v => v.lang.startsWith('pt'))
          if (vozBR) utter.voice = vozBR
          window.speechSynthesis.speak(utter)
        }
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.onvoiceschanged = speak
        } else {
          setTimeout(speak, 200)
        }
      }
    }
    if (!aviso[0]) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [aviso])

  const filaNomes = [
    { key: 'recepcao', nome: 'Recepção', cor: '#a7c7e7' },
    { key: 'enfermagem', nome: 'Enfermagem', cor: '#b7e7c7' },
    { key: 'medico', nome: 'Médico', cor: '#0f0e0cff' }
  ]

  // Prepara dados das filas para renderização
  const pacientesPorFila = filaNomes.map(fila => ({
    ...fila,
    pacientes: filas[fila.key] || []
  }))

  // Filtra pacientes em atendimento de todas as filas
  const emAtendimento = []
  Object.values(filas).forEach(fila => {
    if (Array.isArray(fila)) {
      fila.forEach(paciente => {
        if (paciente && paciente.status === 'em-atendimento') {
          emAtendimento.push(paciente)
        }
      })
    }
  })

  const [animNome, setAnimNome] = useState(null)
  useEffect(() => {
    if (aviso[0] && aviso[3]) {
      setAnimNome(aviso[3])
      const timer = setTimeout(() => setAnimNome(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [aviso])

  return (
    <div
      className="dashboard-tv"
      style={{
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="dashboard-header">
        <img
          src={logoAmmarhes}
          alt="Logo Ammarhes"
          className="dashboard-header-logo"
          style={{ height: 40, marginRight: 16 }}
        />
      </div>

      {/* Animação de chamada */}
      {animNome && (
        <div className="aviso-atendimento">
          {animNome} chamado para {aviso[2]}
        </div>
      )}

      {/* Avisos recebidos em tempo real */}
      {avisosRecebidos.length > 0 && (
        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '10px',
            margin: '10px 20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#0e58a8' }}>
            📢 Últimos Avisos Recebidos
          </h4>
          {avisosRecebidos.slice(0, 3).map((avisoItem, idx) => (
            <div
              key={avisoItem.id}
              style={{
                padding: '8px',
                backgroundColor: idx === 0 ? '#d4edda' : '#ffffff',
                border: idx === 0 ? '1px solid #c3e6cb' : '1px solid #dee2e6',
                borderRadius: '4px',
                marginBottom: '5px',
                fontSize: '0.9rem'
              }}
            >
              <strong>
                {avisoItem.dados[3]} → {avisoItem.dados[2]}
              </strong>
              <span
                style={{ float: 'right', color: '#6c757d', fontSize: '0.8rem' }}
              >
                {new Date(avisoItem.timestamp).toLocaleTimeString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      <div className="estatisticas-board" style={{ marginBottom: 18 }}>
        <div className="estatistica-item aguardando">
          <span className="numero" style={{ fontSize: '2.1rem' }}>
            {estatisticas.aguardando}
          </span>
          <span className="label" style={{ fontSize: '0.9rem' }}>
            Aguardando
          </span>
        </div>
        <div className="estatistica-item atendimento">
          <span className="numero" style={{ fontSize: '2.1rem' }}>
            {estatisticas.emAtendimento}
          </span>
          <span className="label" style={{ fontSize: '0.9rem' }}>
            Atendimento
          </span>
        </div>
        <div className="estatistica-item finalizado">
          <span className="numero" style={{ fontSize: '2.1rem' }}>
            {estatisticas.finalizado}
          </span>
          <span className="label" style={{ fontSize: '0.9rem' }}>
            Finalizado
          </span>
        </div>
      </div>

      {/* Filas principais */}
      <div className="filas-grid" style={{ marginTop: 0 }}>
        {pacientesPorFila.map(fila => (
          <div
            className="fila-container"
            key={fila.key}
            style={{ minWidth: 0, padding: 10 }}
          >
            <div
              className="fila-header"
              style={{
                padding: '10px 12px',
                background: 'rgba(248,250,252,0.7)',
                borderBottom: 'none'
              }}
            >
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{fila.nome}</h3>
            </div>
            <div
              className="fila-content"
              style={{
                padding: '10px 12px',
                maxHeight: '22vh',
                overflowY: 'auto'
              }}
            >
              {fila.pacientes.length > 0 ? (
                fila.pacientes.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="paciente-item"
                    style={{
                      padding: 8,
                      ...(p.vip
                        ? {
                            border: '2px solid #d4af37',
                            borderRadius: '8px',
                            boxShadow: '0 2px 6px rgba(212, 175, 55, 0.3)',
                            backgroundColor: '#ffffff',
                            background: '#ffffff'
                          }
                        : {})
                    }}
                  >
                    <div className="paciente-info">
                      <span
                        className="paciente-nome"
                        style={{
                          fontSize: '0.95rem',
                          color: p.vip ? '#ffffffff' : 'inherit',
                          fontWeight: p.vip ? 'bold' : 'normal'
                        }}
                      >
                        <strong
                          style={{ color: p.vip ? '#000000ff' : 'inherit' }}
                        >
                          {p.nome}
                        </strong>
                        {p.vip && (
                          <span
                            className="vip-badge"
                            style={{
                              background: '#d4af37',
                              color: '#000000ff',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              marginLeft: '8px',
                              textTransform: 'uppercase'
                            }}
                          >
                            VIP
                          </span>
                        )}
                      </span>
                      <span
                        className={`paciente-status ${
                          p.vip ? 'fila-atendimento-lista-hora-vip' : ''
                        }`}
                        style={{
                          fontSize: '0.8rem',
                          color: p.vip ? '#000000ff' : 'inherit'
                        }}
                      >
                        Aguardando
                      </span>
                    </div>
                    <span
                      className="paciente-horario"
                      style={{
                        fontSize: '0.8rem',
                        color: p.vip ? '#000000ff' : 'inherit'
                      }}
                    >
                      {/* Usando toLocaleTimeString para melhor formatação */}
                      {new Date(p.horarioAgenda).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  className="sem-pacientes"
                  style={{ fontSize: '0.85rem', padding: 6 }}
                >
                  <p>Sem pacientes</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Fila em atendimento embaixo */}
      <div style={{ paddingLeft: '25px', paddingRight: '25px' }}>
        <h3 style={{ color: '#0e58a8', marginBottom: 8, fontSize: '1.1rem' }}>
          Em Atendimento
        </h3>
        <div>
          {emAtendimento.length === 0 ? (
            <div
              className="sem-pacientes"
              style={{ fontSize: '0.85rem', padding: 6 }}
            >
              <p>Nenhum paciente em atendimento</p>
            </div>
          ) : (
            emAtendimento.map((p, idx) => (
              <div
                key={p.id || idx}
                className="paciente-item"
                style={{
                  padding: 8,
                  ...(p.vip
                    ? {
                        border: '2px solid #d4af37',
                        borderRadius: '8px',
                        boxShadow: '0 2px 6px rgba(212, 175, 55, 0.3)',
                        backgroundColor: '#ffffff',
                        background: '#ffffff'
                      }
                    : {})
                }}
              >
                <div className="paciente-info">
                  <span
                    className="paciente-nome"
                    style={{
                      fontSize: '0.95rem',
                      color: p.vip ? '#d4af37' : 'inherit',
                      fontWeight: p.vip ? 'bold' : 'normal'
                    }}
                  >
                    <strong style={{ color: p.vip ? '#d4af37' : 'inherit' }}>
                      {p.nome}
                    </strong>
                    {p.vip && (
                      <span
                        className="vip-badge"
                        style={{
                          background: '#d4af37',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          marginLeft: '8px',
                          textTransform: 'uppercase'
                        }}
                      >
                        VIP
                      </span>
                    )}
                  </span>
                  <span
                    className={`paciente-status ${
                      p.vip ? 'fila-atendimento-lista-hora-vip' : ''
                    }`}
                    style={{
                      fontSize: '0.8rem',
                      color: p.vip ? '#000000ff' : 'inherit'
                    }}
                  >
                    Em atendimento com{' '}
                    {returnFilaById(p.idFila) || 'desconhecido'}
                  </span>
                </div>
                <span
                  className="paciente-horario"
                  style={{
                    fontSize: '0.8rem',
                    color: p.vip ? '#b8860b' : 'inherit'
                  }}
                >
                  {new Date(p.horarioAgenda).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/*conexão e info */}
      <div className="tv-footer-fix-position">
        <div className="tv-footer" style={{ padding: 10 }}>
          <div className="status-conexao">
            <div
              className={`status-indicator ${
                socket?.connected ? 'conectado' : 'desconectado'
              }`}
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
            >
              {socket?.connected ? '🟢 Conectado' : '🔴 Desconectado'}
            </div>
            <span style={{ fontSize: '0.8rem' }}>
              Atualização em tempo real
            </span>
            <span className="ultima-atualizacao" style={{ fontSize: '0.8rem' }}>
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
          </div>
          <div className="sistema-info" style={{ fontSize: '0.7rem' }}>
            Sistema Fila Clínica Ammarhes
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="loading-icon">⏳</div>
            <div>Carregando painel...</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardTV
