# Sistema de Filas - Dashboard TV com WebSocket

Sistema de gestão de filas para chamadas de pacientes com interface de TV, avisos por voz e API HTTP/WebSocket para integração externa.

## 🚀 Funcionalidades

- **Dashboard TV**: Interface otimizada para TVs com avisos visuais
- **Avisos por Voz**: Síntese de voz para chamadas automáticas  
- **WebSocket Real**: Comunicação em tempo real entre sistemas
- **API HTTP**: Rotas RESTful para integração externa
- **Interface Responsiva**: Adaptada para diferentes tamanhos de tela
- **Multi-página**: Dashboard, Configurações e Testes

## 🛠️ Tecnologias

- **Frontend**: React 19.1.1, React Router DOM
- **Backend**: Express.js 5.1.0, Socket.IO 4.8.1
- **APIs**: SpeechSynthesis API, WebSocket
- **Build**: Create React App, React App Rewired

## 📦 Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>

# Instalar dependências
npm install

# Executar em desenvolvimento (WebSocket + React)
npm run dev

# Ou executar separadamente:
npm run server  # Servidor WebSocket (porta 3001)
npm start       # React (porta 3000)
```

## 🌐 URLs da Aplicação

- **Dashboard**: `http://localhost:3000/` - Tela principal
- **Configurações**: `http://localhost:3000/config` - Configurar WebSocket  
- **Testes**: `http://localhost:3000/teste` - Testar avisos e API

## 📡 API HTTP

### Base URL: `http://localhost:3001/api`

#### Enviar Aviso
```bash
POST /api/aviso
Content-Type: application/json

[123456, null, "Consultório 1", "João Silva"]
```

#### Listar Avisos
```bash
GET /api/avisos
```

#### Status do Servidor
```bash
GET /api/status
```

#### Teste de Conexão
```bash
GET /api/teste
```

**Documentação completa**: Veja `API_USAGE.md` para exemplos detalhados em múltiplas linguagens.

## 🔌 WebSocket

### Eventos Disponíveis

**Cliente → Servidor:**
- `novo-aviso`: Enviar novo aviso
- `marcar-processado`: Marcar como processado  
- `solicitar-avisos-pendentes`: Solicitar avisos pendentes

**Servidor → Cliente:**
- `novo-aviso`: Aviso recebido
- `avisos-pendentes`: Lista de avisos
- `status-conexao`: Status da conexão

## 🎯 Como Usar

### 1. Dashboard Principal (`/`)
- Visualiza filas de atendimento em tempo real
- Recebe avisos via WebSocket automaticamente
- Síntese de voz automática dos avisos
- Interface otimizada para TVs

### 2. Página de Configuração (`/config`)
- Configurar URL do servidor WebSocket
- Testar conexão
- Configurações de voz e interface

### 3. Página de Testes (`/teste`)
- Enviar avisos de teste via WebSocket
- Testar API HTTP
- Visualizar avisos recentes
- Gerar avisos aleatórios

### 4. Integração Externa

#### JavaScript/Node.js
```javascript
// Enviar via API HTTP
const response = await fetch('http://localhost:3001/api/aviso', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([Date.now(), null, "Sala 1", "Maria Silva"])
})
```

#### Python
```python
import requests
requests.post('http://localhost:3001/api/aviso', 
  json=[1642678800000, None, "Consultório 2", "João Santos"])
```

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
