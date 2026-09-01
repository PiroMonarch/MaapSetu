import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label, FormGroup } from '@/components/ui/Form';
import { Hash, Calendar, User, Building2, MapPin, Info } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const PURPOSE_OPTIONS = [
  'Model Approval',
  'Verification',
  'Re-verification',
  'Other',
];

export function Step1General() {
  const { reportData, updateReportData, user } = useAppStore();
  const [instruments, setInstruments] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/instruments').then(r => r.json()).then(setInstruments);
    fetch('/api/users').then(r => r.json()).then(setUsersList).catch(() => setUsersList([]));
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    updateReportData({ [key]: e.target.value });

  return (
    <div className="max-w-screen-lg mx-auto px-5 py-8 lg:px-10 page-enter">
      {/* Section header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="info" dot>Step 1 of 5</Badge>
        </div>
        <h2 className="text-2xl font-heading font-bold text-near-black tracking-tight">General Information</h2>
        <p className="text-sm text-near-black/50 mt-1 max-w-lg">
          Provide foundational metadata for this NAWI evaluation. These details appear on the final OIML R&nbsp;76 report.
        </p>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-industrial-blue/6 border border-industrial-blue/15 mb-6">
        <Info className="h-4 w-4 text-industrial-blue shrink-0 mt-0.5" />
        <p className="text-xs text-industrial-blue/80 leading-relaxed">
          The application number is mandatory and must be unique. The selected instrument's specifications will be
          auto-populated in Step&nbsp;2.
        </p>
      </div>

      <div className="space-y-5">
        {/* Section A — Application Details */}
        <div className="glass-surface rounded-2xl p-6">
          <p className="text-xs font-semibold text-near-black/50 uppercase tracking-wider mb-5">Application Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormGroup>
              <Label htmlFor="applicationNo">Application Number *</Label>
              <Input id="applicationNo" value={reportData.applicationNo || ''} onChange={set('applicationNo')}
                placeholder="APP-2026-XXXX" leftIcon={<Hash className="h-3.5 w-3.5" />} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="date">Test Date *</Label>
              <Input id="date" type="date"
                value={reportData.date?.split('T')[0] || new Date().toISOString().split('T')[0]}
                onChange={set('date')}
                leftIcon={<Calendar className="h-3.5 w-3.5" />} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="purposeOfTest">Purpose of Test</Label>
              <Select id="purposeOfTest" value={reportData.purposeOfTest || 'Model Approval'} onChange={set('purposeOfTest')}>
                {PURPOSE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="laboratory">Testing Laboratory</Label>
              <Input id="laboratory" value={reportData.laboratory || ''} onChange={set('laboratory')}
                placeholder="e.g. NABL-Accredited Lab, New Delhi"
                leftIcon={<Building2 className="h-3.5 w-3.5" />} />
            </FormGroup>
          </div>
        </div>

        {/* Section B — Applicant */}
        <div className="glass-surface rounded-2xl p-6">
          <p className="text-xs font-semibold text-near-black/50 uppercase tracking-wider mb-5">Applicant / Manufacturer Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormGroup>
              <Label htmlFor="applicantName">Applicant / Manufacturer Name</Label>
              <Input id="applicantName" value={reportData.applicantName || ''} onChange={set('applicantName')}
                placeholder="Company or individual name"
                leftIcon={<Building2 className="h-3.5 w-3.5" />} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="applicantAddress">Address</Label>
              <Input id="applicantAddress" value={reportData.applicantAddress || ''} onChange={set('applicantAddress')}
                placeholder="City, State"
                leftIcon={<MapPin className="h-3.5 w-3.5" />} />
            </FormGroup>
          </div>
        </div>

        {/* Section C — Instrument & Inspector */}
        <div className="glass-surface rounded-2xl p-6">
          <p className="text-xs font-semibold text-near-black/50 uppercase tracking-wider mb-5">Instrument & Inspector</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormGroup className="md:col-span-2">
              <Label htmlFor="instrumentId">Instrument Under Test *</Label>
              <Select id="instrumentId" value={reportData.instrumentId || ''} onChange={set('instrumentId')}>
                <option value="">— Select instrument —</option>
                {instruments.map(inst => (
                  <option key={inst._id} value={inst._id}>
                    {inst.manufacturer} · {inst.model} · SN: {inst.serialNumber || 'N/A'} · Class {inst.accuracyClass}
                  </option>
                ))}
              </Select>
              {instruments.length === 0 && (
                <p className="mt-1.5 text-xs text-near-black/40">
                  No instruments found.{' '}
                  <a href="#/instruments" className="text-industrial-blue hover:underline">Register one first →</a>
                </p>
              )}
            </FormGroup>
            <FormGroup className="md:col-span-2">
              <Label htmlFor="inspector">Lead Inspector</Label>
              {usersList.length > 0 ? (
                <Select id="inspector" value={reportData.inspector || user?.name || ''} onChange={set('inspector')}>
                  {user && <option value={user.name}>{user.name} (you)</option>}
                  <option value="">— Select inspector —</option>
                  {usersList.map(u => (
                    <option key={u._id} value={u.name}>
                      {u.name}{u.designation ? ` · ${u.designation}` : ''}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input id="inspector" value={reportData.inspector || user?.name || ''} onChange={set('inspector')}
                  placeholder="Inspector name" leftIcon={<User className="h-3.5 w-3.5" />} />
              )}
            </FormGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
