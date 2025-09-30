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
  { href: '/interpreter', label: 'Interpreter', icon: MessageSquareText, description: 'Instantly decode and understand any raw FIX message with an AI-powered breakdown of every tag and its meaning.', isAiPowered: true },
  { href: '/chat', label: 'Chat', icon: MessageCircle, description: 'Your personal AI FIX protocol expert. Ask questions, get explanations, and clarify complex topics in a conversational interface.', isAiPowered: true },
  { href: '/log-analyzer', label: 'Log Analyzer', icon: FileText, description: 'Efficiently parse, search, and filter large FIX log files. Zero in on specific messages and analyze communication flows.' },
  { href: '/log-processor', label: 'Log Processor', icon: FileCog, description: 'Merge and sort multiple FIX log files chronologically. A powerful tool for consolidating session data for review.' },
  { href: '/comparator', label: 'Comparator', icon: GitCompareArrows, description: 'Perform a precise, field-by-field comparison of two FIX messages to instantly highlight any differences or discrepancies.' },
  { href: '/formatter', label: 'Formatter', icon: CodeXml, description: 'Convert raw, pipe-separated FIX messages into clean, well-structured XML for easier processing, documentation, or sharing.' },
  { href: '/workflow-visualizer', label: 'Visualizer', icon: Workflow, description: 'Generate clear flowchart diagrams from plain-text descriptions of trading scenarios to visualize complex message workflows.', isAiPowered: true },
  { href: '/symbol-search', label: 'Symbol Search', icon: Search, description: 'Look up real-time trading symbols, access key market data, and stay informed without leaving the application.' },
];
