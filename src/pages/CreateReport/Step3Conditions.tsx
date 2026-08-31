import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/store';

const initialApplicability = [
  { id: '01', name: 'Electronic instrument', type: 'Required', active: true },
  { id: '02', name: 'Battery-powered', type: 'Power', active: false },
  { id: '03', name: 'AC mains-powered', type: 'Power', active: true },
  { id: '04', name: 'Direct-sales function', type: 'Feature', active: true },
  { id: '05', name: 'Price-computing function', type: 'Feature', active: true },
  { id: '06', name: 'Mobile instrument', type: 'Physical', active: false },
  { id: '07', name: 'Tare device available', type: 'Feature', active: true },
];

export function Step3Conditions() {
  const navigate = useNavigate();
  const { reportData, updateReportData } = useAppStore();
  const [applicability, setApplicability] = useState(
    reportData.applicability || initialApplicability
  );

  useEffect(() => {
    updateReportData({ applicability });
  }, [applicability, updateReportData]);

  const toggleItem = (id: string) => {
    setApplicability(prev => prev.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

  const activeCount = applicability.filter(i => i.active).length;

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12">
      <div className="mb-12">
        <h2 className="text-5xl md:text-7xl font-heading font-bold uppercase tracking-tighter text-near-black mb-4">
          Test Conditions
        </h2>
        <p className="text-xl font-medium text-near-black/60 border-l-4 border-electric-lime pl-4">
          Configure the testing environment and let MaapSetu generate the evaluation matrix.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Applicable Tests Selection - Large Editorial Rows */}
        <div className="lg:col-span-8">
          <h3 className="text-2xl font-heading font-bold uppercase tracking-tight mb-6">Determine Applicability</h3>
          <div className="border-t-2 border-near-black">
            {applicability.map((item, idx) => (
              <label 
                key={item.id} 
                className={`group flex items-center justify-between p-6 border-b border-near-black/10 cursor-pointer transition-all ${
                  item.active ? 'bg-near-black text-warm-ivory' : 'hover:bg-white text-near-black'
                }`}
              >
                <div className="flex items-center gap-6">
                  <input 
                    type="checkbox" 
                    checked={item.active} 
                    onChange={() => toggleItem(item.id)}
                    className="w-6 h-6 accent-electric-lime cursor-pointer"
                  />
                  <div>
                    <span className={`font-mono text-sm font-bold mr-4 ${item.active ? 'text-electric-lime' : 'text-near-black/40'}`}>
                      {item.id}
                    </span>
                    <span className="text-xl font-bold tracking-tight uppercase">{item.name}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${item.active ? 'bg-warm-ivory/10 text-warm-ivory' : 'bg-near-black/5 text-near-black'}`}>
                  {item.type}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Dynamic Test Matrix Summary */}
        <div className="lg:col-span-4">
          <div className="bg-industrial-blue text-warm-ivory p-8 sticky top-24">
            <h3 className="text-2xl font-heading font-bold uppercase tracking-tight mb-6 text-electric-lime">
              Generated Matrix
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold uppercase tracking-wider">Applicable Tests</span>
                  <span className="text-3xl font-heading font-bold">{5 + activeCount}</span>
                </div>
                <div className="w-full h-1 bg-warm-ivory/20">
                  <div className="h-full bg-electric-lime" style={{ width: `${((5 + activeCount) / 20) * 100}%` }}></div>
                </div>
              </div>

              <ul className="space-y-3 font-mono text-sm text-warm-ivory/70">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-electric-lime" /> Weighing Performance</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-electric-lime" /> Eccentricity</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-electric-lime" /> Discrimination</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-electric-lime" /> Repeatability</li>
                {applicability.find(a => a.id === '07')?.active && (
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-electric-lime" /> Tare Weighing</li>
                )}
                <li className="pt-2 text-electric-lime font-bold">+ {activeCount} ADDITIONAL TESTS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
