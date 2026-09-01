import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Search, Bell, Menu, X, LayoutDashboard, FileText, Settings2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const user = useAppStore(state => state.user);

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Instruments', href: '/instruments', icon: Settings2 },
    { name: 'Rules', href: '/rules', icon: Wrench },
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AS';

  return (
    <div className="flex flex-col min-h-screen bg-warm-ivory">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-warm-ivory/90 backdrop-blur-md border-b border-near-black/8">
        <div className="max-w-screen-2xl mx-auto px-5 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-10 shrink-0">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 bg-near-black rounded-lg flex items-center justify-center group-hover:bg-industrial-blue transition-colors">
                <Scale className="h-4.5 w-4.5 text-electric-lime" style={{ width: '18px', height: '18px' }} />
              </div>
              <span className="text-base font-heading font-bold tracking-tight text-near-black">MaapSetu</span>
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-near-black text-warm-ivory'
                        : 'text-near-black/60 hover:text-near-black hover:bg-near-black/6'
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-near-black/35 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 pl-8.5 pr-4 text-sm bg-near-black/5 rounded-lg border border-transparent focus:border-near-black/15 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-electric-lime/40 placeholder:text-near-black/35 transition-all w-44 focus:w-56"
                style={{ paddingLeft: '34px' }}
              />
            </div>

            {/* Notifications */}
            <NavLink
              to="/notifications"
              className="relative h-9 w-9 flex items-center justify-center rounded-lg text-near-black/50 hover:text-near-black hover:bg-near-black/6 transition-all"
            >
              <Bell className="h-4.5 w-4.5" style={{ width: '18px', height: '18px' }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-signal-orange rounded-full border-2 border-warm-ivory" />
            </NavLink>

            {/* Divider */}
            <div className="w-px h-6 bg-near-black/10 mx-1" />

            {/* Profile */}
            <NavLink
              to="/profile"
              className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-lg hover:bg-near-black/6 transition-all cursor-pointer"
            >
              <div className="h-8 w-8 bg-industrial-blue text-warm-ivory flex items-center justify-center font-bold text-xs rounded-lg shrink-0">
                {initials}
              </div>
              <span className="text-sm font-medium text-near-black/70 max-w-[100px] truncate">
                {user?.name || 'Inspector'}
              </span>
            </NavLink>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-near-black/8 text-near-black transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden fixed inset-0 z-40 bg-warm-ivory/98 backdrop-blur-md pt-20"
          >
            <div className="px-5 py-6 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all',
                      isActive
                        ? 'bg-near-black text-warm-ivory'
                        : 'text-near-black/60 hover:text-near-black hover:bg-near-black/6'
                    )
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}

              <div className="pt-4 mt-4 border-t border-near-black/8 flex items-center gap-3 px-4">
                <div className="h-10 w-10 bg-industrial-blue text-warm-ivory flex items-center justify-center font-bold text-sm rounded-xl shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-near-black">{user?.name || 'Inspector'}</p>
                  <p className="text-xs text-near-black/40">{user?.email || ''}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full relative">
        <Outlet />
      </main>
    </div>
  );
}
