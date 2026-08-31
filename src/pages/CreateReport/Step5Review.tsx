import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

export function Step5Review() {
  const { currentReportId, reportData, testResults } = useAppStore();
  const [instrument, setInstrument] = useState<any>(null);
  const navigate = useNavigate();

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

  const handleExportPDF = () => {
    if (!currentReportId) return;
    window.open(`/api/reports/${currentReportId}/pdf`, '_blank');
  };

  const handleFinalize = async () => {
    if (!currentReportId) return;
    try {
      await fetch(`/api/reports/${currentReportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' })
      });
      navigate('/reports');
    } catch (err) {
      console.error(err);
    }
  };

  const isComplete = testResults.length > 0;
  const anyFail = testResults.some(t => !t.passed);

  return (
    <div className="max-w-screen-2xl mx-auto p-6 lg:p-12 w-full">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-8 border-b-4 border-near-black pb-8">
        <div>
          <h2 className="text-[8vw] lg:text-[5vw] font-heading font-bold uppercase tracking-tighter leading-[0.85] text-near-black">
            The Decision <br/>
            Becomes A <span className="text-industrial-blue">Report.</span>
          </h2>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleExportPDF} variant="outline" size="lg" className="border-near-black"><Download className="mr-2 h-5 w-5" /> Export PDF</Button>
          <Button onClick={handleFinalize} size="lg" className="bg-near-black text-warm-ivory hover:bg-electric-lime hover:text-near-black">
            <FileText className="mr-2 h-5 w-5" /> Finalize Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Side: Summary & Actions */}
        <div className="lg:col-span-4 space-y-12">
          
          <div className="bg-near-black text-warm-ivory p-8">
            <h3 className="text-2xl font-heading font-bold uppercase tracking-tight text-electric-lime mb-6">Validation</h3>
            <ul className="space-y-4 font-mono text-sm">
              <li className="flex items-center justify-between border-b border-warm-ivory/10 pb-2">
                <span>General Information</span> <CheckCircle2 className="h-5 w-5 text-electric-lime" />
              </li>
              <li className="flex items-center justify-between border-b border-warm-ivory/10 pb-2">
                <span>Specifications</span> <CheckCircle2 className="h-5 w-5 text-electric-lime" />
              </li>
              <li className="flex items-center justify-between border-b border-warm-ivory/10 pb-2">
                <span>Test Conditions</span> <CheckCircle2 className="h-5 w-5 text-electric-lime" />
              </li>
              <li className="flex items-center justify-between pb-2">
                <span className={isComplete ? "text-electric-lime" : "text-signal-orange"}>Data Records ({testResults.length})</span> 
                {isComplete ? <CheckCircle2 className="h-5 w-5 text-electric-lime" /> : <AlertCircle className="h-5 w-5 text-signal-orange" />}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-heading font-bold uppercase tracking-tight mb-6">Test Results</h3>
            <div className="space-y-2">
              {testResults.map(test => (
                <div key={test.testName} className="flex justify-between items-center p-4 bg-white border border-near-black/10">
                  <span className="font-bold text-sm uppercase">{test.testName}</span>
                  <span className={`font-mono font-bold ${test.passed ? 'text-emerald' : 'text-red-500'}`}>{test.passed ? 'PASS' : 'FAIL'}</span>
                </div>
              ))}
              {testResults.length === 0 && (
                <div className="p-4 bg-white border border-near-black/10 text-near-black/50 font-bold uppercase text-center text-sm">No tests completed</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: A4 Document Preview */}
        <div className="lg:col-span-8 bg-black/5 p-8 md:p-12 flex justify-center overflow-x-auto">
          <div className="w-[794px] h-[1123px] bg-white shadow-2xl p-16 flex flex-col shrink-0 font-sans text-near-black relative">
            {/* Document Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <span className="text-9xl font-heading font-bold -rotate-45">MAAPSETU</span>
            </div>

            <div className="border-b-4 border-near-black pb-6 mb-12 text-center">
              <h1 className="text-3xl font-heading font-bold uppercase tracking-widest">OIML R 76</h1>
              <h2 className="text-xl font-bold uppercase tracking-widest text-near-black/60 mt-2">NAWI Test Report</h2>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-16">
              <div>
                <span className="block text-xs font-bold text-near-black/40 uppercase tracking-widest mb-1">Report ID</span>
                <span className="font-mono font-bold text-lg">{reportData.applicationNo || 'DRAFT'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-near-black/40 uppercase tracking-widest mb-1">Date</span>
                <span className="font-mono font-bold text-lg">{reportData.date?.split('T')[0] || new Date().toISOString().split('T')[0]}</span>
              </div>
              <div className="col-span-2 border-t-2 border-near-black/10 pt-8">
                <span className="block text-xs font-bold text-near-black/40 uppercase tracking-widest mb-1">Manufacturer</span>
                <span className="text-xl font-bold uppercase">{instrument?.manufacturer || '-'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-near-black/40 uppercase tracking-widest mb-1">Instrument Type</span>
                <span className="font-bold text-lg uppercase">{instrument?.model || '-'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-near-black/40 uppercase tracking-widest mb-1">Accuracy Class</span>
                <span className="font-mono font-bold text-lg">{instrument?.accuracyClass ? `Class ${instrument.accuracyClass}` : '-'}</span>
              </div>
            </div>

            <h3 className="text-lg font-bold border-b-2 border-near-black pb-2 mb-6 uppercase tracking-widest">Evaluation Summary</h3>
            <table className="w-full text-left mb-12 font-mono text-sm">
              <thead>
                <tr className="border-b-2 border-near-black/20">
                  <th className="pb-3 uppercase tracking-wider text-near-black/50">Test Designation</th>
                  <th className="pb-3 uppercase tracking-wider text-near-black/50 text-right">Result</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((t) => (
                  <tr key={t.testName} className="border-b border-near-black/10">
                    <td className="py-4 font-bold">{t.testName}</td>
                    <td className="py-4 text-right font-bold uppercase">{t.passed ? 'PASS' : 'FAIL'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-auto pt-12 border-t-4 border-near-black flex justify-between items-end">
              <div>
                <div className="w-48 h-12 border-b-2 border-near-black/20 mb-2"></div>
                <p className="font-bold uppercase tracking-wider">{reportData.inspector || 'Inspector'}</p>
                <p className="text-xs font-bold text-near-black/40 uppercase">Lead Inspector</p>
              </div>
              <div className="text-right">
                <div className="w-48 h-12 border-b-2 border-near-black/20 mb-2"></div>
                <p className="font-bold uppercase tracking-wider">Date of Approval</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
