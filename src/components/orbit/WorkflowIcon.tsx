import React from 'react';
import { Receipt, UserCheck, ShieldCheck, Calendar, Wallet, Sparkles } from 'lucide-react';
import type { WorkflowIconKey } from '../../types/agent';

export function WorkflowIcon({ icon }: { icon: WorkflowIconKey }) {
  switch (icon) {
    case 'invoice':
      return <Receipt className="w-3.5 h-3.5" />;
    case 'user':
      return <UserCheck className="w-3.5 h-3.5" />;
    case 'shield':
      return <ShieldCheck className="w-3.5 h-3.5" />;
    case 'calendar':
      return <Calendar className="w-3.5 h-3.5" />;
    case 'wallet':
      return <Wallet className="w-3.5 h-3.5" />;
    case 'spark':
    default:
      return <Sparkles className="w-3.5 h-3.5" />;
  }
}
