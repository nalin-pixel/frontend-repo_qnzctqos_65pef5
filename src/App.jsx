import { useEffect, useMemo, useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'

function useHoldProgress({ duration = 1800, onComplete }) {
  const [progress, setProgress] = useState(0) // 0..1
  const [holding, setHolding] = useState(false)
  const startRef = useRef(0)
  const rafRef = useRef(0)

  const start = () => {
    if (holding) return
    setHolding(true)
    startRef.current = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - startRef.current) / duration)
      setProgress(p)
      if (p >= 1) {
        cancelAnimationFrame(rafRef.current)
        setHolding(false)
        onComplete && onComplete()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }
  const cancel = () => {
    setHolding(false)
    cancelAnimationFrame(rafRef.current)
    setProgress(0)
  }

  return { progress, holding, start, cancel }
}

function TopNav() {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 sm:px-10 py-5 mix-blend-difference">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/90" />
        <span className="text-white/90 tracking-widest text-sm uppercase">Centrix</span>
      </div>
      <button className="relative h-10 w-10 rounded-full flex items-center justify-center bg-orange-500/90 hover:bg-orange-500 transition-colors">
        <span className="sr-only">Menu</span>
        <div className="space-y-1.5">
          <span className="block h-0.5 w-5 bg-white rounded" />
          <span className="block h-0.5 w-3.5 bg-white rounded ml-auto" />
          <span className="block h-0.5 w-4 bg-white rounded" />
        </div>
      </button>
    </div>
  )
}

function HoldToEnter({ onComplete, label = 'HOLD TO ENTER THE PORTAL' }) {
  const { progress, holding, start, cancel } = useHoldProgress({ duration: 1800, onComplete })

  const handleDown = () => start()
  const handleUp = () => cancel()

  const pct = Math.round(progress * 100)
  const ringStyle = useMemo(() => ({
    background: `conic-gradient(#fb923c ${pct * 3.6}deg, rgba(255,255,255,0.15) 0deg)`
  }), [pct])

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <button
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        onTouchEnd={handleUp}
        className="group relative"
        aria-label={label}
      >
        <div className="relative h-20 w-20 rounded-full p-[6px]" style={ringStyle}>
          <div className="h-full w-full rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center">
            <div className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 ${holding ? 'bg-orange-500/90 scale-105' : 'bg-white/15'} border border-white/30`}>
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </button>
      <div className="text-[11px] tracking-[0.35em] text-white/80 uppercase">{label}</div>
    </div>
  )
}

export default function App() {
  const [stage, setStage] = useState('idle') // idle | expanding | entered
  const portalRef = useRef(null)

  // Background and portal images (premium, architectural)
  const bgImage = 'https://images.unsplash.com/photo-1519710884009-0daf7fc7fbef?q=80&w=2400&auto=format&fit=crop'
  const projectImage = 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2400&auto=format&fit=crop'

  const startEnter = () => {
    if (stage !== 'idle') return
    setStage('expanding')
    // After animation completes, mark as entered and scroll
    setTimeout(() => {
      setStage('entered')
      const next = document.getElementById('next')
      next && next.scrollIntoView({ behavior: 'smooth' })
    }, 1500)
  }

  useEffect(() => {
    // Prevent context menu interfering with long press
    const handler = (e) => e.preventDefault()
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [])

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-hidden">
      {/* HERO */}
      <section className="relative h-screen w-full">
        {/* Spline cover background */}
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/z3DRq211g66TkBow/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Underlay interior photography as subtle layer */}
        <div
          className="absolute inset-0 bg-center bg-cover opacity-[0.25]"
          style={{ backgroundImage: `url(${bgImage})` }}
        />

        {/* Atmospheric gradient overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60% 60% at 50% 40%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 35%, rgba(0,0,0,0.5) 100%)' }} />

        <TopNav />

        {/* Center content */}
        <div className="relative z-10 h-full w-full flex items-center justify-center">
          {/* Portal container */}
          <div className="flex flex-col items-center -mt-8">
            <div
              ref={portalRef}
              className={`relative w-[56vmin] max-w-[520px] aspect-[3/5] overflow-hidden transition-transform duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]`}
              style={{ borderTopLeftRadius: '9999px', borderTopRightRadius: '9999px', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px', transform: stage === 'expanding' ? 'scale(9) translateY(-6vh)' : 'scale(1)' }}
            >
              {/* White outline */}
              <div className="absolute inset-0 rounded-t-[9999px] rounded-b-[28px] border-2 border-white/90 pointer-events-none" />

              {/* Inner scene */}
              <div className={`absolute inset-0 bg-center bg-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${stage === 'expanding' ? 'scale-[1.08] brightness-110' : 'scale-100 brightness-100'}`} style={{ backgroundImage: `url(${projectImage})` }} />

              {/* Soft fade to emphasize window */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 pointer-events-none" />
            </div>

            {/* Hold to enter */}
            {stage !== 'entered' && (
              <div className={`mt-10 transition-opacity duration-500 ${stage === 'expanding' ? 'opacity-0' : 'opacity-100'}`}>
                <HoldToEnter onComplete={startEnter} />
              </div>
            )}
          </div>
        </div>

        {/* Cinematic crossfade overlay as the scene takes over */}
        <div className={`absolute inset-0 transition-opacity duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${stage === 'expanding' ? 'opacity-40' : 'opacity-0'}`} style={{ background: 'radial-gradient(80% 80% at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
      </section>

      {/* After entering, replace backdrop with the project image */}
      <div className={`fixed inset-0 -z-10 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${stage === 'entered' ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url(${projectImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

      {/* NEXT SECTION / PROJECT */}
      <section id="next" className="relative min-h-[120vh] bg-black text-white">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(251,146,60,0.15) 0%, rgba(255,255,255,0) 60%)' }} />
        <div className="relative max-w-6xl mx-auto px-6 sm:px-10 pt-28 pb-24">
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight">Project One</h2>
          <p className="mt-6 text-white/70 max-w-2xl leading-relaxed">
            You stepped through the portal. This section represents the next scene with space for rich project storytelling. Imagery, captions, and subtle motion continue the cinematic feel.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop" alt="Detail" />
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1598771977456-fbb119538add?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxEZXRhaWwlMjAyfGVufDB8MHx8fDE3NjMwMTM2ODJ8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="Detail 2" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
