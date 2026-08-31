import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(console.error);
  }, []);

  const total = reports.length;
  const inProgress = reports.filter(r => r.status === 'Draft').length;
  const passed = reports.filter(r => r.status === 'Completed').length;

  return (
    <div className="flex-1 flex flex-col px-6 py-12 lg:px-20 max-w-screen-2xl mx-auto w-full">
      {/* Huge Editorial Hero */}
      <div className="mb-16">
        <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] font-heading font-bold uppercase tracking-tighter leading-[0.85] text-near-black">
          Good Morning,
        </h1>
        <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] font-heading font-bold uppercase tracking-tighter leading-[0.85] text-industrial-blue">
          {user?.name || 'Inspector'}.
        </h1>
        <p className="text-xl md:text-2xl font-medium mt-8 text-near-black/70 border-l-4 border-electric-lime pl-6 max-w-2xl">
          Your testing workspace is moving. 
          <br className="hidden sm:block" />
          Ready to measure right?
        </p>
      </div>

      {/* Metrics Overlay on Photographic/Industrial Canvas */}
      <div className="relative w-full aspect-[4/3] md:aspect-[21/9] bg-near-black overflow-hidden mb-20 group">
        <img 
          src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2000" 
          alt="Laboratory" 
          className="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-near-black to-transparent"></div>
        
        <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between text-warm-ivory">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="border-electric-lime text-electric-lime bg-near-black/50 backdrop-blur-md">
              LIVE METRICS
            </Badge>
            <Button className="bg-electric-lime text-near-black hover:bg-white" onClick={() => navigate('/reports/new')}>
              START EVALUATION <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div>
              <p className="text-electric-lime font-bold text-sm tracking-wider uppercase mb-2">Total Reports</p>
              <p className="text-5xl md:text-7xl font-heading font-bold">{total}</p>
            </div>
            <div>
              <p className="text-industrial-blue-light text-warm-ivory/60 font-bold text-sm tracking-wider uppercase mb-2">In Progress</p>
              <p className="text-5xl md:text-7xl font-heading font-bold">{inProgress}</p>
            </div>
            <div>
              <p className="text-emerald font-bold text-sm tracking-wider uppercase mb-2">Completed</p>
              <p className="text-5xl md:text-7xl font-heading font-bold">{passed}</p>
            </div>
            <div>
              <p className="text-signal-orange font-bold text-sm tracking-wider uppercase mb-2">Review Required</p>
              <p className="text-5xl md:text-7xl font-heading font-bold">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Recent Work */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8">
          <div className="flex justify-between items-end mb-8 border-b-2 border-near-black pb-4">
            <h2 className="text-4xl font-heading font-bold uppercase tracking-tight">Recent Work</h2>
            <button 
              onClick={() => navigate('/reports')}
              className="text-sm font-bold uppercase tracking-wider text-near-black/60 hover:text-electric-lime transition-colors">
              View Archive →
            </button>
          </div>

          <div className="space-y-0">
            {reports.slice(0, 5).map((item, idx) => (
              <div key={item._id} onClick={() => navigate(`/reports/new?id=${item._id}`)} className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-near-black/10 hover:bg-near-black hover:text-warm-ivory transition-colors cursor-pointer">
                <div>
                  <div className="font-mono text-sm font-bold text-near-black/50 group-hover:text-warm-ivory/50 mb-1">{item.applicationNo}</div>
                  <div className="text-xl font-bold uppercase">{item.instrumentId?.model || 'Unknown Model'}</div>
                  <div className="text-sm font-medium opacity-80">{item.instrumentId?.manufacturer || 'Unknown'}</div>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-6">
                  <div className={`px-4 py-1 text-xs font-bold uppercase tracking-wider ${item.status === 'Completed' ? 'bg-emerald/10 text-emerald' : 'bg-industrial-blue/10'} group-hover:bg-transparent group-hover:border group-hover:border-warm-ivory group-hover:text-warm-ivory`}>
                    {item.status}
                  </div>
                  <ArrowRight className="h-5 w-5 text-near-black/20 group-hover:text-electric-lime -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="py-8 text-near-black/50 font-bold uppercase tracking-widest text-center">No reports found</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
           <div className="bg-industrial-blue text-warm-ivory p-8">
             <h3 className="text-2xl font-heading font-bold uppercase tracking-tight mb-4">Compliance Notice</h3>
             <p className="text-warm-ivory/80 font-medium leading-relaxed mb-6">
               New thresholds for Class II instruments are active. Ensure all pending evaluations are updated to the 2026 standard.
             </p>
             <Button className="w-full bg-warm-ivory text-industrial-blue hover:bg-electric-lime hover:text-near-black">
               View Documentation
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
