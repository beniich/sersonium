import React, { useState } from 'react';
import { X, Check, Zap, Shield, Crown, Building2, CreditCard } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planName: string) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paypalCheckoutSuccess, setPaypalCheckoutSuccess] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      name: 'Starter Facility',
      tagline: 'For single commercial buildings up to 25,000 sqm',
      price: billingCycle === 'annual' ? 390 : 490,
      badge: null,
      features: [
        'Up to 2,500 active IoT telemetry nodes',
        'IFC 4.3 3D BIM Viewer (LOD 300)',
        'Basic BMS Modbus & BACnet bridge',
        'Standard Work Orders & QR field tagging',
        '99.9% Edge Mesh SLA',
        'Email & Community support',
      ],
      buttonText: 'Start 14-Day Pilot',
      highlighted: false,
    },
    {
      name: 'Spider Enterprise',
      tagline: 'For multi-site portfolios and corporate campuses',
      price: billingCycle === 'annual' ? 1490 : 1850,
      badge: 'MOST POPULAR',
      features: [
        'Unlimited IoT telemetry nodes & chillers',
        'Gemini AI Predictive Breakdown Copilot',
        'Full 60 FPS Thermal Slicing & Heatmaps',
        'EU CSRD Scope 1, 2, 3 Automated Accounting',
        'HydroSync Automated Leak Protection',
        'CityPulse DALI-2 Circadian Lighting Engine',
        '99.999% Zero-Downtime Edge SLA',
        '24/7 Dedicated Facility Engineering Support',
      ],
      buttonText: 'Subscribe with PayPal',
      highlighted: true,
    },
    {
      name: 'Sovereign Industrial',
      tagline: 'Air-gapped on-premise or sovereign cloud deployments',
      price: 'Custom',
      badge: 'DEFENSE & AIRPORTS',
      features: [
        'Self-hosted on Sovereign Cloud or Bare-metal',
        'Hardware mTLS v1.3 cryptographic keycards',
        'Direct SCADA & industrial PLC interconnects',
        'Custom fine-tuned Gemini AI physics weights',
        'Dedicated Technical Account Manager',
        'Full source code escrow agreement',
      ],
      buttonText: 'Contact Enterprise Sales',
      highlighted: false,
    },
  ];

  const handleCheckout = (planName: string) => {
    setSelectedPlan(planName);
    setPaypalCheckoutSuccess(true);
    setTimeout(() => {
      onSelectPlan(planName);
      setPaypalCheckoutSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 max-w-5xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-mono font-medium text-indigo-700 mb-3">
            TRANSPARENT FACILITY PRICING
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Predictive Intelligence Built to Scale
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-normal">
            Choose the subscription tier aligned with your portfolio footprint and regulatory CSRD obligations.
          </p>

          {/* Billing cycle toggle */}
          <div className="inline-flex items-center p-1 mt-6 bg-slate-100 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                billingCycle === 'annual' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-700 text-indigo-100 font-mono">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {paypalCheckoutSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>PayPal Subscription Captured for {selectedPlan}! Activating Enterprise Node...</span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                p.highlighted
                  ? 'bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl ring-2 ring-indigo-500'
                  : 'bg-white border border-slate-200 text-slate-900 hover:border-indigo-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  {p.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        p.highlighted ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className={`text-xs mb-5 ${p.highlighted ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {p.tagline}
                </p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold tracking-tight font-mono">
                    {typeof p.price === 'number' ? `$${p.price}` : p.price}
                  </span>
                  {typeof p.price === 'number' && (
                    <span className={`text-xs ml-1 ${p.highlighted ? 'text-indigo-300' : 'text-slate-500'}`}>
                      / month billed {billingCycle}
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 text-xs mb-8">
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2">
                      <Check
                        className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          p.highlighted ? 'text-indigo-400' : 'text-indigo-600'
                        }`}
                      />
                      <span className={p.highlighted ? 'text-slate-200' : 'text-slate-600'}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleCheckout(p.name)}
                className={`w-full py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  p.highlighted
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {p.highlighted && <CreditCard className="w-3.5 h-3.5" />}
                <span>{p.buttonText}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
