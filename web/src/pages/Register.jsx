import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'Alumno' })
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) {
      setError('Completa todos los campos')
      return
    }
    login({ username: form.username, role: form.role }, 'access-token', 'refresh-token')
    navigate('/dashboard')
  }

  return (
    <div className="page">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit} className="card">
        <label>Usuario</label>
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>Contraseña</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <label>Rol</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option>Alumno</option>
          <option>Profesor</option>
        </select>
        {error && <p className="error">{error}</p>}
        <button type="submit">Crear cuenta</button>
      </form>
    </div>
  )
}
