"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  getCurrentUserId,
  getUsers,
  hashPassword,
  saveUsers,
  setCurrentUserId,
  type StoredUser,
} from "@/lib/storage"

export type PublicUser = { id: string; name: string; email: string }

type AuthContextValue = {
  user: PublicUser | null
  loading: boolean
  signUp: (input: {
    name: string
    email: string
    password: string
  }) => { ok: true } | { ok: false; error: string }
  signIn: (input: {
    email: string
    password: string
  }) => { ok: true } | { ok: false; error: string }
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toPublic(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = getCurrentUserId()
    if (id) {
      const found = getUsers().find((u) => u.id === id)
      if (found) setUser(toPublic(found))
    }
    setLoading(false)
  }, [])

  const signUp = useCallback(
    ({ name, email, password }: { name: string; email: string; password: string }) => {
      const normalized = email.trim().toLowerCase()
      const users = getUsers()
      if (users.some((u) => u.email === normalized)) {
        return { ok: false as const, error: "An account with this email already exists." }
      }
      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalized,
        password: hashPassword(password),
      }
      saveUsers([...users, newUser])
      setCurrentUserId(newUser.id)
      setUser(toPublic(newUser))
      return { ok: true as const }
    },
    [],
  )

  const signIn = useCallback(
    ({ email, password }: { email: string; password: string }) => {
      const normalized = email.trim().toLowerCase()
      const found = getUsers().find((u) => u.email === normalized)
      if (!found || found.password !== hashPassword(password)) {
        return { ok: false as const, error: "Invalid email or password." }
      }
      setCurrentUserId(found.id)
      setUser(toPublic(found))
      return { ok: true as const }
    },
    [],
  )

  const signOut = useCallback(() => {
    setCurrentUserId(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, signUp, signIn, signOut }),
    [user, loading, signUp, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
