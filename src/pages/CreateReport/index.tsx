import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const steps = [
  { id: '01', name: 'General', path: '/reports/new/general' },
  { id: '02', name: 'Specs', path: '/reports/new/instrument' },
  { id: '03', name: 'Matrix', path: '/reports/new/conditions' },
  { id: '04', name: 'Workspace', path: '/reports/new/tests' },
  { id: '05', name: 'Generate', path: '/reports/new/review' },
];

export function CreateReportLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');
  const { setCurrentReportId, updateReportData, updateTestResults, currentReportId } = useAppStore();

  useEffect(() => {
    if (reportId) {
      setCurrentReportId(reportId);
      fetch(`/api/reports/${reportId}`)
        .then(res => res.json())
        .then(data => {
          updateReportData(data);
          updateTestResults(data.testResults || []);
        });
    } else {
      setCurrentReportId(null);
      updateReportData({});
      updateTestResults([]);
    }
  }, [reportId]);
  
  const currentStepIndex = steps.findIndex(s => location.pathname.includes(s.path));
  const activeStep = currentStepIndex >= 0 ? currentStepIndex : 0;

  const handleNext = async () => {
    // If we are at step 1 and have no report ID, we should create a draft
    if (activeStep === 0 && !currentReportId) {
      const data = useAppStore.getState().reportData;
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'Draft' })
      });
      const newReport = await res.json();
      setCurrentReportId(newReport._id);
      navigate(steps[activeStep + 1].path + `?id=${newReport._id}`);
      return;
    }

    // If on final step, execute / finalize the report
    if (activeStep === steps.length - 1) {
      if (!currentReportId) return; // nothing to execute
      try {
        await fetch(`/api/reports/${currentReportId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Completed' })
        });
        // Optionally navigate to reports list after execution
        navigate('/reports');
      } catch (err) {
        console.error('Execute error', err);
      }
      return;
    }

    if (activeStep < steps.length - 1) {
      navigate(steps[activeStep + 1].path + (currentReportId ? `?id=${currentReportId}` : ''));
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      navigate(steps[activeStep - 1].path + (currentReportId ? `?id=${currentReportId}` : ''));
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col h-full bg-warm-ivory">
      {/* Editorial Stepper Header */}
      <div className="bg-near-black text-warm-ivory px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {steps.map((step, idx) => (
            <div 
              key={step.id} 
              className={cn(
                "flex items-center gap-3 whitespace-nowrap transition-colors cursor-pointer",
                idx === activeStep ? "text-electric-lime" : idx < activeStep ? "text-warm-ivory" : "text-warm-ivory/30"
              )}
              onClick={() => navigate(step.path + (currentReportId ? `?id=${currentReportId}` : ''))}
            >
              <span className="font-mono text-sm font-bold">{step.id}</span>
              <span className="font-bold uppercase tracking-widest">{step.name}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="border-warm-ivory/20 text-warm-ivory hover:bg-warm-ivory hover:text-near-black" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button className="bg-electric-lime text-near-black hover:bg-white" onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Execute' : 'Next'} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
