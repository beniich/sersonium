import React from 'react';
import {
  Globe,
  Layers,
  Compass,
  Cpu,
  Wrench,
  Network,
  Shield,
  Laptop,
  Lock,
  Database,
  Activity,
  Users,
  Server,
  Target,
  Bot,
  Factory,
  Zap,
  ShieldAlert,
  Plug,
  Settings,
} from 'lucide-react';
import type { SensoriumRubriqueIconKey } from '../../types/agent';

export function RubriqueIcon({
  icon,
  className = 'w-3.5 h-3.5',
}: {
  icon: SensoriumRubriqueIconKey;
  className?: string;
}) {
  switch (icon) {
    case 'globe':
      return <Globe className={className} />;
    case 'layers':
      return <Layers className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'cpu':
      return <Cpu className={className} />;
    case 'wrench':
      return <Wrench className={className} />;
    case 'network':
      return <Network className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'laptop':
      return <Laptop className={className} />;
    case 'lock':
      return <Lock className={className} />;
    case 'database':
      return <Database className={className} />;
    case 'activity':
      return <Activity className={className} />;
    case 'users':
      return <Users className={className} />;
    case 'server':
      return <Server className={className} />;
    case 'target':
      return <Target className={className} />;
    case 'bot':
      return <Bot className={className} />;
    case 'factory':
      return <Factory className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'shield-alert':
      return <ShieldAlert className={className} />;
    case 'plug':
      return <Plug className={className} />;
    case 'settings':
    default:
      return <Settings className={className} />;
  }
}
