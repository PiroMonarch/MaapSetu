import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Plus, ChevronRight, BarChart3, Clock, CheckCircle2,
  AlertCircle, TrendingUp, XCircle, Eye, ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from 'recharts';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Stats {
  total: number;
  draft: number;
  inProgress: number;
  completed: number;
  failed: number;
  underReview: number;
  monthlyData: { month: string; total: number; passed: number; failed: number }[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function statusVariant(status: string): 'success' | 'info' | 'warning' | 'error' | 'default' {
  if (status === 'Completed') return 'success';
  if (status === 'In Progress') return 'info';
  if (status === 'Under Review') return 'warning';
  if (status === 'Failed') return 'error';
  return 'default';
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, iconBg, icon: Icon, delay = 0,
}: {
  label: string; value: number | string; sub?: string;
  iconBg: string; icon: React.ElementType; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-surface rounded-2xl p-5 flex flex-col gap-3 card-hover"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-near-black/50 uppercase tracking-wider">{label}</p>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="text-4xl font-heading font-bold text-near-black tabular-nums">{value}</p>
        {sub && <p className="text-xs text-near-black/35 mt-0.5 font-medium">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const user = useAppStore(s => s.user);
  const dashKey = useAppStore(s => s.dashboardKey);

  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.json()),
      fetch('/api/reports').then(r => r.json()),
    ]).then(([s, r]) => {
      setStats(s);
      setReports(r);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [dashKey]);

  const firstName = user?.name?.split(' ')[0] || 'Inspector';

  // Pie data
  const pieData = stats ? [
    { name: 'Completed', value: stats.completed, fill: '#159A70' },
    { name: 'In Progress', value: stats.inProgress, fill: '#123B5D' },
    { name: 'Draft', value: stats.draft, fill: '#9CA3AF' },
    { name: 'Failed', value: stats.failed, fill: '#E05252' },
    { name: 'Under Review', value: stats.underReview, fill: '#FF7043' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="flex-1 flex flex-col max-w-screen-2xl mx-auto w-full px-5 py-8 lg:px-10 page-enter">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-near-black/45 font-medium">{getGreeting()}</p>
          <h1 className="text-2xl font-heading font-bold text-near-black tracking-tight">
            {firstName} <span className="text-near-black/20">·</span>{' '}
            <span className="text-industrial-blue">Overview</span>
          </h1>
        </div>
        <Button onClick={() => navigate('/reports/new')} size="md">
          <Plus className="h-4 w-4" /> New Evaluation
        </Button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Reports" value={stats?.total ?? '—'} sub="All time" iconBg="bg-near-black/8 text-near-black/60" icon={BarChart3} delay={0} />
        <StatCard label="Draft" value={stats?.draft ?? '—'} sub="Not submitted" iconBg="bg-near-black/8 text-near-black/40" icon={Clock} delay={0.05} />
        <StatCard label="In Progress" value={stats?.inProgress ?? '—'} sub="Active" iconBg="bg-industrial-blue/10 text-industrial-blue" icon={TrendingUp} delay={0.10} />
        <StatCard label="Completed" value={stats?.completed ?? '—'} sub="Passed OIML R76" iconBg="bg-emerald/10 text-emerald" icon={CheckCircle2} delay={0.15} />
        <StatCard label="Failed / Review" value={(stats?.failed ?? 0) + (stats?.underReview ?? 0)} sub="Needs attention" iconBg="bg-red/10 text-red" icon={XCircle} delay={0.20} />
      </div>

      {/* ── Charts + Recent ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Monthly Activity Chart */}
        <div className="lg:col-span-2 glass-surface rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-base font-heading font-bold text-near-black">Monthly Activity</p>
              <p className="text-xs text-near-black/40 mt-0.5">Last 6 months — evaluations created</p>
            </div>
          </div>
          {loading || !stats?.monthlyData?.length ? (
            <div className="h-40 flex items-center justify-center text-near-black/25 text-sm">
              {loading ? 'Loading…' : 'No data yet'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.monthlyData} barSize={28} barGap={4}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }}
                  cursor={{ fill: 'rgba(16,18,20,0.04)' }}
                />
                <Bar dataKey="passed" name="Passed" fill="#159A70" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" name="Failed" fill="#E05252" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Breakdown Pie */}
        <div className="glass-surface rounded-2xl p-5">
          <p className="text-base font-heading font-bold text-near-black mb-1">Status Breakdown</p>
          <p className="text-xs text-near-black/40 mb-4">Distribution of all reports</p>
          {loading || !pieData.length ? (
            <div className="h-40 flex items-center justify-center text-near-black/25 text-sm">
              {loading ? 'Loading…' : 'No data yet'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3}>
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Reports */}
        <div className="lg:col-span-2 glass-surface rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-near-black/8">
            <p className="text-sm font-heading font-bold text-near-black">Recent Evaluations</p>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-semibold text-near-black/40 hover:text-near-black transition-colors flex items-center gap-1"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-near-black/6">
            {loading && (
              <div className="py-12 text-center text-near-black/25 text-sm animate-pulse">Loading…</div>
            )}
            {!loading && reports.length === 0 && (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-near-black/5 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-near-black/20" />
                </div>
                <p className="text-sm text-near-black/35">No evaluations yet</p>
                <Button variant="subtle" size="sm" onClick={() => navigate('/reports/new')}>
                  <Plus className="h-3.5 w-3.5" /> Start first
                </Button>
              </div>
            )}
            {reports.slice(0, 6).map(item => (
              <div
                key={item._id}
                onClick={() => navigate(`/reports/new?id=${item._id}`)}
                className="group flex items-center justify-between px-6 py-3.5 hover:bg-near-black/3 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-industrial-blue/8 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 text-industrial-blue" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-near-black truncate">
                      {item.instrumentId?.manufacturer} · {item.instrumentId?.model || 'Unknown'}
                    </p>
                    <p className="text-xs text-near-black/35 font-mono mt-0.5">{item.applicationNo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Badge variant={statusVariant(item.status)} dot>{item.status}</Badge>
                  <ChevronRight className="h-3.5 w-3.5 text-near-black/20 group-hover:text-near-black/50 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Panel */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="glass-surface rounded-2xl p-5">
            <p className="text-sm font-heading font-bold text-near-black mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: 'New Evaluation', desc: 'Start a NAWI R76 test', href: '/reports/new', accent: 'bg-electric-lime/15 border-electric-lime/25' },
                { label: 'View Reports', desc: 'Browse all test records', href: '/reports', accent: 'bg-near-black/5 border-near-black/10' },
                { label: 'Add Instrument', desc: 'Register new equipment', href: '/instruments', accent: 'bg-near-black/5 border-near-black/10' },
                { label: 'OIML Rules', desc: 'View compliance rules', href: '/rules', accent: 'bg-industrial-blue/8 border-industrial-blue/15' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left hover:opacity-75 transition-opacity ${item.accent}`}
                >
                  <div>
                    <p className="text-xs font-semibold text-near-black">{item.label}</p>
                    <p className="text-xs text-near-black/45 mt-0.5">{item.desc}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-near-black/30 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="rounded-2xl bg-industrial-blue p-5 text-warm-ivory">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <AlertCircle className="h-3.5 w-3.5 text-electric-lime" />
              </div>
              <div>
                <p className="text-xs font-bold">Compliance Notice</p>
                <p className="text-xs text-warm-ivory/50 mt-0.5">2026 Class II update</p>
              </div>
            </div>
            <p className="text-xs text-warm-ivory/65 leading-relaxed mb-4">
              Updated MPE thresholds for Class II instruments are active. Review pending evaluations.
            </p>
            <Button variant="outline" size="sm" className="w-full border-warm-ivory/20 text-warm-ivory hover:bg-white/10">
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
