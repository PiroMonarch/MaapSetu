import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label, FormGroup } from '@/components/ui/Form';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, X, Settings2, ChevronRight, Weight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstrumentFormProps {
  onClose: () => void;
  onSaved: () => void;
}

function InstrumentForm({ onClose, onSaved }: InstrumentFormProps) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    try {
      await fetch('/api/instruments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ duration: 0.2 }}
      className="glass-surface rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-heading font-bold text-near-black">Register Instrument</h2>
          <p className="text-xs text-near-black/45 mt-0.5">Add a new weighing instrument to your registry</p>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-near-black/8 text-near-black/50 hover:text-near-black transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormGroup>
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input id="manufacturer" name="manufacturer" required placeholder="e.g. Mettler Toledo" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" required placeholder="e.g. XS-6002S" />
          </FormGroup>
        </div>

        <FormGroup>
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input id="serialNumber" name="serialNumber" placeholder="e.g. SN-20240001" />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="accuracyClass">Accuracy Class</Label>
          <Select id="accuracyClass" name="accuracyClass" required>
            <option value="I">Class I — Special</option>
            <option value="II">Class II — High</option>
            <option value="III">Class III — Medium</option>
            <option value="IIII">Class IIII — Ordinary</option>
          </Select>
        </FormGroup>

        <div className="grid grid-cols-2 gap-5">
          <FormGroup>
            <Label htmlFor="maxCapacity">Max Capacity (kg)</Label>
            <Input id="maxCapacity" name="maxCapacity" type="number" step="any" required placeholder="e.g. 6" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="minCapacity">Min Capacity (g)</Label>
            <Input id="minCapacity" name="minCapacity" type="number" step="any" required placeholder="e.g. 10" />
          </FormGroup>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <FormGroup>
            <Label htmlFor="eValue">Verification Scale 'e' (g)</Label>
            <Input id="eValue" name="eValue" type="number" step="any" required placeholder="e.g. 0.01" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="dValue">Actual Scale 'd' (g)</Label>
            <Input id="dValue" name="dValue" type="number" step="any" required placeholder="e.g. 0.01" />
          </FormGroup>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Saving…' : 'Register Instrument'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

export function Instruments() {
  const [instruments, setInstruments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInstruments();
  }, []);

  const fetchInstruments = () => {
    setLoading(true);
    fetch('/api/instruments')
      .then(res => res.json())
      .then(data => { setInstruments(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const filtered = instruments.filter(i => {
    const q = search.toLowerCase();
    return (
      !q ||
      (i.model || '').toLowerCase().includes(q) ||
      (i.manufacturer || '').toLowerCase().includes(q) ||
      (i.serialNumber || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col max-w-screen-2xl mx-auto w-full px-5 py-8 lg:px-10 page-enter">

      {/* ── Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-near-black tracking-tight">Instruments</h1>
          <p className="text-sm text-near-black/45 mt-0.5">{instruments.length} registered instrument{instruments.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="md">
          <Plus className="h-4 w-4" /> Register New
        </Button>
      </div>

      <div className={`grid gap-6 ${showForm ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>
        {/* ── List ─────────────────────────────────── */}
        <div className={showForm ? 'lg:col-span-3' : 'col-span-1'}>
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search instruments…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="h-3.5 w-3.5" />}
            />
          </div>

          <div className="glass-surface rounded-2xl overflow-hidden">
            {/* Header row */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-near-black/8 bg-near-black/3">
              <div className="col-span-4 text-xs font-semibold text-near-black/40 uppercase tracking-wider">Model</div>
              <div className="col-span-3 text-xs font-semibold text-near-black/40 uppercase tracking-wider">Manufacturer</div>
              <div className="col-span-2 text-xs font-semibold text-near-black/40 uppercase tracking-wider">Serial</div>
              <div className="col-span-1 text-xs font-semibold text-near-black/40 uppercase tracking-wider">Class</div>
              <div className="col-span-2 text-xs font-semibold text-near-black/40 uppercase tracking-wider">Capacity</div>
            </div>

            <div className="divide-y divide-near-black/6">
              {loading && (
                <div className="py-20 text-center text-sm text-near-black/30 animate-pulse">Loading…</div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="py-20 flex flex-col items-center gap-3 text-center">
                  <div className="h-12 w-12 rounded-xl bg-near-black/5 flex items-center justify-center">
                    <Settings2 className="h-6 w-6 text-near-black/25" />
                  </div>
                  <p className="text-sm font-medium text-near-black/40">
                    {search ? 'No matching instruments' : 'No instruments registered yet'}
                  </p>
                  {!search && (
                    <Button variant="subtle" size="sm" onClick={() => setShowForm(true)}>
                      <Plus className="h-3.5 w-3.5" /> Register first instrument
                    </Button>
                  )}
                </div>
              )}
              {filtered.map((inst, idx) => (
                <motion.div
                  key={inst._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group grid grid-cols-1 lg:grid-cols-12 gap-3 items-center px-6 py-4 hover:bg-near-black/3 transition-colors cursor-pointer"
                >
                  <div className="lg:col-span-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-industrial-blue/8 flex items-center justify-center shrink-0">
                      <Weight className="h-4 w-4 text-industrial-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-near-black">{inst.model}</p>
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <p className="text-sm text-near-black/60">{inst.manufacturer}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <span className="font-mono text-xs text-near-black/40">{inst.serialNumber || '—'}</span>
                  </div>
                  <div className="lg:col-span-1">
                    <Badge variant="info">{inst.accuracyClass || '—'}</Badge>
                  </div>
                  <div className="lg:col-span-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-near-black/50">{inst.maxCapacity}kg / {inst.eValue}g</span>
                    <ChevronRight className="h-4 w-4 text-near-black/20 group-hover:text-near-black/50 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form Panel ───────────────────────────── */}
        <AnimatePresence>
          {showForm && (
            <div className="lg:col-span-2">
              <InstrumentForm
                onClose={() => setShowForm(false)}
                onSaved={() => { setShowForm(false); fetchInstruments(); }}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
