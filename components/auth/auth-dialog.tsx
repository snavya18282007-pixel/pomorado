"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

type Tab = "signin" | "signup"

export function AuthDialog({
  open,
  onClose,
  initialTab = "signin",
}: {
  open: boolean
  onClose: () => void
  initialTab?: Tab
}) {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTab(initialTab)
      setError(null)
      setName("")
      setEmail("")
      setPassword("")
    }
  }, [open, initialTab])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    const result =
      tab === "signup"
        ? signUp({ name, email, password })
        : signIn({ email, password })

    if (!result.ok) {
      setError(result.error)
      return
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={tab === "signup" ? "Create account" : "Sign in"}
    >
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="font-serif text-2xl font-light tracking-tight text-foreground">
            {tab === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "signup"
              ? "Start tracking your focus journey."
              : "Sign in to continue your focus journey."}
          </p>
        </div>

        <div
          className="mb-6 flex items-center gap-1 rounded-full border border-border bg-secondary/60 p-1"
          role="tablist"
        >
          {(["signin", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t)
                setError(null)
              }}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === t
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === "signup" && (
            <Field
              label="Name"
              id="name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Ada Lovelace"
              required
            />
          )}
          <Field
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <Field
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {tab === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  id: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
