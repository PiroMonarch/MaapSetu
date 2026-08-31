import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Search, Bell, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Reports', href: '/reports' },
    { name: 'Instruments', href: '/instruments' },
    { name: 'Rules', href: '/rules' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-warm-ivory selection:bg-electric-lime">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-warm-ivory/80 backdrop-blur-md border-b-2 border-near-black/10">
        <div className="max-w-screen-2xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <NavLink to="/" className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-near-black" />
              <span className="text-2xl font-heading font-bold tracking-tight uppercase">MaapSetu</span>
            </NavLink>
            
            <nav className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'text-sm font-bold uppercase tracking-wider transition-colors',
                      isActive ? 'text-near-black border-b-2 border-electric-lime py-1' : 'text-near-black/50 hover:text-near-black'
                    )
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-0 top-1.5 h-5 w-5 text-near-black/40 group-focus-within:text-near-black transition-colors" />
              <input 
                type="text" 
                placeholder="SEARCH..." 
                className="bg-transparent border-b-2 border-near-black/20 focus:border-near-black pl-8 pr-4 py-1 text-sm font-bold placeholder:text-near-black/40 outline-none w-48 focus:w-64 transition-all"
              />
            </div>
            <NavLink to="/notifications" className="text-near-black/50 hover:text-near-black transition-colors relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-signal-orange rounded-full border-2 border-warm-ivory"></span>
            </NavLink>
            <NavLink to="/profile" className="h-10 w-10 bg-industrial-blue text-warm-ivory flex items-center justify-center font-bold rounded-full cursor-pointer hover:ring-2 hover:ring-electric-lime hover:ring-offset-2 hover:ring-offset-warm-ivory transition-all">
              AS
            </NavLink>
          </div>

          <button 
            className="lg:hidden text-near-black"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden fixed inset-0 z-40 bg-warm-ivory pt-24 px-6"
        >
          <nav className="flex flex-col gap-6 text-2xl font-heading font-bold uppercase tracking-tight">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'border-b-2 pb-4',
                    isActive ? 'border-electric-lime text-near-black' : 'border-near-black/10 text-near-black/50'
                  )
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full relative">
        <Outlet />
      </main>
    </div>
  );
}
