import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Label, FormGroup } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { Calculator, AlertCircle } from 'lucide-react';
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
    return (
      <div className="max-w-screen-lg mx-auto px-5 py-8 lg:px-10 page-enter">
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-signal-orange/8 border border-signal-orange/20">
          <AlertCircle className="h-5 w-5 text-signal-orange shrink-0" />
          <div>
            <p className="text-sm font-semibold text-near-black">No instrument selected</p>
            <p className="text-xs text-near-black/50 mt-0.5">Please go back to Step 1 and select an instrument to test.</p>
          </div>
        </div>
      </div>
    );
  }

  const e = instrument.eValue || 1;
  const accClass = instrument.accuracyClass || 'III';
  const mpe1 = 0.5 * e;
  const mpe2 = 1.0 * e;
  const mpe3 = 1.5 * e;
  const t1 = 500 * e;
  const t2 = 2000 * e;
  const t3 = 10000 * e;

  return (
    <div className="max-w-screen-lg mx-auto px-5 py-8 lg:px-10 page-enter">
      {/* Section header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="info" dot>Step 2 of 5</Badge>
        </div>
        <h2 className="text-2xl font-heading font-bold text-near-black tracking-tight">Instrument Specifications</h2>
        <p className="text-sm text-near-black/50 mt-1 max-w-lg">
          Verify the metrological characteristics pre-filled from the instrument registry. Adjust if needed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 glass-surface rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-near-black/60 uppercase tracking-wider mb-5">Metrological Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormGroup>
              <Label htmlFor="maxCapacity">Max Capacity (Max)</Label>
              <Input
                id="maxCapacity"
                type="number"
                value={reportData.maxCapacity ?? instrument.maxCapacity ?? ''}
                onChange={e => updateReportData({ maxCapacity: Number(e.target.value) })}
                placeholder="kg"
                rightIcon={<span className="text-xs font-mono text-near-black/40">kg</span>}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="minCapacity">Min Capacity (Min)</Label>
              <Input
                id="minCapacity"
                type="number"
                value={reportData.minCapacity ?? instrument.minCapacity ?? ''}
                onChange={e => updateReportData({ minCapacity: Number(e.target.value) })}
                placeholder="g"
                rightIcon={<span className="text-xs font-mono text-near-black/40">g</span>}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="eValue">Verification Scale (e)</Label>
              <Input
                id="eValue"
                type="number"
                value={reportData.eValue ?? instrument.eValue ?? ''}
                onChange={ev => updateReportData({ eValue: Number(ev.target.value) })}
                placeholder="g"
                rightIcon={<span className="text-xs font-mono text-near-black/40">g</span>}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="dValue">Actual Scale (d)</Label>
              <Input
                id="dValue"
                type="number"
                value={reportData.dValue ?? instrument.dValue ?? ''}
                onChange={ev => updateReportData({ dValue: Number(ev.target.value) })}
                placeholder="g"
                rightIcon={<span className="text-xs font-mono text-near-black/40">g</span>}
              />
            </FormGroup>
          </div>
        </div>

        {/* Generated thresholds */}
        <div className="glass-surface rounded-2xl overflow-hidden">
          <div className="bg-industrial-blue px-5 py-4">
            <div className="flex items-center gap-2 text-electric-lime mb-1">
              <Calculator className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Generated Thresholds</span>
            </div>
            <p className="text-warm-ivory/60 text-xs">Based on class and scale value</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-near-black/8">
              <span className="text-xs text-near-black/50 font-medium">Accuracy Class</span>
              <Badge variant="info">{accClass}</Badge>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-near-black/8">
              <span className="text-xs text-near-black/50 font-medium">Scale 'e'</span>
              <span className="text-sm font-mono font-semibold text-near-black">{e} g</span>
            </div>

            <div>
              <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-3">Max Permissible Errors</p>
              <div className="space-y-2.5">
                {[
                  { range: `0 – ${t1}e`, mpe: `± ${mpe1} g` },
                  { range: `${t1}e – ${t2}e`, mpe: `± ${mpe2} g` },
                  { range: `${t2}e – ${t3}e`, mpe: `± ${mpe3} g` },
                ].map(row => (
                  <div key={row.range} className="flex justify-between items-center p-2.5 rounded-lg bg-near-black/3">
                    <span className="text-xs text-near-black/55 font-mono">{row.range}</span>
                    <span className="text-xs font-bold text-industrial-blue font-mono">{row.mpe}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
