import { useEffect, useState } from 'react'

const PETAL_COUNT = 8
const BLOOM_DURATION = 1800 // ms for bloom to complete
const HOLD_DURATION = 600   // ms to hold fully bloomed
const FADE_DURATION = 800   // ms for screen fade-out

export default function BloomingFlower({ onComplete }) {
  const [phase, setPhase] = useState('bloom') // bloom → hold → fade → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), BLOOM_DURATION)
    const t2 = setTimeout(() => setPhase('fade'), BLOOM_DURATION + HOLD_DURATION)
    const t3 = setTimeout(() => {
      setPhase('done')
      onComplete?.()
    }, BLOOM_DURATION + HOLD_DURATION + FADE_DURATION)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  if (phase === 'done') return null

  const petals = Array.from({ length: PETAL_COUNT }, (_, i) => {
    const angle = (360 / PETAL_COUNT) * i
    const delay = i * 80 // stagger each petal
    return (
      <div
        key={i}
        className="bloom-petal"
        style={{
          '--petal-angle': `${angle}deg`,
          '--petal-delay': `${delay}ms`,
        }}
      />
    )
  })

  return (
    <div
      className={`bloom-overlay ${phase === 'fade' ? 'bloom-fade-out' : ''}`}
      style={{ '--fade-duration': `${FADE_DURATION}ms` }}
    >
      {/* Soft glow behind the flower */}
      <div className="bloom-glow" />

      {/* The flower */}
      <div className="bloom-flower">
        {/* Petals */}
        {petals}
        {/* Center of the flower */}
        <div className="bloom-center" />
      </div>

      {/* Small floating particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`p-${i}`}
          className="bloom-particle"
          style={{
            '--p-angle': `${(360 / 12) * i}deg`,
            '--p-delay': `${400 + i * 100}ms`,
            '--p-distance': `${80 + Math.random() * 60}px`,
          }}
        />
      ))}
    </div>
  )
}
