import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label, FormGroup } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/store';

export function Login() {
  const navigate = useNavigate();
  const setUser = useAppStore(state => state.setUser);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const user = await res.json();
        setUser(user);
        navigate('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="flex min-h-screen bg-warm-ivory text-near-black font-sans selection:bg-electric-lime">
      {/* Left Panel - Editorial Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-near-black text-warm-ivory p-12 relative overflow-hidden">
        
        {/* Abstract 3D / Lighting effect placeholder */}
        <div className="absolute right-0 top-1/4 w-full h-full bg-industrial-blue/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute -left-20 bottom-0 w-96 h-96 bg-electric-lime/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Scale className="h-8 w-8 text-electric-lime" />
            <span className="text-2xl font-heading font-bold tracking-tight uppercase">MaapSetu</span>
          </div>

          <div className="max-w-lg mt-20">
            <h1 className="text-[5vw] lg:text-[4vw] font-heading font-bold tracking-tighter mb-6 leading-[0.85] uppercase">
              Precision in <br/>
              every measurement.
            </h1>
            <p className="text-xl font-medium text-warm-ivory/70 leading-relaxed border-l-4 border-electric-lime pl-4">
              Digital NAWI testing, compliance evaluation and structured OIML R 76 report generation.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <Scale className="h-8 w-8 text-near-black" />
            <span className="text-3xl font-heading font-bold tracking-tight uppercase">MaapSetu</span>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-heading font-bold uppercase tracking-tighter text-near-black">
              Sign In.
            </h2>
            <p className="text-base font-bold text-near-black/50 mt-2 uppercase tracking-widest">
              Authorized Laboratories Only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {error && <div className="text-red-500 font-bold mb-4">{error}</div>}
            <FormGroup>
              <Label htmlFor="email">Official Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue="inspector@maapsetu.com"
              />
            </FormGroup>

            <FormGroup>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <div className="text-xs font-bold uppercase tracking-widest">
                  <a href="#" className="text-industrial-blue hover:text-electric-lime transition-colors">
                    Reset?
                  </a>
                </div>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                defaultValue="password123"
              />
            </FormGroup>

            <Button type="submit" className="w-full" size="lg">
              Enter Platform <CheckCircle2 className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
