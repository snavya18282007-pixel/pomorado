"use client"

import { useCallback, useEffect, useState } from "react"
import { History as HistoryIcon, LogOut } from "lucide-react"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { HistoryPanel } from "@/components/history-panel"
import { useAuth } from "@/components/auth/auth-provider"
import {
  addHistoryRecord,
  clearHistory,
  getHistory,
  type SessionRecord,
} from "@/lib/storage"

export default function Page() {
  const { user, loading, signOut } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [records, setRecords] = useState<SessionRecord[]>([])

  useEffect(() => {
    if (user) setRecords(getHistory(user.id))
    else setRecords([])
  }, [user])

  const handleSessionComplete = useCallback(
    (data: { mode: SessionRecord["mode"]; label: string; durationMinutes: number }) => {
      if (!user) return
      const record: SessionRecord = {
        id: crypto.randomUUID(),
        completedAt: new Date().toISOString(),
        ...data,
      }
      setRecords(addHistoryRecord(user.id, record))
    },
    [user],
  )

  const handleClear = useCallback(() => {
    if (!user) return
    clearHistory(user.id)
    setRecords([])
  }, [user])

  const openAuth = (tab: "signin" | "signup") => {
    setAuthTab(tab)
    setAuthOpen(true)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-background px-6 py-10">
      <header className="flex w-full max-w-5xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="font-serif text-xl font-medium tracking-tight text-foreground">
            Veloura
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!loading && user && (
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              aria-label="Open session history"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            >
              <HistoryIcon className="h-4 w-4" />
            </button>
          )}

          {!loading &&
            (user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {user.name || user.email}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  aria-label="Sign out"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuth("signin")}
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("signup")}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign up
                </button>
              </div>
            ))}
        </div>
      </header>

      <section className="flex w-full flex-col items-center gap-12 py-10">
        <div className="max-w-2xl text-center">
          <h1 className="text-balance font-serif text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl">
            Focus deeply, <span className="italic text-primary">rest</span>{" "}
            intentionally.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
            The Pomodoro technique, refined. Work in calm, undistracted
            intervals and let mindful breaks restore your energy.
          </p>
          {!loading && !user && (
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground/80">
              <button
                type="button"
                onClick={() => openAuth("signup")}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Create an account
              </button>{" "}
              to save your session history.
            </p>
          )}
        </div>

        <PomodoroTimer onSessionComplete={handleSessionComplete} />
      </section>

      <footer className="flex w-full max-w-5xl items-center justify-center text-sm text-muted-foreground">
        <p className="text-pretty text-center">
          25 minutes of focus, 5 minutes of rest. A longer break after every
          four sessions.
        </p>
      </footer>

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={authTab}
      />
      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        records={records}
        onClear={handleClear}
      />
    </main>
  )
}
