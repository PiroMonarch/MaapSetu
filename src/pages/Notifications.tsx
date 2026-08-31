import React from 'react';
import { Bell } from 'lucide-react';

export function Notifications() {
  return (
    <div className="flex flex-col min-h-full max-w-screen-2xl mx-auto w-full px-6 py-12 lg:px-20">
      <div className="flex justify-between items-end mb-12 border-b-4 border-near-black pb-8">
        <div>
          <h1 className="text-6xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-none mb-4 flex items-center gap-6">
            <Bell className="h-16 w-16" /> Notifications
          </h1>
          <p className="text-xl md:text-2xl font-medium text-near-black/70 border-l-4 border-electric-lime pl-6 max-w-2xl">
            Recent updates, alerts, and system messages.
          </p>
        </div>
      </div>

      <div className="flex-1">
        <div className="py-12 text-center text-near-black/50 font-bold uppercase tracking-widest border-2 border-dashed border-near-black/20 p-12">
          No new notifications
        </div>
      </div>
    </div>
  );
}
