import React from 'react';
import { Cpu, Wrench, Leaf, Box, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';

interface SixPillarsProps {
  onOpenPillar: (pillarIndex: number) => void;
}

export const SixPillars: React.FC<SixPillarsProps> = ({ onOpenPillar }) => {
  const pillars = [
    {
      id: 1,
      code: 'PILLAR // 01',
      title: 'Smart Utilities & BMS',
      icon: Cpu,
      iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      description:
        'Universal industrial bus binding for KNX, BACnet, and Modbus networks. Direct real-time controls for CityPulse DALI circadian lighting and HydroSync flow telemetry.',
      tags: ['BACnet IP', 'Modbus RTU', 'DALI-2'],
      badgeColor: 'text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08]',
    },
    {
      id: 2,
      code: 'PILLAR // 02',
      title: 'CMMS & Asset Lifecycle',
      icon: Wrench,
      iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      description:
        'Predictive asset health scores, automatic work order generation via Gemini AI, NFC/QR field dispatch, and multi-warehouse MRO component tracking.',
      tags: ['Predictive MTBF', 'NFC Tapping', 'Work Order SLA'],
      badgeColor: 'text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08]',
    },
    {
      id: 3,
      code: 'PILLAR // 03',
      title: 'ESG & Carbon Strategy',
      icon: Leaf,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      description:
        'Continuous CSRD Scope 1, 2, and 3 accounting with immutable ledger exports. Automated WELL-certified indoor air quality auditing and energy abatement verification.',
      tags: ['EU CSRD', 'GHG Protocol', 'WELL v2'],
      badgeColor: 'text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08]',
    },
    {
      id: 4,
      code: 'PILLAR // 04',
      title: '3D Digital Twin & BIM',
      icon: Box,
      iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      description:
        'IFC 4.3 and Autodesk Revit geometry ingested directly into high-fidelity Three.js and WebGL scenes. 60 FPS thermal slicing and volumetric heatmaps.',
      tags: ['IFC 4.3', 'Three.js', 'Spatial LOD 400'],
      badgeColor: 'text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08]',
    },
    {
      id: 5,
      code: 'PILLAR // 05',
      title: 'Grafana Observability',
      icon: BarChart3,
      iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      description:
        'Industrial PromQL engines, Prometheus exporters for edge nodes, and custom visual dashboards sustaining over 1,000,000 real-time telemetry points per second.',
      tags: ['PromQL', 'Grafana Core', 'OpenTelemetry'],
      badgeColor: 'text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08]',
    },
    {
      id: 6,
      code: 'PILLAR // 06',
      title: 'Zero-Trust & Resilient Edge',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      description:
        'Distributed Cloudflare Workers compute paired with Neon Serverless Postgres and Dexie.js offline-first client replication. End-to-end mTLS hardware encryption.',
      tags: ['Neon DB', 'mTLS v1.3', 'Dexie Offline'],
      badgeColor: 'text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08]',
    },
  ];

  return (
    <section id="pillars" className="py-20 scroll-mt-16 bg-slate-50 dark:bg-[#070709] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-mono tracking-wider text-orange-500 uppercase font-semibold mb-2">
              SYSTEM ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              The 6 Pillars of SENSORIUM
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-neutral-400 max-w-md font-normal leading-relaxed md:text-right">
            A coherent modular framework architected to connect raw mechanical hardware with autonomous spatial intelligence.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                onClick={() => onOpenPillar(idx)}
                className="group relative bg-white dark:bg-[#0e0e14] rounded-2xl p-6 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md hover:border-orange-500/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-2.5 rounded-xl ${pillar.iconBg} transition-transform group-hover:scale-110 duration-200`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-neutral-500">
                      {pillar.code}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors mb-2.5">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                {/* Footer Tags */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {pillar.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border ${pillar.badgeColor}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-slate-400 dark:text-neutral-500 group-hover:text-orange-500 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4" />
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
