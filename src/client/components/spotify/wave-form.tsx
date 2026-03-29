import { useState } from "react"

const NUM_BARS = 4

export default function WaveForm() {
  const [bars] = useState(() =>
    Array.from({ length: NUM_BARS }).map(() => ({
      delay: Math.floor(Math.random() * 400),
      duration: (0.8 + Math.random() * 0.6).toFixed(2)
    }))
  )

  return (
    <div className="flex h-3 items-center justify-center gap-0.5">
      {bars.map((bar, index) => (
        <div
          className="animate-waveform rounded-sm bg-gray-400"
          key={`${bar.delay}-${index}`}
          style={{
            animationDelay: `${bar.delay}ms`,
            animationDuration: `${bar.duration}s`,
            width: "2px"
          }}
        />
      ))}
    </div>
  )
}
