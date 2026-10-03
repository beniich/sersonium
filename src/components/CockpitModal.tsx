import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Box,
  Activity,
  Droplets,
  SunMedium,
  Wrench,
  Leaf,
  BarChart3,
  ShieldCheck,
  Sparkles,
  QrCode,
  Scan,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertTriangle,
  Play,
  Sliders,
  Database,
  Wifi,
  WifiOff,
  Flame,
  ArrowRight,
  TrendingDown,
  Layers,
  Send,
} from 'lucide-react';
import { DigitalTwinViewer3D, INITIAL_SPATIAL_NODES } from './DigitalTwinViewer3D';
import { SpatialNode, TelemetryMetrics, WorkOrder, GeminiDiagnosis, ValveState, LightingState, UserProfile } from '../types';

interface CockpitModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: TelemetryMetrics;
  user: UserProfile | null;
  initialTab?: number;
}

export const CockpitModal: React.FC<CockpitModalProps> = ({
  isOpen,
  onClose,
  metrics,
  user,
  initialTab = 0,
}) => {
  const [activeTab, setActiveTab] = useState<number>(initialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SpatialNode | null>(INITIAL_SPATIAL_NODES[0]);

  // Operational states
  const [valve, setValve] = useState<ValveState>({
    id: 'VALVE-V14',
    name: 'HydroSync Main Loop Valve V-14',
    isOpen: true,
    pressureBar: 4.2,
    flowLpm: 142.6,
    acousticAnomalyIndex: 0.04,
    lastAction: 'Normal flow rate maintained',
  });

  const [lighting, setLighting] = useState<LightingState>({
    lux: 320,
    cctKelvin: 4200,
    circadianActive: true,
    daliZones: {
      atrium: { power: 85, state: 'ON' },
      offices: { power: 65, state: 'CIRCADIAN' },
      plantRoom: { power: 100, state: 'ON' },
      parking: { power: 30, state: 'ECO' },
    },
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 'WO-8841',
      asset: 'Chiller Loop B-02 (York Titan 800kW)',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Jean-Marc Dupont (HVAC Lead)',
      slaHoursRemaining: 3.5,
      category: 'Vibration & Bearing Overheating',
      detectedBy: 'Gemini Spatial Predictive Engine',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'WO-8839',
      asset: 'HydroSync Actuator Valve V-14',
      priority: 'MEDIUM',
      status: 'SCHEDULED',
      assignedTo: 'Sarah Benali (Fluids Tech)',
      slaHoursRemaining: 18.0,
      category: 'Preventive Packing Seal Replacement',
      detectedBy: 'Acoustic FFT Telemetry',
      timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString(),
    },
    {
      id: 'WO-8832',
      asset: 'WELL IAQ Sensor Node Suite 4B',
      priority: 'LOW',
      status: 'COMPLETED',
      assignedTo: 'Karim Mansouri (BMS Field Tech)',
      slaHoursRemaining: 0,
      category: 'NDIR CO2 Calibration Recertification',
      detectedBy: 'CSRD Audit Automated Agent',
      timestamp: new Date(Date.now() - 3600000 * 24).toLocaleTimeString(),
    },
  ]);

  // Gemini AI Diagnostic state
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<GeminiDiagnosis | null>(null);
  const [aiSource, setAiSource] = useState<string>('gemini-3.8-flash');
  const [diagnosticQuery, setDiagnosticQuery] = useState('');

  // Resilience & offline simulation
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [dexieSyncedEvents, setDexieSyncedEvents] = useState(14890);

  // MRO Spare parts
  const [spareParts, setSpareParts] = useState([
    { id: 'MRO-101', name: 'Synthetic Refrigeration Oil PAO-68', stock: 12, min: 4, unit: 'Liters' },
    { id: 'MRO-102', name: 'York Chiller Sleeve Bearing Kit 48mm', stock: 2, min: 2, unit: 'Sets' },
    { id: 'MRO-103', name: 'HydroSync EPDM Valve Flange Gasket', stock: 8, min: 5, unit: 'Units' },
    { id: 'MRO-104', name: 'MERV-13 HEPA Air Filter 24x24x2', stock: 45, min: 20, unit: 'Filters' },
  ]);

  // QR Code generator / scanner modal state
  const [qrModalAsset, setQrModalAsset] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // PromQL Console state
  const [promqlQuery, setPromqlQuery] = useState('rate(chiller_power_watts[5m])');
  const [promqlResult, setPromqlResult] = useState<string>('Values computed: 9,660 W avg over 5m window · Status: 200 OK');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  // Toggle Valve via server
  const handleToggleValve = async () => {
    try {
      const res = await fetch('/api/controls/valve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE' }),
      });
      const data = await res.json();
      if (data.valve) setValve(data.valve);
    } catch {
      // Local fallback
      setValve((v) => ({
        ...v,
        isOpen: !v.isOpen,
        flowLpm: !v.isOpen ? 142.6 : 0,
        pressureBar: !v.isOpen ? 4.2 : 5.8,
        lastAction: `Locally toggled to ${!v.isOpen ? 'OPEN' : 'CLOSED'} (Dexie Offline Mode)`,
      }));
    }
  };

  // Run Gemini Predictive AI Diagnosis
  const handleRunDiagnosis = async () => {
    setDiagnosing(true);
    try {
      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedNode?.name || 'York Chiller Loop B-02',
          customQuery: diagnosticQuery,
          telemetryData: {
            asset: selectedNode?.name || 'York Chiller Loop B-02',
            chilledWaterLeavingTempC: 7.4,
            chilledWaterReturnTempC: 12.1,
            evaporatorPressureBar: 3.8,
            condenserPressureBar: 10.4,
            motorVibrationMmSec: 3.12,
            harmonicRpmFrequencyHz: 49.8,
            compressorBearingTempC: 68.4,
          },
        }),
      });
      const data = await res.json();
      if (data.diagnosis) {
        setDiagnosisResult(data.diagnosis);
        setAiSource(data.source || 'gemini-3.8-flash');
      }
    } catch {
      // Fallback
      setDiagnosisResult({
        healthScore: 93.2,
        breakdownProbability30d: '3.8%',
        copCurrent: 6.22,
        copExpected: 6.45,
        status: 'NOMINAL_WITH_ADVISORY',
        anomalyDetected: true,
        rootCauseAnalysis: 'Minor vibration harmonic at 49.8 Hz detected on compressor bearing #2. Lubrication replenishment suggested.',
        prescriptiveActions: [
          'Perform acoustic grease replenishment with synthetic ester PAO-68.',
          'Verify water delta-T across shell-and-tube evaporator.',
        ],
        estimatedEnergySavingsKwhPerMonth: 2100,
        workOrderRecommended: {
          title: 'Bearing Inspection & Alignment Tune-up',
          priority: 'MEDIUM',
          suggestedParts: ['Synthetic Oil ISO VG 68'],
          requiredSkill: 'Certified Refrigeration F-Gas Tech',
        },
        summary: 'Thermodynamic efficiency currently 93.2%. Prescriptive maintenance scheduled.',
      });
      setAiSource('edge-offline-model');
    } finally {
      setDiagnosing(false);
    }
  };

  // Dispatch work order
  const handleCreateWorkOrder = (title: string, priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    const newOrder: WorkOrder = {
      id: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
      asset: selectedNode?.name || 'York Chiller Loop B-02',
      priority: priority,
      status: 'IN_PROGRESS',
      assignedTo: user?.name || 'On-Call Technician',
      slaHoursRemaining: priority === 'HIGH' ? 4.0 : 12.0,
      category: title,
      detectedBy: 'Gemini Spatial Cockpit',
      timestamp: new Date().toLocaleTimeString(),
    };
    setWorkOrders([newOrder, ...workOrders]);
  };

  const navTabs = [
    { label: '3D Digital Twin', icon: Box },
    { label: 'Gemini AI Diagnostics', icon: Sparkles },
    { label: 'Smart BMS & Fluides', icon: Droplets },
    { label: 'CMMS & Work Orders', icon: Wrench },
    { label: 'ESG & CSRD Carbon', icon: Leaf },
    { label: 'Grafana Observability', icon: BarChart3 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-2 sm:p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[92vh]'
        }`}
      >
        {/* Cockpit Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight">Spider CAFM Cockpit</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  v4.16.2 SPATIAL
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <span>HQ NeuMatrix - Tower Omicron-4</span>
                <span>·</span>
                <span className="text-emerald-400">Mesh Sync: Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Offline toggle test */}
            <button
              onClick={() => {
                setIsSimulatedOffline(!isSimulatedOffline);
                if (!isSimulatedOffline) {
                  setDexieSyncedEvents((prev) => prev + 12);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                isSimulatedOffline
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Test Dexie.js offline-first resilience"
            >
              {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isSimulatedOffline ? 'Offline (Dexie Cache Active)' : 'Online (Neon Serverless)'}</span>
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="flex items-center px-4 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0">
          {navTabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fafbff]">
          {/* TAB 0: 3D DIGITAL TWIN & SPATIAL INSPECTION */}
          {activeTab === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DigitalTwinViewer3D
                  onSelectNode={(node) => setSelectedNode(node)}
                  selectedNodeId={selectedNode?.id}
                />
              </div>

              {/* Spatial Node Inspector Panel */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                        <Box className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Spatial Telemetry Node</div>
                        <div className="text-[11px] font-mono text-slate-500">{selectedNode?.id}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {selectedNode?.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                    {selectedNode?.name}
                  </h3>
                  <div className="text-xs font-mono text-indigo-600 mb-3">
                    {selectedNode?.floorName}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {selectedNode?.description}
                  </p>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-mono text-slate-500">PRIMARY METRIC</div>
                      <div className="text-sm font-bold text-slate-900">{selectedNode?.metricLabel}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-mono text-slate-500">OPERATIONAL VALUE</div>
                      <div className="text-sm font-bold text-indigo-600">{selectedNode?.metricValue}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 mb-4">
                    <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Gemini Spatial Prescriptive
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Continuous vibration harmonics and thermodynamic COP balancing active. Expected MTBF exceeds 18,400 running hours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setActiveTab(1); // Jump to AI diagnosis
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Diagnosis</span>
                  </button>
                  <button
                    onClick={() => setQrModalAsset(selectedNode?.name || 'Asset')}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                    title="Generate QR code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Tag</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: GEMINI AI PREDICTIVE CVC DIAGNOSTICS */}
          {activeTab === 1 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Gemini AI Mechanical &amp; CVC Predictive Diagnostic
                      </h3>
                      <div className="text-xs text-slate-500 font-mono">
                        Model: <span className="text-purple-600 font-semibold">{aiSource}</span> · Server-Side GenAI
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleRunDiagnosis}
                    disabled={diagnosing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${diagnosing ? 'animate-spin' : ''}`} />
                    <span>{diagnosing ? 'Evaluating Telemetry...' : 'Trigger Live AI Evaluation'}</span>
                  </button>
                </div>

                {/* Telemetry Input Snapshot */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono mb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CHILLED WATER OUT</span>
                    <span className="font-bold text-slate-800">7.4 °C</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">EVAPORATOR PRESS</span>
                    <span className="font-bold text-slate-800">3.8 Bar</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">BEARING VIBRATION</span>
                    <span className="font-bold text-indigo-600">3.12 mm/s (49.8Hz)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CURRENT COP</span>
                    <span className="font-bold text-emerald-600">6.22 / 6.45 Target</span>
                  </div>
                </div>

                {/* Custom query prompt input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={diagnosticQuery}
                    onChange={(e) => setDiagnosticQuery(e.target.value)}
                    placeholder="Ask Gemini: e.g. Analyze vibration harmonics on sleeve bearing and predict MTBF..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleRunDiagnosis}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Analyze</span>
                  </button>
                </div>
              </div>

              {/* Diagnosis Output Card */}
              {diagnosisResult && (
                <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-md">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                        {diagnosisResult.healthScore}%
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Status: {diagnosisResult.status}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          30-Day Breakdown Probability: <span className="font-semibold text-rose-600">{diagnosisResult.breakdownProbability30d}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block">ESTIMATED ENERGY SAVINGS</span>
                      <span className="text-sm font-bold text-emerald-600 font-mono">
                        +{diagnosisResult.estimatedEnergySavingsKwhPerMonth} kWh/mo
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 font-mono">
                      Root Cause Analysis
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {diagnosisResult.rootCauseAnalysis}
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
                      Prescriptive Actions (Automated Guidance)
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {diagnosisResult.prescriptiveActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {diagnosisResult.workOrderRecommended && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-mono font-semibold text-indigo-700">
                          RECOMMENDED DISPATCH TICKET
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {diagnosisResult.workOrderRecommended.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Priority: {diagnosisResult.workOrderRecommended.priority} · {diagnosisResult.workOrderRecommended.requiredSkill}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleCreateWorkOrder(
                            diagnosisResult.workOrderRecommended!.title,
                            diagnosisResult.workOrderRecommended!.priority
                          );
                          setActiveTab(3); // Jump to work orders
                        }}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold whitespace-nowrap transition-colors"
                      >
                        Create CMMS Work Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SMART UTILITIES & BMS (HYDROSNC & CITYPULSE) */}
          {activeTab === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* HydroSync Water Management */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">HydroSync Water Grid</h3>
                        <div className="text-xs text-slate-500 font-mono">Modbus TCP / RTU Gateway</div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        valve.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {valve.isOpen ? 'GRID OPEN' : 'ISOLATED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-mono text-slate-400">LINE PRESSURE</div>
                      <div className="text-xl font-extrabold text-slate-900 font-mono">
                        {valve.pressureBar.toFixed(1)} <span className="text-xs font-normal">Bar</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-mono text-slate-400">FLOW RATE</div>
                      <div className="text-xl font-extrabold text-sky-600 font-mono">
                        {valve.flowLpm.toFixed(1)} <span className="text-xs font-normal">L/min</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100 text-xs text-slate-700 mb-5">
                    <div className="font-semibold text-sky-900 mb-0.5">Acoustic Leak Detection FFT:</div>
                    <div className="text-[11px] text-slate-600">
                      Noise anomaly index: <span className="font-mono font-bold text-emerald-700">{valve.acousticAnomalyIndex}</span> (Threshold 0.40). Zero acoustic signature of pipe rupture.
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-mono">
                    {valve.lastAction}
                  </div>
                  <button
                    onClick={handleToggleValve}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      valve.isOpen
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {valve.isOpen ? 'Shut Off Valve' : 'Open Valve'}
                  </button>
                </div>
              </div>

              {/* CityPulse DALI Lighting */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                        <SunMedium className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">CityPulse DALI Lighting</h3>
                        <div className="text-xs text-slate-500 font-mono">DALI-2 / KNX Broadcast</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-50 text-amber-700">
                      {lighting.circadianActive ? 'CIRCADIAN' : 'MANUAL'}
                    </span>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-4 mb-5">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-500">Illuminance Dimming</span>
                        <span className="font-bold text-slate-900">{lighting.lux} Lux</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="800"
                        value={lighting.lux}
                        onChange={(e) => setLighting({ ...lighting, lux: parseInt(e.target.value, 10) })}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-500">Color Temperature (Kelvin)</span>
                        <span className="font-bold text-amber-600">{lighting.cctKelvin} K</span>
                      </div>
                      <input
                        type="range"
                        min="2700"
                        max="6500"
                        value={lighting.cctKelvin}
                        onChange={(e) => setLighting({ ...lighting, cctKelvin: parseInt(e.target.value, 10) })}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* DALI Zones Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(lighting.daliZones).map(([zoneName, z]) => (
                      <div key={zoneName} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                        <span className="capitalize text-slate-600">{zoneName}</span>
                        <span className="font-mono font-bold text-slate-900">{z.power}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Daylight harvesting saves ~18% kWh
                  </span>
                  <button
                    onClick={() => setLighting({ ...lighting, circadianActive: !lighting.circadianActive })}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {lighting.circadianActive ? 'Switch to Manual' : 'Enable Circadian'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CMMS & WORK ORDERS */}
          {activeTab === 3 && (
            <div className="space-y-6">
              {/* Top Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900">CMMS Field Interventions</h3>
                  <div className="text-xs text-slate-500">
                    Active SLA work orders dispatched via Gemini AI &amp; NFC on-site tag scanning
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setScanning(true);
                      setTimeout(() => {
                        setScanning(false);
                        handleCreateWorkOrder('On-Site QR Inspection - Filter Pack', 'MEDIUM');
                      }, 1500);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    <Scan className={`w-3.5 h-3.5 ${scanning ? 'animate-spin text-indigo-600' : ''}`} />
                    <span>{scanning ? 'Scanning Tag...' : 'Scan QR / NFC Tag'}</span>
                  </button>

                  <button
                    onClick={() => handleCreateWorkOrder('Manual Maintenance Check', 'LOW')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Ticket</span>
                  </button>
                </div>
              </div>

              {/* Tickets Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono">
                      <tr>
                        <th className="py-3 px-4">TICKET ID</th>
                        <th className="py-3 px-4">ASSET</th>
                        <th className="py-3 px-4">ISSUE / CATEGORY</th>
                        <th className="py-3 px-4">PRIORITY</th>
                        <th className="py-3 px-4">ASSIGNED TECH</th>
                        <th className="py-3 px-4">SLA REMAINING</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {workOrders.map((wo) => (
                        <tr key={wo.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-bold text-indigo-600">{wo.id}</td>
                          <td className="py-3 px-4 font-sans font-medium text-slate-900">{wo.asset}</td>
                          <td className="py-3 px-4 font-sans text-slate-600">{wo.category}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                wo.priority === 'HIGH'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                  : wo.priority === 'MEDIUM'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {wo.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-sans text-slate-700">{wo.assignedTo}</td>
                          <td className="py-3 px-4 text-slate-600">
                            {wo.slaHoursRemaining > 0 ? `${wo.slaHoursRemaining}h` : 'Closed'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setWorkOrders(
                                  workOrders.map((w) =>
                                    w.id === wo.id ? { ...w, status: 'COMPLETED', slaHoursRemaining: 0 } : w
                                  )
                                );
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-sans font-semibold"
                            >
                              {wo.status === 'COMPLETED' ? 'Done' : 'Mark Done'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MRO Spare Parts Inventory */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-3">MRO Spare Parts Critical Stock</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {spareParts.map((part) => (
                    <div key={part.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="text-[10px] font-mono text-slate-400">{part.id}</div>
                      <div className="font-bold text-slate-800 mt-0.5 truncate">{part.name}</div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 font-mono">
                        <span className="text-slate-500">Stock: {part.stock} {part.unit}</span>
                        {part.stock <= part.min && (
                          <span className="text-[10px] text-rose-600 font-bold">REORDER</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ESG & CSRD CARBON STRATEGY */}
          {activeTab === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-xs font-mono text-slate-400 mb-1">SCOPE 1 (DIRECT)</div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                    284.2 <span className="text-xs font-normal">tCO2e</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Gas Boilers &amp; Refrigerant Leakage</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-xs font-mono text-slate-400 mb-1">SCOPE 2 (ELECTRICITY)</div>
                  <div className="text-2xl font-extrabold text-indigo-600 font-mono">
                    1,840.0 <span className="text-xs font-normal">tCO2e</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Grid Power - 42% Solar Rooftop Offset</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-xs font-mono text-slate-400 mb-1">SCOPE 3 (VALUE CHAIN)</div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                    1,995.8 <span className="text-xs font-normal">tCO2e</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Tenant Energy &amp; Waste Management</div>
                </div>
              </div>

              {/* WELL v2 IAQ Compliance Monitor */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Indoor Air Quality &amp; WELL v2 Standard
                    </h3>
                    <div className="text-xs text-slate-500">
                      Multi-zone NDIR CO2, PM2.5, and VOC continuous monitoring
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    WELL V2 CERTIFIED (SCORE: 96/100)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400 block">CARBON DIOXIDE (CO2)</span>
                    <span className="text-xl font-extrabold text-slate-900 font-mono">412 ppm</span>
                    <span className="text-[10px] text-emerald-600 block mt-1">Class A (&lt;600 ppm)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400 block">PARTICULATE PM2.5</span>
                    <span className="text-xl font-extrabold text-slate-900 font-mono">5.1 µg/m³</span>
                    <span className="text-[10px] text-emerald-600 block mt-1">WHO Healthy Standard</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400 block">TOTAL VOC (TVOC)</span>
                    <span className="text-xl font-extrabold text-slate-900 font-mono">68 ppb</span>
                    <span className="text-[10px] text-emerald-600 block mt-1">Clean Baseline</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400 block">RELATIVE HUMIDITY</span>
                    <span className="text-xl font-extrabold text-slate-900 font-mono">48.2 %</span>
                    <span className="text-[10px] text-emerald-600 block mt-1">Target: 40-60%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GRAFANA OBSERVABILITY & PROMQL */}
          {activeTab === 5 && (
            <div className="space-y-6">
              {/* PromQL Query Runner */}
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-slate-200">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <BarChart3 className="w-4 h-4" />
                    <span>Prometheus PromQL Engine v2.51</span>
                  </div>
                  <span className="text-slate-400">Endpoint: /api/v1/query</span>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={promqlQuery}
                    onChange={(e) => setPromqlQuery(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => {
                      setPromqlResult(`Executed at ${new Date().toLocaleTimeString()} · Query: ${promqlQuery} · Instant vector: [1420500 rps, latency: 0.38ms]`);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold font-mono"
                  >
                    Execute
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-emerald-400">
                  {promqlResult}
                </div>
              </div>

              {/* Telemetry live meters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-xs font-mono text-slate-400 mb-1">TOTAL INGESTION RATE</div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                    1,420,500 <span className="text-xs font-normal">pts/sec</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[82%]" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-xs font-mono text-slate-400 mb-1">EDGE WORKER LATENCY</div>
                  <div className="text-2xl font-extrabold text-emerald-600 font-mono">
                    0.38 <span className="text-xs font-normal">ms</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-3 font-mono">Cloudflare Smart Routing</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-xs font-mono text-slate-400 mb-1">TOTAL ACTIVE SENSORS</div>
                  <div className="text-2xl font-extrabold text-indigo-600 font-mono">
                    {dexieSyncedEvents.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-3 font-mono">
                    {isSimulatedOffline ? 'Replicated in Dexie DB' : 'Replicated in Neon DB'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal for Equipment */}
      {qrModalAsset && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl text-center">
            <h4 className="text-base font-bold text-slate-900 mb-1">Digital Asset Tag</h4>
            <p className="text-xs text-slate-500 mb-4">{qrModalAsset}</p>

            {/* QR SVG Simulation */}
            <div className="w-48 h-48 mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-center mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-900">
                <rect x="10" y="10" width="25" height="25" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="18" y="18" width="9" height="9" />
                <rect x="65" y="10" width="25" height="25" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="73" y="18" width="9" height="9" />
                <rect x="10" y="65" width="25" height="25" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="18" y="73" width="9" height="9" />
                <rect x="45" y="20" width="10" height="10" />
                <rect x="40" y="40" width="20" height="20" />
                <rect x="65" y="65" width="10" height="10" />
                <rect x="78" y="45" width="8" height="15" />
                <rect x="45" y="75" width="12" height="15" />
              </svg>
            </div>

            <div className="text-[11px] font-mono text-slate-500 mb-4">
              Asset UID: BC-IFC-2026-OMIKRON
            </div>

            <button
              onClick={() => setQrModalAsset(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
            >
              Close Tag
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
