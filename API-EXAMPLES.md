# 📡 API de Avisos - Exemplos JSON

## 🎯 Endpoints disponíveis:

### 1. **Enviar Aviso (POST /aviso)**
```bash
curl -X POST https://fila-react.onrender.com/aviso \
  -H "Content-Type: application/json" \
  -d '{
    "aviso": [1, null, "Consultório 1", "João Silva"]
  }'
```

**Resposta JSON:**
```json
{
  "success": true,
  "message": "Aviso recebido com sucesso!",
  "id": 1,
  "timestamp": "2025-09-26T10:30:00.000Z"
}
```

### 2. **Buscar Avisos Novos (GET /avisos/novos)**
```bash
curl https://fila-react.onrender.com/avisos/novos
```

**Resposta JSON:**
```json
[
  {
    "id": 1,
    "dados": [1, null, "Consultório 1", "João Silva"],
    "timestamp": "2025-09-26T10:30:00.000Z",
    "processado": false
  }
]
```

### 3. **Listar Todos os Avisos (GET /avisos)**
```bash
curl https://fila-react.onrender.com/avisos
```

### 4. **Status do Servidor (GET /status)**
```bash
curl https://fila-react.onrender.com/status
```

**Resposta JSON:**
```json
{
  "status": "Servidor funcionando",
  "timestamp": "2025-09-26T10:30:00.000Z",
  "environment": "production",
  "totalAvisos": 1,
  "ultimoAviso": {
    "id": 1,
    "dados": [1, null, "Consultório 1", "João Silva"],
    "timestamp": "2025-09-26T10:30:00.000Z",
    "processado": false
  }
}
```

### 5. **Teste Rápido (GET /teste-aviso)**
```bash
curl https://fila-react.onrender.com/teste-aviso
```

## 🔧 Formato do Array "aviso":
```json
{
  "aviso": [
    1,                    // ID do aviso (qualquer número)
    null,                 // Campo reservado (sempre null)
    "Consultório 1",      // Local para onde chamar
    "João Silva"          // Nome do paciente
  ]
}
```

## 📱 Exemplos de uso:

### **Chamada para Consultório:**
```json
{
  "aviso": [1, null, "Consultório 1", "Maria Santos"]
}
```

### **Chamada para Enfermagem:**
```json
{
  "aviso": [2, null, "Enfermagem", "Pedro Oliveira"]
}
```

### **Chamada para Recepção:**
```json
{
  "aviso": [3, null, "Recepção", "Ana Costa"]
}
```

## 🚀 Usando JavaScript (fetch):

```javascript
// Enviar aviso
fetch('https://fila-react.onrender.com/aviso', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    aviso: [1, null, 'Consultório 1', 'João Silva']
  })
})
.then(response => response.json())
.then(data => console.log(data))
```

## 🐍 Usando Python (requests):

```python
import requests
import json

url = 'https://fila-react.onrender.com/aviso'
data = {
    'aviso': [1, None, 'Consultório 1', 'João Silva']
}

response = requests.post(url, json=data)
print(response.json())
```

## 📋 Postman/Insomnia:

- **URL**: `https://fila-react.onrender.com/aviso`
- **Método**: `POST`
- **Header**: `Content-Type: application/json`
- **Body (raw JSON)**:
```json
{
  "aviso": [1, null, "Consultório 1", "João Silva"]
}
```