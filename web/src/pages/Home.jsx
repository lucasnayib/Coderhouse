import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="page">
      <h1>Fitness Platform</h1>
      <p>Monorepo con microservicios de autenticación, usuarios, rutinas y mensajería.</p>
      <nav>
        <Link to="/login">Login</Link> | <Link to="/register">Registro</Link> | <Link to="/dashboard">Dashboard</Link>
      </nav>
    </div>
  )
}
