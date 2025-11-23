import React from 'react'
import { useAuth } from '../components/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()
  return (
    <div className="page">
      <h2>Dashboard</h2>
      {user ? (
        <>
          <p>Bienvenido {user.username} ({user.role})</p>
          <button onClick={logout}>Cerrar sesión</button>
        </>
      ) : (
        <p>Inicia sesión para ver tu panel.</p>
      )}
    </div>
  )
}
