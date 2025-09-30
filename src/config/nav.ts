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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview of all tools and market data.' },
  { href: '/interpreter', label: 'Interpreter', icon: MessageSquareText, description: 'Decode raw FIX messages with an AI-powered breakdown.', isAiPowered: true },
  { href: '/chat', label: 'Chat', icon: MessageCircle, description: 'Ask questions and get expert answers about the FIX protocol.', isAiPowered: true },
  { href: '/log-analyzer', label: 'Log Analyzer', icon: FileText, description: 'Parse, filter, and analyze large FIX log files.' },
  { href: '/log-processor', label: 'Log Processor', icon: FileCog, description: 'Merge and chronologically sort multiple log files.' },
  { href: '/comparator', label: 'Comparator', icon: GitCompareArrows, description: 'Perform a side-by-side comparison of two FIX messages.' },
  { href: '/formatter', label: 'Formatter', icon: CodeXml, description: 'Convert raw FIX messages into a structured XML format.' },
  { href: '/workflow-visualizer', label: 'Visualizer', icon: Workflow, description: 'Generate flowcharts from trading scenario descriptions.', isAiPowered: true },
  { href: '/symbol-search', label: 'Symbol Search', icon: Search, description: 'Look up real-time trading symbols and market data.' },
];
