import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Play, 
  Pause, 
  Send, 
  Filter, 
  RefreshCw, 
  Eye, 
  Copy, 
  Check, 
  Radio, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  SlidersHorizontal 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GlobalState } from '../types';

interface KafkaMonitorProps {
  state: GlobalState;
  isDark?: boolean;
  activeItemId?: string;
  onSelectTab?: (id: string) => void;
}

interface PartitionInfo {
  id: number;
  topic: string;
  leaderBroker: string;
  replicas: number[];
  isr: number[];
  logEndOffset: number;
  consumerOffset: number;
  lag: number;
  throughputKb: number;
  status: 'Healthy' | 'Rebalancing' | 'Syncing';
}

interface ConsumedEvent {
  id: string;
  topic: string;
  partition: number;
  offset: number;
  key: string;
  timestamp: string;
  latencyMs: number;
  payload: Record<string, any>;
}

interface LatencyPoint {
  time: string;
  latency: number;
  p95: number;
  p99: number;
  throughput: number;
}

const TOPICS = [
  "All Topics",
  "cafm.telemetry.events",
  "security.waf.alerts",
  "edge.dns.queries",
  "billing.jeton.transactions"
];

const INITIAL_PARTITIONS: PartitionInfo[] = [
  { id: 0, topic: "cafm.telemetry.events", leaderBroker: "broker-1 (eu-west-1a)", replicas: [1, 2, 3], isr: [1, 2, 3], logEndOffset: 1489204, consumerOffset: 1489202, lag: 2, throughputKb: 142.5, status: "Healthy" },
  { id: 1, topic: "cafm.telemetry.events", leaderBroker: "broker-2 (eu-west-1b)", replicas: [2, 3, 1], isr: [2, 3, 1], logEndOffset: 1488995, consumerOffset: 1488995, lag: 0, throughputKb: 138.2, status: "Healthy" },
  { id: 2, topic: "cafm.telemetry.events", leaderBroker: "broker-3 (eu-west-1c)", replicas: [3, 1, 2], isr: [3, 1, 2], logEndOffset: 1490112, consumerOffset: 1490109, lag: 3, throughputKb: 154.1, status: "Healthy" },
  { id: 3, topic: "cafm.telemetry.events", leaderBroker: "broker-1 (eu-west-1a)", replicas: [1, 3, 2], isr: [1, 3, 2], logEndOffset: 1487650, consumerOffset: 1487649, lag: 1, throughputKb: 132.8, status: "Healthy" },
  
  { id: 0, topic: "security.waf.alerts", leaderBroker: "broker-2 (eu-west-1b)", replicas: [2, 1, 3], isr: [2, 1, 3], logEndOffset: 894320, consumerOffset: 894320, lag: 0, throughputKb: 86.4, status: "Healthy" },
  { id: 1, topic: "security.waf.alerts", leaderBroker: "broker-3 (eu-west-1c)", replicas: [3, 2, 1], isr: [3, 2, 1], logEndOffset: 893114, consumerOffset: 893112, lag: 2, throughputKb: 91.0, status: "Healthy" },
  { id: 2, topic: "security.waf.alerts", leaderBroker: "broker-1 (eu-west-1a)", replicas: [1, 2, 3], isr: [1, 2, 3], logEndOffset: 895400, consumerOffset: 895398, lag: 2, throughputKb: 88.7, status: "Healthy" },
  
  { id: 0, topic: "edge.dns.queries", leaderBroker: "broker-1 (eu-west-1a)", replicas: [1, 2, 3], isr: [1, 2, 3], logEndOffset: 3290450, consumerOffset: 3290446, lag: 4, throughputKb: 312.4, status: "Healthy" },
  { id: 1, topic: "edge.dns.queries", leaderBroker: "broker-2 (eu-west-1b)", replicas: [2, 3, 1], isr: [2, 3, 1], logEndOffset: 3289120, consumerOffset: 3289120, lag: 0, throughputKb: 298.1, status: "Healthy" },

  { id: 0, topic: "billing.jeton.transactions", leaderBroker: "broker-3 (eu-west-1c)", replicas: [3, 1, 2], isr: [3, 1, 2], logEndOffset: 412080, consumerOffset: 412080, lag: 0, throughputKb: 45.2, status: "Healthy" },
  { id: 1, topic: "billing.jeton.transactions", leaderBroker: "broker-1 (eu-west-1a)", replicas: [1, 3, 2], isr: [1, 3, 2], logEndOffset: 411950, consumerOffset: 411949, lag: 1, throughputKb: 42.8, status: "Healthy" },
];

export default function KafkaMonitor({ state, isDark = true, activeItemId = "tel-1", onSelectTab }: KafkaMonitorProps) {
  const [isRunning, setIsRunning] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");
  const [partitions, setPartitions] = useState<PartitionInfo[]>(INITIAL_PARTITIONS);
  const [selectedPayload, setSelectedPayload] = useState<ConsumedEvent | null>(null);
  const [copied, setCopied] = useState(false);

  // Active view tab state (synchronized with activeItemId or local tabs)
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (activeItemId === "tel-2") return "partitions";
    if (activeItemId === "tel-3") return "latency";
    if (activeItemId === "tel-4") return "consumed";
    return "overview";
  });

  useEffect(() => {
    if (activeItemId === "tel-2") setCurrentTab("partitions");
    else if (activeItemId === "tel-3") setCurrentTab("latency");
    else if (activeItemId === "tel-4") setCurrentTab("consumed");
    else if (activeItemId === "tel-1") setCurrentTab("overview");
  }, [activeItemId]);

  const handleTabChange = (tabKey: string, navItemId: string) => {
    setCurrentTab(tabKey);
    if (onSelectTab) onSelectTab(navItemId);
  };

  // Real-time counter of total events consumed
  const [totalEventsConsumed, setTotalEventsConsumed] = useState<number>(3482190);
  const [consumptionRate, setConsumptionRate] = useState<number>(1420);
  const [recentEvents, setRecentEvents] = useState<ConsumedEvent[]>([]);

  // Latency time series data
  const [latencyData, setLatencyData] = useState<LatencyPoint[]>(() => {
    const points: LatencyPoint[] = [];
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const timeStr = new Date(now - i * 2000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const baseLatency = 3.2 + Math.sin(i / 2) * 1.1 + (Math.random() * 1.2);
      points.push({
        time: timeStr,
        latency: parseFloat(baseLatency.toFixed(2)),
        p95: parseFloat((baseLatency * 1.6 + 0.4).toFixed(2)),
        p99: parseFloat((baseLatency * 2.4 + 1.2).toFixed(2)),
        throughput: Math.floor(1250 + Math.random() * 400),
      });
    }
    return points;
  });

  // Generator for mock events
  const generateNewEvent = (): ConsumedEvent => {
    const topics = [
      "cafm.telemetry.events",
      "cafm.telemetry.events",
      "security.waf.alerts",
      "edge.dns.queries",
      "billing.jeton.transactions"
    ];
    const pickedTopic = topics[Math.floor(Math.random() * topics.length)];
    const node = state?.nodes?.[Math.floor(Math.random() * (state?.nodes?.length || 1))] || { id: "fra-node-01", name: "Frankfurt POP", cpuUsage: 45 };
    
    let payload: Record<string, any> = {};
    if (pickedTopic === "cafm.telemetry.events") {
      const nodeCpu = 'cpuUsage' in node && typeof node.cpuUsage === 'number' ? node.cpuUsage : Math.floor(40 + Math.random() * 35);
      payload = {
        nodeId: node.id,
        rackId: "rack-04b",
        pue: parseFloat((1.12 + Math.random() * 0.08).toFixed(3)),
        temperatureC: parseFloat((21.5 + Math.random() * 3).toFixed(1)),
        cpuUsage: nodeCpu,
        powerDrawKw: parseFloat((8.4 + Math.random() * 1.2).toFixed(2)),
        fanRpm: Math.floor(4800 + Math.random() * 600)
      };
    } else if (pickedTopic === "security.waf.alerts") {
      const attackTypes = ["SQLi Attack Detected", "Rate Limit Threshold Exceeded", "Malicious User-Agent Blocked", "DDoS Syn Flood Mitigated"];
      payload = {
        ruleId: `WAF-${Math.floor(1000 + Math.random() * 900)}`,
        action: "BLOCK_AND_LOG",
        threatScore: Math.floor(80 + Math.random() * 20),
        reason: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        clientIp: `198.51.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country: ["FR", "DE", "US", "JP", "BR"][Math.floor(Math.random() * 5)],
        edgePop: node.id
      };
    } else if (pickedTopic === "edge.dns.queries") {
      payload = {
        queryType: ["A", "AAAA", "CNAME", "TXT"][Math.floor(Math.random() * 4)],
        domain: ["api.cafm.io", "cdn.carbonat.network", "gateway.edge.internal"][Math.floor(Math.random() * 3)],
        responseMs: parseFloat((1.2 + Math.random() * 2.8).toFixed(2)),
        cacheHit: Math.random() > 0.15,
        resolverId: "1.1.1.1-cafm"
      };
    } else {
      payload = {
        txId: `tx-${Date.now().toString(36)}`,
        amountCafm: Math.floor(50 + Math.random() * 450),
        type: "EDGE_COMPUTE_SETTLEMENT",
        targetNode: node.id,
        status: "CONFIRMED_ON_CHAIN"
      };
    }

    const latencyMs = parseFloat((2.1 + Math.random() * 4.8).toFixed(2));

    return {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      topic: pickedTopic,
      partition: Math.floor(Math.random() * 4),
      offset: Math.floor(1489000 + Math.random() * 5000),
      key: `${node.id}-${Math.floor(Math.random() * 10)}`,
      timestamp: new Date().toISOString(),
      latencyMs,
      payload
    };
  };

  // Interval loop for stream animation & live ingestion
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // 1. Generate 1-3 new consumed events
      const batchCount = Math.floor(1 + Math.random() * 3);
      const newBatch: ConsumedEvent[] = [];
      for (let i = 0; i < batchCount; i++) {
        newBatch.push(generateNewEvent());
      }

      setRecentEvents(prev => [...newBatch, ...prev].slice(0, 14));
      setTotalEventsConsumed(prev => prev + batchCount * 18);
      const instantRate = Math.floor(1200 + Math.random() * 450);
      setConsumptionRate(instantRate);

      // 2. Update partition offsets & lag with small jitter
      setPartitions(prev => prev.map(p => {
        const delta = Math.floor(Math.random() * 6);
        const newOffset = p.logEndOffset + delta;
        const newConsumerOffset = p.consumerOffset + Math.max(0, delta - (Math.random() > 0.8 ? 1 : 0));
        const newLag = Math.max(0, newOffset - newConsumerOffset);
        return {
          ...p,
          logEndOffset: newOffset,
          consumerOffset: newConsumerOffset,
          lag: newLag,
          throughputKb: parseFloat((p.throughputKb + (Math.random() * 4 - 2)).toFixed(1))
        };
      }));

      // 3. Update latency series
      const nowStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const currentLatency = parseFloat((3.1 + Math.sin(Date.now() / 6000) * 1.4 + Math.random() * 1.8).toFixed(2));
      const currentP95 = parseFloat((currentLatency * 1.55 + 0.3).toFixed(2));
      const currentP99 = parseFloat((currentLatency * 2.3 + 1.1).toFixed(2));

      setLatencyData(prev => [
        ...prev.slice(1),
        {
          time: nowStr,
          latency: currentLatency,
          p95: currentP95,
          p99: currentP99,
          throughput: instantRate
        }
      ]);

    }, 1800);

    return () => clearInterval(interval);
  }, [isRunning, state.nodes]);

  // Initial event seeding if empty
  useEffect(() => {
    if (recentEvents.length === 0) {
      const seed: ConsumedEvent[] = [];
      for (let i = 0; i < 8; i++) {
        seed.push(generateNewEvent());
      }
      setRecentEvents(seed);
    }
  }, []);

  // Filtered partitions and events by selected topic
  const filteredPartitions = useMemo(() => {
    if (selectedTopic === "All Topics") return partitions;
    return partitions.filter(p => p.topic === selectedTopic);
  }, [partitions, selectedTopic]);

  const filteredEvents = useMemo(() => {
    if (selectedTopic === "All Topics") return recentEvents;
    return recentEvents.filter(e => e.topic === selectedTopic);
  }, [recentEvents, selectedTopic]);

  // Summary calculations
  const totalLag = useMemo(() => partitions.reduce((acc, p) => acc + p.lag, 0), [partitions]);
  const avgThroughput = useMemo(() => Math.round(partitions.reduce((acc, p) => acc + p.throughputKb, 0)), [partitions]);
  const currentAvgLatency = useMemo(() => {
    if (latencyData.length === 0) return 3.4;
    return latencyData[latencyData.length - 1].latency;
  }, [latencyData]);

  // Manual Trigger Event
  const handlePublishTestEvent = () => {
    const testEvent = generateNewEvent();
    testEvent.key = "manual-test-probe";
    testEvent.payload._isTestProbe = true;
    testEvent.payload.operatorMessage = "Manual synthetic probe injected via CAFM Telemetry Console";
    setRecentEvents(prev => [testEvent, ...prev].slice(0, 14));
    setTotalEventsConsumed(prev => prev + 1);
  };

  const copyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Recharts styling
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "#a1a1aa" : "#71717a";

  return (
    <div id="kafka-monitor-root" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Control Deck */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-5 rounded-2xl glass-panel gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-[#F38020] flex items-center justify-center border border-orange-500/30">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Kafka Telemetry Monitor</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  CLUSTER HEALTHY
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Real-time distributed event streaming, partition high watermarks, and consumer lag analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
          {/* Topic Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80 text-xs font-medium">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              aria-label="Filter Topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-transparent border-none outline-none text-neutral-800 dark:text-neutral-200 cursor-pointer text-xs pr-2"
            >
              {TOPICS.map(t => (
                <option key={t} value={t} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Test Probe Event Button */}
          <button
            id="btn-publish-probe"
            onClick={handlePublishTestEvent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700/80 hover:bg-slate-50 dark:hover:bg-neutral-700/60 text-neutral-700 dark:text-neutral-200 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Publish a synthetic message into Kafka stream"
          >
            <Send className="w-3.5 h-3.5 text-orange-500" />
            <span>Publish Probe</span>
          </button>

          {/* Stream Pause / Play */}
          <button
            id="btn-toggle-stream"
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-all cursor-pointer ${
              isRunning ? 'bg-[#F38020] hover:bg-[#e06f15]' : 'bg-neutral-600 hover:bg-neutral-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Stream</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200/80 dark:border-white/[0.08] pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => handleTabChange("overview", "tel-1")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
            currentTab === "overview"
              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/30"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          Message Flow & Overview
        </button>
        <button
          onClick={() => handleTabChange("partitions", "tel-2")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
            currentTab === "partitions"
              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/30"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          Partition Status ({filteredPartitions.length})
        </button>
        <button
          onClick={() => handleTabChange("latency", "tel-3")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
            currentTab === "latency"
              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/30"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          Latency & Throughput Graph
        </button>
        <button
          onClick={() => handleTabChange("consumed", "tel-4")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
            currentTab === "consumed"
              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/30"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          Events Consumed Feed
        </button>
      </div>

      {/* KPI Cards Row (Focused on Events Consumed, Partitions, and Latency) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Events Consumed */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Events Consumed</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-[#F38020]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight font-mono text-neutral-900 dark:text-white">
              {(totalEventsConsumed ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> ~{(consumptionRate ?? 0).toLocaleString()} msg/s
            </span>
            <span className="font-mono">4 Consumer Groups</span>
          </div>
        </div>

        {/* KPI 2: Partition Status */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Partition Status</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight font-mono text-neutral-900 dark:text-white">
              {filteredPartitions.length} Active
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              100% In Sync
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Replicas ISR: 3/3</span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">Total Lag: {totalLag} msgs</span>
          </div>
        </div>

        {/* KPI 3: Latency (P50 / P95) */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">End-to-End Latency</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight font-mono text-neutral-900 dark:text-white">
              {currentAvgLatency} ms
            </span>
            <span className="text-xs text-neutral-400">P50</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="font-mono">P95: {(currentAvgLatency * 1.6).toFixed(1)} ms</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">P99: {(currentAvgLatency * 2.3).toFixed(1)} ms</span>
          </div>
        </div>

        {/* KPI 4: Ingress / Egress Throughput */}
        <div className="p-4 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cluster Throughput</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight font-mono text-neutral-900 dark:text-white">
              {avgThroughput} KB/s
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Brokers: 3 Nodes</span>
            <span className="text-purple-600 dark:text-purple-400 font-medium">SASL/SSL Active</span>
          </div>
        </div>

      </div>

      {/* Main Tab 1: Message Flow & Unified Architecture */}
      {(currentTab === "overview") && (
        <div className="space-y-6">
          
          {/* Animated Interactive Pipeline */}
          <div className="p-5 rounded-2xl glass-panel overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold tracking-tight">Real-Time Message Flow Pipeline</h3>
                <p className="text-xs text-neutral-500">Distributed ingestion from Edge POPs through Kafka brokers to downstream consumer engines.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-[#F38020] animate-ping" />
                Live Ingestion Stream
              </div>
            </div>

            {/* Pipeline Stage Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative py-4 items-center">
              
              {/* Stage 1: Producers */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-500" />
                  1. Edge Producers
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold">CAFM Sensor Fleet</div>
                      <div className="text-[10px] text-neutral-500 font-mono">cafm.telemetry.events</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">~640/s</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold">Edge WAF Shield</div>
                      <div className="text-[10px] text-neutral-500 font-mono">security.waf.alerts</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-bold">~310/s</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold">Anycast DNS Probes</div>
                      <div className="text-[10px] text-neutral-500 font-mono">edge.dns.queries</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">~470/s</span>
                  </div>
                </div>
              </div>

              {/* Stage 2: Kafka Cluster Brokers & Partitions */}
              <div className="space-y-3 relative">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-orange-500" />
                    2. Kafka Brokers (3-Node Quorum)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold">ISR 100%</span>
                </div>

                <div className="p-4 rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent dark:bg-neutral-800/60 relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      <span className="text-xs font-bold font-mono">broker-1 (Leader)</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">Offset: 1,489k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                      <span className="text-xs font-bold font-mono">broker-2 (Replica)</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">Offset: 1,488k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                      <span className="text-xs font-bold font-mono">broker-3 (Replica)</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">Offset: 1,490k</span>
                  </div>

                  {/* Flow Animation Pill */}
                  <div className="pt-2 border-t border-slate-200 dark:border-neutral-700/60 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                    <span>Partitions: 16</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">Lag: {totalLag} msgs</span>
                  </div>
                </div>
              </div>

              {/* Stage 3: Consumer Groups */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-500" />
                  3. Consumer Groups
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold">Gemini AI Analytics</div>
                      <div className="text-[10px] text-neutral-500 font-mono">group-ai-anomaly-cg</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">Stable</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold">Time-Series TSDB</div>
                      <div className="text-[10px] text-neutral-500 font-mono">group-tsdb-telemetry</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">Lag: 0</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold">R2 Long-Term Archiver</div>
                      <div className="text-[10px] text-neutral-500 font-mono">group-cold-storage-cg</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-500/10 text-neutral-500 font-bold">Batched</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Dual Panel: Latency Mini Graph + Recent Events */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Real-time Latency Chart (7 cols) */}
            <div className="lg:col-span-7 p-5 rounded-2xl glass-panel space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Real-Time Producer-to-Consumer Latency</h3>
                  <p className="text-xs text-neutral-500">Live sliding window (ms) with P95 & P99 threshold markers.</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold font-mono text-orange-500">{currentAvgLatency} ms</span>
                  <div className="text-[10px] text-neutral-400 font-mono">Target: &lt; 10ms</div>
                </div>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latencyData}>
                    <defs>
                      <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F38020" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F38020" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="p95Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="time" stroke={textColor} fontSize={10} tickLine={false} />
                    <YAxis stroke={textColor} fontSize={10} domain={[0, 15]} unit="ms" tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? "#18181b" : "#ffffff", 
                        borderColor: isDark ? "#27272a" : "#e4e4e7",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                      }}
                      formatter={(val: any, name: any) => [`${val} ms`, name === "latency" ? "Current (P50)" : name === "p95" ? "P95" : "P99"]}
                    />
                    <Area type="monotone" dataKey="latency" stroke="#F38020" strokeWidth={2} fillOpacity={1} fill="url(#latencyGradient)" name="latency" />
                    <Line type="monotone" dataKey="p95" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="p95" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-neutral-800 text-neutral-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-[#F38020] rounded" /> P50 Average: {currentAvgLatency} ms
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-blue-500 rounded" /> P95 Threshold: {(currentAvgLatency * 1.6).toFixed(1)} ms
                </span>
                <span>Buffer: 25 Samples</span>
              </div>
            </div>

            {/* Right: Consumed Events Stream (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl glass-panel flex flex-col h-[340px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold tracking-tight">Recent Consumed Events</h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Auto-tail</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                <AnimatePresence initial={false}>
                  {filteredEvents.map((evt) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedPayload(evt)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/30 hover:border-orange-500/40 cursor-pointer transition-all flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                          evt.topic.includes("waf") 
                            ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                            : evt.topic.includes("dns") 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        }`}>
                          {evt.topic}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-300">
                        <span className="font-mono truncate max-w-[160px]">key: {evt.key}</span>
                        <span className="font-mono text-neutral-400">P-{evt.partition} / #{evt.offset}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 text-[11px] text-neutral-400 flex justify-between items-center">
                <span>Click event to inspect payload</span>
                <button
                  onClick={() => handleTabChange("consumed", "tel-4")}
                  className="text-orange-500 hover:underline font-medium text-[11px] flex items-center gap-0.5"
                >
                  View Full Feed <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Main Tab 2: Detailed Partition Status */}
      {(currentTab === "partitions") && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl glass-panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold tracking-tight">Kafka Partition Status & Watermarks</h3>
                <p className="text-xs text-neutral-500">Detailed partition leader assignment, In-Sync Replicas (ISR), Log End Offsets, and Consumer Lag.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  {filteredPartitions.length} / {partitions.length} Partitions Showing
                </span>
              </div>
            </div>

            {/* Partitions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-4">Topic Name</th>
                    <th className="pb-3 px-3">Partition</th>
                    <th className="pb-3 px-3">Leader Broker</th>
                    <th className="pb-3 px-3">ISR (In-Sync)</th>
                    <th className="pb-3 px-3">Log End Offset</th>
                    <th className="pb-3 px-3">Consumer Offset</th>
                    <th className="pb-3 px-3">Consumer Lag</th>
                    <th className="pb-3 px-3">Throughput</th>
                    <th className="pb-3 pl-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-neutral-800/60 font-mono">
                  {filteredPartitions.map((part, idx) => (
                    <tr key={`${part.topic}-${part.id}-${idx}`} className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 pr-4 font-sans font-medium text-neutral-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          <span>{part.topic}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300 font-bold">
                        P-{part.id}
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                        {part.leaderBroker}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                          [{part.isr.join(",")}] (3/3)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">
                        {(part.logEndOffset ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">
                        {(part.consumerOffset ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          part.lag === 0 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                          {part.lag} msg
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                        {part.throughputKb} KB/s
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 3: Full Latency & Performance Graph */}
      {(currentTab === "latency") && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold tracking-tight">Detailed Cluster Latency Distribution</h3>
                <p className="text-xs text-neutral-500">Real-time telemetry showing P50, P95, and P99 latency percentiles over sliding time window.</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#F38020]" />
                  <span>P50 ({currentAvgLatency}ms)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>P95 ({(currentAvgLatency * 1.6).toFixed(1)}ms)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>P99 ({(currentAvgLatency * 2.3).toFixed(1)}ms)</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={latencyData}>
                  <defs>
                    <linearGradient id="latencyFullGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F38020" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#F38020" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="time" stroke={textColor} fontSize={11} tickLine={false} />
                  <YAxis stroke={textColor} fontSize={11} domain={[0, 16]} unit="ms" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? "#18181b" : "#ffffff", 
                      borderColor: isDark ? "#27272a" : "#e4e4e7",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                    formatter={(val: any, name: any) => [`${val} ms`, name.toUpperCase()]}
                  />
                  <Area type="monotone" dataKey="latency" stroke="#F38020" strokeWidth={2.5} fillOpacity={1} fill="url(#latencyFullGradient)" name="p50" />
                  <Line type="monotone" dataKey="p95" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={false} name="p95" />
                  <Line type="monotone" dataKey="p99" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="2 2" dot={false} name="p99" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Latency Breakdown Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-neutral-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Producer Latency</span>
                <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">1.18 ms</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Socket write & SSL handshake</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Broker Append & ISR Ack</span>
                <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">1.42 ms</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Quorum commit (acks=all)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Consumer Fetch & Decode</span>
                <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">0.82 ms</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Group poll & deserialize</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 4: Events Consumed Feed */}
      {(currentTab === "consumed") && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold tracking-tight">Events Consumed Stream Log</h3>
                <p className="text-xs text-neutral-500">Live stream of deserialized Kafka messages consumed by cluster worker groups.</p>
              </div>
              <div className="text-xs font-mono text-neutral-400">
                Total Consumed: <strong className="text-orange-500">{(totalEventsConsumed ?? 0).toLocaleString()}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-4">Event ID</th>
                    <th className="pb-3 px-3">Topic</th>
                    <th className="pb-3 px-3">Partition</th>
                    <th className="pb-3 px-3">Partition Key</th>
                    <th className="pb-3 px-3">Offset</th>
                    <th className="pb-3 px-3">Latency</th>
                    <th className="pb-3 px-3">Time</th>
                    <th className="pb-3 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-neutral-800/60 font-mono">
                  {filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 pr-4 font-bold text-neutral-900 dark:text-white">
                        {evt.id}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          evt.topic.includes("waf") 
                            ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                            : evt.topic.includes("dns") 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        }`}>
                          {evt.topic}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        P-{evt.partition}
                      </td>
                      <td className="py-3 px-3 text-neutral-500 truncate max-w-[140px]">
                        {evt.key}
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                        #{(evt.offset ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                        {evt.latencyMs} ms
                      </td>
                      <td className="py-3 px-3 text-neutral-400 text-[11px]">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          onClick={() => setSelectedPayload(evt)}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-neutral-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-neutral-300 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Inspect JSON
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Slide-over: Inspect Event Payload */}
      <AnimatePresence>
        {selectedPayload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <h4 className="text-sm font-bold tracking-tight">Kafka Message Inspector</h4>
                  <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                    {selectedPayload.topic} (P-{selectedPayload.partition} / Offset #{selectedPayload.offset})
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayload(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Payload JSON:</span>
                  <button
                    onClick={() => copyPayload(selectedPayload.payload)}
                    className="flex items-center gap-1 text-[11px] text-orange-500 hover:underline font-mono cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy Payload"}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 font-mono text-xs overflow-x-auto max-h-64 border border-slate-200 dark:border-neutral-800">
                  {JSON.stringify(selectedPayload.payload, null, 2)}
                </pre>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
                <button
                  onClick={() => setSelectedPayload(null)}
                  className="px-4 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
