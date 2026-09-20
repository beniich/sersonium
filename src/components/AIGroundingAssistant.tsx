import React, { useState } from "react";
import { Cpu, Search, MapPin, Send, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { logAuditEvent } from "../hooks/useGlobalState";

export default function AIGroundingAssistant() {
  const [query, setQuery] = useState("");
  const [tool, setTool] = useState<"search" | "maps">("search");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await fetch("/api/v1/grounding/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query, toolType: tool })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to query AI");
      }
      
      setResponse(data.data.response);
      logAuditEvent("AI_GROUNDING_QUERY", `Queried AI with ${tool} grounding: ${query.substring(0, 30)}...`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
      <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
        <Cpu className="w-5 h-5 text-indigo-500" />
        AI Grounding (Live Data Access)
      </div>
      
      <p className="text-xs text-slate-500 dark:text-neutral-500">
        Use Gemini 3.5 Flash equipped with Google Search or Google Maps to access up-to-date and accurate real-world information.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tool Selector */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grounding Source</label>
          
          <button
            onClick={() => setTool("search")}
            className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
              tool === "search" 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm" 
                : "border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 text-slate-600 dark:text-neutral-400"
            }`}
          >
            <div className={`p-1.5 rounded-md ${tool === "search" ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-neutral-800"}`}>
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-sans">Google Search</div>
              <div className="text-[10px] font-mono opacity-80">Real-time web data</div>
            </div>
          </button>
          
          <button
            onClick={() => setTool("maps")}
            className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
              tool === "maps" 
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm" 
                : "border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 text-slate-600 dark:text-neutral-400"
            }`}
          >
            <div className={`p-1.5 rounded-md ${tool === "maps" ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-neutral-800"}`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-sans">Google Maps</div>
              <div className="text-[10px] font-mono opacity-80">Places & Geospatial</div>
            </div>
          </button>
        </div>

        {/* Query Input */}
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prompt</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tool === "search" ? "Search for recent security vulnerabilities..." : "Where is the nearest Google Cloud datacenter?"}
              className="flex-1 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            />
            <button
              onClick={handleQuery}
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
          </div>
          
          {error && (
            <div className="mt-2 p-3 rounded-lg border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {response && (
            <div className="mt-2 p-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/50 text-sm whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-neutral-200">
              <div className="text-slate-500 dark:text-neutral-400 mb-2 font-bold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                Grounded AI Response:
              </div>
              {response}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
