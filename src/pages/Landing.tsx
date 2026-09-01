import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowDown, Scale, ShieldCheck, BarChart3, FileText, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  {
    icon: Scale,
    title: 'Structured Evaluation',
    desc: 'Guided 5-step wizard walks you through each test phase — from setup to final report.',
    color: 'bg-industrial-blue/10 text-industrial-blue',
  },
  {
    icon: ShieldCheck,
    title: 'OIML R 76 Compliant',
    desc: 'All calculations locked to OIML R 76 standards. MPE thresholds are auto-generated.',
    color: 'bg-emerald/10 text-emerald',
  },
  {
    icon: BarChart3,
    title: 'Live Error Tracking',
    desc: 'Real-time pass/fail determination as you enter readings. Zero manual calculations.',
    color: 'bg-signal-orange/10 text-signal-orange',
  },
  {
    icon: FileText,
    title: 'Instant PDF Reports',
    desc: 'Generate compliance-ready NAWI test reports with one click — signed and traceable.',
    color: 'bg-accent-purple/10 text-accent-purple',
  },
];

const WORKFLOW = [
  { num: '01', title: 'Register Instrument', desc: 'Add your weighing instrument with all metrological specs.' },
  { num: '02', title: 'Set Up Evaluation', desc: 'Enter application details, test date and assign an inspector.' },
  { num: '03', title: 'Run Tests', desc: 'Enter load readings. The system calculates errors instantly.' },
  { num: '04', title: 'Generate Report', desc: 'Export a compliance-ready PDF or finalise digitally.' },
];

export function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <div className="bg-warm-ivory min-h-screen text-near-black font-sans overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between border-b border-near-black/8 bg-warm-ivory/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-near-black rounded-lg flex items-center justify-center">
            <Scale className="h-4 w-4 text-electric-lime" />
          </div>
          <span className="text-base font-heading font-bold tracking-tight text-near-black">MaapSetu</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
            Login
          </Button>
          <Button size="sm" onClick={() => navigate('/dashboard')}>
            Enter App <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-20 pt-24 overflow-hidden">
        {/* bg blobs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-electric-lime/15 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-industrial-blue/10 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        <motion.div style={{ opacity: opacityHero }} className="relative z-10 max-w-2xl">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-industrial-blue/8 border border-industrial-blue/15 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-lime animate-pulse" />
            <span className="text-xs font-semibold text-industrial-blue uppercase tracking-widest">
              India's Digital Metrology Platform
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-bold tracking-tight leading-[1.05] text-near-black mb-6">
            Measure Right.<br />
            <span className="text-industrial-blue">Report Right.</span>
          </h1>

          <p className="text-lg text-near-black/65 leading-relaxed mb-10 max-w-lg">
            MaapSetu transforms paper-based NAWI testing into a fast, traceable digital workflow — from observations to compliance-ready OIML R&nbsp;76 reports.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate('/reports/new')}>
              Start an Evaluation <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
              Open Dashboard
            </Button>
          </div>
        </motion.div>

        {/* Hero image */}
        <motion.div
          className="absolute right-0 top-1/4 w-1/2 h-[60%] pointer-events-none hidden md:block"
          style={{ y: yBg }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200"
            alt="Industrial measurement"
            className="w-full h-full object-cover object-left rounded-l-[60px] opacity-75"
            style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
          />
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-near-black/30 flex flex-col items-center gap-1.5"
        >
          <ArrowDown className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
        </motion.div>
      </section>

      {/* ── Features ──────────────────────────────── */}
      <section className="py-24 px-6 lg:px-20 bg-near-black text-warm-ivory">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
              Built for precision.<br />
              <span className="text-electric-lime">Designed for speed.</span>
            </h2>
            <p className="text-warm-ivory/55 max-w-lg mx-auto text-base leading-relaxed">
              Every feature engineered for the realities of NAWI compliance testing in India.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-warm-ivory/5 border border-warm-ivory/8 rounded-2xl p-6 hover:bg-warm-ivory/8 transition-colors"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-heading font-bold text-warm-ivory mb-2">{f.title}</h3>
                <p className="text-sm text-warm-ivory/55 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ──────────────────────────── */}
      <section className="py-24 px-6 lg:px-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-near-black mb-3">
              How it works
            </h2>
            <p className="text-near-black/50 max-w-md mx-auto text-sm leading-relaxed">
              From instrument setup to signed PDF — in four straightforward steps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKFLOW.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < WORKFLOW.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-near-black/10 z-0 -translate-y-1/2" style={{ width: 'calc(100% - 2.5rem)', left: '2.5rem' }} />
                )}
                <div className="glass-surface rounded-2xl p-6 relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-near-black text-electric-lime flex items-center justify-center font-mono font-bold text-sm mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-sm font-heading font-bold text-near-black mb-2">{step.title}</h3>
                  <p className="text-xs text-near-black/50 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem Statement ─────────────────────── */}
      <section className="py-24 px-6 lg:px-20 bg-near-black text-warm-ivory">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-6 leading-tight">
              Testing is still<br />
              too manual.
            </h2>
            <div className="space-y-4">
              {[
                'Paper forms with handwritten measurements',
                'Manual error calculations prone to mistakes',
                'Missing audit trails and traceability gaps',
                'Filing cabinets instead of searchable records',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-warm-ivory/65">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal-orange shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-industrial-blue rounded-2xl p-8">
            <h3 className="text-xl font-heading font-bold mb-6 text-warm-ivory">The MaapSetu Difference</h3>
            <div className="space-y-5">
              {[
                'Structured digital forms replace paper',
                'Instant MPE compliance calculation',
                'Immutable digital audit trail',
                'Central repository with search & filter',
              ].map((item, i) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-electric-lime/15 border border-electric-lime/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-electric-lime" />
                  </div>
                  <p className="text-sm text-warm-ivory/80 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-near-black mb-4">
            One workflow.<br />Zero paper chaos.
          </h2>
          <p className="text-near-black/50 mb-8 text-sm leading-relaxed">
            Join inspection labs across India digitising their NAWI compliance workflow with MaapSetu.
          </p>
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            Open Command Centre <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="border-t border-near-black/8 px-6 py-8 text-center">
        <p className="text-xs text-near-black/30">© 2026 MaapSetu · India's Digital Metrology Platform · Authorized Laboratories Only</p>
      </footer>
    </div>
  );
}
