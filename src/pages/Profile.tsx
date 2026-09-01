import React from 'react';
import { User, LogOut, Mail, Shield, Building2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';

export function Profile() {
  const { user, setUser } = useAppStore();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AS';

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col max-w-screen-sm mx-auto w-full px-5 py-8 lg:px-10 page-enter">
      <h1 className="text-2xl font-heading font-bold text-near-black mb-6 tracking-tight">Profile</h1>

      {/* Avatar card */}
      <div className="glass-surface rounded-2xl p-6 mb-4 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-industrial-blue text-warm-ivory flex items-center justify-center font-bold text-xl font-heading shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-lg font-heading font-bold text-near-black">{user?.name || 'Inspector'}</p>
          <p className="text-sm text-near-black/50 mt-0.5">{user?.email || 'inspector@maapsetu.gov'}</p>
          <Badge variant="info" dot className="mt-2">Inspector</Badge>
        </div>
      </div>

      {/* Info rows */}
      <div className="glass-surface rounded-2xl overflow-hidden mb-4 divide-y divide-near-black/6">
        {[
          { icon: User, label: 'Full Name', value: user?.name || 'Inspector' },
          { icon: Mail, label: 'Email', value: user?.email || 'inspector@maapsetu.gov' },
          { icon: Shield, label: 'Role', value: 'Inspector' },
          { icon: Building2, label: 'Organisation', value: 'MaapSetu Lab' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-6 py-4">
            <div className="h-8 w-8 rounded-lg bg-near-black/6 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-near-black/50" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-medium text-near-black mt-0.5 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <Button variant="danger" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
