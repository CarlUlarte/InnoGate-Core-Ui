import React from 'react'
import { Navigate } from 'react-router-dom'
import { auth } from 'src/backend/firebase'

const PrivateRoute = ({ children }) => {
  const user = auth.currentUser // Check if user is authenticated
  return user ? children : <Navigate to="/login" />
}

export default PrivateRoute
