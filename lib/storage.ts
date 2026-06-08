export type StoredUser = {
  id: string
  name: string
  email: string
  // NOTE: This is a local-only demo auth. Passwords are lightly obfuscated,
  // not securely hashed. Do not use for real credentials.
  password: string
}

export type SessionRecord = {
  id: string
  mode: "focus" | "short" | "long"
  label: string
  durationMinutes: number
  completedAt: string // ISO string
}

const USERS_KEY = "veloura:users"
const CURRENT_KEY = "veloura:currentUserId"

function obfuscate(value: string) {
  if (typeof window === "undefined") return value
  return window.btoa(unescape(encodeURIComponent(value)))
}

export function hashPassword(password: string) {
  return obfuscate(`veloura::${password}`)
}

export function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]")
  } catch {
    return []
  }
}

export function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CURRENT_KEY)
}

export function setCurrentUserId(id: string | null) {
  if (id) localStorage.setItem(CURRENT_KEY, id)
  else localStorage.removeItem(CURRENT_KEY)
}

function historyKey(userId: string) {
  return `veloura:history:${userId}`
}

export function getHistory(userId: string): SessionRecord[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(historyKey(userId)) || "[]")
  } catch {
    return []
  }
}

export function addHistoryRecord(userId: string, record: SessionRecord) {
  const history = getHistory(userId)
  const updated = [record, ...history].slice(0, 200)
  localStorage.setItem(historyKey(userId), JSON.stringify(updated))
  return updated
}

export function clearHistory(userId: string) {
  localStorage.removeItem(historyKey(userId))
}
