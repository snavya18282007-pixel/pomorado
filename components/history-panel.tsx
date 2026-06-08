"use client"

import { useEffect } from "react"
import { Trash2, X, History as HistoryIcon } from "lucide-react"
import type { SessionRecord } from "@/lib/storage"
import { cn } from "@/lib/utils"

const MODE_STYLES: Record<SessionRecord["mode"], string> = {
  focus: "bg-primary",
  short: "bg-muted-foreground",
  long: "bg-muted-foreground",
}

function formatWhen(iso: string) {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function HistoryPanel({
  open,
  onClose,
  records,
  onClear,
}: {
  open: boolean
  onClose: () => void
  records: SessionRecord[]
  onClear: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const focusSessions = records.filter((r) => r.mode === "focus")
  const totalFocusMinutes = focusSessions.reduce(
    (sum, r) => sum + r.durationMinutes,
    0,
  )

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Session history"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-medium tracking-tight text-foreground">
              Session History
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 py-5">
          <Stat label="Focus sessions" value={String(focusSessions.length)} />
          <Stat
            label="Time focused"
            value={`${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {records.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm text-muted-foreground">
                No sessions yet. Complete a timer to start building your history.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {records.map((record) => (
                <li
                  key={record.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        MODE_STYLES[record.mode],
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {record.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatWhen(record.completedAt)}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {record.durationMinutes}m
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {records.length > 0 && (
          <div className="border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onClear}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Clear history
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
      <p className="font-mono text-xl font-light tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
