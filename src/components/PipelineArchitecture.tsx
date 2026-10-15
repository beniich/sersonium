import React, { useState } from 'react';
import { Check, Copy, Terminal, Code2, Server, Database, Brain, Globe } from 'lucide-react';

export const PipelineArchitecture: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'express' | 'gemini'>('schema');

  const codeSnippets = {
    schema: `export interface SpatialTelemetryEvent {
  sensorNodeId: \`node:edge-\${string}\`;
  spatialCoordinates: [number, number, number]; // [X, Y, Z] IFC space
  timestampEpochMs: number;
  metrics: {
    thermalCelsius: number;
    pressureBar?: number;
    co2Ppm?: number;
    copFactor?: number;
  };
  geminiPrescriptive?: {
    actionRequired: boolean;
    confidenceScore: number;
    recommendedRpm?: number;
  };
};`,
    express: `// Express API Mesh Controller (Real-time telemetry ingestion)
app.post('/api/telemetry/ingest', async (req, res) => {
  const event: SpatialTelemetryEvent = req.body;
  // Edge calibration & validation
  await edgeMesh.validate(event);
  // Offline-first dual sync: Neon Serverless + Dexie.js
  await persistentStore.batchInsert([event]);
  // Asynchronous spatial inference trigger
  if (event.metrics.thermalCelsius > THRESHOLD) {
    await geminiPredictiveEngine.enqueue(event);
  }
  return res.status(202).json({ ingested: true, latencyMs: 0.38 });
});`,
    gemini: `// Gemini 3.8 Flash Industrial HVAC Prescriptive Engine
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const result = await ai.models.generateContent({
  model: 'gemini-3.8-flash',
  contents: \`Analyze vibration FFT and thermal metrics for \${chillerId}: \${JSON.stringify(telemetry)}\`,
  config: {
    responseMimeType: 'application/json',
    systemInstruction: 'Industrial thermodynamic twin diagnostics. Output JSON format.'
  }
});`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      num: 1,
      badge: '1 INGESTION',
      title: 'Cloudflare Edge',
      icon: Globe,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      description: '300+ Edge PoPs terminating MQTT/WebSocket feeds directly at the ISP perimeter with <1ms latency.',
    },
    {
      num: 2,
      badge: '2 MICROSERVICES',
      title: 'Express API Mesh',
      icon: Server,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      description: 'Scalable event-driven middleware enforcing schema validation, calibration offsets, and access rights.',
    },
    {
      num: 3,
      badge: '3 PERSISTENCE',
      title: 'Neon & Dexie Local',
      icon: Database,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      description: 'Serverless PostgreSQL with instant autoscaling and Dexie IndexedDB caching for offline resilience.',
    },
    {
      num: 4,
      badge: '4 INFERENCE',
      title: 'Gemini AI Engine',
      icon: Brain,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      description: 'Continuous spatial correlation across thermal, structural, and mechanical logs predicting fault conditions.',
    },
  ];

  return (
    <section id="architecture" className="py-20 scroll-mt-16 bg-white dark:bg-[#070709] border-t border-slate-200/80 dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-mono tracking-wider text-orange-500 uppercase font-semibold mb-2">
            FULLSTACK PIPELINE
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            From Sensor Edge to Spatial Cognition
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-neutral-400 font-normal leading-relaxed">
            Resilient multi-tier distributed pipeline handling massive temporal stream validation without centralized bottlenecks.
          </p>
        </div>

        {/* 4 Pipeline Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-slate-50 dark:bg-[#0e0e14] rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:border-orange-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                      {step.badge}
                    </span>
                    <div className={`p-1.5 rounded-lg ${step.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Code Snippet Container */}
        <div className="bg-[#0b0f17] rounded-2xl border border-slate-800 dark:border-white/[0.08] shadow-2xl overflow-hidden text-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-900/70 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
              </div>
              <div className="flex items-center gap-1 font-mono text-slate-300">
                <Code2 className="w-3.5 h-3.5 text-orange-400" />
                <span>telemetryStream.schema.ts</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    activeTab === 'schema' ? 'bg-orange-500 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Schema
                </button>
                <button
                  onClick={() => setActiveTab('express')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    activeTab === 'express' ? 'bg-orange-500 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Express API
                </button>
                <button
                  onClick={() => setActiveTab('gemini')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    activeTab === 'gemini' ? 'bg-orange-500 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Gemini SDK
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-400 hidden md:inline">TypeScript 5.4 - Strict</span>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy snippet"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-5 sm:p-6 overflow-x-auto text-[13px] font-mono leading-relaxed bg-[#0b1120]">
            <pre className="text-slate-300">
              <code>{codeSnippets[activeTab]}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
