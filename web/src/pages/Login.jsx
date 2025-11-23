import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Completa usuario y contraseña')
      return
    }
    // Fake tokens for placeholder frontend
    login({ username: form.username, role: 'Alumno' }, 'access-token', 'refresh-token')
    navigate('/dashboard')
  }

  return (
    <div className="page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="card">
        <label>Usuario</label>
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <label>Contraseña</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="error">{error}</p>}
        <button type="submit">Ingresar</button>
      </form>
    </div>
  )
}
