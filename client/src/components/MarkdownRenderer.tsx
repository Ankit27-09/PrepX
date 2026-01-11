import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // You can change this theme

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-[#335441] mt-8 mb-4 pb-2 border-b-2 border-[#E4D7B4]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-[#335441] mt-8 mb-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold text-[#335441] mt-6 mb-3">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-[#335441] mt-4 mb-2">
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 text-[#3C6040] leading-relaxed">{children}</p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 space-y-2 list-disc text-[#3C6040]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 space-y-2 list-decimal text-[#3C6040]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,

          // Code
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="bg-[#F9F6EE] text-[#335441] px-2 py-1 rounded text-sm font-mono border border-[#E4D7B4]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className} text-sm`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-[#F9F6EE] border-2 border-[#E4D7B4] rounded-xl p-4 my-4 overflow-x-auto">
              {children}
            </pre>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#335441] bg-[#F9F6EE] pl-4 py-2 my-4 italic text-[#6B8F60]">
              {children}
            </blockquote>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[#335441] underline hover:text-[#46704A] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-2 border-[#E4D7B4] rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-[#335441] to-[#46704A] text-white">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold border border-[#E4D7B4]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border border-[#E4D7B4] text-[#3C6040]">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[#F9F6EE] transition-colors">{children}</tr>
          ),

          // Horizontal Rule
          hr: () => <hr className="my-8 border-t-2 border-[#E4D7B4]" />,

          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-bold text-[#335441]">{children}</strong>
          ),

          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic text-[#6B8F60]">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
