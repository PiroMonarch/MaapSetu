import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label, FormGroup } from '@/components/ui/Form';
import { CheckCircle2, Thermometer, Droplets, Wind, MapPin, FlaskConical, Info } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const APPLICABILITY_LIST = [
  { id: '01', name: 'Electronic instrument', type: 'Required', active: true },
  { id: '02', name: 'Battery-powered', type: 'Power', active: false },
  { id: '03', name: 'AC mains-powered', type: 'Power', active: true },
  { id: '04', name: 'Direct-sales function', type: 'Feature', active: true },
  { id: '05', name: 'Price-computing function', type: 'Feature', active: true },
  { id: '06', name: 'Mobile instrument', type: 'Physical', active: false },
  { id: '07', name: 'Tare device available', type: 'Feature', active: true },
  { id: '08', name: 'Printing device fitted', type: 'Feature', active: false },
  { id: '09', name: 'Remote display', type: 'Feature', active: false },
];

const typeVariants: Record<string, 'info' | 'warning' | 'success' | 'default'> = {
  Required: 'info',
  Power: 'warning',
  Feature: 'success',
  Physical: 'default',
};

export function Step3Conditions() {
  const { reportData, updateReportData } = useAppStore();

  const [conditions, setConditions] = useState({
    temperature: reportData.testConditions?.temperature || '',
    humidity: reportData.testConditions?.humidity || '',
    atmosphericPressure: reportData.testConditions?.atmosphericPressure || '',
    location: reportData.testConditions?.location || '',
    referenceStandards: reportData.testConditions?.referenceStandards || '',
  });

  const [applicability, setApplicability] = useState<typeof APPLICABILITY_LIST>(
    reportData.applicability || APPLICABILITY_LIST
  );

  // Sync conditions to store
  useEffect(() => {
    updateReportData({ testConditions: conditions });
  }, [conditions]);

  // Sync applicability to store
  useEffect(() => {
    updateReportData({ applicability });
  }, [applicability]);

  const handleCondition = (key: string, value: string) => {
    setConditions(prev => ({ ...prev, [key]: value }));
  };

  const toggleItem = (id: string) => {
    setApplicability(prev =>
      prev.map(item => item.id === id ? { ...item, active: !item.active } : item)
    );
  };

  const activeCount = applicability.filter(a => a.active).length;
  const totalTests = 4 + (applicability.find(a => a.id === '07')?.active ? 1 : 0);

  return (
    <div className="max-w-screen-lg mx-auto px-5 py-8 lg:px-10 page-enter">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="info" dot>Step 3 of 5</Badge>
        </div>
        <h2 className="text-2xl font-heading font-bold text-near-black tracking-tight">
          Conditions & Applicability
        </h2>
        <p className="text-sm text-near-black/50 mt-1 max-w-lg">
          Record laboratory environmental conditions and configure which test conditions apply.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Environmental conditions + Applicability */}
        <div className="lg:col-span-2 space-y-5">

          {/* Environmental Conditions */}
          <div className="glass-surface rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Thermometer className="h-4 w-4 text-signal-orange" />
              <p className="text-sm font-semibold text-near-black">Environmental Conditions</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormGroup>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  value={conditions.temperature}
                  onChange={e => handleCondition('temperature', e.target.value)}
                  placeholder="e.g. 22 °C ± 2 °C"
                  leftIcon={<Thermometer className="h-3.5 w-3.5" />}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="humidity">Relative Humidity</Label>
                <Input
                  id="humidity"
                  value={conditions.humidity}
                  onChange={e => handleCondition('humidity', e.target.value)}
                  placeholder="e.g. 55% ± 10%"
                  leftIcon={<Droplets className="h-3.5 w-3.5" />}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="pressure">Atmospheric Pressure</Label>
                <Input
                  id="pressure"
                  value={conditions.atmosphericPressure}
                  onChange={e => handleCondition('atmosphericPressure', e.target.value)}
                  placeholder="e.g. 101.3 kPa"
                  leftIcon={<Wind className="h-3.5 w-3.5" />}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="location">Test Location</Label>
                <Input
                  id="location"
                  value={conditions.location}
                  onChange={e => handleCondition('location', e.target.value)}
                  placeholder="e.g. Metrology Lab, Floor 2"
                  leftIcon={<MapPin className="h-3.5 w-3.5" />}
                />
              </FormGroup>
              <FormGroup className="sm:col-span-2">
                <Label htmlFor="refStandards">Reference Standards / Equipment Used</Label>
                <Input
                  id="refStandards"
                  value={conditions.referenceStandards}
                  onChange={e => handleCondition('referenceStandards', e.target.value)}
                  placeholder="e.g. Class E2 weights, Cert. No. 12345"
                  leftIcon={<FlaskConical className="h-3.5 w-3.5" />}
                />
              </FormGroup>
            </div>
          </div>

          {/* Applicability matrix */}
          <div className="glass-surface rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-near-black/8 bg-near-black/3">
              <Info className="h-3.5 w-3.5 text-near-black/40" />
              <p className="text-xs font-semibold text-near-black/50 uppercase tracking-wider">
                Determine Applicability
              </p>
            </div>
            <div className="divide-y divide-near-black/6">
              {applicability.map(item => (
                <label
                  key={item.id}
                  className={cn(
                    'flex items-center justify-between px-6 py-3.5 cursor-pointer transition-colors select-none',
                    item.active ? 'bg-near-black/3' : 'hover:bg-near-black/2'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                        item.active
                          ? 'bg-near-black border-near-black'
                          : 'bg-transparent border-near-black/20 hover:border-near-black/40'
                      )}
                    >
                      {item.active && <CheckCircle2 className="h-3 w-3 text-electric-lime" />}
                    </button>
                    <div>
                      <p className={cn('text-sm font-medium', item.active ? 'text-near-black' : 'text-near-black/45')}>
                        {item.name}
                      </p>
                      <p className="text-xs font-mono text-near-black/25 mt-0.5">{item.id}</p>
                    </div>
                  </div>
                  <Badge variant={typeVariants[item.type] || 'default'}>{item.type}</Badge>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Test matrix summary */}
        <div className="space-y-4">
          <div className="glass-surface rounded-2xl overflow-hidden sticky top-24">
            <div className="bg-industrial-blue px-5 py-4">
              <p className="text-xs font-semibold text-electric-lime uppercase tracking-wider">Generated Matrix</p>
              <p className="text-warm-ivory/50 text-xs mt-0.5">Tests to be performed</p>
            </div>
            <div className="p-5">
              <div className="text-4xl font-heading font-bold text-near-black tabular-nums mb-1">{totalTests}</div>
              <p className="text-xs text-near-black/40 mb-4 font-medium">applicable tests identified</p>

              <div className="w-full h-1.5 bg-near-black/8 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-electric-lime rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalTests / 8) * 100, 100)}%` }}
                />
              </div>

              <div className="space-y-2.5">
                {[
                  { code: 'T.3.2', name: 'Weighing Performance', always: true },
                  { code: 'T.3.3', name: 'Repeatability', always: true },
                  { code: 'T.3.4', name: 'Eccentricity', always: true },
                  { code: 'T.3.5', name: 'Discrimination', always: true },
                  { code: 'T.4.1', name: 'Tare Weighing', always: false, condId: '07' },
                ].map(test => {
                  const applicable = test.always || applicability.find(a => a.id === test.condId)?.active;
                  return (
                    <div key={test.code} className={cn('flex items-center gap-2.5', !applicable && 'opacity-30')}>
                      {applicable
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald shrink-0" />
                        : <div className="h-3.5 w-3.5 rounded-full border border-near-black/20 shrink-0" />
                      }
                      <span className="text-xs font-medium text-near-black/65">{test.name}</span>
                      <span className="text-xs font-mono text-near-black/25 ml-auto">{test.code}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-near-black/8">
                <p className="text-xs text-near-black/40">
                  <span className="font-semibold text-near-black">{activeCount}</span> condition-based features active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
