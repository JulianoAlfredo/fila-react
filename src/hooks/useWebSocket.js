import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'

export const useWebSocket = () => {
  const [fila, setFila] = useState([])
  const [conectado, setConectado] = useState(false)
  const [socket, setSocket] = useState(null)
  const socketRef = useRef(null)

  // WebSocket real com Socket.IO
  const conectarWebSocket = () => {
    // Evitar múltiplas conexões
    if (socketRef.current && socketRef.current.connected) {
      console.log('🔌 WebSocket já está conectado')
      return
    }

    console.log('🔌 Conectando WebSocket real...')

    // URL do servidor WebSocket
    const serverUrl =
      'https://test-connection-agenda-filaatendimento.onrender.com'

    // Criar conexão Socket.IO
    const novoSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true
    })

    // Eventos de conexão
    novoSocket.on('connect', () => {
      console.log('✅ WebSocket conectado:', novoSocket.id)
      setConectado(true)
      setSocket(novoSocket)
    })

    novoSocket.on('disconnect', reason => {
      console.log('❌ WebSocket desconectado:', reason)
      setConectado(false)
    })

    novoSocket.on('connect_error', error => {
      console.error('🚫 Erro de conexão WebSocket:', error)
      console.error(serverUrl)
      setConectado(false)
    })

    // Evento para receber atualizações da fila
    novoSocket.on('filaAtualizada', novaFila => {
      console.log('📋 Fila atualizada:', novaFila)
      setFila(novaFila)
    })

    socketRef.current = novoSocket
  }

  const desconectarWebSocket = () => {
    console.log('🔌 Desconectando WebSocket...')
    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setConectado(false)
    setSocket(null)
  }

  // Função para adicionar pessoa na fila via API HTTP
  const adicionarNaFila = async nome => {
    const serverUrl =
      'https://test-connection-agenda-filaatendimento.onrender.com'

    try {
      const response = await fetch(
        `${serverUrl}/add/${encodeURIComponent(nome)}`,
        {
          method: 'GET'
        }
      )

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Erro ao adicionar na fila:', error)
      throw error
    }
  }

  // Função para buscar fila atual via API HTTP
  const buscarFila = async () => {
    const serverUrl =
      'https://test-connection-agenda-filaatendimento.onrender.com'

    try {
      const response = await fetch(`${serverUrl}/fila`)

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const result = await response.json()
      setFila(result)
      return result
    } catch (error) {
      console.error('Erro ao buscar fila:', error)
      throw error
    }
  }

  // Auto-conectar e buscar fila inicial quando o componente montar
  useEffect(() => {
    conectarWebSocket()
    buscarFila()

    // Cleanup na desmontagem
    return () => {
      desconectarWebSocket()
    }
  }, []) // Array vazio para executar apenas uma vez

  return {
    fila,
    conectado,
    socket,
    adicionarNaFila,
    buscarFila,
    conectarWebSocket,
    desconectarWebSocket
  }
}
