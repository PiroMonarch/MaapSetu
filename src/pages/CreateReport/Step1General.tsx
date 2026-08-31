import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label, FormGroup } from '@/components/ui/Form';
import { Scale } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function Step1General() {
  const { reportData, updateReportData, user } = useAppStore();
  const [instruments, setInstruments] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/instruments').then(r => r.json()).then(setInstruments);
    fetch('/api/users').then(r => r.json()).then(setUsersList).catch(() => setUsersList([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    updateReportData({ [id]: value });
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-6 lg:p-12 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Giant Typography Header & Info */}
        <div className="lg:col-span-5">
          <h2 className="text-[10vw] lg:text-[6vw] font-heading font-bold uppercase tracking-tighter leading-[0.85] text-near-black mb-8">
            Let's Test <br/>
            An <span className="text-industrial-blue">Instrument.</span>
          </h2>
          
          <div className="bg-near-black text-warm-ivory p-8 relative overflow-hidden group mt-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-electric-lime/20 blur-3xl rounded-full group-hover:bg-electric-lime/30 transition-all"></div>
            <Scale className="h-12 w-12 text-electric-lime mb-6 relative z-10" />
            <h3 className="text-2xl font-heading font-bold uppercase tracking-tight relative z-10 mb-2">Report Setup</h3>
            <p className="text-warm-ivory/60 font-medium leading-relaxed relative z-10">
              Provide the foundational metadata for the NAWI evaluation. This ensures traceability and correctly identifies the applicant.
            </p>
          </div>
        </div>

        {/* Editorial Form */}
        <div className="lg:col-span-7 py-4">
          <div className="space-y-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <FormGroup>
                <Label htmlFor="applicationNo">Application Number</Label>
                <Input id="applicationNo" value={reportData.applicationNo || ''} onChange={handleChange} placeholder="APP-YYYY-XXXX" className="text-2xl font-bold font-mono" />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="date">Test Date</Label>
                <Input id="date" type="date" value={reportData.date?.split('T')[0] || new Date().toISOString().split('T')[0]} onChange={handleChange} className="text-2xl font-bold font-mono" />
              </FormGroup>
            </div>

            <FormGroup>
              <Label htmlFor="instrumentId">Select Instrument (from DB)</Label>
              <Select id="instrumentId" value={reportData.instrumentId || ''} onChange={handleChange} className="text-xl font-bold font-heading uppercase">
                <option value="">-- Select Instrument --</option>
                {instruments.map(inst => (
                  <option key={inst._id} value={inst._id}>{inst.manufacturer} - {inst.model} ({inst.serialNumber})</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="inspector">Lead Inspector</Label>
              {usersList && usersList.length > 0 ? (
                <Select id="inspector" value={reportData.inspector || user?.name || ''} onChange={handleChange} className="text-xl font-bold font-heading uppercase">
                  {user && <option value={user.name}>{user.name} (you)</option>}
                  <option value="">-- Select Inspector --</option>
                  {usersList.map(u => (
                    <option key={u._id} value={u.name}>{u.name} {u.email ? `(${u.email})` : ''}</option>
                  ))}
                </Select>
              ) : (
                <Input id="inspector" value={reportData.inspector || user?.name || ''} onChange={handleChange} className="text-xl font-bold font-heading uppercase" />
              )}
            </FormGroup>
          </div>
        </div>
        
      </div>
    </div>
  );
}
