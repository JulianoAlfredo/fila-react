import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'

export const useWebSocket = () => {
  const [avisosRecebidos, setAvisosRecebidos] = useState([])
  const [conectado, setConectado] = useState(false)
  const [socket, setSocket] = useState(null)
  const socketRef = useRef(null)

  // WebSocket real com Socket.IO
  const conectarWebSocket = () => {
    console.log('🔌 Conectando WebSocket real...')

    // URL do servidor WebSocket
    const serverUrl =
      process.env.NODE_ENV === 'production'
        ? window.location.origin
        : 'http://localhost:3001'

    // Criar conexão Socket.IO
    const novoSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000
    })

    // Eventos de conexão
    novoSocket.on('connect', () => {
      console.log('✅ WebSocket conectado:', novoSocket.id)
      setConectado(true)
      setSocket(novoSocket)

      // Solicitar avisos pendentes ao conectar
      novoSocket.emit('solicitar-avisos-pendentes')
    })

    novoSocket.on('disconnect', reason => {
      console.log('❌ WebSocket desconectado:', reason)
      setConectado(false)
    })

    novoSocket.on('connect_error', error => {
      console.error('🚫 Erro de conexão WebSocket:', error)
      setConectado(false)
    })

    // Eventos de dados
    novoSocket.on('novo-aviso', aviso => {
      console.log('📢 Novo aviso recebido:', aviso)
      setAvisosRecebidos(prev => [aviso, ...prev.slice(0, 9)])
    })

    novoSocket.on('avisos-pendentes', avisos => {
      console.log('📋 Avisos pendentes:', avisos)
      setAvisosRecebidos(avisos)
    })

    novoSocket.on('status-conexao', status => {
      console.log('📊 Status:', status)
    })

    socketRef.current = novoSocket
  }

  const desconectarWebSocket = () => {
    console.log('🔌 Desconectando WebSocket...')
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setConectado(false)
    setSocket(null)
  }

  const enviarAviso = async aviso => {
    console.log('📤 Enviando aviso:', aviso)

    if (!socketRef.current || !conectado) {
      throw new Error('WebSocket não conectado')
    }

    return new Promise((resolve, reject) => {
      socketRef.current.emit('novo-aviso', aviso, response => {
        if (response.success) {
          resolve(response.aviso)
        } else {
          reject(new Error(response.error || 'Erro ao enviar aviso'))
        }
      })
    })
  }

  const marcarProcessado = avisoId => {
    if (socketRef.current && conectado) {
      socketRef.current.emit('marcar-processado', avisoId)

      // Atualizar estado local
      setAvisosRecebidos(prev =>
        prev.map(aviso =>
          aviso.id === avisoId ? { ...aviso, processado: true } : aviso
        )
      )
    }
  }

  // Função para enviar aviso via API HTTP (para integração externa)
  const enviarAvisoViaAPI = async aviso => {
    const serverUrl =
      process.env.NODE_ENV === 'production'
        ? window.location.origin
        : 'http://localhost:3001'

    try {
      const response = await fetch(`${serverUrl}/api/aviso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aviso)
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Erro ao enviar aviso via API:', error)
      throw error
    }
  }

  // Auto-conectar quando o componente montar
  useEffect(() => {
    conectarWebSocket()

    // Cleanup na desmontagem
    return () => {
      desconectarWebSocket()
    }
  }, [])

  return {
    avisosRecebidos,
    conectado,
    socket,
    enviarAviso,
    conectarWebSocket,
    desconectarWebSocket,
    marcarProcessado,
    enviarAvisoViaAPI
  }
}
