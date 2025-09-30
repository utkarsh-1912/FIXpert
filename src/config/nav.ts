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
  Sparkles,
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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'An overview of all available tools.' },
  { href: '/interpreter', label: 'Interpreter', icon: MessageSquareText, description: 'Parse and understand raw FIX messages.', isAiPowered: true },
  { href: '/chat', label: 'Chat', icon: MessageCircle, description: 'Chat with an AI FIX protocol expert.', isAiPowered: true },
  { href: '/log-analyzer', label: 'Log Analyzer', icon: FileText, description: 'Analyze and filter FIX protocol log files.' },
  { href: '/log-processor', label: 'Log Processor', icon: FileCog, description: 'Process and sort raw FIX log files.' },
  { href: '/comparator', label: 'Comparator', icon: GitCompareArrows, description: 'Compare two FIX messages side-by-side.' },
  { href: '/formatter', label: 'Formatter', icon: CodeXml, description: 'Convert raw FIX messages to XML format.' },
  { href: '/workflow-visualizer', label: 'Visualizer', icon: Workflow, description: 'Visualize FIX message workflows from scenarios.', isAiPowered: true },
  { href: '/symbol-search', label: 'Symbol Search', icon: Search, description: 'Quickly find and select trading symbols.' },
];
