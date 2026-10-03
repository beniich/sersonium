import React from 'react';
import { ShieldCheck, Award, FileCheck2, Lock } from 'lucide-react';

export const MetricsAndCompliance: React.FC = () => {
  const metrics = [
    {
      value: '48M+',
      label: 'Sqm Under Management',
      detail: 'Global corporate real estate footprint',
    },
    {
      value: '99.999%',
      label: 'Edge Mesh SLA',
      detail: 'Zero downtime facility failover',
    },
    {
      value: '-42%',
      label: 'Average OPEX Reduction',
      detail: 'Verified over 12 billing cycles',
    },
    {
      value: 'Zero',
      label: 'Audit Discrepancies',
      detail: 'CSRD and ISO carbon certifiable',
    },
  ];

  const compliance = [
    {
      icon: Award,
      title: 'ISO/IEC 27001',
      desc: 'Certified Security Mesh',
    },
    {
      icon: ShieldCheck,
      title: 'SOC 2 Type II',
      desc: 'Audited Continuous Trust',
    },
    {
      icon: FileCheck2,
      title: 'EU CSRD Standard',
      desc: 'ESRS E1 Energy Compliant',
    },
    {
      icon: Lock,
      title: 'GDPR Sovereign',
      desc: 'Edge Data Residency',
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 Big Numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16">
          {metrics.map((m, idx) => (
            <div key={idx} className="text-center p-4">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-1">
                {m.value}
              </div>
              <div className="text-sm font-semibold text-slate-800 mb-1">
                {m.label}
              </div>
              <div className="text-xs text-slate-500 font-normal">
                {m.detail}
              </div>
            </div>
          ))}
        </div>

        {/* 4 Compliance Standards */}
        <div className="pt-10 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
          {compliance.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {c.title}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {c.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
