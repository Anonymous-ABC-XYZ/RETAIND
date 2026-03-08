import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  // Refs for intersection observers
  const revealRefs = useRef<(HTMLElement | null)[]>([])
  const hRuleRefs = useRef<(HTMLElement | null)[]>([])
  const chartRef = useRef<HTMLDivElement>(null)
  const fillRefs = useRef<(HTMLElement | null)[]>([])
  const dataRefs = useRef<(HTMLElement | null)[]>([])
  const savingsRef = useRef<HTMLParagraphElement>(null)
  const staggerRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    // Scroll reveal observer
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    revealRefs.current.forEach((el) => el && revealObs.observe(el))

    // H-rule draw-in observer
    const ruleObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('drawn')
            ruleObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.5 }
    )
    hRuleRefs.current.forEach((el) => el && ruleObs.observe(el))

    // Chart bars grow on scroll
    const barObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll('.bar-animated').forEach((b) => b.classList.add('grown'))
            barObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.3 }
    )
    if (chartRef.current) barObs.observe(chartRef.current)

    // Progress bar fills
    const fillObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('filled')
            fillObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.5 }
    )
    fillRefs.current.forEach((el) => el && fillObs.observe(el))

    // Data number pop
    const dataObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('popped')
            dataObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.5 }
    )
    dataRefs.current.forEach((el) => el && dataObs.observe(el))

    // Savings number pop
    const savObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('popped')
            savObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.3 }
    )
    if (savingsRef.current) savObs.observe(savingsRef.current)

    // Stagger list items
    const listObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            listObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.3 }
    )
    staggerRefs.current.forEach((el) => el && listObs.observe(el))

    // Hero chart bars animate after page load
    const timer = setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.querySelectorAll('.bar-animated').forEach((b) => b.classList.add('grown'))
      }
    }, 900)

    return () => {
      clearTimeout(timer)
      revealObs.disconnect()
      ruleObs.disconnect()
      barObs.disconnect()
      fillObs.disconnect()
      dataObs.disconnect()
      savObs.disconnect()
      listObs.disconnect()
    }
  }, [])

  const addRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el)
    }
  }

  const addHRuleRef = (el: HTMLElement | null) => {
    if (el && !hRuleRefs.current.includes(el)) {
      hRuleRefs.current.push(el)
    }
  }

  const addFillRef = (el: HTMLElement | null) => {
    if (el && !fillRefs.current.includes(el)) {
      fillRefs.current.push(el)
    }
  }

  const addDataRef = (el: HTMLElement | null) => {
    if (el && !dataRefs.current.includes(el)) {
      dataRefs.current.push(el)
    }
  }

  const addStaggerRef = (el: HTMLElement | null) => {
    if (el && !staggerRefs.current.includes(el)) {
      staggerRefs.current.push(el)
    }
  }

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  const faqs = [
    {
      question: 'Do I have to replace my existing FSM?',
      answer: 'No. RETAIND sits on top of your existing FSM via API. No rip-and-replace needed.',
    },
    {
      question: 'Where does the £125k–£175k saving come from?',
      answer:
        'Conservative model for 100 engineers: 10% churn reduction (~£70k–£104k), 10% faster ramp-up (~£26k–£39k), plus 1 prevented failed hire (~£30.6k). Excludes rework and compliance savings.',
    },
    {
      question: 'What trades and sectors does RETAIND support?',
      answer:
        'Electrical, EV, solar and heat pumps today. Multi-trade FM and M&E supported, with HVAC and broader construction planned.',
    },
    {
      question: 'How does the AI work—does it make decisions automatically?',
      answer:
        'No. AI flags issues—humans always sign off. Everything is logged for full audit accountability.',
    },
    {
      question: 'How is RETAIND priced?',
      answer:
        "Per-worker-per-month pricing. Book a demo and we'll model the plan that fits your operation.",
    },
    {
      question: 'How long does integration take?',
      answer:
        'API connector framework designed for rapid setup. A pilot can be running within weeks, not months.',
    },
  ]

  return (
    <div className="bg-surface-0 text-surface-600 font-body antialiased scroll-smooth">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-surface-0/90 backdrop-blur-lg border-b border-surface-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-brand flex items-center justify-center rounded-md font-mono text-xs font-bold text-surface-900 transition-transform duration-200 group-hover:scale-105">
              R
            </div>
            <span className="font-display text-lg text-surface-900 tracking-tight font-bold">
              RETAIND
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#problems"
              onClick={(e) => scrollToSection(e, 'problems')}
              className="nav-link text-xs font-medium text-surface-500 tracking-wide uppercase transition-colors duration-200 hover:text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 rounded"
            >
              Problems
            </a>
            <a
              href="#savings"
              onClick={(e) => scrollToSection(e, 'savings')}
              className="nav-link text-xs font-medium text-surface-500 tracking-wide uppercase transition-colors duration-200 hover:text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 rounded"
            >
              ROI
            </a>
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="nav-link text-xs font-medium text-surface-500 tracking-wide uppercase transition-colors duration-200 hover:text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 rounded"
            >
              Platform
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className="nav-link text-xs font-medium text-surface-500 tracking-wide uppercase transition-colors duration-200 hover:text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 rounded"
            >
              FAQ
            </a>
          </div>
          <Link
            to="/contact"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-surface-900 text-surface-0 text-xs font-semibold tracking-wide uppercase rounded-full transition-all duration-200 hover:bg-surface-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
          >
            Join Beta
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-surface-500 hover:text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-0/95 backdrop-blur-lg border-t border-surface-200">
            <div className="flex flex-col px-6 py-4 gap-3 text-sm font-medium text-surface-500">
              <a
                href="#problems"
                onClick={(e) => scrollToSection(e, 'problems')}
                className="py-1.5 hover:text-surface-900"
              >
                Problems
              </a>
              <a
                href="#savings"
                onClick={(e) => scrollToSection(e, 'savings')}
                className="py-1.5 hover:text-surface-900"
              >
                ROI
              </a>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="py-1.5 hover:text-surface-900"
              >
                Platform
              </a>
              <a
                href="#faq"
                onClick={(e) => scrollToSection(e, 'faq')}
                className="py-1.5 hover:text-surface-900"
              >
                FAQ
              </a>
              <Link
                to="/contact"
                className="mt-2 text-center px-4 py-2.5 bg-surface-900 text-surface-0 text-xs font-semibold tracking-wide uppercase rounded-full"
              >
                Join Beta
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-end pb-20 pt-32 lg:pt-16 lg:items-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-end lg:items-center">
            {/* Left */}
            <div className="lg:col-span-7 relative">
              <p className="load-1 section-num mb-6">Workforce retention platform</p>
              <h1 className="load-2 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight text-surface-900 font-bold">
                Stop losing your
                <br />
                <span className="marker">best people.</span>
              </h1>
              <p
                className="load-3 mt-8 text-lg lg:text-xl text-surface-600 leading-relaxed max-w-lg"
                style={{ textWrap: 'pretty' } as React.CSSProperties}
              >
                AI-powered compliance, quality &amp; onboarding overlay for your existing FSM. Cut
                churn, rework and ramp-up time.
              </p>
              <div className="load-4 flex flex-wrap items-center gap-4 mt-10">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-surface-900 text-white text-sm font-semibold rounded-full transition-all duration-200 hover:bg-surface-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 active:scale-[0.97]"
                >
                  Join Beta
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                    />
                  </svg>
                </Link>
                <a
                  href="#features"
                  onClick={(e) => scrollToSection(e, 'features')}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-surface-500 transition-colors duration-200 hover:text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded px-2 py-1"
                >
                  Explore the platform
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Dashboard */}
            <div className="lg:col-span-5 load-5">
              <div className="mock-panel rounded-xl overflow-hidden shadow-xl shadow-black/[0.08] border border-surface-200">
                {/* Title bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-200">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-brand/10 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-brand"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z"
                        />
                      </svg>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-surface-500">
                      retaind / dashboard
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-surface-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-surface-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-surface-300"></div>
                  </div>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x divide-surface-200">
                  <div className="p-4">
                    <p className="text-[10px] font-mono uppercase text-surface-400 tracking-wider">
                      Quality
                    </p>
                    <p className="data-accent text-2xl font-semibold text-signal-green mt-1">
                      94.2<span className="text-sm text-surface-400">%</span>
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-mono uppercase text-surface-400 tracking-wider">
                      Churn
                    </p>
                    <p className="data-accent text-2xl font-semibold text-signal-teal mt-1">
                      –18<span className="text-sm text-surface-400">%</span>
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-mono uppercase text-surface-400 tracking-wider">
                      Ramp-up
                    </p>
                    <p className="data-accent text-2xl font-semibold text-signal-amber mt-1">
                      +27<span className="text-sm text-surface-400">%</span>
                    </p>
                  </div>
                </div>
                {/* Chart area */}
                <div className="px-4 pt-3 pb-4 border-t border-surface-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase text-surface-400 tracking-wider">
                      Readiness score · 12 mo
                    </span>
                    <span className="text-[10px] font-mono text-signal-green bg-signal-green/10 px-1.5 py-0.5 rounded inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-signal-green ping-dot"></span>
                      LIVE
                    </span>
                  </div>
                  <div ref={chartRef} className="flex items-end gap-[3px] h-16">
                    {[28, 38, 35, 48, 45, 58, 55, 68, 72, 78, 85, 94].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm bar-animated ${
                          i < 3
                            ? 'bg-surface-200'
                            : i < 7
                              ? 'bg-surface-300'
                              : i < 10
                                ? 'bg-surface-400'
                                : i === 10
                                  ? 'bg-surface-500'
                                  : 'bg-brand'
                        }`}
                        style={{ height: `${h}%`, transitionDelay: `${i * 0.04}s` }}
                      ></div>
                    ))}
                  </div>
                </div>
                {/* Activity rows */}
                <div className="border-t border-surface-200 divide-y divide-surface-200">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-signal-green/15 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-signal-green"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-[11px] text-surface-600">Job #4821 · EV charger install</span>
                    </div>
                    <span className="text-[10px] font-mono text-signal-green">passed</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-signal-amber/15 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-signal-amber"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5" />
                        </svg>
                      </div>
                      <span className="text-[11px] text-surface-600">Job #4819 · Solar panel fit</span>
                    </div>
                    <span className="text-[10px] font-mono text-signal-amber">review</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-signal-red/15 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-signal-red"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className="text-[11px] text-surface-600">Job #4817 · Consumer unit</span>
                    </div>
                    <span className="text-[10px] font-mono text-signal-red">remedial</span>
                  </div>
                </div>
              </div>
              <p className="text-center mt-3 text-[10px] font-mono text-surface-400 tracking-wide uppercase">
                Dashboard preview · product screenshot placeholder
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <section id="problems" className="py-16 relative">
        <div ref={addHRuleRef} className="h-rule"></div>
        <div className="max-w-6xl mx-auto px-6 pt-12">
          <div className="grid lg:grid-cols-12 gap-12">
            <div ref={addRevealRef} className="lg:col-span-4 reveal">
              <p className="section-num mb-4">01 — The problem</p>
              <h2 className="font-display text-3xl sm:text-4xl text-surface-900 font-bold leading-[1.1] tracking-tight">
                Your workforce is&nbsp;bleeding margin.
              </h2>
              <p className="mt-4 text-surface-500 leading-relaxed">
                Your FSM tracks jobs. It doesn't fix these three margin leaks.
              </p>
            </div>
            <div className="lg:col-span-8 space-y-3">
              {/* Problem 1 */}
              <div ref={addRevealRef} className="reveal edge-card rounded-xl p-6 lg:p-8 bg-surface-50">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="shrink-0 w-16 h-16 rounded-lg bg-signal-red/[0.08] border border-signal-red/15 flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-signal-red"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-surface-900">Costly staff churn</h3>
                    <p className="text-surface-500 mt-1.5 leading-relaxed">
                      Construction churn runs at ~23%. One in five leavers quit within the first
                      45&nbsp;days.
                    </p>
                  </div>
                  <div className="shrink-0 text-right sm:pl-4 sm:border-l border-surface-200">
                    <p
                      ref={addDataRef}
                      className="data-accent data-animated text-3xl font-semibold text-signal-red"
                    >
                      £30,614
                    </p>
                    <p className="text-[10px] font-mono uppercase text-surface-400 mt-0.5 tracking-wider">
                      cost per leaver
                    </p>
                  </div>
                </div>
              </div>

              {/* Problem 2 */}
              <div
                ref={addRevealRef}
                className="reveal reveal-delay-1 edge-card rounded-xl p-6 lg:p-8 bg-surface-50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="shrink-0 w-16 h-16 rounded-lg bg-signal-orange/[0.08] border border-signal-orange/15 flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-signal-orange"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-surface-900">Rework &amp; callbacks</h3>
                    <p className="text-surface-500 mt-1.5 leading-relaxed">
                      Inconsistent evidence and late sign-offs mean problems are caught too late.
                    </p>
                  </div>
                  <div className="shrink-0 text-right sm:pl-4 sm:border-l border-surface-200">
                    <p
                      ref={addDataRef}
                      className="data-accent data-animated text-3xl font-semibold text-signal-orange"
                    >
                      ~5%
                    </p>
                    <p className="text-[10px] font-mono uppercase text-surface-400 mt-0.5 tracking-wider">
                      of project value
                    </p>
                  </div>
                </div>
              </div>

              {/* Problem 3 */}
              <div
                ref={addRevealRef}
                className="reveal reveal-delay-2 edge-card rounded-xl p-6 lg:p-8 bg-surface-50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="shrink-0 w-16 h-16 rounded-lg bg-signal-amber/[0.08] border border-signal-amber/15 flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-signal-amber"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-surface-900">Slow onboarding</h3>
                    <p className="text-surface-500 mt-1.5 leading-relaxed">
                      No structured competence tracking means 18% of new hires have probation extended
                      or fail entirely.
                    </p>
                  </div>
                  <div className="shrink-0 text-right sm:pl-4 sm:border-l border-surface-200">
                    <p
                      ref={addDataRef}
                      className="data-accent data-animated text-3xl font-semibold text-signal-amber"
                    >
                      ~15<span className="text-lg text-surface-400"> wk</span>
                    </p>
                    <p className="text-[10px] font-mono uppercase text-surface-400 mt-0.5 tracking-wider">
                      to productivity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAVINGS */}
      <section id="savings" className="py-16 relative">
        <div ref={addHRuleRef} className="h-rule"></div>
        <div className="max-w-6xl mx-auto px-6 pt-12">
          <div ref={addRevealRef} className="reveal text-center">
            <p className="section-num mb-4">02 — The return</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-surface-900 font-bold leading-[1.05] tracking-tight">
              RETAIND fixes this, saving
            </h2>
          </div>

          <div ref={addRevealRef} className="reveal mt-12 text-center">
            <p
              ref={savingsRef}
              className="data-accent savings-animated text-[clamp(3.5rem,10vw,8rem)] font-semibold text-surface-900 leading-none tracking-tighter"
            >
              £125k–175k<span className="text-surface-300">+</span>
            </p>
            <p className="mt-3 text-lg text-surface-500">per year, per 100 field workers</p>
            <p className="mt-2 text-sm text-surface-400 max-w-md mx-auto">
              Conservative estimate—<em>before</em> rework, QS time and compliance savings.
            </p>
          </div>

          {/* Breakdown */}
          <div
            ref={addRevealRef}
            className="reveal mt-16 grid sm:grid-cols-3 max-w-3xl mx-auto border border-surface-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-surface-200 bg-surface-50"
          >
            <div className="p-6 text-center">
              <p className="data-accent text-3xl font-semibold text-surface-900">10%</p>
              <p className="text-sm text-surface-500 font-medium mt-1">Churn reduction</p>
              <p className="text-[11px] font-mono text-surface-400 mt-1">~£70k–£104k saved</p>
            </div>
            <div className="p-6 text-center">
              <p className="data-accent text-3xl font-semibold text-surface-900">10%</p>
              <p className="text-sm text-surface-500 font-medium mt-1">Faster ramp-up</p>
              <p className="text-[11px] font-mono text-surface-400 mt-1">~£26k–£39k saved</p>
            </div>
            <div className="p-6 text-center">
              <p className="data-accent text-3xl font-semibold text-surface-900">1</p>
              <p className="text-sm text-surface-500 font-medium mt-1">Failed hire prevented</p>
              <p className="text-[11px] font-mono text-surface-400 mt-1">~£30.6k saved</p>
            </div>
          </div>

          <p
            ref={addRevealRef}
            className="reveal text-[11px] font-mono text-surface-400 text-center mt-6 tracking-wide"
          >
            Sources: Oxford Economics, CIPD UK, GIRI construction rework studies
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 relative">
        <div ref={addHRuleRef} className="h-rule"></div>
        <div className="max-w-6xl mx-auto px-6 pt-12">
          <div ref={addRevealRef} className="reveal mb-12">
            <p className="section-num mb-4">03 — The platform</p>
            <h2 className="font-display text-3xl sm:text-4xl text-surface-900 font-bold leading-[1.1] tracking-tight max-w-lg">
              Four hubs. One&nbsp;overlay.
              <br />
              No rip-and-replace.
            </h2>
          </div>

          {/* Hub 1 */}
          <div ref={addRevealRef} className="reveal grid lg:grid-cols-12 gap-8 items-start mb-12">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="data-accent text-xs text-surface-400">hub 01</span>
                <div className="flex-1 h-px bg-surface-200"></div>
              </div>
              <h3 className="font-display text-2xl text-surface-900 font-bold mb-3">
                Compliance &amp; Certification
              </h3>
              <p className="text-surface-500 leading-relaxed mb-5">
                Define standards by trade, job type and region. Review queues, evidence requirements
                and certs with full audit trails.
              </p>
              <ul ref={addStaggerRef} className="stagger-list space-y-2.5 text-sm text-surface-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> Pass / fail / remedial /
                  escalation workflows
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> Photo, form, test value &amp;
                  timestamp evidence
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> Full audit trail for every
                  sign-off decision
                </li>
              </ul>
            </div>
            <div className="lg:col-span-7">
              <div className="mock-panel rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-surface-200 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-surface-400 tracking-wider">
                    Compliance Hub
                  </span>
                  <span className="text-[10px] font-mono text-signal-green bg-signal-green/10 px-1.5 py-0.5 rounded">
                    3 pending
                  </span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-surface-200 border-b border-surface-200">
                  <div className="p-4 text-center">
                    <p className="data-accent text-2xl font-semibold text-signal-green">247</p>
                    <p className="text-[10px] font-mono uppercase text-surface-400 mt-0.5 tracking-wider">
                      Jobs passed
                    </p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="data-accent text-2xl font-semibold text-signal-red">12</p>
                    <p className="text-[10px] font-mono uppercase text-surface-400 mt-0.5 tracking-wider">
                      Remedials open
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-surface-200">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-[11px] text-surface-600">
                      Job #4821 · EV charger install ·{' '}
                      <span className="text-surface-400">J. Wilson</span>
                    </span>
                    <span className="text-[10px] font-mono text-signal-green">passed</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-[11px] text-surface-600">
                      Job #4819 · Solar panel fit ·{' '}
                      <span className="text-surface-400">M. Roberts</span>
                    </span>
                    <span className="text-[10px] font-mono text-signal-amber">review</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-[11px] text-surface-600">
                      Job #4817 · Consumer unit · <span className="text-surface-400">T. Patel</span>
                    </span>
                    <span className="text-[10px] font-mono text-signal-red">remedial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hub 2 */}
          <div ref={addRevealRef} className="reveal grid lg:grid-cols-12 gap-8 items-start mb-12">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="mock-panel rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-surface-200">
                  <span className="text-[10px] font-mono uppercase text-surface-400 tracking-wider">
                    Audit pass rate by region
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { region: 'North West', pct: 96, color: 'bg-signal-green', textColor: 'text-signal-green' },
                    { region: 'South East', pct: 89, color: 'bg-signal-teal', textColor: 'text-signal-teal' },
                    { region: 'Midlands', pct: 74, color: 'bg-signal-amber', textColor: 'text-signal-amber' },
                    { region: 'London', pct: 68, color: 'bg-signal-red', textColor: 'text-signal-red' },
                  ].map((item, i) => (
                    <div key={item.region}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-surface-600">{item.region}</span>
                        <span className={`data-accent ${item.textColor}`}>{item.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-200 overflow-hidden">
                        <div
                          ref={addFillRef}
                          className={`h-full rounded-full ${item.color} fill-animated`}
                          style={{ width: `${item.pct}%`, transitionDelay: `${i * 0.1}s` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="data-accent text-xs text-surface-400">hub 02</span>
                <div className="flex-1 h-px bg-surface-200"></div>
              </div>
              <h3 className="font-display text-2xl text-surface-900 font-bold mb-3">
                Quality, Audits &amp;&nbsp;Remedials
              </h3>
              <p className="text-surface-500 leading-relaxed mb-5">
                Blind audits, targeted sampling and remedial workflows. Performance dashboards by team
                and region.
              </p>
              <ul ref={addStaggerRef} className="stagger-list space-y-2.5 text-sm text-surface-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> Blind audits &amp; targeted
                  sampling rules
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> Remedial workflows &amp;
                  re-audit tracking
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> Region &amp; team performance
                  dashboards
                </li>
              </ul>
            </div>
          </div>

          {/* Hub 3 */}
          <div ref={addRevealRef} className="reveal grid lg:grid-cols-12 gap-8 items-start mb-12">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="data-accent text-xs text-surface-400">hub 03</span>
                <div className="flex-1 h-px bg-surface-200"></div>
              </div>
              <h3 className="font-display text-2xl text-surface-900 font-bold mb-3">
                Training, CPD &amp;&nbsp;Competence
              </h3>
              <p className="text-surface-500 leading-relaxed mb-5">
                CPD records and training modules linked to real job outcomes. Skills matrices per trade
                and role.
              </p>
              <ul ref={addStaggerRef} className="stagger-list space-y-2.5 text-sm text-surface-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> Training linked to outcome data
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> Skills matrices per trade &amp;
                  role
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> QS/Training scored reviews
                </li>
              </ul>
            </div>
            <div className="lg:col-span-7">
              <div className="mock-panel rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-surface-200">
                  <span className="text-[10px] font-mono uppercase text-surface-400 tracking-wider">
                    Skills matrix · Electrical team
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-surface-200">
                        <th className="text-left font-mono font-medium text-surface-400 px-4 py-2.5 uppercase tracking-wider text-[10px]">
                          Engineer
                        </th>
                        <th className="text-center font-mono font-medium text-surface-400 px-3 py-2.5 uppercase tracking-wider text-[10px]">
                          18th Ed
                        </th>
                        <th className="text-center font-mono font-medium text-surface-400 px-3 py-2.5 uppercase tracking-wider text-[10px]">
                          EV Install
                        </th>
                        <th className="text-center font-mono font-medium text-surface-400 px-3 py-2.5 uppercase tracking-wider text-[10px]">
                          Solar PV
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-200">
                      <tr>
                        <td className="px-4 py-2.5 text-surface-600">J. Wilson</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-signal-green">✓</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-signal-green">✓</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[10px] font-mono text-signal-amber">in progress</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-surface-600">M. Roberts</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-signal-green">✓</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[10px] font-mono text-signal-amber">in progress</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[10px] font-mono text-surface-400">—</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-surface-600">T. Patel</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-signal-green">✓</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-signal-green">✓</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-signal-green">✓</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Hub 4 */}
          <div ref={addRevealRef} className="reveal grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="mock-panel rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-surface-200 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-surface-400 tracking-wider">
                    New starter · Alex Morgan
                  </span>
                  <span className="text-[10px] font-mono text-signal-green bg-signal-green/10 px-1.5 py-0.5 rounded">
                    on track
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'Onboarding progress', value: '62%', pct: 62, color: 'bg-brand' },
                    { label: 'Competence checkpoints', value: '4/7', pct: 57, color: 'bg-signal-teal' },
                    { label: 'Portfolio evidence', value: '8 items', pct: 40, color: 'bg-signal-amber' },
                  ].map((item, i) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-surface-500">{item.label}</span>
                        <span className="data-accent text-surface-700">{item.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-200 overflow-hidden">
                        <div
                          ref={addFillRef}
                          className={`h-full rounded-full ${item.color} fill-animated`}
                          style={{ width: `${item.pct}%`, transitionDelay: `${i * 0.1}s` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-signal-amber/20 bg-signal-amber/5 flex items-start gap-2.5">
                  <svg
                    className="w-4 h-4 text-signal-amber shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  <div>
                    <p className="text-[11px] font-semibold text-signal-amber">Early warning</p>
                    <p className="text-[11px] text-surface-500">
                      Sam Taylor (wk 3) — missed 2 checkpoints. Mentor review triggered.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="data-accent text-xs text-surface-400">hub 04</span>
                <div className="flex-1 h-px bg-surface-200"></div>
              </div>
              <h3 className="font-display text-2xl text-surface-900 font-bold mb-3">
                Onboarding &amp;&nbsp;Readiness
              </h3>
              <p className="text-surface-500 leading-relaxed mb-5">
                Role templates, mentor assignment and competence checkpoints. Early warnings flag risk
                before probation fails.
              </p>
              <ul ref={addStaggerRef} className="stagger-list space-y-2.5 text-sm text-surface-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> Mentor assignment &amp; shadowing
                  logs
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> Auto-assembled portfolio from job
                  evidence
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-brand mt-0.5 text-xs">▆</span> Early warning signals for
                  probation risk
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI OVERLAY */}
      <section className="py-12 relative">
        <div ref={addHRuleRef} className="h-rule"></div>
        <div className="max-w-6xl mx-auto px-6 pt-10">
          <div ref={addRevealRef} className="reveal grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <p className="section-num mb-4">04 — The intelligence</p>
              <h2 className="font-display text-2xl sm:text-3xl text-surface-900 font-bold leading-[1.1] tracking-tight">
                AI flags.
                <br />
                Humans sign&nbsp;off.
              </h2>
              <p className="mt-4 text-surface-500 leading-relaxed text-sm">
                Human-in-the-loop by design. Everything logged for audit accountability.
              </p>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-3 gap-4">
              {[
                {
                  title: 'Evidence checks',
                  desc: 'Missing photos, wrong angles, unreadable labels — caught before QS review.',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  ),
                },
                {
                  title: 'Anomaly detection',
                  desc: 'Data conflicts between forms, notes and evidence flagged automatically.',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                    />
                  ),
                },
                {
                  title: 'Smart audits',
                  desc: 'Prioritises what to review and who to sample based on risk signals.',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
                    />
                  ),
                },
              ].map((item, i) => (
                <div
                  key={item.title}
                  ref={addRevealRef}
                  className={`reveal ${i > 0 ? `reveal-delay-${i}` : ''} edge-card rounded-xl p-5 bg-surface-50`}
                >
                  <div className="w-10 h-10 rounded bg-brand/[0.08] border border-brand/15 flex items-center justify-center mb-4">
                    <svg
                      className="w-5 h-5 text-brand"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-surface-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-surface-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 relative">
        <div ref={addHRuleRef} className="h-rule"></div>
        <div className="max-w-3xl mx-auto px-6 pt-12">
          <div ref={addRevealRef} className="reveal mb-12">
            <p className="section-num mb-4">05 — FAQ</p>
            <h2 className="font-display text-3xl text-surface-900 font-bold tracking-tight">
              Common questions
            </h2>
          </div>

          <div ref={addRevealRef} className="reveal">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item py-5 ${openFaqIndex === i ? 'open' : ''}`}>
                <button
                  onClick={() => toggleFaq(i)}
                  className="faq-toggle w-full flex items-center justify-between text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                  aria-expanded={openFaqIndex === i}
                >
                  <span className="text-sm font-medium text-surface-800 group-hover:text-surface-900 pr-4">
                    {faq.question}
                  </span>
                  <span className="faq-plus text-surface-400 text-xl leading-none shrink-0 font-light">
                    +
                  </span>
                </button>
                <div className="faq-answer">
                  <p className="text-sm text-surface-500 leading-relaxed pt-3">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section id="contact" className="py-16 relative">
        <div ref={addHRuleRef} className="h-rule"></div>
        <div className="max-w-6xl mx-auto px-6 pt-12">
          <div className="grid lg:grid-cols-12 gap-12">
            <div ref={addRevealRef} className="lg:col-span-5 reveal">
              <p className="section-num mb-4">06 — Get started</p>
              <h2 className="font-display text-3xl sm:text-4xl text-surface-900 font-bold leading-[1.1] tracking-tight">
                Ready to retain more&nbsp;value?
              </h2>
              <p className="mt-4 text-surface-500 leading-relaxed">
                Sign up for a free account to explore the platform with demo data.
              </p>
              <div className="mt-8 space-y-4 text-sm">
                <div className="flex items-center gap-3 text-surface-500">
                  <svg
                    className="w-4 h-4 text-brand shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  <a
                    href="mailto:hello@retaind.io"
                    className="hover:text-surface-900 transition-colors duration-200"
                  >
                    hello@retaind.io
                  </a>
                </div>
              </div>
            </div>
            <div ref={addRevealRef} className="lg:col-span-7 reveal reveal-delay-1">
              <div className="bg-surface-50 border border-surface-200 rounded-xl p-6 lg:p-8 space-y-6 text-center">
                <h3 className="font-display text-2xl text-surface-900 font-bold">
                  Ready to reduce turnover?
                </h3>
                <p className="text-surface-500">
                  Join the beta and be among the first to transform how you retain your workforce.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-surface-900 text-white text-sm font-semibold rounded-full transition-all duration-200 hover:bg-surface-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-50 active:scale-[0.97]"
                  >
                    Join Beta
                    <svg
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-surface-200 bg-surface-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-brand flex items-center justify-center rounded-md text-[10px] font-mono font-bold text-surface-900">
                R
              </div>
              <span className="font-display text-sm text-surface-800 font-bold">RETAIND</span>
              <span className="text-surface-300 text-xs ml-1">·</span>
              <span className="text-xs text-surface-500">Retain staff. Retain skills. Retain value.</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-surface-400">
              <a href="#" className="hover:text-surface-700 transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="hover:text-surface-700 transition-colors duration-200">
                Terms
              </a>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
