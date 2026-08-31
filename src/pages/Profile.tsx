import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

export function Profile() {
  const { user, setUser } = useAppStore();

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="flex flex-col min-h-full max-w-screen-md mx-auto w-full px-6 py-12 lg:px-20">
      <div className="flex justify-between items-end mb-12 border-b-4 border-near-black pb-8">
        <div>
          <h1 className="text-6xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-none mb-4 flex items-center gap-6">
            <User className="h-16 w-16" /> Profile
          </h1>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-xs font-bold text-near-black/40 uppercase tracking-widest mb-2">Name</p>
          <p className="text-2xl font-bold">{user?.name || 'Inspector'}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-near-black/40 uppercase tracking-widest mb-2">Email</p>
          <p className="text-xl font-mono">{user?.email || 'inspector@maapsetu.gov'}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-near-black/40 uppercase tracking-widest mb-2">Role</p>
          <div className="inline-block px-4 py-2 bg-industrial-blue/10 text-industrial-blue font-bold uppercase tracking-wider text-sm">
            {'Inspector'}
          </div>
        </div>
        
        <div className="pt-8 border-t-2 border-near-black/10">
          <Button onClick={handleLogout} className="w-full bg-red-500 text-white hover:bg-red-600 h-14 text-lg">
            <LogOut className="mr-2 h-5 w-5" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
