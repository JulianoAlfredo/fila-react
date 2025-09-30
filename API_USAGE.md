# API de Avisos - Sistema de Filas

Este documento descreve como usar as rotas HTTP da API para integrar com sistemas externos.

## 🚀 Iniciando o Sistema

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Executar servidor WebSocket + React juntos
npm run dev

# Ou executar separadamente:
npm run server  # Servidor WebSocket na porta 3001
npm start       # React na porta 3000
```

### Produção
```bash
npm run build
npm run server  # Serve build + WebSocket na mesma porta
```

## 📡 Rotas da API

### Base URL
- **Desenvolvimento**: `http://localhost:3001/api`
- **Produção**: `https://seu-dominio.com/api`

### 1. Enviar Novo Aviso
**POST** `/api/aviso`

Envia um novo aviso que será transmitido via WebSocket para todas as telas conectadas.

#### Headers
```
Content-Type: application/json
```

#### Body (JSON)
```json
[
  123456,           // ID único (timestamp ou número sequencial)
  null,             // Campo reservado (sempre null)
  "Consultório 1",  // Local de atendimento
  "João Silva"      // Nome do paciente
]
```

#### Resposta de Sucesso (200)
```json
{
  "success": true,
  "message": "Aviso enviado com sucesso",
  "aviso": {
    "id": 123456,
    "dados": [123456, null, "Consultório 1", "João Silva"],
    "timestamp": "2024-01-15T10:30:00.000Z",
    "processado": false
  }
}
```

#### Exemplo com cURL
```bash
curl -X POST http://localhost:3001/api/aviso \
  -H "Content-Type: application/json" \
  -d '[123456, null, "Consultório 1", "João Silva"]'
```

#### Exemplo com JavaScript
```javascript
const enviarAviso = async () => {
  const aviso = [
    Date.now(),        // ID único
    null,              // Campo reservado
    "Consultório 2",   // Local
    "Maria Santos"     // Nome
  ]

  try {
    const response = await fetch('http://localhost:3001/api/aviso', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aviso)
    })

    const resultado = await response.json()
    console.log('Aviso enviado:', resultado)
  } catch (error) {
    console.error('Erro:', error)
  }
}
```

### 2. Listar Avisos Pendentes
**GET** `/api/avisos`

Retorna todos os avisos ainda não processados.

#### Resposta (200)
```json
{
  "success": true,
  "avisos": [
    {
      "id": 123456,
      "dados": [123456, null, "Consultório 1", "João Silva"],
      "timestamp": "2024-01-15T10:30:00.000Z",
      "processado": false
    }
  ],
  "total": 1
}
```

### 3. Status do Servidor
**GET** `/api/status`

Verifica o status do servidor e conexões WebSocket.

#### Resposta (200)
```json
{
  "success": true,
  "status": "online",
  "uptime": 3600,
  "conexoes": 2,
  "avisos_pendentes": 3,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Teste de Conexão
**GET** `/api/teste`

Rota simples para testar se a API está respondendo.

#### Resposta (200)
```json
{
  "success": true,
  "message": "API funcionando corretamente",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔌 WebSocket (Opcional)

Além das rotas HTTP, o sistema também oferece WebSocket para comunicação em tempo real.

### Eventos WebSocket

#### Cliente → Servidor
- `novo-aviso`: Enviar novo aviso
- `marcar-processado`: Marcar aviso como processado
- `solicitar-avisos-pendentes`: Solicitar lista de avisos

#### Servidor → Cliente
- `novo-aviso`: Novo aviso recebido
- `avisos-pendentes`: Lista de avisos pendentes
- `status-conexao`: Status da conexão

### Exemplo de Conexão WebSocket (JavaScript)
```javascript
import io from 'socket.io-client'

const socket = io('http://localhost:3001')

socket.on('connect', () => {
  console.log('Conectado ao WebSocket')
})

socket.on('novo-aviso', (aviso) => {
  console.log('Novo aviso:', aviso)
})

// Enviar aviso via WebSocket
socket.emit('novo-aviso', [Date.now(), null, 'Sala 1', 'Pedro'], (response) => {
  console.log('Resposta:', response)
})
```

## ⚡ Integração com Sistemas Externos

### 1. Sistema de Gestão Hospitalar
```python
# Python
import requests
import json

def chamar_paciente(nome, consultorio):
    url = "http://localhost:3001/api/aviso"
    aviso = [
        int(time.time() * 1000),  # Timestamp como ID
        None,                      # Campo reservado
        consultorio,               # Local
        nome                       # Nome do paciente
    ]
    
    response = requests.post(url, json=aviso)
    return response.json()

# Uso
resultado = chamar_paciente("Ana Costa", "Consultório 3")
print(resultado)
```

### 2. Sistema de Senhas
```php
<?php
// PHP
function chamarSenha($numero, $guiche) {
    $url = "http://localhost:3001/api/aviso";
    $aviso = [
        time() * 1000,  // Timestamp como ID
        null,           // Campo reservado
        "Guichê " . $guiche,
        "Senha " . $numero
    ];
    
    $options = [
        'http' => [
            'header' => "Content-Type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($aviso)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    return json_decode($result, true);
}

// Uso
$resultado = chamarSenha(15, 2);
echo json_encode($resultado);
?>
```

### 3. Sistema de Agendamento
```csharp
// C#
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class AvisoService 
{
    private static readonly HttpClient client = new HttpClient();
    
    public async Task<object> ChamarPaciente(string nome, string local)
    {
        var url = "http://localhost:3001/api/aviso";
        var aviso = new object[] {
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            null,
            local,
            nome
        };
        
        var json = JsonConvert.SerializeObject(aviso);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await client.PostAsync(url, content);
        var responseString = await response.Content.ReadAsStringAsync();
        
        return JsonConvert.DeserializeObject(responseString);
    }
}
```

## 🎯 Casos de Uso

1. **Clínicas e Hospitais**: Chamar pacientes para consultas
2. **Bancos**: Sistema de senhas e atendimento
3. **Repartições Públicas**: Chamada de documentos
4. **Restaurantes**: Avisar quando pedido está pronto
5. **Farmácias**: Notificar quando medicamento está disponível

## 🔧 Configuração de CORS

O servidor está configurado para aceitar requests de qualquer origem em desenvolvimento. Em produção, configure as origens permitidas editando o arquivo `websocket-server.js`:

```javascript
const corsOptions = {
  origin: ["https://seu-dominio.com", "https://app.exemplo.com"],
  credentials: true
}
```

## 📱 Interface Web

Acesse as seguintes URLs no navegador:

- **Dashboard**: `http://localhost:3000/` - Tela principal com avisos
- **Configurações**: `http://localhost:3000/config` - Configurar WebSocket  
- **Testes**: `http://localhost:3000/teste` - Interface para testar avisos

## 🚨 Tratamento de Erros

### Códigos de Status HTTP

- **200**: Sucesso
- **400**: Dados inválidos
- **405**: Método não permitido
- **500**: Erro interno do servidor

### Exemplo de Erro (400)
```json
{
  "success": false,
  "error": "Dados do aviso inválidos",
  "details": "Array deve ter exatamente 4 elementos"
}
```

## 🔍 Logs e Monitoramento

O servidor registra automaticamente:
- Conexões WebSocket
- Avisos enviados/recebidos
- Erros de validação
- Status das conexões

Verifique o console do servidor para acompanhar a atividade em tempo real.