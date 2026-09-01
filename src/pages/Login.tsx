import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label, FormGroup } from '@/components/ui/Form';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';

export function Login() {
  const navigate = useNavigate();
  const setUser = useAppStore(state => state.setUser);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const user = await res.json();
        setUser(user);
        navigate('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid email or password.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory text-near-black font-sans">
      {/* ── Left branding panel ─────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col bg-near-black text-warm-ivory relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-electric-lime/8 blur-[80px] rounded-full" />
        <div className="absolute bottom-1/4 -left-16 w-64 h-64 bg-industrial-blue/20 blur-[80px] rounded-full" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-electric-lime rounded-xl flex items-center justify-center">
              <Scale className="h-5 w-5 text-near-black" />
            </div>
            <span className="text-lg font-heading font-bold tracking-tight">MaapSetu</span>
          </div>

          {/* Hero text */}
          <div className="max-w-sm">
            <h1 className="text-4xl font-heading font-bold tracking-tight leading-tight mb-4">
              India's digital<br />
              metrology platform.
            </h1>
            <p className="text-warm-ivory/60 text-sm leading-relaxed">
              Digitise your NAWI testing workflow — from instrument setup to OIML R&nbsp;76 compliant report generation.
            </p>

            {/* Feature bullets */}
            <ul className="mt-8 space-y-3">
              {[
                'Structured 5-step evaluation wizard',
                'Auto-calculated MPE & error corrections',
                'Compliance-ready PDF export',
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-warm-ivory/75">
                  <span className="h-5 w-5 rounded-full bg-electric-lime/20 border border-electric-lime/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-3 w-3 text-electric-lime" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-xs text-warm-ivory/25">
            © 2026 MaapSetu · Authorized Laboratories Only
          </p>
        </div>
      </div>

      {/* ── Right login panel ───────────────────── */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-9 w-9 bg-near-black rounded-xl flex items-center justify-center">
              <Scale className="h-5 w-5 text-electric-lime" />
            </div>
            <span className="text-lg font-heading font-bold tracking-tight">MaapSetu</span>
          </div>

          <h2 className="text-2xl font-heading font-bold text-near-black mb-1">
            Sign in to your account
          </h2>
          <p className="text-sm text-near-black/50 mb-8">
            Enter your credentials to access the platform.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red/8 border border-red/20 text-red text-sm font-medium">
                <span className="shrink-0 text-base">⚠️</span>
                {error}
              </div>
            )}

            <FormGroup>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@lab.gov.in"
                defaultValue="inspector@maapsetu.com"
              />
            </FormGroup>

            <FormGroup>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="mb-0">Password</Label>
                <a href="#" className="text-xs font-medium text-industrial-blue hover:text-electric-lime transition-colors">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                defaultValue="password123"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="cursor-pointer text-near-black/40 hover:text-near-black transition-colors pointer-events-auto"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </FormGroup>

            <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          {/* Demo hint */}
          <p className="mt-6 text-center text-xs text-near-black/35">
            Demo: <span className="font-mono">inspector@maapsetu.com</span> / <span className="font-mono">password123</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
