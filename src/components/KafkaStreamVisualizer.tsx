import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, ArrowRight, Rss, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlobalState } from '../types';

interface KafkaStreamVisualizerProps {
  state: GlobalState;
}

interface KafkaEvent {
  id: string;
  topic: string;
  payload: any;
  timestamp: string;
}

export default function KafkaStreamVisualizer({ state }: KafkaStreamVisualizerProps) {
  const [events, setEvents] = useState<KafkaEvent[]>([]);
  const [metrics, setMetrics] = useState({ throughput: 0, lag: 0 });

  // Simulate incoming Kafka events based on nodes/telemetry
  useEffect(() => {
    let messageCount = 0;
    const interval = setInterval(() => {
      if (!state.nodes || state.nodes.length === 0) return;
      
      const randomNode = state.nodes[Math.floor(Math.random() * state.nodes.length)];
      const isSecurity = Math.random() > 0.8;
      const topic = isSecurity ? 'security.waf.alerts' : 'cafm.telemetry.events';
      
      const newEvent: KafkaEvent = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        topic,
        timestamp: new Date().toISOString(),
        payload: isSecurity 
          ? { ruleId: 'WAF-1002', action: 'BLOCK', ip: '198.51.100.42', nodeId: randomNode.id }
          : { assetId: randomNode.id, cpuUsage: randomNode.cpuUsage, temp: 22.4, status: randomNode.status }
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 8)); // Keep last 8 events
      messageCount++;
    }, 2000); // 2 seconds

    const metricsInterval = setInterval(() => {
      setMetrics({
        throughput: Math.floor(Math.random() * 150) + 50 + messageCount, // Simulated msg/sec
        lag: Math.floor(Math.random() * 5),
      });
      messageCount = 0;
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(metricsInterval);
    };
  }, [state.nodes]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Rss className="w-4 h-4 text-orange-500" />
            Kafka Event Streaming (Real-Time)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Distributed message broker visualizing live telemetry and security events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/[0.08] px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Kafka Cluster Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visualizer Flow (Left, 2 columns wide) */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent"></div>
          
          <div className="flex justify-between items-center h-full min-h-[220px] relative z-10 px-4">
            
            {/* Producers */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Producers</div>
              <div className="w-20 h-20 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-xs flex flex-col items-center justify-center gap-2 relative">
                <Server className="w-6 h-6 text-blue-500" />
                <span className="text-[10px] font-bold">Edge POPs</span>
                {events.length > 0 && (
                  <motion.div
                    key={`prod-${events[0].id}`}
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    className="absolute inset-0 border-2 border-blue-500 rounded-xl"
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
              <div className="w-20 h-20 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-xs flex flex-col items-center justify-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <span className="text-[10px] font-bold">WAF Node</span>
              </div>
            </div>

            {/* Topics (Kafka) */}
            <div className="flex-1 flex flex-col justify-center items-center relative min-w-[200px] h-full">
              <div className="w-full h-px bg-slate-200 dark:bg-neutral-700 absolute top-1/2 -translate-y-1/2 z-0"></div>
              
              <AnimatePresence>
                {events.slice(0, 3).map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ x: -100, opacity: 0, scale: 0.5 }}
                    animate={{ x: 0, opacity: 1, scale: 1, y: (i === 0 ? -25 : i === 1 ? 0 : 25) }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "linear" }}
                    className={`absolute z-10 px-2 py-1 rounded bg-white dark:bg-neutral-800 text-[9px] font-mono border whitespace-nowrap shadow-xs ${
                      ev.topic.includes('waf') 
                        ? 'border-red-500/50 text-red-600 dark:text-red-400' 
                        : 'border-orange-500/50 text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {JSON.stringify(ev.payload).substring(0, 20)}...
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="z-20 p-4 rounded-full bg-gradient-to-br from-slate-50 to-white dark:from-neutral-800 dark:to-neutral-900 border-4 border-slate-200 dark:border-neutral-700 shadow-xl flex items-center justify-center relative">
                <Database className="w-10 h-10 text-neutral-800 dark:text-neutral-200" />
                <div className="absolute -bottom-8 whitespace-nowrap text-[11px] font-bold tracking-widest text-neutral-500 uppercase">Kafka Brokers</div>
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                  {metrics.throughput}/s
                </div>
              </div>
            </div>

            {/* Consumers */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Consumers</div>
              <div className="w-20 h-20 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-xs flex flex-col items-center justify-center gap-2 relative">
                <Activity className="w-6 h-6 text-purple-500" />
                <span className="text-[10px] font-bold text-center">AI Analytics</span>
              </div>
              <div className="w-20 h-20 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-xs flex flex-col items-center justify-center gap-2">
                <Database className="w-6 h-6 text-emerald-500" />
                <span className="text-[10px] font-bold text-center">Time-Series DB</span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Live Event Log (Right, 1 column wide) */}
        <div className="p-4 rounded-2xl glass-card text-slate-800 dark:text-neutral-300 shadow-xs flex flex-col h-full min-h-[220px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-neutral-400">Live Log (Tail)</h3>
            <span className="text-[10px] font-mono bg-slate-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-neutral-500">Consumer Lag: {metrics.lag}</span>
          </div>
          <div className="flex-1 overflow-hidden relative font-mono text-[10px] space-y-1.5 flex flex-col-reverse">
            <AnimatePresence>
              {events.map((ev) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 dark:bg-neutral-800/50 p-2 rounded border border-slate-200/70 dark:border-neutral-700/50"
                >
                  <div className="flex justify-between text-slate-500 dark:text-neutral-500 mb-1">
                    <span className={ev.topic.includes('waf') ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-orange-600 dark:text-orange-400 font-semibold'}>{ev.topic}</span>
                    <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 break-all leading-tight">
                    {JSON.stringify(ev.payload)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
