import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  getRedirectResult,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRedirectResult(auth).catch(() => {
      // Ignorar si no hay redirect pendiente.
    })
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      setLoading(false)
      if (currentUser) {
        const userRef = doc(db, 'usuarios', currentUser.uid)
        try {
          await setDoc(
            userRef,
            {
              uid: currentUser.uid,
              nombre: currentUser.displayName || 'Usuario',
              email: currentUser.email,
              rol: 'tecnico',
              lastLogin: serverTimestamp(),
            },
            { merge: true },
          )
        } catch {
          // Se sincronizara cuando haya conexion.
        }
      }
    })
    return () => unsub()
  }, [])

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    return signInWithRedirect(auth, provider)
  }

  const logout = () => signOut(auth)

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithGoogle,
      logout,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
