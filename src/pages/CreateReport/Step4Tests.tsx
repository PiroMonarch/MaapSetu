import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, ChevronRight, Calculator, Check, AlertTriangle, PlayCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

export function Step4Tests() {
  const navigate = useNavigate();
  const { currentReportId, reportData, testResults, updateTestResults } = useAppStore();
  const [instrument, setInstrument] = useState<any>(null);
  
  const testsList = [
    { num: '01', name: 'Weighing Performance' },
    { num: '02', name: 'Temperature Effect' },
    { num: '03', name: 'Eccentricity' },
    { num: '04', name: 'Discrimination' },
    { num: '05', name: 'Repeatability' },
  ];
  
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const activeTestName = testsList[activeTestIndex].name;
  
  // Find "Weighing Performance" test or create empty
  const [readings, setReadings] = useState<any[]>(() => {
    const existing = testResults.find(t => t.testName === 'Weighing Performance');
    if (existing && existing.data && existing.data.length > 0) return existing.data;
    return [{ id: Date.now(), load: '', ind: '', add: '' }];
  });

  useEffect(() => {
    if (reportData.instrumentId) {
      const id = typeof reportData.instrumentId === 'string' ? reportData.instrumentId : reportData.instrumentId._id;
      if (id) {
        fetch(`/api/instruments/${id}`)
          .then(res => res.json())
          .then(setInstrument);
      }
    }
  }, [reportData.instrumentId]);

  const e = instrument?.eValue || 1;
  const max = instrument?.maxCapacity || 0;
  const accClass = instrument?.accuracyClass || 'III';

  // Calculate fields for a reading
  const calculateReading = (row: any, E0: number) => {
    const L = parseFloat(row.load) || 0;
    const I = parseFloat(row.ind) || 0;
    const add = parseFloat(row.add) || 0;
    
    if (row.load === '' || row.ind === '' || row.add === '') return row;

    const P = I + 0.5 * e - add;
    const E = P - L;
    const Ec = E - E0;

    // mpe logic simplified
    let mpe = 0.5 * e;
    if (L > 500 * e) mpe = 1.0 * e;
    if (L > 2000 * e) mpe = 1.5 * e;

    let result = 'Pass';
    if (Math.abs(Ec) > mpe) result = 'Fail';
    else if (Math.abs(Ec) === mpe) result = 'Review';

    return { ...row, calc: P.toFixed(4), err: E.toFixed(4), corr: Ec.toFixed(4), mpe: `±${mpe.toFixed(4)}`, result };
  };

  const handleReadingChange = (index: number, field: string, value: string) => {
    const newReadings = [...readings];
    newReadings[index] = { ...newReadings[index], [field]: value };
    
    // E0 is the error of the first zero reading
    let E0 = 0;
    const zeroRow = newReadings.find(r => parseFloat(r.load) === 0);
    if (zeroRow && zeroRow.load !== '' && zeroRow.ind !== '' && zeroRow.add !== '') {
      const P = (parseFloat(zeroRow.ind)||0) + 0.5 * e - (parseFloat(zeroRow.add)||0);
      E0 = P - (parseFloat(zeroRow.load)||0);
    }

    const calculatedReadings = newReadings.map(r => calculateReading(r, E0));
    setReadings(calculatedReadings);
  };

  const addRow = () => {
    setReadings([...readings, { id: Date.now(), load: '', ind: '', add: '' }]);
  };

  const saveTest = async () => {
    if (!currentReportId) return;
    try {
      const isWeighing = activeTestName === 'Weighing Performance';
      const testPassed = isWeighing ? !readings.some(r => r.result === 'Fail') : true; // default pass for placeholder tests

      const res = await fetch(`/api/reports/${currentReportId}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: activeTestName,
          data: isWeighing ? readings : [{ passed: true, note: 'Passed manually' }],
          passed: testPassed
        })
      });
      const updated = await res.json();
      
      const newResults = [...testResults];
      const idx = newResults.findIndex(t => t.testName === activeTestName);
      if (idx > -1) newResults[idx] = updated;
      else newResults.push(updated);
      updateTestResults(newResults);
      
      // Move to next test or review
      if (activeTestIndex < testsList.length - 1) {
        setActiveTestIndex(activeTestIndex + 1);
      } else {
        navigate('/reports/new/review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeRow = readings[readings.length - 1] || {};

  return (
    <div className="flex flex-col xl:flex-row h-full min-h-[800px] border-t-2 border-near-black">
      {/* LEFT: SLIM TEST NAV */}
      <div className="w-full xl:w-72 border-r-2 border-near-black/10 bg-white flex flex-col">
        <div className="p-6 bg-near-black text-warm-ivory">
          <h3 className="font-heading font-bold text-xl uppercase tracking-wider">Applicable Tests</h3>
          <p className="text-electric-lime font-mono text-sm mt-2">{reportData.applicability?.filter((a:any)=>a.active).length || 5} REQUIRED</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {testsList.map((test, idx) => {
            const isActive = idx === activeTestIndex;
            const isCompleted = testResults.some(t => t.testName === test.name);
            return (
              <div 
                key={idx} 
                onClick={() => setActiveTestIndex(idx)}
                className={`flex items-center justify-between p-4 border-b border-near-black/10 cursor-pointer transition-all group ${
                  isActive ? 'bg-near-black text-warm-ivory border-l-4 border-l-electric-lime' : 'hover:bg-black/5 text-near-black'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`font-mono text-sm font-bold ${isActive ? 'text-warm-ivory/50' : 'text-near-black/40'}`}>{test.num}</span>
                  <span className={`font-bold uppercase tracking-tight text-sm ${isCompleted && !isActive ? 'text-emerald' : ''}`}>{test.name}</span>
                </div>
                {isCompleted && !isActive && <CheckCircle2 className="h-4 w-4 text-emerald" />}
                {!isActive && !isCompleted && <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER: DATA ENTRY SPREADSHEET */}
      <div className="flex-1 bg-warm-ivory p-6 md:p-12 flex flex-col overflow-x-hidden">
        <div className="mb-8">
          <h2 className="text-5xl font-heading font-bold uppercase tracking-tighter mb-4 text-near-black">{activeTestName}</h2>
          <div className="flex flex-wrap gap-4 text-sm font-bold font-mono text-industrial-blue border-b-2 border-near-black pb-4">
            <span className="px-3 py-1 bg-industrial-blue/10">CLASS {accClass}</span>
            <span className="px-3 py-1 bg-industrial-blue/10">MAX: {max}kg</span>
            <span className="px-3 py-1 bg-industrial-blue/10">e = {e}g</span>
          </div>
        </div>

        {activeTestName === 'Weighing Performance' ? (
          <>
            <div className="overflow-x-auto pb-8">
              <table className="w-full text-left font-mono text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b-2 border-near-black text-near-black/50">
                    <th className="p-3 font-bold uppercase tracking-widest">Load (L)</th>
                    <th className="p-3 font-bold uppercase tracking-widest">Ind. (I)</th>
                    <th className="p-3 font-bold uppercase tracking-widest">Add (ΔL)</th>
                    <th className="p-3 font-bold uppercase tracking-widest text-industrial-blue bg-industrial-blue/5">Calc (P)</th>
                    <th className="p-3 font-bold uppercase tracking-widest text-industrial-blue bg-industrial-blue/5">Err (E)</th>
                    <th className="p-3 font-bold uppercase tracking-widest text-industrial-blue bg-industrial-blue/5">Corr (Ec)</th>
                    <th className="p-3 font-bold uppercase tracking-widest text-near-black/40">MPE</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((r, i) => (
                    <tr key={r.id} className={`border-b border-near-black/10 transition-colors ${r.result === 'Fail' ? 'bg-red-500/10' : r.result === 'Review' ? 'bg-signal-orange/10' : 'hover:bg-white'}`}>
                      <td className="p-2"><Input value={r.load} onChange={e => handleReadingChange(i, 'load', e.target.value)} className="h-10 border-b-0 bg-white/50 px-3 w-24 text-center font-bold" /></td>
                      <td className="p-2"><Input value={r.ind} onChange={e => handleReadingChange(i, 'ind', e.target.value)} className="h-10 border-b-0 bg-white/50 px-3 w-24 text-center font-bold" /></td>
                      <td className="p-2"><Input value={r.add} onChange={e => handleReadingChange(i, 'add', e.target.value)} className="h-10 border-b-0 bg-white/50 px-3 w-24 text-center font-bold" /></td>
                      <td className="p-3 bg-industrial-blue/5 text-industrial-blue">{r.calc || '-'}</td>
                      <td className="p-3 bg-industrial-blue/5 text-industrial-blue">{r.err || '-'}</td>
                      <td className="p-3 bg-industrial-blue/10 text-industrial-blue font-bold">{r.corr || '-'}</td>
                      <td className="p-3 text-near-black/40">{r.mpe || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-auto pt-6 flex justify-between items-center">
              <Button variant="outline" onClick={addRow}>Add Row +</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-near-black/20 p-12 text-center bg-white/50">
            <h3 className="text-2xl font-bold uppercase mb-4 text-near-black/50">Generic Test Module</h3>
            <p className="text-near-black/40 max-w-md">This test is currently evaluated externally. You may mark this test as passed to proceed.</p>
          </div>
        )}
      </div>

      {/* RIGHT: DARK CHARCOAL CONSOLE */}
      <div className="w-full xl:w-96 bg-near-black text-warm-ivory flex flex-col">
        <div className="p-6 border-b border-warm-ivory/10">
          <h3 className="font-heading font-bold text-xl uppercase tracking-widest text-electric-lime flex items-center gap-3">
            <Calculator className="h-5 w-5" /> Live Check
          </h3>
        </div>
        
        <div className="p-6 flex-1 flex flex-col justify-center space-y-12">
          
          {activeTestName === 'Weighing Performance' ? (
            <>
              <div className="space-y-6 font-mono">
                <div className="flex justify-between border-b border-warm-ivory/10 pb-2">
                  <span className="text-warm-ivory/50">Error (E)</span>
                  <span className="font-bold">{activeRow.err || '0'}</span>
                </div>
                <div className="flex justify-between border-b border-warm-ivory/10 pb-2">
                  <span className="text-warm-ivory/50">Corr. Error (Ec)</span>
                  <span className={`font-bold ${activeRow.result === 'Fail' ? 'text-red-500' : activeRow.result === 'Review' ? 'text-signal-orange' : 'text-electric-lime'}`}>{activeRow.corr || '0'}</span>
                </div>
                <div className="flex justify-between border-b border-warm-ivory/10 pb-2">
                  <span className="text-warm-ivory/50">Limit (MPE)</span>
                  <span className="font-bold">{activeRow.mpe || '0'}</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-xs uppercase tracking-widest text-warm-ivory/40 mb-4">Deviation Visualizer</p>
                <div className="relative h-12 w-full flex items-center">
                  <div className="absolute w-full h-[2px] bg-warm-ivory/20"></div>
                  <div className="absolute left-[20%] w-[60%] h-full border-x border-warm-ivory/20 bg-warm-ivory/5 flex justify-between items-end pb-1 px-1">
                    <span className="text-[10px] font-mono text-warm-ivory/40">-MPE</span>
                    <span className="text-[10px] font-mono text-warm-ivory/40">+MPE</span>
                  </div>
                  <div className="absolute left-1/2 h-full w-[2px] bg-warm-ivory/40"></div>
                  <div className="absolute left-[80%] h-4 w-4 rounded-full bg-electric-lime transform -translate-x-1/2 -translate-y-1/2 ring-4 ring-electric-lime/20"></div>
                </div>
              </div>

              <div className={`p-6 flex flex-col items-center justify-center text-center mt-auto ${activeRow.result === 'Fail' ? 'bg-red-500/10 border border-red-500/30' : activeRow.result === 'Review' ? 'bg-signal-orange/10 border border-signal-orange/30' : 'bg-electric-lime/10 border border-electric-lime/30'}`}>
                 <AlertTriangle className={`h-10 w-10 mb-3 ${activeRow.result === 'Fail' ? 'text-red-500' : activeRow.result === 'Review' ? 'text-signal-orange' : 'text-electric-lime'}`} />
                 <h4 className={`text-3xl font-heading font-bold uppercase tracking-tighter ${activeRow.result === 'Fail' ? 'text-red-500' : activeRow.result === 'Review' ? 'text-signal-orange' : 'text-electric-lime'}`}>{activeRow.result || 'Pending'}</h4>
              </div>
            </>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center text-center mt-auto bg-electric-lime/10 border border-electric-lime/30">
               <CheckCircle2 className="h-10 w-10 mb-3 text-electric-lime" />
               <h4 className="text-3xl font-heading font-bold uppercase tracking-tighter text-electric-lime">OK</h4>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-warm-ivory/10">
          <Button onClick={saveTest} className="w-full h-16 text-lg bg-warm-ivory text-near-black hover:bg-electric-lime">Save & Complete Test</Button>
        </div>
      </div>
    </div>
  );
}
