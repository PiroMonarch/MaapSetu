import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Search, Filter, ArrowRight, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ReportRepository() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col min-h-full max-w-screen-2xl mx-auto w-full px-6 py-12 lg:px-20">
      
      {/* Huge Editorial Header */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-near-black pb-8">
        <div>
          <h1 className="text-[10vw] sm:text-[8vw] lg:text-[6vw] font-heading font-bold uppercase tracking-tighter leading-[0.85] text-near-black">
            Your <br/>
            <span className="text-industrial-blue">Evaluations.</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-0 top-3.5 h-6 w-6 text-near-black/40" />
            <Input placeholder="SEARCH REPORTS..." className="pl-10 text-xl font-bold font-heading uppercase" />
          </div>
        </div>
      </div>

      {/* Editorial Table Replacement */}
      <div className="flex-1 space-y-0">
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 pb-4 border-b-2 border-near-black/20 text-xs font-bold uppercase tracking-widest text-near-black/50">
          <div className="col-span-2">App No</div>
          <div className="col-span-4">Instrument</div>
          <div className="col-span-2">Class</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {reports.map((report) => (
          <div 
            key={report._id} 
            onClick={() => navigate(`/reports/new?id=${report._id}`)}
            className="group grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-6 border-b border-near-black/10 hover:bg-near-black hover:text-warm-ivory transition-all cursor-pointer"
          >
            <div className="lg:col-span-2 font-mono text-sm font-bold text-near-black/50 group-hover:text-electric-lime transition-colors">
              {report.applicationNo}
            </div>
            
            <div className="lg:col-span-4">
              <div className="text-2xl font-bold uppercase tracking-tight">{report.instrumentId?.model || 'Unknown'}</div>
              <div className="text-sm font-medium opacity-80 mt-1">{report.instrumentId?.manufacturer || 'Unknown'}</div>
            </div>
            
            <div className="lg:col-span-2 font-mono font-bold">
              {report.instrumentId?.accuracyClass ? `Class ${report.instrumentId.accuracyClass}` : '-'}
            </div>
            
            <div className="lg:col-span-2 font-mono text-sm opacity-60">
              {report.date?.split('T')[0] || new Date(report.createdAt).toISOString().split('T')[0]}
            </div>
            
            <div className="lg:col-span-2 flex justify-end">
              <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${report.status === 'Completed' ? 'bg-emerald/10 text-emerald' : 'bg-industrial-blue/10 text-industrial-blue'} group-hover:bg-transparent group-hover:border-2 group-hover:border-warm-ivory group-hover:text-warm-ivory transition-all`}>
                {report.status}
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="py-12 text-center text-near-black/50 font-bold uppercase tracking-widest">No reports found</div>
        )}
      </div>
    </div>
  );
}
