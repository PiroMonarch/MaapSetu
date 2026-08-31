import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowDown } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="bg-warm-ivory min-h-screen text-near-black font-sans selection:bg-electric-lime selection:text-near-black overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference text-warm-ivory">
        <div className="text-2xl font-heading font-bold uppercase tracking-tighter">MaapSetu</div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-warm-ivory hover:text-electric-lime hidden sm:flex">Login</Button>
          <Button onClick={() => navigate('/dashboard')} className="bg-electric-lime text-near-black hover:bg-white">
            Enter App
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center px-6 lg:px-20 pt-20">
        <motion.div style={{ opacity: opacityHero }} className="relative z-10 max-w-5xl">
          <p className="font-bold text-sm md:text-base uppercase tracking-widest text-near-black/60 mb-6 border-l-2 border-electric-lime pl-4">
            India's Digital Metrology Workflow
          </p>
          <h1 className="text-[12vw] md:text-[8vw] font-heading font-bold leading-[0.85] uppercase tracking-tighter mb-4">
            Measure<br />
            Right.
          </h1>
          <h1 className="text-[12vw] md:text-[8vw] font-heading font-bold leading-[0.85] uppercase tracking-tighter text-industrial-blue">
            Report<br />
            Right.
          </h1>
          
          <div className="mt-12 max-w-lg">
            <p className="text-lg md:text-xl font-medium text-near-black/80 mb-8 leading-relaxed">
              MaapSetu transforms physical NAWI testing into a faster, traceable digital workflow — from observations to compliance-ready reports.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group" onClick={() => navigate('/reports/new')}>
                Start an Evaluation <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                Explore the Platform <ArrowDown className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 3D Representation / Image Placeholder */}
        <motion.div 
          className="absolute right-0 top-1/4 w-full md:w-3/5 h-3/5 md:h-[80%] pointer-events-none opacity-20 md:opacity-100 mix-blend-multiply"
          style={{ y: yBg }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 1, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Abstract representation of a 3D industrial scale */}
          <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-industrial-blue/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="absolute right-10 top-1/4">
            <div className="relative font-mono text-xs font-bold text-industrial-blue">
              <span className="absolute -left-12 top-0 border-t border-industrial-blue w-10"></span>
              MAX 15kg
            </div>
          </div>
          
          <div className="absolute right-40 bottom-1/3">
            <div className="relative font-mono text-xs font-bold text-electric-lime bg-near-black px-2 py-1">
              <span className="absolute -left-20 top-1/2 border-t border-near-black w-16"></span>
              e = 5g
            </div>
          </div>

          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200" 
            alt="Industrial Measurement Equipment" 
            className="w-full h-full object-cover object-left opacity-80 rounded-l-[100px]"
            style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
          />
        </motion.div>
      </section>

      {/* Precision Section */}
      <section className="py-32 px-6 lg:px-20 bg-near-black text-warm-ivory relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-8xl font-heading font-bold uppercase tracking-tighter mb-16">
            Precision you can <span className="text-electric-lime">see.</span>
          </h2>
          
          <div className="relative aspect-[21/9] md:aspect-[21/7] rounded-none overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=2000" 
              alt="Metrology Engineer" 
              className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-24 text-left w-full max-w-5xl px-8">
                <div className="bg-near-black/80 backdrop-blur-md p-6 border-l-4 border-electric-lime">
                  <h3 className="font-heading font-bold text-xl uppercase mb-2">Accuracy</h3>
                  <p className="text-sm text-warm-ivory/70">Calculations locked to OIML R 76 standards.</p>
                </div>
                <div className="bg-near-black/80 backdrop-blur-md p-6 border-l-4 border-signal-orange hidden md:block">
                  <h3 className="font-heading font-bold text-xl uppercase mb-2">Calibration</h3>
                  <p className="text-sm text-warm-ivory/70">Track every test weight and condition.</p>
                </div>
                <div className="bg-near-black/80 backdrop-blur-md p-6 border-l-4 border-electric-lime">
                  <h3 className="font-heading font-bold text-xl uppercase mb-2">Traceability</h3>
                  <p className="text-sm text-warm-ivory/70">Immutable records of every evaluation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem (Editorial) */}
      <section className="py-32 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/2">
            <h2 className="text-[10vw] lg:text-7xl font-heading font-bold uppercase tracking-tighter leading-[0.85] mb-8">
              Testing is<br/>
              still too<br/>
              <span className="text-red">manual.</span>
            </h2>
            <p className="text-xl font-medium text-near-black/80 mb-8 max-w-md leading-relaxed">
              Paper forms. Handwritten measurements. Manual error calculations. Missing audit trails.
            </p>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="aspect-[4/5] bg-industrial-blue p-8 flex flex-col justify-between text-warm-ivory relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-electric-lime/20 blur-3xl rounded-full"></div>
              <h3 className="text-3xl font-heading font-bold uppercase tracking-tight z-10">The Digital Transformation</h3>
              
              <div className="space-y-6 z-10 mt-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center border-2 border-warm-ivory/20 font-bold">01</div>
                  <div className="text-xl font-medium">Paper forms to structured data.</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center border-2 border-electric-lime text-electric-lime font-bold">02</div>
                  <div className="text-xl font-medium">Manual math to instant compliance.</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center border-2 border-warm-ivory/20 font-bold">03</div>
                  <div className="text-xl font-medium">Filing cabinets to central repository.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Story Preview */}
      <section className="py-32 bg-industrial-blue text-warm-ivory text-center px-6">
        <h2 className="text-5xl md:text-8xl font-heading font-bold uppercase tracking-tighter mb-8">
          One Workflow.<br/>
          Zero Paper Chaos.
        </h2>
        <Button size="lg" className="bg-electric-lime text-near-black hover:bg-white mt-8 group" onClick={() => navigate('/dashboard')}>
          Enter the Command Center <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </section>
    </div>
  );
}
