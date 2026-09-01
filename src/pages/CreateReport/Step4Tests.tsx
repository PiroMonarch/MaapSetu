import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, ChevronRight, Calculator, AlertTriangle, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TestKey = 'weighing' | 'repeatability' | 'eccentricity' | 'discrimination' | 'tare';

const TESTS: { key: TestKey; code: string; name: string }[] = [
  { key: 'weighing', code: 'T.3.2', name: 'Weighing Performance' },
  { key: 'repeatability', code: 'T.3.3', name: 'Repeatability' },
  { key: 'eccentricity', code: 'T.3.4', name: 'Eccentricity' },
  { key: 'discrimination', code: 'T.3.5', name: 'Discrimination' },
  { key: 'tare', code: 'T.4.1', name: 'Tare Weighing' },
];

const ECCENTRIC_POSITIONS = ['Centre', 'North', 'South', 'East', 'West'];

// ─── Small reusable cell input ─────────────────────────────────────────────────
function NumInput({ value, onChange, placeholder = '0.000', w = 'w-24' }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; w?: string;
}) {
  return (
    <Input
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`h-8 ${w} text-center text-xs font-mono`}
      placeholder={placeholder}
    />
  );
}

// ─── Result Badge helper ───────────────────────────────────────────────────────
function ResultBadge({ result }: { result?: string }) {
  if (!result) return null;
  return (
    <Badge
      variant={result === 'Pass' ? 'success' : result === 'Fail' ? 'error' : 'warning'}
      dot
    >
      {result}
    </Badge>
  );
}

// ─── Main Step4 component ──────────────────────────────────────────────────────
export function Step4Tests() {
  const { currentReportId, reportData, testResults, updateTestResults } = useAppStore();
  const [instrument, setInstrument] = useState<any>(null);
  const [activeKey, setActiveKey] = useState<TestKey>('weighing');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  // ── Weighing ────────────────────────────────────────────────────────────────
  const [wRows, setWRows] = useState<any[]>(() => {
    const ex = testResults.find(t => t.testName === 'Weighing Performance');
    return ex?.data?.length ? ex.data : [{ id: 1, load: '', ind: '', add: '' }];
  });
  const [wResult, setWResult] = useState<any>(null);

  // ── Repeatability ──────────────────────────────────────────────────────────
  const [repReadings, setRepReadings] = useState<string[]>(() => {
    const ex = testResults.find(t => t.testName === 'Repeatability');
    return ex?.data?.readings?.map(String) || Array(5).fill('');
  });
  const [repResult, setRepResult] = useState<any>(null);

  // ── Eccentricity ───────────────────────────────────────────────────────────
  const [eccLoad, setEccLoad] = useState('');
  const [eccRows, setEccRows] = useState<{ position: string; indication: string }[]>(
    () => {
      const ex = testResults.find(t => t.testName === 'Eccentricity');
      return ex?.data?.rows || ECCENTRIC_POSITIONS.map(p => ({ position: p, indication: '' }));
    }
  );
  const [eccResult, setEccResult] = useState<any>(null);

  // ── Discrimination ─────────────────────────────────────────────────────────
  const [discData, setDiscData] = useState<any>(() => {
    const ex = testResults.find(t => t.testName === 'Discrimination');
    return ex?.data || { loadG: '', indicationBefore: '', indicationAfter: '', addedWeightG: '' };
  });
  const [discResult, setDiscResult] = useState<any>(null);

  // ── Tare ────────────────────────────────────────────────────────────────────
  const [tareData, setTareData] = useState<any>(() => {
    const ex = testResults.find(t => t.testName === 'Tare Weighing');
    return ex?.data || { tareMassG: '', indicationAfterTare: '' };
  });
  const [tareResult, setTareResult] = useState<any>(null);

  useEffect(() => {
    if (reportData.instrumentId) {
      const id = typeof reportData.instrumentId === 'string'
        ? reportData.instrumentId
        : reportData.instrumentId._id;
      if (id) fetch(`/api/instruments/${id}`).then(r => r.json()).then(setInstrument);
    }
  }, [reportData.instrumentId]);

  const e = instrument?.eValue || 1;
  const d = instrument?.dValue || 0.001;
  const max = instrument?.maxCapacity || 0;
  const cls = instrument?.accuracyClass || 'III';

  // ── Live evaluation via OIML engine ──────────────────────────────────────────
  const evalWeighing = useCallback(async (rows: any[]) => {
    const filled = rows.filter(r => r.load !== '' && r.ind !== '' && r.add !== '');
    if (!filled.length) return;
    const res = await fetch('/api/oiml/weighing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rows: rows.map(r => ({ load: parseFloat(r.load) || 0, ind: parseFloat(r.ind) || 0, add: parseFloat(r.add) || 0 })),
        eG: e, cls,
      }),
    });
    const data = await res.json();
    // Merge calculated fields back into rows
    const merged = rows.map((r, i) => ({ ...r, ...(data.results[i] || {}) }));
    setWRows(merged);
    setWResult(data);
  }, [e, cls]);

  const evalRepeatability = useCallback(async (readings: string[]) => {
    const nums = readings.map(Number).filter(n => !isNaN(n) && n > 0);
    if (nums.length < 2) return;
    const res = await fetch('/api/oiml/repeatability', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readings: nums, eG: e }),
    });
    setRepResult(await res.json());
  }, [e]);

  const evalEccentricity = useCallback(async (rows: typeof eccRows, loadVal: string) => {
    const nums = rows.map(r => parseFloat(r.indication)).filter(n => !isNaN(n));
    if (nums.length < 3 || !loadVal) return;
    const res = await fetch('/api/oiml/eccentricity', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rows: rows.map(r => ({ position: r.position, indication: parseFloat(r.indication) || 0 })),
        testLoadG: parseFloat(loadVal), eG: e, cls,
      }),
    });
    setEccResult(await res.json());
  }, [e, cls]);

  const evalDiscrimination = useCallback(async (data: any) => {
    const { loadG, indicationBefore, indicationAfter, addedWeightG } = data;
    if (!loadG || !indicationBefore || !indicationAfter) return;
    const res = await fetch('/api/oiml/discrimination', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loadG: parseFloat(loadG), indicationBefore: parseFloat(indicationBefore),
        indicationAfter: parseFloat(indicationAfter), addedWeightG: parseFloat(addedWeightG) || 0.1 * e, dG: d,
      }),
    });
    setDiscResult(await res.json());
  }, [e, d]);

  const evalTare = useCallback(async (data: any) => {
    if (!data.tareMassG || data.indicationAfterTare === '') return;
    const res = await fetch('/api/oiml/tare', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tareMassG: parseFloat(data.tareMassG), indicationAfterTare: parseFloat(data.indicationAfterTare), eG: e }),
    });
    setTareResult(await res.json());
  }, [e]);

  // ── Save & AI ────────────────────────────────────────────────────────────────
  const getActiveTestData = () => {
    switch (activeKey) {
      case 'weighing': return { testName: 'Weighing Performance', testCode: 'T.3.2', data: wRows, passed: wResult?.passed ?? null };
      case 'repeatability': return { testName: 'Repeatability', testCode: 'T.3.3', data: { readings: repReadings.map(Number).filter(Boolean), ...repResult }, passed: repResult?.passed ?? null };
      case 'eccentricity': return { testName: 'Eccentricity', testCode: 'T.3.4', data: { rows: eccRows, testLoad: eccLoad, ...eccResult }, passed: eccResult?.passed ?? null };
      case 'discrimination': return { testName: 'Discrimination', testCode: 'T.3.5', data: { ...discData, ...discResult }, passed: discResult?.passed ?? null };
      case 'tare': return { testName: 'Tare Weighing', testCode: 'T.4.1', data: { ...tareData, ...tareResult }, passed: tareResult?.passed ?? null };
    }
  };

  const handleSave = async () => {
    if (!currentReportId) return;
    setSaving(true);
    const payload = getActiveTestData();
    try {
      const res = await fetch(`/api/reports/${currentReportId}/tests`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      const newResults = [...testResults];
      const idx = newResults.findIndex(t => t.testName === payload?.testName);
      if (idx > -1) newResults[idx] = updated; else newResults.push(updated);
      updateTestResults(newResults);
    } finally { setSaving(false); }
  };

  const handleAISummary = async () => {
    const payload = getActiveTestData();
    if (!payload) return;
    setAiLoading(true);
    setAiSummary('');
    try {
      const res = await fetch('/api/ai/test-summary', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: payload.testName,
          data: payload.data,
          passed: payload.passed,
          instrumentInfo: `${instrument?.manufacturer} ${instrument?.model} Class ${cls}`,
        }),
      });
      const d = await res.json();
      setAiSummary(d.summary || '');
    } finally { setAiLoading(false); }
  };

  const isCompleted = (key: TestKey) => testResults.some(t => t.testName === TESTS.find(tt => tt.key === key)?.name);
  const getResult = (key: TestKey) => {
    const t = testResults.find(r => r.testName === TESTS.find(tt => tt.key === key)?.name);
    return t ? (t.passed ? 'Pass' : 'Fail') : null;
  };

  // Active results
  const activeWeighing = wResult;
  const lastWRow = wRows[wRows.length - 1] || {};
  const activeResult = activeKey === 'weighing' ? wResult?.passed
    : activeKey === 'repeatability' ? repResult?.passed
      : activeKey === 'eccentricity' ? eccResult?.passed
        : activeKey === 'discrimination' ? discResult?.passed
          : activeKey === 'tare' ? tareResult?.passed
            : null;

  const activeResultStr = activeResult === true ? 'Pass' : activeResult === false ? 'Fail' : 'Pending';

  return (
    <div className="flex flex-col xl:flex-row h-full min-h-[700px] page-enter">

      {/* ── Left: Test Nav ──────────────────────────────────────────── */}
      <div className="w-full xl:w-56 shrink-0 border-b xl:border-b-0 xl:border-r border-near-black/8 bg-white/60">
        <div className="px-5 py-3 border-b border-near-black/8 bg-near-black/3">
          <p className="text-xs font-semibold text-near-black/50 uppercase tracking-wider">Tests</p>
        </div>
        <div className="divide-y divide-near-black/6">
          {TESTS.map(test => {
            const isActive = activeKey === test.key;
            const done = isCompleted(test.key);
            const res = getResult(test.key);
            return (
              <button
                key={test.key}
                onClick={() => setActiveKey(test.key)}
                className={cn(
                  'w-full flex items-center justify-between px-5 py-3 text-left transition-all',
                  isActive ? 'bg-near-black text-warm-ivory' : 'hover:bg-near-black/4 text-near-black'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn('text-xs font-mono font-bold shrink-0', isActive ? 'text-warm-ivory/40' : 'text-near-black/25')}>
                    {test.code}
                  </span>
                  <span className="text-xs font-semibold truncate">{test.name}</span>
                </div>
                {done && !isActive && (
                  <Badge variant={res === 'Pass' ? 'success' : 'error'} className="shrink-0 ml-2 text-[10px] px-1.5 py-0">{res}</Badge>
                )}
                {!done && !isActive && <ChevronRight className="h-3.5 w-3.5 text-near-black/20 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Center: Test workspace ──────────────────────────────────── */}
      <div className="flex-1 bg-warm-ivory overflow-auto flex flex-col">
        {/* Sub-header */}
        <div className="px-6 py-3 border-b border-near-black/8 bg-white/50 flex flex-wrap gap-2 items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-heading font-bold text-near-black">
              {TESTS.find(t => t.key === activeKey)?.name}
            </h2>
            <span className="text-xs font-mono text-near-black/30">
              {TESTS.find(t => t.key === activeKey)?.code}
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Badge variant="info">Class {cls}</Badge>
            <Badge variant="default">Max {max} kg</Badge>
            <Badge variant="default">e = {e} g</Badge>
            <Badge variant="default">d = {d} g</Badge>
          </div>
        </div>

        <div className="p-5 flex-1">

          {/* ── T.3.2: Weighing Performance ──────────────────────────── */}
          {activeKey === 'weighing' && (
            <>
              <div className="glass-surface rounded-2xl overflow-hidden mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs whitespace-nowrap font-mono">
                    <thead>
                      <tr className="border-b border-near-black/8 bg-near-black/4">
                        {['Load L (g)', 'Indicated I (g)', 'Add ΔL (g)'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left font-semibold text-near-black/50 uppercase tracking-wider">{h}</th>
                        ))}
                        {['Calc P (g)', 'Error E (g)', 'Corr Ec (g)'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left font-semibold text-industrial-blue/60 uppercase tracking-wider bg-industrial-blue/3">{h}</th>
                        ))}
                        <th className="px-4 py-2.5 text-left font-semibold text-near-black/30 uppercase tracking-wider">MPE</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-near-black/30 uppercase tracking-wider">Result</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-near-black/5">
                      {wRows.map((r: any, i: number) => (
                        <tr key={r.id || i} className={cn('transition-colors', r.result === 'Fail' ? 'bg-red/5' : r.result === 'Pass' ? 'bg-emerald/3' : '')}>
                          <td className="px-3 py-1.5"><NumInput value={r.load} onChange={v => { const n = [...wRows]; n[i] = { ...n[i], load: v }; setWRows(n); }} /></td>
                          <td className="px-3 py-1.5"><NumInput value={r.ind} onChange={v => { const n = [...wRows]; n[i] = { ...n[i], ind: v }; setWRows(n); }} /></td>
                          <td className="px-3 py-1.5"><NumInput value={r.add} onChange={v => { const n = [...wRows]; n[i] = { ...n[i], add: v }; setWRows(n); }} /></td>
                          <td className="px-4 py-2 bg-industrial-blue/3 text-industrial-blue">{r.P !== undefined ? Number(r.P).toFixed(4) : '—'}</td>
                          <td className="px-4 py-2 bg-industrial-blue/3 text-industrial-blue">{r.E !== undefined ? Number(r.E).toFixed(4) : '—'}</td>
                          <td className="px-4 py-2 bg-industrial-blue/5 text-industrial-blue font-bold">{r.Ec !== undefined ? Number(r.Ec).toFixed(4) : '—'}</td>
                          <td className="px-4 py-2 text-near-black/40">{r.mpe !== undefined ? `±${Number(r.mpe).toFixed(4)}` : '—'}</td>
                          <td className="px-4 py-2"><ResultBadge result={r.result} /></td>
                          <td className="px-2 py-1.5">
                            <button onClick={() => wRows.length > 1 && setWRows(wRows.filter((_: any, j: number) => j !== i))}
                              className="h-6 w-6 flex items-center justify-center rounded text-near-black/15 hover:text-red hover:bg-red/8 transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setWRows([...wRows, { id: Date.now(), load: '', ind: '', add: '' }])}>
                  <Plus className="h-3.5 w-3.5" /> Add Row
                </Button>
                <Button variant="subtle" size="sm" onClick={() => evalWeighing(wRows)}>
                  <Calculator className="h-3.5 w-3.5" /> Calculate
                </Button>
              </div>
            </>
          )}

          {/* ── T.3.3: Repeatability ────────────────────────────────── */}
          {activeKey === 'repeatability' && (
            <div className="glass-surface rounded-2xl p-6 max-w-md">
              <p className="text-xs text-near-black/50 mb-4 leading-relaxed">
                Weigh the same test load at least 5 times without repositioning. Enter each indication below.
              </p>
              <div className="space-y-2.5 mb-4">
                {repReadings.map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-near-black/30 w-6">R{i + 1}</span>
                    <NumInput value={v} onChange={val => { const n = [...repReadings]; n[i] = val; setRepReadings(n); }} placeholder="0.0000" w="w-36" />
                    <span className="text-xs text-near-black/30">g</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setRepReadings([...repReadings, ''])}>
                  <Plus className="h-3.5 w-3.5" /> Add reading
                </Button>
                <Button variant="subtle" size="sm" onClick={() => evalRepeatability(repReadings)}>
                  <Calculator className="h-3.5 w-3.5" /> Evaluate
                </Button>
              </div>
              {repResult && (
                <div className={cn('mt-5 p-4 rounded-xl border text-sm', repResult.passed ? 'bg-emerald/8 border-emerald/20' : 'bg-red/8 border-red/20')}>
                  <p className="font-semibold mb-1">{repResult.passed ? '✓ PASS' : '✗ FAIL'}</p>
                  <p className="text-xs text-near-black/60">{repResult.summary}</p>
                  <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                    <div><p className="text-near-black/40">Mean</p><p className="font-mono font-bold">{Number(repResult.mean).toFixed(4)} g</p></div>
                    <div><p className="text-near-black/40">Range</p><p className="font-mono font-bold">{Number(repResult.range).toFixed(4)} g</p></div>
                    <div><p className="text-near-black/40">MPE (0.5e)</p><p className="font-mono font-bold">±{Number(repResult.mpeRepeat).toFixed(4)} g</p></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── T.3.4: Eccentricity ─────────────────────────────────── */}
          {activeKey === 'eccentricity' && (
            <div className="glass-surface rounded-2xl p-6 max-w-md">
              <div className="mb-5">
                <Label htmlFor="eccLoad">Test Load (g)</Label>
                <NumInput value={eccLoad} onChange={v => { setEccLoad(v); }} placeholder="Test load in grams" w="w-48" />
                <p className="text-xs text-near-black/35 mt-1">Typically 1/3 of Max capacity</p>
              </div>
              <div className="space-y-2.5 mb-4">
                {eccRows.map((row, i) => (
                  <div key={row.position} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-near-black/50 w-14">{row.position}</span>
                    <NumInput value={row.indication}
                      onChange={v => { const n = [...eccRows]; n[i] = { ...n[i], indication: v }; setEccRows(n); }}
                      placeholder="indication (g)" w="w-36" />
                    <span className="text-xs text-near-black/30">g</span>
                  </div>
                ))}
              </div>
              <Button variant="subtle" size="sm" onClick={() => evalEccentricity(eccRows, eccLoad)}>
                <Calculator className="h-3.5 w-3.5" /> Evaluate
              </Button>
              {eccResult && (
                <div className={cn('mt-5 p-4 rounded-xl border text-sm', eccResult.passed ? 'bg-emerald/8 border-emerald/20' : 'bg-red/8 border-red/20')}>
                  <p className="font-semibold mb-1">{eccResult.passed ? '✓ PASS' : '✗ FAIL'}</p>
                  <p className="text-xs text-near-black/60">{eccResult.summary}</p>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                    <div><p className="text-near-black/40">Max diff</p><p className="font-mono font-bold">{Number(eccResult.maxDiff).toFixed(4)} g</p></div>
                    <div><p className="text-near-black/40">MPE</p><p className="font-mono font-bold">±{Number(eccResult.mpe).toFixed(4)} g</p></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── T.3.5: Discrimination ───────────────────────────────── */}
          {activeKey === 'discrimination' && (
            <div className="glass-surface rounded-2xl p-6 max-w-md">
              <p className="text-xs text-near-black/50 mb-5 leading-relaxed">
                Load the instrument to near max, record indication, then add 0.1e. Record new indication.
              </p>
              <div className="space-y-4 mb-5">
                {[
                  { key: 'loadG', label: 'Applied Load (g)', placeholder: 'Near max load' },
                  { key: 'indicationBefore', label: 'Indication Before (g)', placeholder: 'Before adding 0.1e' },
                  { key: 'addedWeightG', label: `Added Weight (g) [0.1e = ${(0.1 * e).toFixed(4)} g]`, placeholder: `${(0.1 * e).toFixed(4)}` },
                  { key: 'indicationAfter', label: 'Indication After (g)', placeholder: 'After adding 0.1e' },
                ].map(f => (
                  <FormGroup key={f.key}>
                    <Label htmlFor={f.key}>{f.label}</Label>
                    <NumInput value={discData[f.key] || ''}
                      onChange={v => setDiscData((p: any) => ({ ...p, [f.key]: v }))}
                      placeholder={f.placeholder} w="w-48" />
                  </FormGroup>
                ))}
              </div>
              <Button variant="subtle" size="sm" onClick={() => evalDiscrimination(discData)}>
                <Calculator className="h-3.5 w-3.5" /> Evaluate
              </Button>
              {discResult && (
                <div className={cn('mt-5 p-4 rounded-xl border text-sm', discResult.passed ? 'bg-emerald/8 border-emerald/20' : 'bg-red/8 border-red/20')}>
                  <p className="font-semibold mb-1">{discResult.passed ? '✓ PASS' : '✗ FAIL'}</p>
                  <p className="text-xs text-near-black/60">{discResult.summary}</p>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                    <div><p className="text-near-black/40">Change</p><p className="font-mono font-bold">{Number(discResult.changeMagnitude).toFixed(4)} g</p></div>
                    <div><p className="text-near-black/40">Required (1d)</p><p className="font-mono font-bold">{Number(discResult.minimumRequired).toFixed(4)} g</p></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── T.4.1: Tare Weighing ────────────────────────────────── */}
          {activeKey === 'tare' && (
            <div className="glass-surface rounded-2xl p-6 max-w-md">
              <p className="text-xs text-near-black/50 mb-5 leading-relaxed">
                Place a tare mass, press tare. Record the indication after tare. It should be within ±0.25e.
              </p>
              <div className="space-y-4 mb-5">
                {[
                  { key: 'tareMassG', label: 'Tare Mass (g)', placeholder: 'Mass of tare object' },
                  { key: 'indicationAfterTare', label: 'Indication After Tare (g)', placeholder: 'Should be near 0' },
                ].map(f => (
                  <FormGroup key={f.key}>
                    <Label htmlFor={f.key}>{f.label}</Label>
                    <NumInput value={tareData[f.key] || ''}
                      onChange={v => setTareData((p: any) => ({ ...p, [f.key]: v }))}
                      placeholder={f.placeholder} w="w-48" />
                  </FormGroup>
                ))}
              </div>
              <Button variant="subtle" size="sm" onClick={() => evalTare(tareData)}>
                <Calculator className="h-3.5 w-3.5" /> Evaluate
              </Button>
              {tareResult && (
                <div className={cn('mt-5 p-4 rounded-xl border text-sm', tareResult.passed ? 'bg-emerald/8 border-emerald/20' : 'bg-red/8 border-red/20')}>
                  <p className="font-semibold mb-1">{tareResult.passed ? '✓ PASS' : '✗ FAIL'}</p>
                  <p className="text-xs text-near-black/60">{tareResult.summary}</p>
                  <p className="text-xs text-near-black/40 mt-1">Threshold: ±{Number(tareResult.zeroThreshold).toFixed(4)} g (0.25e)</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Live Console ─────────────────────────────────────── */}
      <div className="w-full xl:w-64 shrink-0 bg-near-black text-warm-ivory flex flex-col border-t xl:border-t-0 xl:border-l border-warm-ivory/5">
        <div className="px-5 py-3 border-b border-warm-ivory/8 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-electric-lime" />
          <span className="text-xs font-semibold text-electric-lime uppercase tracking-wider">Live Status</span>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-auto">
          {/* Active result indicator */}
          <div className={cn(
            'rounded-xl p-4 text-center',
            activeResultStr === 'Pass' ? 'bg-electric-lime/10 border border-electric-lime/20' :
              activeResultStr === 'Fail' ? 'bg-red/10 border border-red/20' :
                'bg-warm-ivory/5 border border-warm-ivory/10'
          )}>
            <AlertTriangle className={cn(
              'h-6 w-6 mx-auto mb-2',
              activeResultStr === 'Pass' ? 'text-electric-lime' : activeResultStr === 'Fail' ? 'text-red' : 'text-warm-ivory/25'
            )} />
            <p className={cn(
              'text-lg font-heading font-bold',
              activeResultStr === 'Pass' ? 'text-electric-lime' : activeResultStr === 'Fail' ? 'text-red' : 'text-warm-ivory/30'
            )}>
              {activeResultStr}
            </p>
          </div>

          {/* Weighing specific details */}
          {activeKey === 'weighing' && lastWRow.Ec !== undefined && (
            <div className="space-y-2.5 text-xs font-mono">
              {[
                { label: 'Last Ec', value: Number(lastWRow.Ec).toFixed(4) + ' g' },
                { label: 'MPE', value: lastWRow.mpe !== undefined ? `±${Number(lastWRow.mpe).toFixed(4)} g` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-warm-ivory/8 pb-2">
                  <span className="text-warm-ivory/40">{label}</span>
                  <span className="text-warm-ivory font-semibold">{value}</span>
                </div>
              ))}
              {wResult && (
                <p className="text-warm-ivory/40 text-[10px] pt-1 leading-relaxed">{wResult.summary}</p>
              )}
            </div>
          )}

          {/* Tests progress */}
          <div>
            <p className="text-xs font-semibold text-warm-ivory/40 uppercase tracking-wider mb-2">Progress</p>
            <div className="space-y-1.5">
              {TESTS.map(t => {
                const done = isCompleted(t.key);
                const res = getResult(t.key);
                return (
                  <div key={t.key} className="flex items-center gap-2">
                    {done
                      ? <CheckCircle2 className={cn('h-3.5 w-3.5 shrink-0', res === 'Pass' ? 'text-electric-lime' : 'text-red')} />
                      : <div className="h-3.5 w-3.5 rounded-full border border-warm-ivory/15 shrink-0" />
                    }
                    <span className={cn('text-xs', done ? 'text-warm-ivory/70' : 'text-warm-ivory/25')}>{t.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Summary */}
          {aiSummary && (
            <div className="rounded-xl p-3 bg-electric-lime/8 border border-electric-lime/15">
              <p className="text-xs font-semibold text-electric-lime mb-1.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AI Summary
              </p>
              <p className="text-xs text-warm-ivory/70 leading-relaxed">{aiSummary}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-warm-ivory/8 space-y-2">
          <Button
            onClick={handleAISummary}
            disabled={aiLoading}
            variant="ghost"
            size="sm"
            className="w-full text-warm-ivory/50 hover:text-electric-lime hover:bg-white/5"
          >
            {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            AI Summary
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-warm-ivory text-near-black hover:bg-electric-lime"
            size="sm"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Save Test
          </Button>
        </div>
      </div>
    </div>
  );
}

// Need FormGroup import
import { Label, FormGroup } from '@/components/ui/Form';
