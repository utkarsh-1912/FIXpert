import {
  LayoutDashboard,
  MessageSquareText,
  FileText,
  GitCompareArrows,
  CodeXml,
  Workflow,
  Search,
  FileCog,
  MessageCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
  isAiPowered?: boolean;
}

export const menuItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'An overview of all available tools and market data.' },
  { href: '/interpreter', label: 'Interpreter', icon: MessageSquareText, description: 'Instantly decode raw FIX messages. AI provides a human-readable breakdown of each tag, value, and its meaning for rapid debugging.', isAiPowered: true },
  { href: '/chat', label: 'Chat', icon: MessageCircle, description: 'Consult our AI FIX expert. Ask questions about protocol versions, message types, and trading scenarios for instant clarification.', isAiPowered: true },
  { href: '/log-analyzer', label: 'Log Analyzer', icon: FileText, description: 'Parse, filter, and analyze large FIX log files from multiple sessions. Identify message types, senders, and targets to trace order flows.' },
  { href: '/log-processor', label: 'Log Processor', icon: FileCog, description: 'Merge and chronologically sort multiple log files. Consolidate data from different systems into a single, time-sorted log for holistic analysis.' },
  { href: '/comparator', label: 'Comparator', icon: GitCompareArrows, description: 'Perform a side-by-side, field-level comparison of two FIX messages. Instantly highlight discrepancies between message sets.' },
  { href: '/formatter', label: 'Formatter', icon: CodeXml, description: 'Convert raw, pipe-separated FIX messages into structured XML for documentation, sharing, or input into other systems.' },
  { href: '/workflow-visualizer', label: 'Visualizer', icon: Workflow, description: 'Generate interactive flowcharts from plain English descriptions of trading scenarios, like order routing and execution reporting.', isAiPowered: true },
  { href: '/symbol-search', label: 'Symbol Search', icon: Search, description: 'Look up real-time trading symbols and access key market data from Yahoo Finance. Validate instruments and check market status.' },
];
