import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, Lock, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>('SUPER_ADMIN');

  if (!isOpen) return null;

  const roles = [
    {
      role: 'SUPER_ADMIN' as const,
      title: 'Global Super Admin',
      name: 'Dr. Elena Rostova',
      email: 'e.rostova@beecarbonat.com',
      org: 'BeeCarbonat Global Facilities Group',
      desc: 'Full access to 3D BIM, Gemini API models, Modbus controllers, and financial ledger.',
    },
    {
      role: 'FACILITY_LEAD' as const,
      title: 'Building Facility Director',
      name: 'Marc Lefebvre',
      email: 'm.lefebvre@omikrontower.com',
      org: 'Omikron Tower Real Estate REIT',
      desc: 'Can control HydroSync valves, CityPulse DALI lighting, and schedule maintenance tickets.',
    },
    {
      role: 'FIELD_TECHNICIAN' as const,
      title: 'Certified Field Specialist',
      name: 'Sarah Benali',
      email: 's.benali@cafm-ops.io',
      org: 'HVAC Technical Services Paris',
      desc: 'Mobile QR/NFC field inspection, tool logging, and SLA ticket closure.',
    },
    {
      role: 'CSRD_AUDITOR' as const,
      title: 'ESG & CSRD Lead Auditor',
      name: 'Thomas Lindqvist',
      email: 't.lindqvist@verra-audit.eu',
      org: 'European Climate Verification Body',
      desc: 'Read-only access to Scope 1, 2, 3 carbon metrics and certified immutable exports.',
    },
  ];

  const handleSelectRole = (r: (typeof roles)[0]) => {
    onLogin({
      role: r.role,
      name: r.name,
      email: r.email,
      organization: r.org,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 max-w-lg w-full p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Spider Console Authentication</h3>
            <p className="text-xs text-slate-500 font-mono">
              mTLS v1.3 &amp; Google OAuth Role-Based Access Control (RBAC)
            </p>
          </div>
        </div>

        {currentUser ? (
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-indigo-700">CURRENTLY AUTHENTICATED</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </div>
            <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
            <div className="text-xs text-slate-600 font-mono">{currentUser.email}</div>
            <div className="text-xs text-indigo-800 mt-1 font-semibold">{currentUser.role} · {currentUser.organization}</div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="mt-4 w-full py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
            >
              Sign Out from Console
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
              Select Authorized Identity Role:
            </div>
            {roles.map((r) => (
              <div
                key={r.role}
                onClick={() => handleSelectRole(r)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 cursor-pointer transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700 mt-0.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 text-xs">{r.name}</div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {r.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{r.org}</div>
                  <div className="text-[11px] text-slate-600 mt-1">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-[11px] font-mono text-slate-400 text-center">
          ISO 27001 &amp; SOC-2 Type II Certified Ingress Perimeter
        </div>
      </div>
    </div>
  );
};
