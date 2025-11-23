import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import { useAuth } from './components/AuthContext'

const ProtectedRoute = ({ roles, children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['Alumno', 'Profesor', 'Admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
