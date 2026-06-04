'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert } from '@/components/ui/alert'
import {
  Dumbbell, Droplets, Moon, Target, Trophy,
  ArrowRight, Check, Zap, Heart, Timer, ChevronDown,
  Footprints, Flame, Star, Wind,
} from 'lucide-react'

// ─── Animated hero figure ─────────────────────────────────────────────────────

function HeroFigure() {
  const spring = { duration: 4, repeat: Infinity, ease: 'easeInOut' as const }
  return (
    <svg viewBox="0 0 200 280" className="w-full max-w-[220px] mx-auto" aria-hidden="true">
      <motion.circle cx={100} cy={140} animate={{ r: [70, 82, 70], opacity: [0.07, 0.13, 0.07] }} transition={spring} fill="#86efac" />
      <motion.circle animate={{ cy: [30, 26, 30] }} transition={spring} cx={100} r={16} fill="none" stroke="#d1fae5" strokeWidth={3} />
      <motion.line animate={{ y1: [46, 42, 46], y2: [58, 54, 58] }} transition={spring} x1={100} x2={100} stroke="#d1fae5" strokeWidth={3} strokeLinecap="round" />
      <motion.line animate={{ y1: [58, 54, 58], y2: [150, 146, 150] }} transition={spring} x1={100} x2={100} stroke="#d1fae5" strokeWidth={4} strokeLinecap="round" />
      <motion.line animate={{ x1: [100,100,100], y1: [75,71,75], x2: [65,48,65], y2: [115,52,115] }} transition={spring} stroke="#86efac" strokeWidth={3.5} strokeLinecap="round" />
      <motion.line animate={{ x1: [100,100,100], y1: [75,71,75], x2: [135,152,135], y2: [115,52,115] }} transition={spring} stroke="#86efac" strokeWidth={3.5} strokeLinecap="round" />
      <motion.line animate={{ y1: [150, 146, 150] }} transition={spring} x1={100} x2={78} y2={230} stroke="#d1fae5" strokeWidth={3.5} strokeLinecap="round" />
      <motion.line animate={{ y1: [150, 146, 150] }} transition={spring} x1={100} x2={122} y2={230} stroke="#d1fae5" strokeWidth={3.5} strokeLinecap="round" />
      <motion.text x={100} y={260} textAnchor="middle" fill="#86efac" fontSize={11} fontFamily="sans-serif" animate={{ opacity: [0.4, 1, 0.4] }} transition={spring}>breathe</motion.text>
    </svg>
  )
}

// ─── Floating stat card ───────────────────────────────────────────────────────

function FloatCard({ icon, label, value, delay = 0, className = '' }: { icon: string; label: string; value: string; delay?: number; className?: string }) {
  return (
    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      className={`absolute bg-white/96 backdrop-blur rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 ${className}`}>
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 leading-none">{label}</p>
        <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </motion.div>
  )
}

// ─── Scroll-triggered fade-in ─────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description, bullets, accent }: { icon: React.ReactNode; title: string; description: string; bullets: string[]; accent: string }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-5 h-full">
      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${accent}`}>{icon}</div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
      <ul className="space-y-2 mt-auto">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{b}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Inline Auth Form ─────────────────────────────────────────────────────────

function AuthForm() {
  const router = useRouter()
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [regError, setRegError] = useState('')

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => authApi.me(), retry: false })

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(loginEmail, loginPassword),
    onSuccess: () => router.push('/dashboard'),
    onError: (err) => setLoginError(err instanceof ApiError ? err.message : 'Login failed'),
  })
  const registerMutation = useMutation({
    mutationFn: () => authApi.register(regEmail, regPassword),
    onSuccess: () => router.push('/onboarding'),
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) setRegError('An account with this email already exists.')
      else setRegError(err instanceof ApiError ? err.message : 'Registration failed')
    },
  })

  if (me) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 mb-4">Signed in as <span className="font-semibold text-gray-900">{me.email}</span></p>
        <Link href="/dashboard">
          <Button className="bg-green-600 hover:bg-green-700 px-8 h-11">
            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <Tabs defaultValue="register" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-11 mb-6">
        <TabsTrigger value="register" className="text-sm font-medium">Create Account</TabsTrigger>
        <TabsTrigger value="login" className="text-sm font-medium">Sign In</TabsTrigger>
      </TabsList>

      <TabsContent value="register">
        <form onSubmit={(e) => { e.preventDefault(); setRegError(''); if (regPassword.length < 8) { setRegError('Password must be at least 8 characters.'); return } registerMutation.mutate() }} className="space-y-4">
          {regError && <Alert className="text-red-700 bg-red-50 border-red-200 text-sm py-2">{regError}</Alert>}
          <div className="space-y-1.5">
            <Label htmlFor="reg-email">Email address</Label>
            <Input id="reg-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" required className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-pass">Password</Label>
            <Input id="reg-pass" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Min. 8 characters" required className="h-11" />
          </div>
          <Button type="submit" disabled={registerMutation.isPending} className="w-full h-11 bg-green-600 hover:bg-green-700 font-semibold text-base">
            {registerMutation.isPending ? 'Creating account…' : <>Start my wellness journey <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
          <p className="text-xs text-center text-gray-400">Free forever · No credit card required</p>
        </form>
      </TabsContent>

      <TabsContent value="login">
        <form onSubmit={(e) => { e.preventDefault(); setLoginError(''); loginMutation.mutate() }} className="space-y-4">
          {loginError && <Alert className="text-red-700 bg-red-50 border-red-200 text-sm py-2">{loginError}</Alert>}
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Email address</Label>
            <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" required className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="login-pass">Password</Label>
            <Input id="login-pass" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" required className="h-11" />
          </div>
          <Button type="submit" disabled={loginMutation.isPending} className="w-full h-11 bg-green-600 hover:bg-green-700 font-semibold text-base">
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const authRef = useRef<HTMLElement>(null)
  const scrollToAuth = () => authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <div className="min-h-screen bg-white">

      {/* Sticky nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">F</div>
            <span className="text-lg font-bold text-gray-900">Fitcount</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hidden sm:block text-sm text-gray-500 hover:text-gray-800 transition-colors">How it works</button>
            <Button onClick={scrollToAuth} size="sm" className="bg-green-600 hover:bg-green-700 text-sm px-5 rounded-full">Get started free</Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16 bg-gradient-to-br from-[#062919] via-[#0a4a28] to-[#0b4035]">
        {/* Concentric rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
          {[200, 360, 520, 680, 840].map((r) => (
            <div key={r} className="absolute rounded-full border border-white" style={{ width: r, height: r }} />
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Copy */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 text-xs font-medium px-4 py-2 rounded-full mb-6 border border-green-500/30">
                <Zap className="h-3 w-3" /> Free · No credit card · Ready in 2 minutes
              </span>
            </motion.div>

            <motion.h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white leading-[1.08] tracking-tight mb-6"
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}>
              Your wellness journey,<br /><span className="text-green-400">personalised</span> for you.
            </motion.h1>

            <motion.p className="text-lg text-green-100/75 leading-relaxed mb-10 max-w-lg"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.2 }}>
              Fitcount builds your workout plan around your body, goals, and schedule. Guided animated exercises, daily habit tracking, and milestones that keep you moving — all free.
            </motion.p>

            <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.3 }}>
              <Button onClick={scrollToAuth} size="lg" className="bg-green-400 hover:bg-green-300 text-green-950 font-bold px-8 h-12 text-base rounded-xl shadow-lg shadow-green-900/40">
                Start for free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} variant="outline" size="lg"
                className="border-white/25 text-white hover:bg-white/10 bg-transparent h-12 text-base rounded-xl">
                See how it works <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div className="mt-10 flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <div className="flex -space-x-2">
                {['🧘','🏃','💪','🌿'].map((em, i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-green-800 border-2 border-green-950 flex items-center justify-center text-sm">{em}</div>
                ))}
              </div>
              <p className="text-sm text-green-200/60">Thousands already on their journey</p>
            </motion.div>
          </div>

          {/* Figure + floating cards */}
          <motion.div className="relative flex justify-center items-center" initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full bg-green-500/10 blur-3xl" />
              <HeroFigure />
              <FloatCard icon="💧" label="Water today" value="6 / 8 cups" delay={0} className="-left-10 top-2 min-w-[140px]" />
              <FloatCard icon="🌙" label="Sleep last night" value="7.5 hrs · Good" delay={0.9} className="-right-6 top-16 min-w-[158px]" />
              <FloatCard icon="🔥" label="Streak" value="5 days" delay={1.5} className="-left-8 bottom-10 min-w-[110px]" />
              <FloatCard icon="🏆" label="Badges earned" value="4 of 16" delay={0.4} className="-right-8 bottom-2 min-w-[135px]" />
            </div>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ChevronDown className="h-6 w-6 text-white/35" />
        </motion.div>
      </section>

      {/* ── Stats strip ── */}
      <div className="bg-green-700 py-5">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[['18','Guided exercises'],['5','Exercise categories'],['16','Achievement badges'],['9','Onboarding questions']].map(([v, l]) => (
            <div key={l}><p className="text-2xl font-extrabold text-white">{v}</p><p className="text-xs text-green-200 mt-0.5">{l}</p></div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Built around your lifestyle</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">No gym. No equipment. Just guided movement and smart tracking — anywhere.</p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            <FadeIn delay={0}><FeatureCard icon={<Dumbbell className="h-7 w-7 text-green-700" />} title="Personalised Workout Plans" description="Generated from your body metrics, fitness level, and goals — updated whenever you change." accent="bg-green-100"
              bullets={['Tai Chi & Japanese interval walking','Hip, core, and relaxation routines','Step-by-step animated guides','Adapts as your fitness improves']} /></FadeIn>
            <FadeIn delay={0.1}><FeatureCard icon={<Heart className="h-7 w-7 text-blue-700" />} title="Daily Habit Tracking" description="Three simple habits that compound into real results. Log in seconds, see the difference in weeks." accent="bg-blue-100"
              bullets={['Water intake with 8-cup tap tracker','Sleep hours + WHO adequacy score','Weight logging with goal timeline','Morning dashboard overview']} /></FadeIn>
            <FadeIn delay={0.2}><FeatureCard icon={<Trophy className="h-7 w-7 text-amber-700" />} title="Milestones & Badges" description="Stay motivated with a badge system that rewards consistency, not just results." accent="bg-amber-100"
              bullets={['16 badges across 5 categories','Workout streaks & daily logging','Weight loss milestones','Hydration and sleep champions']} /></FadeIn>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-3">Simple by design</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Up and running in 3 steps</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { n:'1', icon:<Target className="h-8 w-8 text-green-600"/>, title:'Tell us about yourself', desc:'A 9-question wizard collects your metrics, fitness level, and goal weight. Takes under 3 minutes.' },
              { n:'2', icon:<Footprints className="h-8 w-8 text-green-600"/>, title:'Follow your plan', desc:'Your personalised weekly schedule is ready immediately. Every exercise has an animated step-by-step guide.' },
              { n:'3', icon:<Flame className="h-8 w-8 text-green-600"/>, title:'Track and celebrate', desc:'Log water, sleep, and weight daily. Watch your progress chart grow and earn badges along the way.' },
            ].map(({ n, icon, title, desc }, i) => (
              <FadeIn key={n} delay={i * 0.12}>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-green-50 flex items-center justify-center">{icon}</div>
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">{n}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Exercise categories ── */}
      <section className="py-20 bg-gradient-to-br from-[#062919] to-[#0b4035]">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">Exercises for every body</h2>
            <p className="text-green-200/75 text-lg">Five categories. Eighteen guided routines. All low-impact.</p>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { e:'🌿', name:'Tai Chi Walking', desc:'Slow, meditative movement' },
              { e:'🚶', name:'Interval Walking', desc:'Japanese 3+3 min cycles' },
              { e:'🦵', name:'Hip Exercises', desc:'Circles, hinges, stretches' },
              { e:'💪', name:'Core Workouts', desc:'Plank, crunch, bird-dog' },
              { e:'🧘', name:'Relaxation', desc:'Breathing & body scan' },
            ].map(({ e, name, desc }, i) => (
              <FadeIn key={name} delay={i * 0.07}>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-5 text-center hover:bg-white/15 transition-colors">
                  <div className="text-3xl mb-2">{e}</div>
                  <p className="text-white text-sm font-semibold leading-tight">{name}</p>
                  <p className="text-green-300/70 text-xs mt-1">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Goal Timeline feature ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-8 border border-green-100">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-5">Goal Timeline</p>
                <div className="space-y-4">
                  {[{l:'Starting weight',v:'82 kg',b:false},{l:'Current weight',v:'75.2 kg',b:true},{l:'Goal weight',v:'68 kg',b:false}].map(({l,v,b})=>(
                    <div key={l} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{l}</span>
                      <span className={`font-bold ${b?'text-green-700':'text-gray-900'}`}>{v}</span>
                    </div>
                  ))}
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden my-2">
                    <motion.div className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                      initial={{ width: '0%' }} whileInView={{ width: '58%' }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }} viewport={{ once: true }} />
                  </div>
                  <div className="bg-green-600 text-white rounded-xl p-4 text-center mt-2">
                    <p className="text-xs opacity-80 mb-0.5">Estimated goal date</p>
                    <p className="text-xl font-bold">October 2026</p>
                    <p className="text-xs opacity-70 mt-0.5">~19 weeks at current pace</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="space-y-5">
                <p className="text-sm font-semibold text-green-600 uppercase tracking-widest">Science-backed estimates</p>
                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">Know exactly when you&apos;ll reach your goal</h2>
                <p className="text-gray-500 leading-relaxed">Fitcount uses the Mifflin-St Jeor formula to calculate your TDEE, then models a sustainable 500 kcal daily deficit. Your timeline updates automatically every time you log your weight.</p>
                <ul className="space-y-3">
                  {['Personalised to your gender, age, height, and activity level','Updates in real time as your weight changes','Backed by clinical nutrition science'].map((item)=>(
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5"><Check className="h-3 w-3 text-green-600"/></div>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Sleep section ── */}
      <section className="py-20 bg-[#0d1b2a]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeIn delay={0.1}>
              <div className="space-y-5">
                <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Sleep intelligence</p>
                <h2 className="text-3xl font-extrabold text-white leading-tight">Sleep is your secret weapon for weight loss</h2>
                <p className="text-gray-400 leading-relaxed">Poor sleep raises cortisol and disrupts the hunger hormones ghrelin and leptin. Fitcount scores your sleep against WHO guidelines each night and gives you a personal recommendation — not a generic tip.</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center"><Moon className="h-6 w-6 text-blue-400"/></div>
                  <div><p className="text-white text-sm font-semibold">WHO target: 7–9 hours</p><p className="text-gray-500 text-xs">Scored 0–100 each night</p></div>
                </div>
              </div>
            </FadeIn>
            <FadeIn>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                {[{h:'8.0h',s:95,l:'Excellent',c:'bg-green-500'},{h:'6.5h',s:62,l:'Below target',c:'bg-amber-500'},{h:'7.5h',s:88,l:'Good',c:'bg-green-400'},{h:'5.5h',s:40,l:'Insufficient',c:'bg-red-400'}].map(({h,s,l,c},i)=>(
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-white text-sm font-mono w-12 shrink-0">{h}</span>
                    <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${c}`} initial={{width:0}} whileInView={{width:`${s}%`}} transition={{duration:0.9,delay:i*0.12,ease:'easeOut'}} viewport={{once:true}} />
                    </div>
                    <span className="text-gray-400 text-xs w-20 text-right shrink-0">{l}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-600 pt-1 text-center">Sample sleep analysis across 4 nights</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Auth / CTA Section ── */}
      <section ref={authRef} id="auth" className="py-24 bg-gradient-to-br from-green-50 via-white to-teal-50">
        <div className="max-w-md mx-auto px-6">
          <FadeIn className="text-center mb-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-5">
              <Star className="h-7 w-7 text-green-600"/>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Ready to start?</h2>
            <p className="text-gray-500 text-lg">Create a free account in seconds. Your personalised plan is ready the moment you finish onboarding.</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <AuthForm />
            </div>
          </FadeIn>
          <FadeIn delay={0.25}>
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[{icon:<Check className="h-4 w-4 text-green-600"/>,l:'Free forever'},{icon:<Wind className="h-4 w-4 text-green-600"/>,l:'No gym needed'},{icon:<Timer className="h-4 w-4 text-green-600"/>,l:'Ready in 3 minutes'}].map(({icon,l})=>(
                <div key={l} className="flex items-center gap-1.5 text-sm text-gray-500">{icon}{l}</div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">F</div>
            <span className="text-lg font-bold text-white">Fitcount</span>
            <span className="text-gray-600 text-sm ml-2">Personalised wellness for everyone</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span className="text-gray-700">·</span>
            <span>© 2026 Fitcount</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
