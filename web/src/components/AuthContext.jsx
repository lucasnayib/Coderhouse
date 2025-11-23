import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [tokens, setTokens] = useState(() => {
    const stored = localStorage.getItem('tokens')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (tokens) {
      localStorage.setItem('tokens', JSON.stringify(tokens))
      setUser(tokens.user)
    } else {
      localStorage.removeItem('tokens')
      setUser(null)
    }
  }, [tokens])

  const login = (userData, access, refresh) => {
    setTokens({ user: userData, access, refresh })
  }

  const logout = () => setTokens(null)

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
