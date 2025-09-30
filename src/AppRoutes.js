import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import DashboardTV from './pages/DashboardTV'
import ConfigPage from './pages/ConfigPage'
import TestePage from './pages/TestePage'
import './App.css'

const App = () => {
  return (
    <Router>
      <div className="app">
        <nav
          className="app-nav"
          style={{
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
          }}
        >
          <h1 style={{ margin: 0, color: '#0e58a8' }}>Sistema Fila Ammarhes</h1>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: '#0e58a8',
              fontWeight: 'bold'
            }}
          >
            📺 Dashboard TV
          </Link>
          <Link
            to="/config"
            style={{
              textDecoration: 'none',
              color: '#0e58a8',
              fontWeight: 'bold'
            }}
          >
            ⚙️ Configurações
          </Link>
          <Link
            to="/teste"
            style={{
              textDecoration: 'none',
              color: '#0e58a8',
              fontWeight: 'bold'
            }}
          >
            🧪 Teste WebSocket
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<DashboardTV />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/teste" element={<TestePage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
