import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, ChevronRight, FileText, SlidersHorizontal, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function statusVariant(status: string): 'success' | 'info' | 'warning' | 'error' | 'default' {
  if (status === 'Completed') return 'success';
  if (status === 'Draft') return 'info';
  if (status === 'Review') return 'warning';
  if (status === 'Failed') return 'error';
  return 'default';
}

export function ReportRepository() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => { setReports(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDownloadPDF = async (e: React.MouseEvent, report: any) => {
    e.stopPropagation();
    setDownloadingId(report._id);
    try {
      const res = await fetch(`/api/reports/${report._id}/pdf`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NAWI-Report-${report.applicationNo || report._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed.');
    } finally {
      setDownloadingId(null);
    }
  };

  const statuses = ['All', 'Draft', 'Completed', 'Review', 'Failed'];

  const filtered = reports.filter(r => {
    const matchesStatus = filter === 'All' || r.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (r.applicationNo || '').toLowerCase().includes(q) ||
      (r.instrumentId?.model || '').toLowerCase().includes(q) ||
      (r.instrumentId?.manufacturer || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col max-w-screen-2xl mx-auto w-full px-5 py-8 lg:px-10 page-enter">

      {/* ── Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-near-black tracking-tight">Evaluations</h1>
          <p className="text-sm text-near-black/45 mt-0.5">{reports.length} total report{reports.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => navigate('/reports/new')} size="md">
          <Plus className="h-4 w-4" /> New Evaluation
        </Button>
      </div>

      {/* ── Filters ─────────────────────────────────── */}
      <div className="glass-surface rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-near-black/35 pointer-events-none" />
          <Input
            placeholder="Search by application no, instrument, manufacturer…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '34px' }}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <SlidersHorizontal className="h-4 w-4 text-near-black/35 shrink-0 mr-1" />
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filter === s
                ? 'bg-near-black text-warm-ivory'
                : 'text-near-black/50 hover:text-near-black hover:bg-near-black/6'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────── */}
      <div className="glass-surface rounded-2xl overflow-hidden flex-1">
        {/* Table header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-near-black/8 bg-near-black/3">
          <div className="col-span-2 text-xs font-semibold text-near-black/40 uppercase tracking-wider">App No</div>
          <div className="col-span-4 text-xs font-semibold text-near-black/40 uppercase tracking-wider">Instrument</div>
          <div className="col-span-2 text-xs font-semibold text-near-black/40 uppercase tracking-wider">Class</div>
          <div className="col-span-2 text-xs font-semibold text-near-black/40 uppercase tracking-wider">Date</div>
          <div className="col-span-2 text-xs font-semibold text-near-black/40 uppercase tracking-wider text-right">Status</div>
        </div>

        <div className="divide-y divide-near-black/6">
          {loading && (
            <div className="py-20 text-center text-sm text-near-black/30 animate-pulse">Loading…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="py-20 flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-xl bg-near-black/5 flex items-center justify-center">
                <FileText className="h-6 w-6 text-near-black/25" />
              </div>
              <p className="text-sm font-medium text-near-black/40">
                {search || filter !== 'All' ? 'No matching reports found' : 'No reports yet'}
              </p>
              {!search && filter === 'All' && (
                <Button variant="subtle" size="sm" onClick={() => navigate('/reports/new')}>
                  <Plus className="h-3.5 w-3.5" /> Create first evaluation
                </Button>
              )}
            </div>
          )}
          {filtered.map((report, idx) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => navigate(`/reports/new?id=${report._id}`)}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-3 items-center px-6 py-4 hover:bg-near-black/3 transition-colors cursor-pointer"
            >
              <div className="lg:col-span-2">
                <span className="font-mono text-xs font-semibold text-near-black/40 group-hover:text-near-black/60 transition-colors">
                  {report.applicationNo || '—'}
                </span>
              </div>
              <div className="lg:col-span-4">
                <p className="text-sm font-semibold text-near-black truncate">{report.instrumentId?.model || 'Unknown'}</p>
                <p className="text-xs text-near-black/40 mt-0.5">{report.instrumentId?.manufacturer || '—'}</p>
              </div>
              <div className="lg:col-span-2">
                <span className="text-xs font-mono font-semibold text-near-black/60">
                  {report.instrumentId?.accuracyClass ? `Class ${report.instrumentId.accuracyClass}` : '—'}
                </span>
              </div>
              <div className="lg:col-span-2">
                <span className="text-xs text-near-black/40 font-medium">
                  {(report.date || report.createdAt)?.split('T')[0] || '—'}
                </span>
              </div>
              <div className="lg:col-span-2 flex justify-end items-center gap-2">
                <Badge variant={statusVariant(report.status)} dot>{report.status}</Badge>
                <button
                  onClick={(e) => handleDownloadPDF(e, report)}
                  disabled={downloadingId === report._id}
                  title="Download PDF"
                  className="p-1.5 rounded-lg text-near-black/30 hover:text-near-black/70 hover:bg-near-black/8 transition-colors disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                <ChevronRight className="h-4 w-4 text-near-black/20 group-hover:text-near-black/50 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
