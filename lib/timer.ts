export type Mode = "focus" | "short" | "long"

export const MODE_CONFIG: Record<
  Mode,
  { label: string; minutes: number; tagline: string }
> = {
  focus: { label: "Focus", minutes: 25, tagline: "Time to concentrate" },
  short: { label: "Short Break", minutes: 5, tagline: "Stretch and breathe" },
  long: { label: "Long Break", minutes: 15, tagline: "Rest and recharge" },
}

export function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
