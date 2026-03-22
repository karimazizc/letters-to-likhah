import { useState, useEffect, useCallback } from 'react'

const HEART_CHARS = ['❤️', '💕', '💗', '💖', '💘', '♥', '💓', '💞']

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

let nextId = 0

export default function FloatingHearts() {
  const [hearts, setHearts] = useState([])

  const spawnHeart = useCallback(() => {
    const id = nextId++
    const heart = {
      id,
      char: HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)],
      left: randomBetween(2, 98),          // % from left
      size: randomBetween(14, 26),          // px font-size
      duration: randomBetween(6, 12),       // seconds to float up
      delay: 0,
      drift: randomBetween(-40, 40),        // px horizontal sway
      opacity: randomBetween(0.25, 0.55),
    }
    setHearts((prev) => [...prev, heart])

    // Remove after animation finishes
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id))
    }, heart.duration * 1000)
  }, [])

  useEffect(() => {
    // Spawn a small initial batch
    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnHeart(), i * 600)
    }

    // Then keep spawning at a gentle pace
    const interval = setInterval(() => {
      spawnHeart()
    }, 2200)

    return () => clearInterval(interval)
  }, [spawnHeart])

  return (
    <div className="floating-hearts-container" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            opacity: h.opacity,
            '--float-duration': `${h.duration}s`,
            '--drift': `${h.drift}px`,
          }}
        >
          {h.char}
        </span>
      ))}
    </div>
  )
}
