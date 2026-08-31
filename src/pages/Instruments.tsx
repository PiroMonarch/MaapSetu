import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label, FormGroup } from '@/components/ui/Form';
import { Search, Plus, Archive, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Instruments() {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchInstruments();
  }, []);

  const fetchInstruments = () => {
    fetch('/api/instruments')
      .then(res => res.json())
      .then(data => setInstruments(data))
      .catch(console.error);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    await fetch('/api/instruments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    setShowAddForm(false);
    fetchInstruments();
  };

  if (showAddForm) {
    return (
      <div className="flex flex-col min-h-full max-w-screen-md mx-auto w-full px-6 py-12 lg:px-20">
        <div className="flex justify-between items-center mb-12 border-b-4 border-near-black pb-8">
          <h1 className="text-4xl lg:text-6xl font-heading font-bold uppercase tracking-tighter leading-none">
            Register Instrument
          </h1>
          <button onClick={() => setShowAddForm(false)} className="text-near-black/50 hover:text-near-black">
            <X className="h-8 w-8" />
          </button>
        </div>
        
        <form onSubmit={handleAddSubmit} className="space-y-6">
          <FormGroup>
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input id="manufacturer" name="manufacturer" required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input id="serialNumber" name="serialNumber" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="accuracyClass">Accuracy Class</Label>
            <select id="accuracyClass" name="accuracyClass" className="w-full bg-white/50 border-2 border-near-black/20 focus:border-near-black outline-none px-4 py-3 font-bold font-mono text-near-black uppercase transition-colors" required>
              <option value="I">Class I</option>
              <option value="II">Class II</option>
              <option value="III">Class III</option>
              <option value="IIII">Class IIII</option>
            </select>
          </FormGroup>
          <div className="grid grid-cols-2 gap-6">
            <FormGroup>
              <Label htmlFor="maxCapacity">Max Capacity (kg)</Label>
              <Input id="maxCapacity" name="maxCapacity" type="number" step="any" required />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="minCapacity">Min Capacity (g)</Label>
              <Input id="minCapacity" name="minCapacity" type="number" step="any" required />
            </FormGroup>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <FormGroup>
              <Label htmlFor="eValue">Verification Scale 'e' (g)</Label>
              <Input id="eValue" name="eValue" type="number" step="any" required />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="dValue">Actual Scale 'd' (g)</Label>
              <Input id="dValue" name="dValue" type="number" step="any" required />
            </FormGroup>
          </div>
          <Button type="submit" className="w-full mt-8 bg-near-black text-warm-ivory hover:bg-electric-lime hover:text-near-black">
            Register Instrument
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full max-w-screen-2xl mx-auto w-full px-6 py-12 lg:px-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-4 border-near-black pb-8">
        <div>
          <h1 className="text-6xl lg:text-8xl font-heading font-bold uppercase tracking-tighter leading-none mb-4">
            Instruments
          </h1>
          <p className="text-xl md:text-2xl font-medium text-near-black/70 border-l-4 border-electric-lime pl-6 max-w-2xl">
            Active weighing systems registered for evaluation.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="lg" className="bg-near-black text-warm-ivory hover:bg-electric-lime hover:text-near-black">
          <Plus className="mr-2 h-5 w-5" /> Register New
        </Button>
      </div>

      <div className="flex-1 space-y-0">
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 pb-4 border-b-2 border-near-black/20 text-xs font-bold uppercase tracking-widest text-near-black/50">
          <div className="col-span-3">Model</div>
          <div className="col-span-3">Manufacturer</div>
          <div className="col-span-2">Serial No.</div>
          <div className="col-span-1">Class</div>
          <div className="col-span-2">Capacity / e</div>
          <div className="col-span-1"></div>
        </div>

        {instruments.map((inst) => (
          <div 
            key={inst._id} 
            className="group grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-6 border-b border-near-black/10 hover:bg-near-black hover:text-warm-ivory transition-all cursor-pointer"
          >
            <div className="lg:col-span-3">
              <div className="text-2xl font-bold uppercase tracking-tight">{inst.model}</div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="text-lg font-medium opacity-80">{inst.manufacturer}</div>
            </div>
            
            <div className="lg:col-span-2 font-mono font-bold text-near-black/50 group-hover:text-electric-lime transition-colors">
              {inst.serialNumber || '-'}
            </div>

            <div className="lg:col-span-1 font-mono font-bold text-sm">
              {inst.accuracyClass ? `Class ${inst.accuracyClass}` : '-'}
            </div>
            
            <div className="lg:col-span-2 font-mono text-sm opacity-60">
              {inst.maxCapacity}kg / {inst.eValue}g
            </div>
            
            <div className="lg:col-span-1 flex justify-end">
              <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider bg-industrial-blue/10 text-industrial-blue group-hover:bg-transparent group-hover:border-2 group-hover:border-warm-ivory group-hover:text-warm-ivory transition-all`}>
                View
              </div>
            </div>
          </div>
        ))}
        {instruments.length === 0 && (
          <div className="py-12 text-center text-near-black/50 font-bold uppercase tracking-widest">No instruments found</div>
        )}
      </div>
    </div>
  );
}
