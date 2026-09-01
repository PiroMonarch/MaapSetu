import React from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'warning',
    title: 'Class II Threshold Update',
    message: 'New MPE thresholds for Class II instruments are active from January 2026. Review your pending drafts.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'success',
    title: 'Report Finalized',
    message: 'Evaluation APP-2026-001 has been successfully finalized and is ready for download.',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'Welcome to MaapSetu',
    message: 'Your account is set up and ready. Start by registering your instruments or creating a new evaluation.',
    time: '3 days ago',
    read: true,
  },
];

const typeConfig = {
  warning: { icon: AlertTriangle, color: 'text-signal-orange', bg: 'bg-signal-orange/10', badge: 'warning' as const },
  success: { icon: CheckCircle2, color: 'text-emerald', bg: 'bg-emerald/10', badge: 'success' as const },
  info: { icon: Info, color: 'text-industrial-blue', bg: 'bg-industrial-blue/10', badge: 'info' as const },
};

export function Notifications() {
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="flex-1 flex flex-col max-w-screen-md mx-auto w-full px-5 py-8 lg:px-10 page-enter">

      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-bold text-near-black tracking-tight">Notifications</h1>
          {unread > 0 && (
            <Badge variant="warning" dot>{unread} new</Badge>
          )}
        </div>
        {unread > 0 && (
          <button className="flex items-center gap-1.5 text-xs font-medium text-near-black/50 hover:text-near-black transition-colors">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* ── List ─────────────────────────────────────── */}
      <div className="glass-surface rounded-2xl overflow-hidden">
        {MOCK_NOTIFICATIONS.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <div className="h-14 w-14 rounded-2xl bg-near-black/5 flex items-center justify-center">
              <Bell className="h-7 w-7 text-near-black/25" />
            </div>
            <p className="text-sm font-medium text-near-black/40">You're all caught up</p>
            <p className="text-xs text-near-black/25">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-near-black/6">
            {MOCK_NOTIFICATIONS.map(notif => {
              const cfg = typeConfig[notif.type as keyof typeof typeConfig];
              const Icon = cfg.icon;
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-near-black/3 cursor-pointer ${!notif.read ? 'bg-electric-lime/3' : ''}`}
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-near-black">{notif.title}</p>
                      {!notif.read && <Badge variant={cfg.badge} dot>New</Badge>}
                    </div>
                    <p className="text-xs text-near-black/55 mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-near-black/30 mt-2 font-medium">{notif.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
