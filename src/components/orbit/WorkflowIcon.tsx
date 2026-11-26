import React from 'react';
import { FileText, Users, ShieldCheck, Calendar, DollarSign, Cpu, Activity, Workflow } from 'lucide-react';

interface WorkflowIconProps {
  icon?: string;
  className?: string;
}

export function WorkflowIcon({ icon, className = 'w-3.5 h-3.5' }: WorkflowIconProps) {
  switch (icon?.toLowerCase()) {
    case 'invoice':
    case 'receipt':
    case 'doc':
    case 'file':
      return <FileText className={className} />;
    case 'user':
    case 'users':
    case 'team':
    case 'onboarding':
      return <Users className={className} />;
    case 'shield':
    case 'security':
    case 'okta':
    case 'access':
      return <ShieldCheck className={className} />;
    case 'calendar':
    case 'clock':
    case 'renewal':
      return <Calendar className={className} />;
    case 'payroll':
    case 'dollar':
    case 'credit-card':
    case 'money':
      return <DollarSign className={className} />;
    case 'cpu':
    case 'edge':
    case 'agent':
      return <Cpu className={className} />;
    case 'activity':
    case 'sensor':
      return <Activity className={className} />;
    default:
      return <Workflow className={className} />;
  }
}

