import React from 'react';
import { Lock, CheckCircle2, XCircle } from 'lucide-react';
import type { ApprovalItem } from '../../types/agent';

interface ApprovalsViewProps {
  approvals: ApprovalItem[];
  decidingApprovalId: string | null;
  onDecideApproval: (approvalId: string, decision: 'approved' | 'declined') => void;
  onBatchDecideApprovals: (decision: 'approved' | 'declined') => void;
}

export function ApprovalsView({
  approvals,
  decidingApprovalId,
  onDecideApproval,
  onBatchDecideApprovals,
}: ApprovalsViewProps) {
  const pending = approvals.filter((a) => a.status === 'pending');
  const resolved = approvals.filter((a) => a.status !== 'pending');

  return (
    <div className="space-y-3">
      <section className="bg-white dark:bg-[#1e2023] rounded-[20px] p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] border border-white dark:border-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Pending Approvals
            </h2>
            <span className="w-5 h-5 rounded-full bg-[#E5FA52] text-[#111317] font-semibold text-[11px] flex items-center justify-center tabular-nums">
              {pending.length}
            </span>
          </div>

          {pending.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onBatchDecideApprovals('approved')}
                className="px-3.5 py-1.5 rounded-full bg-[#141518] dark:bg-white text-white dark:text-[#111317] text-xs font-semibold hover:opacity-90"
              >
                Approve all
              </button>
              <button
                type="button"
                onClick={() => onBatchDecideApprovals('declined')}
                className="px-3.5 py-1.5 rounded-full bg-[#F2F4F7] dark:bg-[#282a2d] text-slate-700 dark:text-[#e2e2e6] text-xs font-medium hover:bg-slate-200 dark:hover:bg-[#333538]"
              >
                Decline all
              </button>
            </div>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#8E929C]">
            No pending approvals right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pending.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-[#282a2d] border border-slate-100 dark:border-white/[0.08] flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#8E929C] mb-1">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                      {item.locked && <Lock className="w-3 h-3" />}
                      {item.id}
                    </span>
                    <span>{item.ageLabel}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </div>
                  <div className="text-xs text-[#8E929C] mt-1">{item.subtitle}</div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={decidingApprovalId === item.id}
                    onClick={() => onDecideApproval(item.id, 'approved')}
                    className="flex-1 py-2 rounded-xl bg-[#141518] dark:bg-white text-white dark:text-[#111317] text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={decidingApprovalId === item.id}
                    onClick={() => onDecideApproval(item.id, 'declined')}
                    className="flex-1 py-2 rounded-xl bg-white dark:bg-[#1a1c1f] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-[#e2e2e6] text-xs font-medium hover:bg-slate-100 dark:hover:bg-[#333538] disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {resolved.length > 0 && (
        <section className="bg-white dark:bg-[#1e2023] rounded-[20px] p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] border border-white dark:border-white/[0.06]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8E929C] mb-3">
            Decided ({resolved.length})
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-white/[0.06] text-xs">
            {resolved.map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-mono text-[11px] text-[#8E929C] mr-2">
                    {item.id}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {item.title}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                    item.status === 'approved'
                      ? 'bg-emerald-50 dark:bg-[#4edea3]/10 text-emerald-700 dark:text-[#4edea3]'
                      : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {item.status === 'approved' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  <span className="capitalize">{item.status}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
