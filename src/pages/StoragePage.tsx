import React, { useState } from "react";
import { GlobalState, StorageBucket } from "../types";
import { Database, HardDrive, LayoutGrid, Plus, X, Trash2, Video, Image, Terminal, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { logAuditEvent } from "../hooks/useGlobalState";

interface StoragePageProps {
  state: GlobalState;
  isDark: boolean;
  activeItemId?: string;
  onSelectTab?: (id: string) => void;
}

const TABS = [
  { id: "db-1", label: "R2 Buckets" },
  { id: "db-2", label: "D1 SQL" },
  { id: "db-3", label: "Images" },
  { id: "db-4", label: "Stream" }
];

export default function StoragePage({ state, isDark, activeItemId = "db-1", onSelectTab }: StoragePageProps) {
  const currentTab = TABS.some(t => t.id === activeItemId) ? activeItemId : "db-1";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBucket, setNewBucket] = useState({
    name: "",
    location: "EU-West",
  });

  // D1 Interactive SQL Editor state
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM edge_nodes WHERE status = 'active' LIMIT 5;");
  const [sqlResult, setSqlResult] = useState<any[] | null>([
    { id: "fra-1", name: "Frankfurt Core", status: "active", latency: 12 },
    { id: "cdg-2", name: "Paris Central", status: "active", latency: 16 },
    { id: "lhr-3", name: "London Docklands", status: "active", latency: 14 }
  ]);

  const handleRunSql = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sqlQuery) return;
    setSqlResult([
      { query_executed: sqlQuery, status: "SUCCESS", rows_affected: 3, execution_time: "0.84ms" },
      { engine: "D1 SQLite Edge Edition", checkpoint: "WAL Mode", consistency: "Read-After-Write" }
    ]);
    logAuditEvent("D1_SQL_EXECUTE", `Executed SQL: ${sqlQuery.substring(0, 50)}...`);
  };

  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucket.name) return;
    
    setIsSubmitting(true);
    try {
      const colRef = collection(db, "buckets");
      const docRef = await addDoc(colRef, {
        name: newBucket.name,
        location: newBucket.location,
        sizeGB: 0.1,
        objects: 1
      });
      await updateDoc(doc(db, "buckets", docRef.id), { id: docRef.id });
      await logAuditEvent("R2_BUCKET_CREATE", `Created R2 bucket '${newBucket.name}' in ${newBucket.location}`);
      
      setIsModalOpen(false);
      setNewBucket({ name: "", location: "EU-West" });
    } catch (err) {
      console.error("Failed to add bucket", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBucket = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, "buckets", id));
      await logAuditEvent("R2_BUCKET_DELETE", `Deleted R2 bucket ${name}`);
    } catch (err) {
      console.error("Failed to delete bucket", err);
    }
  };

  const chartFill = isDark ? "#ffffff" : "#F38020";
  const gridColor = isDark ? "#262626" : "#f1f5f9";
  const textColor = isDark ? "#a3a3a3" : "#64748b";

  const totalSize = (state.buckets || []).reduce((acc, curr) => acc + curr.sizeGB, 0);
  const totalObjects = (state.buckets || []).reduce((acc, curr) => acc + curr.objects, 0);

  const chartData = (state.buckets || []).map(b => ({
    name: b.name.replace("jeton-", "").substring(0, 10),
    size: b.sizeGB
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 dark:border-neutral-800 pb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Storage & Edge Databases</h1>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">enterprise.jeton.com / R2 Zero-Egress Storage & D1 SQLite</p>
        </div>
        {currentTab === "db-1" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Create Bucket
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-neutral-800 pb-px">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onSelectTab && onSelectTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === tab.id
                ? "bg-white dark:bg-neutral-900 border-t-2 border-l border-r border-t-orange-500 border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-500 mb-2">
            <HardDrive className="w-4 h-4 text-orange-500" /> Total R2 Stored Data
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{(totalSize / 1024).toFixed(2)} TB</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">€ 0.00 Egress fees guaranteed</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-500 mb-2">
            <LayoutGrid className="w-4 h-4 text-orange-500" /> Total Stored Objects
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{(totalObjects ?? 0).toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-1">Across {(state.buckets || []).length} buckets</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-neutral-500 mb-2">
            <Database className="w-4 h-4 text-orange-500" /> D1 Edge Databases
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">1 Active Primary</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Replicated across Europe & US</div>
        </div>
      </div>

      {/* Sub-View: R2 Buckets (db-1) */}
      {currentTab === "db-1" && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Storage Volume Distribution (GB)</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" stroke={gridColor} tick={{ fill: textColor, fontSize: 11 }} />
                  <YAxis stroke={gridColor} tick={{ fill: textColor, fontSize: 11 }} unit=" GB" />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#171717' : '#ffffff', borderColor: gridColor, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="size" fill={chartFill} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">R2 Storage Buckets</h3>
              <span className="text-xs text-slate-500 dark:text-neutral-500 font-mono">S3-Compatible API</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-500 font-sans">
                  <tr>
                    <th className="p-3">Bucket Name</th>
                    <th className="p-3">Jurisdiction / Location</th>
                    <th className="p-3">Size (GB)</th>
                    <th className="p-3">Total Objects</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                  {(state.buckets || []).map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50">
                      <td className="p-3 font-bold font-sans flex items-center gap-2 text-slate-900 dark:text-white">
                        <HardDrive className="w-3.5 h-3.5 text-orange-500" />
                        {b.name}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-neutral-400">{b.location}</td>
                      <td className="p-3 text-slate-700 dark:text-neutral-300">{b.sizeGB.toFixed(1)} GB</td>
                      <td className="p-3 text-slate-700 dark:text-neutral-300">{(b.objects || 0).toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteBucket(b.id, b.name)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Sub-View: D1 SQL (db-2) */}
      {currentTab === "db-2" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">D1 Serverless SQLite Query Console</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-500">Query your edge SQL database with automatic read replicas</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold">
              jeton_prod_d1
            </span>
          </div>

          <form onSubmit={handleRunSql} className="space-y-3">
            <textarea
              rows={3}
              value={sqlQuery}
              onChange={e => setSqlQuery(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Execute Query
              </button>
            </div>
          </form>

          {sqlResult && (
            <div className="p-3 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50 font-mono text-xs overflow-x-auto">
              <div className="text-slate-500 dark:text-neutral-400 mb-2 font-bold font-sans">Query Output:</div>
              <pre className="text-slate-800 dark:text-neutral-300">{JSON.stringify(sqlResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Sub-View: Images (db-3) */}
      {currentTab === "db-3" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edge Image Resizing & Delivery</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-500">Auto-convert JPEG/PNG to modern WebP and AVIF formats based on client browser Accept headers.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-2">
              <div className="font-bold font-sans text-slate-800 dark:text-neutral-200">AVIF Auto-Format Conversion</div>
              <div className="text-slate-500 dark:text-neutral-500">Compression Efficiency: 68% size reduction</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold">Active / Edge Accelerated</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 space-y-2">
              <div className="font-bold font-sans text-slate-800 dark:text-neutral-200">Polish & Mirage Optimizations</div>
              <div className="text-slate-500 dark:text-neutral-500">Lossless metadata stripping & responsive downsampling</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold">Active</div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View: Stream (db-4) */}
      {currentTab === "db-4" && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edge Stream Video Delivery</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-500">Adaptive bitrate streaming (HLS/DASH) encoded at the edge without buffering.</p>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 text-xs font-mono space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-800 dark:text-neutral-200">Total Video Minutes Streamed (30d)</span>
              <span className="text-emerald-600 dark:text-emerald-400">842,100 mins</span>
            </div>
            <div className="text-slate-500 dark:text-neutral-500">HLS Ingest Endpoint: rtmp://stream.jeton.com/live</div>
          </div>
        </div>
      )}

      {/* Create Bucket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create R2 Bucket</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBucket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Bucket Name</label>
                <input 
                  required
                  type="text" 
                  value={newBucket.name}
                  onChange={e => setNewBucket({...newBucket, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono text-slate-900 dark:text-white"
                  placeholder="e.g. enterprise-backups-fra"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1">Jurisdiction / Storage Location</label>
                <select 
                  value={newBucket.location}
                  onChange={e => setNewBucket({...newBucket, location: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 dark:text-white"
                >
                  <option value="EU-West">EU-West (Frankfurt / Paris)</option>
                  <option value="US-East">US-East (Ashburn)</option>
                  <option value="APAC">APAC (Singapore / Tokyo)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? "Creating..." : "Create Bucket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
