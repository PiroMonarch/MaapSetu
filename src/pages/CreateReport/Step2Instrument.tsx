import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label, FormGroup } from '@/components/ui/Form';
import { Calculator } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function Step2Instrument() {
  const { reportData, updateReportData } = useAppStore();
  const [instrument, setInstrument] = useState<any>(null);

  useEffect(() => {
    if (reportData.instrumentId && typeof reportData.instrumentId === 'string') {
      fetch(`/api/instruments/${reportData.instrumentId}`)
        .then(res => res.json())
        .then(setInstrument);
    } else if (reportData.instrumentId && typeof reportData.instrumentId === 'object') {
      setInstrument(reportData.instrumentId);
    }
  }, [reportData.instrumentId]);

  if (!instrument) {
    return <div className="p-12 text-2xl font-bold uppercase tracking-widest text-near-black/50">Please select an instrument in Step 1.</div>;
  }

  const e = instrument.eValue || 1;
  const accClass = instrument.accuracyClass || 'III';
  // generate simple thresholds based on e and class for UI demonstration
  const mpeStep1 = 500 * e;
  const mpeStep2 = 2000 * e;
  const mpeStep3 = 10000 * e;

  return (
    <div className="max-w-screen-2xl mx-auto p-6 lg:p-12 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Side: Technical Inputs */}
        <div className="lg:col-span-8">
          <div className="mb-12">
            <h2 className="text-5xl md:text-7xl font-heading font-bold uppercase tracking-tighter text-near-black mb-4">
              Specs.
            </h2>
            <p className="text-xl font-medium text-near-black/60 border-l-4 border-electric-lime pl-4">
              Enter the instrument's metrological characteristics to generate the appropriate calculation thresholds.
            </p>
          </div>

          <div className="space-y-16">
            <section>
              <h3 className="text-2xl font-heading font-bold uppercase tracking-tight mb-8 border-b-2 border-near-black pb-2">Metrology</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <FormGroup>
                  <Label htmlFor="maxCapacity">Max Capacity (Max)</Label>
                  <div className="flex items-end">
                              <Input id="maxCapacity" type="number" value={reportData.maxCapacity ?? instrument.maxCapacity ?? ''} onChange={(e) => updateReportData({ maxCapacity: Number(e.target.value) })} className="text-3xl font-bold font-mono text-near-black/50" />
                    <span className="text-xl font-bold font-mono text-near-black/40 ml-2 pb-2">kg</span>
                  </div>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="minCapacity">Min Capacity (Min)</Label>
                  <div className="flex items-end">
                    <Input id="minCapacity" type="number" value={reportData.minCapacity ?? instrument.minCapacity ?? ''} onChange={(e) => updateReportData({ minCapacity: Number(e.target.value) })} className="text-3xl font-bold font-mono text-near-black/50" />
                    <span className="text-xl font-bold font-mono text-near-black/40 ml-2 pb-2">g</span>
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="verificationScale">Verification Scale (e)</Label>
                  <div className="flex items-end">
                    <Input id="eValue" type="number" value={reportData.eValue ?? instrument.eValue ?? ''} onChange={(e) => updateReportData({ eValue: Number(e.target.value) })} className="text-3xl font-bold font-mono text-industrial-blue" />
                    <span className="text-xl font-bold font-mono text-near-black/40 ml-2 pb-2">g</span>
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="actualScale">Actual Scale (d)</Label>
                  <div className="flex items-end">
                    <Input id="dValue" type="number" value={reportData.dValue ?? instrument.dValue ?? ''} onChange={(e) => updateReportData({ dValue: Number(e.target.value) })} className="text-3xl font-bold font-mono text-near-black/50" />
                    <span className="text-xl font-bold font-mono text-near-black/40 ml-2 pb-2">g</span>
                  </div>
                </FormGroup>
              </div>
            </section>
          </div>
        </div>

        {/* Right Side: Active Calculation */}
        <div className="lg:col-span-4">
          <div className="bg-industrial-blue text-warm-ivory p-8 sticky top-24">
            <h3 className="text-2xl font-heading font-bold uppercase tracking-tight mb-6 flex items-center gap-3 text-electric-lime">
              <Calculator className="h-6 w-6" /> Generated Thresholds
            </h3>
            
            <div className="space-y-6 font-mono text-sm">
              <div className="flex justify-between items-center border-b border-warm-ivory/20 pb-3">
                <span className="text-warm-ivory/60">Class</span>
                <span className="font-bold text-xl px-2 py-1 bg-warm-ivory/10">{accClass}</span>
              </div>
              <div className="flex justify-between items-center border-b border-warm-ivory/20 pb-3">
                <span className="text-warm-ivory/60">Resolution (e)</span>
                <span className="font-bold text-xl">{e}g</span>
              </div>
              
              <div className="pt-6">
                <p className="text-xs font-bold font-sans uppercase tracking-widest text-warm-ivory/40 mb-4">Max Permissible Errors</p>
                <div className="space-y-4">
                  <div className="flex justify-between border-l-2 border-electric-lime pl-3">
                    <span className="text-warm-ivory/70">0 ≤ m ≤ {mpeStep1}e</span>
                    <span className="font-bold">± {0.5 * e}g</span>
                  </div>
                  <div className="flex justify-between border-l-2 border-electric-lime pl-3">
                    <span className="text-warm-ivory/70">{mpeStep1}e &lt; m ≤ {mpeStep2}e</span>
                    <span className="font-bold">± {1.0 * e}g</span>
                  </div>
                  <div className="flex justify-between border-l-2 border-electric-lime pl-3">
                    <span className="text-warm-ivory/70">{mpeStep2}e &lt; m ≤ {mpeStep3}e</span>
                    <span className="font-bold">± {1.5 * e}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
