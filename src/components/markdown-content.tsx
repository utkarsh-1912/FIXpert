
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ node, ...props }) => <Table className="my-4" {...props} />,
        thead: ({ node, ...props }) => <TableHeader {...props} />,
        tbody: ({ node, ...props }) => <TableBody {...props} />,
        tr: ({ node, ...props }) => <TableRow {...props} />,
        th: ({ node, ...props }) => <TableHead className="font-semibold" {...props} />,
        td: ({ node, ...props }) => <TableCell {...props} />,
        ul: ({ node, ...props }) => <ul className="my-4 ml-6 list-disc [&>li]:mt-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="my-4 ml-6 list-decimal [&>li]:mt-2" {...props} />,
        p: ({ node, ...props }) => <div className="leading-relaxed" {...props} />,
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline ? (
            <pre className="my-4 overflow-x-auto rounded-md bg-muted/80 p-3 font-mono">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code className="rounded-md bg-muted/80 px-1.5 py-1 font-mono text-sm" {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
