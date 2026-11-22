import React from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  Newspaper,
  Sparkles,
} from 'lucide-react';
import type { AgentIconKey } from '../../types/agent';

export function StarburstMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <line x1="16" y1="4" x2="16" y2="12" />
        <line x1="16" y1="20" x2="16" y2="28" />
        <line x1="4" y1="16" x2="12" y2="16" />
        <line x1="20" y1="16" x2="28" y2="16" />
        <line x1="7.5" y1="7.5" x2="13.2" y2="13.2" />
        <line x1="18.8" y1="18.8" x2="24.5" y2="24.5" />
        <line x1="24.5" y1="7.5" x2="18.8" y2="13.2" />
        <line x1="13.2" y1="18.8" x2="7.5" y2="24.5" />
        <line x1="11.4" y1="5" x2="14.5" y2="12.5" />
        <line x1="17.5" y1="19.5" x2="20.6" y2="27" />
        <line x1="5" y1="20.6" x2="12.5" y2="17.5" />
        <line x1="19.5" y1="14.5" x2="27" y2="11.4" />
      </g>
    </svg>
  );
}

export function AgentIcon({
  icon,
  highlighted = false,
}: {
  icon: AgentIconKey;
  highlighted?: boolean;
}) {
  const baseClass = 'w-4 h-4 shrink-0';
  const mutedColor = highlighted
    ? 'text-orange-600 dark:text-orange-400'
    : 'text-slate-400 dark:text-slate-500';

  switch (icon) {
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`${baseClass} ${highlighted ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`} aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z" />
        </svg>
      );
    case 'reddit':
      return (
        <svg viewBox="0 0 24 24" className={`${baseClass}`} aria-hidden="true">
          <circle cx="12" cy="12" r="10" className={highlighted ? 'fill-orange-500' : 'fill-slate-400 dark:fill-slate-500'} />
          <circle cx="9" cy="12" r="1.4" fill="white" />
          <circle cx="15" cy="12" r="1.4" fill="white" />
          <path d="M9 15.5c1 1 5 1 6 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${baseClass} ${mutedColor}`} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${baseClass} ${mutedColor}`} aria-hidden="true">
          <rect x="2.5" y="5" width="19" height="14" rx="4" />
          <path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={`${baseClass} ${mutedColor}`} aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'stripe':
      return (
        <span
          className={`w-4 h-4 rounded text-[11px] font-bold flex items-center justify-center shrink-0 ${
            highlighted
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
          aria-hidden="true"
        >
          S
        </span>
      );
    case 'figma':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${baseClass}`} aria-hidden="true">
          <path d="M9 3h3v6H9a3 3 0 0 1 0-6z" fill={highlighted ? '#F24E1E' : '#94A3B8'} />
          <path d="M12 3h3a3 3 0 0 1 0 6h-3V3z" fill={highlighted ? '#FF7262' : '#CBD5E1'} />
          <path d="M12 9h3a3 3 0 0 1 0 6h-3V9z" fill={highlighted ? '#1ABCFE' : '#94A3B8'} />
          <path d="M9 9h3v6H9a3 3 0 0 1 0-6z" fill={highlighted ? '#A259FF' : '#64748B'} />
          <path d="M9 15h3v3a3 3 0 0 1-3-3z" fill={highlighted ? '#0ACF83' : '#94A3B8'} />
        </svg>
      );
    case 'hubspot':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={`${baseClass} ${mutedColor}`} aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <circle cx="18.5" cy="7.5" r="1.5" />
          <circle cx="6.5" cy="17.5" r="1.5" />
          <line x1="14.2" y1="10.2" x2="17.2" y2="8.4" />
          <line x1="9.8" y1="13.8" x2="7.7" y2="16.3" />
        </svg>
      );
    case 'zoom':
      return (
        <span
          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
            highlighted
              ? 'bg-sky-500 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
          aria-hidden="true"
        >
          <span className="w-2 h-0.5 bg-current rounded-full" />
        </span>
      );
    case 'google':
      return (
        <span className={`w-4 h-4 text-xs font-bold flex items-center justify-center shrink-0 ${mutedColor}`} aria-hidden="true">
          G
        </span>
      );
    case 'flower':
      return <StarburstMark className={`${baseClass} ${mutedColor}`} />;
    case 'mail':
      return (
        <span
          className={`w-4 h-4 text-[11px] font-bold tracking-tight flex items-center justify-center shrink-0 ${mutedColor}`}
          aria-hidden="true"
        >
          M
        </span>
      );
    case 'mic':
      return (
        <span
          className={`w-4 h-4 flex items-center justify-center gap-[2.5px] shrink-0 ${mutedColor}`}
          aria-hidden="true"
        >
          <span className="w-[2px] h-3 bg-current rounded-full" />
          <span className="w-[2px] h-3 bg-current rounded-full" />
        </span>
      );
    case 'chart':
      return <BarChart3 className={`${baseClass} ${mutedColor}`} aria-hidden="true" />;
    case 'calendar':
      return <Calendar className={`${baseClass} ${mutedColor}`} aria-hidden="true" />;
    case 'newsletter':
      return <Newspaper className={`${baseClass} ${mutedColor}`} aria-hidden="true" />;
    case 'doc':
      return <FileText className={`${baseClass} ${mutedColor}`} aria-hidden="true" />;
    case 'dollar':
      return <DollarSign className={`${baseClass} ${mutedColor}`} aria-hidden="true" />;
    case 'message':
      return <MessageSquare className={`${baseClass} ${mutedColor}`} aria-hidden="true" />;
    case 'spark':
    default:
      return <Sparkles className={`${baseClass} ${mutedColor}`} aria-hidden="true" />;
  }
}
