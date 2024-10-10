import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from 'src/backend/firebase' // Adjust the path according to your project structure
import { getUserRole } from 'src/backend/firebase' // The function to get role from Firestore

// Create the RoleContext
const RoleContext = createContext()

// Hook to use the RoleContext
export const useRole = () => {
  return useContext(RoleContext)
}

// RoleProvider component to wrap around your app
export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fetchedRole = await getUserRole(user.uid) // Fetch role from Firestore
        console.log(`Fetched Role: ${fetchedRole}`)
        setRole(fetchedRole)
      } else {
        setRole(null) // No user, no role
      }
      setLoading(false) // End loading state
    })

    return () => unsubscribe() // Clean up listener on unmount
  }, [])

  // Show loading spinner while role is being fetched
  if (loading) {
    return <div>Loading...</div>
  }

  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>
}
