import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content text-xs md:text-sm text-zinc-200 leading-relaxed space-y-2 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Tables
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/60 shadow-lg">
              <table className="w-full text-left border-collapse text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-900 text-indigo-300 font-bold uppercase tracking-wider text-[10px] font-mono border-b border-zinc-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-zinc-800/40 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 font-mono text-[11px] text-zinc-300">
              {children}
            </td>
          ),

          // Headings
          h1: ({ children }) => (
            <h1 className="text-base font-extrabold text-white mt-4 mb-2 border-b border-zinc-800 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-zinc-100 mt-3.5 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-indigo-400 mt-2.5 mb-1 tracking-wide">
              {children}
            </h3>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 border-l-2 border-indigo-500 bg-indigo-950/20 px-3.5 py-2 rounded-r-xl text-xs text-zinc-300 italic">
              {children}
            </blockquote>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-xs text-zinc-300 pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 text-xs text-zinc-300 pl-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-normal">
              {children}
            </li>
          ),

          // Text Formatting
          strong: ({ children }) => (
            <strong className="font-bold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-zinc-300 italic">
              {children}
            </em>
          ),

          // Code Blocks & Inline Code
          code: ({ className: codeClassName, children, ...props }: any) => {
            const isInline = !codeClassName;
            return isInline ? (
              <code className="bg-zinc-900 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-zinc-800/80" {...props}>
                {children}
              </code>
            ) : (
              <pre className="my-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-200 overflow-x-auto shadow-inner">
                <code {...props}>{children}</code>
              </pre>
            );
          },

          // Paragraphs
          p: ({ children }) => (
            <p className="my-1.5 text-xs md:text-sm leading-relaxed text-zinc-300">
              {children}
            </p>
          ),

          // Horizontal Rule
          hr: () => (
            <hr className="my-3 border-zinc-800/80" />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
