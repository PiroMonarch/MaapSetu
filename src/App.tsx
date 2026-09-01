/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Dashboard } from '@/pages/Dashboard';
import { CreateReportLayout } from '@/pages/CreateReport';
import { Step1General } from '@/pages/CreateReport/Step1General';
import { Step2Instrument } from '@/pages/CreateReport/Step2Instrument';
import { Step3Conditions } from '@/pages/CreateReport/Step3Conditions';
import { Step4Tests } from '@/pages/CreateReport/Step4Tests';
import { Step5Review } from '@/pages/CreateReport/Step5Review';
import { ReportRepository } from '@/pages/ReportRepository';
import { Instruments } from '@/pages/Instruments';
import { OimlRules } from '@/pages/OimlRules';
import { Notifications } from '@/pages/Notifications';
import { Profile } from '@/pages/Profile';

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-3xl font-heading font-bold text-near-black">{title}</h1>
    <p className="text-near-black/45 mt-2 text-sm">This section is coming soon.</p>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/reports/new" element={<CreateReportLayout />}>
            <Route index element={<Navigate to="general" replace />} />
            <Route path="general" element={<Step1General />} />
            <Route path="instrument" element={<Step2Instrument />} />
            <Route path="conditions" element={<Step3Conditions />} />
            <Route path="tests" element={<Step4Tests />} />
            <Route path="review" element={<Step5Review />} />
          </Route>

          <Route path="/reports" element={<ReportRepository />} />
          <Route path="/instruments" element={<Instruments />} />
          <Route path="/rules" element={<OimlRules />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/equipment" element={<Placeholder title="Test Equipment" />} />
          <Route path="/attachments" element={<Placeholder title="Attachments" />} />
          <Route path="/team" element={<Placeholder title="Team & Roles" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Routes>
    </Router>
  );
}
