import { useState, useEffect, useRef } from 'react'

export const useWebSocket = () => {
  const [avisosRecebidos, setAvisosRecebidos] = useState([])
  const [conectado, setConectado] = useState(false)
  const [socket, setSocket] = useState(null)
  const socketRef = useRef(null)

  // WebSocket simulado com EventSource ou fetch polling
  const conectarWebSocket = () => {
    console.log('🔌 Conectando WebSocket simulado...')
    
    // Simular conexão WebSocket com polling
    const interval = setInterval(async () => {
      try {
        // Simula recebimento de dados
        const avisoSimulado = {
          id: Date.now(),
          dados: [1, null, 'WebSocket Simulado', `Teste ${new Date().toLocaleTimeString()}`],
          timestamp: new Date(),
          processado: false
        }

        // Ocasionalmente adiciona um aviso de teste
        if (Math.random() > 0.98) { // 2% de chance a cada segundo
          setAvisosRecebidos(prev => [avisoSimulado, ...prev.slice(0, 9)])
          setConectado(true)
        } else {
          setConectado(true)
        }
      } catch (error) {
        console.error('Erro na conexão simulada:', error)
        setConectado(false)
      }
    }, 1000)

    socketRef.current = interval
    setSocket({ connected: true, interval })
  }

  const desconectarWebSocket = () => {
    console.log('🔌 Desconectando WebSocket...')
    if (socketRef.current) {
      clearInterval(socketRef.current)
      socketRef.current = null
    }
    setConectado(false)
    setSocket(null)
  }

  const enviarAviso = (aviso) => {
    console.log('📤 Enviando aviso:', aviso)
    const novoAviso = {
      id: Date.now(),
      dados: aviso,
      timestamp: new Date(),
      processado: false
    }
    setAvisosRecebidos(prev => [novoAviso, ...prev.slice(0, 9)])
    return Promise.resolve(novoAviso)
  }

  // Simular recebimento de aviso externo via API
  const receberAvisoExterno = (aviso) => {
    const novoAviso = {
      id: Date.now(),
      dados: aviso,
      timestamp: new Date(),
      processado: false
    }
    setAvisosRecebidos(prev => [novoAviso, ...prev.slice(0, 9)])
  }

  // Expor função global para receber avisos externos
  useEffect(() => {
    window.receberAviso = receberAvisoExterno
    return () => {
      delete window.receberAviso
    }
  }, [])

  return {
    avisosRecebidos,
    conectado,
    socket,
    enviarAviso,
    conectarWebSocket,
    desconectarWebSocket,
    receberAvisoExterno
  }
}