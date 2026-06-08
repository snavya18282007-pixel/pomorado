"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react"
import { type Mode, MODE_CONFIG, formatTime } from "@/lib/timer"
import { cn } from "@/lib/utils"

const RADIUS = 150
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function PomodoroTimer({
  onSessionComplete,
}: {
  onSessionComplete?: (record: {
    mode: Mode
    label: string
    durationMinutes: number
  }) => void
}) {
  const [mode, setMode] = useState<Mode>("focus")
  const [secondsLeft, setSecondsLeft] = useState(MODE_CONFIG.focus.minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedFocus, setCompletedFocus] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSeconds = MODE_CONFIG[mode].minutes * 60
  const progress = 1 - secondsLeft / totalSeconds

  const playChime = useCallback(() => {
    if (typeof window === "undefined") return
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new AudioCtx()
      const notes = [523.25, 659.25, 783.99]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = freq
        osc.connect(gain)
        gain.connect(ctx.destination)
        const start = ctx.currentTime + i * 0.18
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(0.25, start + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6)
        osc.start(start)
        osc.stop(start + 0.6)
      })
    } catch {
      // ignore audio errors
    }
  }, [])

  const switchMode = useCallback((next: Mode) => {
    setMode(next)
    setIsRunning(false)
    setSecondsLeft(MODE_CONFIG[next].minutes * 60)
  }, [])

  // Handle countdown completion
  useEffect(() => {
    if (secondsLeft > 0) return
    setIsRunning(false)
    playChime()
    onSessionComplete?.({
      mode,
      label: MODE_CONFIG[mode].label,
      durationMinutes: MODE_CONFIG[mode].minutes,
    })
    if (mode === "focus") {
      setCompletedFocus((c) => {
        const updated = c + 1
        // Long break every 4 focus sessions, otherwise short
        switchMode(updated % 4 === 0 ? "long" : "short")
        return updated
      })
    } else {
      switchMode("focus")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  // Ticking
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  // Sync document title
  useEffect(() => {
    document.title = `${formatTime(secondsLeft)} · ${MODE_CONFIG[mode].label} — Veloura`
  }, [secondsLeft, mode])

  const toggleRunning = () => {
    if (secondsLeft === 0) return
    setIsRunning((r) => !r)
  }

  const reset = () => {
    setIsRunning(false)
    setSecondsLeft(totalSeconds)
  }

  const skip = () => {
    if (mode === "focus") {
      const updated = completedFocus + 1
      setCompletedFocus(updated)
      switchMode(updated % 4 === 0 ? "long" : "short")
    } else {
      switchMode("focus")
    }
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-10">
      {/* Mode selector */}
      <div
        className="flex items-center gap-1 rounded-full border border-border bg-card/60 p-1 backdrop-blur-sm"
        role="tablist"
        aria-label="Timer mode"
      >
        {(Object.keys(MODE_CONFIG) as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium tracking-tight transition-colors sm:px-5",
              mode === m
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {MODE_CONFIG[m].label}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative flex aspect-square w-[20rem] items-center justify-center sm:w-[22rem]">
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 340 340"
          aria-hidden="true"
        >
          <circle
            cx="170"
            cy="170"
            r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          <circle
            cx="170"
            cy="170"
            r={RADIUS}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>

        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            {MODE_CONFIG[mode].tagline}
          </span>
          <span className="font-mono text-6xl font-light tabular-nums tracking-tight text-foreground sm:text-7xl">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-sm text-muted-foreground">
            Session {completedFocus + (mode === "focus" ? 1 : 0)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          aria-label="Reset timer"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        <button
          onClick={toggleRunning}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
        >
          {isRunning ? (
            <Pause className="h-7 w-7" fill="currentColor" />
          ) : (
            <Play className="ml-0.5 h-7 w-7" fill="currentColor" />
          )}
        </button>

        <button
          onClick={skip}
          aria-label="Skip to next session"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      {/* Session dots */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i < completedFocus % 4 || (completedFocus > 0 && completedFocus % 4 === 0)
                  ? "bg-primary"
                  : "bg-border",
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {completedFocus} focus {completedFocus === 1 ? "session" : "sessions"} completed today
        </p>
      </div>
    </div>
  )
}
