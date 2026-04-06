import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, CheckCircle2, AlertCircle, Eye, Copy, Check, Bot, Sparkles } from 'lucide-react';
import type { GenerationStatus, Website } from '../types';
import type { SummaryStatus } from '../pages/Home';

interface StreamingOutputProps {
  status: GenerationStatus;
  streamedCode: string;
  currentWebsite: Website | null;
  onPreview: (id: string) => void;
  errorMessage?: string;
  summaryMessage: string;
  summaryStatus: SummaryStatus;
}

const statusConfig = {
  idle: null,
  thinking: { label: 'AI is thinking…', color: 'text-amber-600', dot: 'bg-amber-400', bg: 'bg-amber-50 border-amber-100' },
  streaming: { label: 'Generating code…', color: 'text-accent', dot: 'bg-accent', bg: 'bg-accent-muted border-accent/15' },
  done: { label: 'Done!', color: 'text-sage-accent', dot: 'bg-sage-accent', bg: 'bg-emerald-50 border-emerald-100' },
  error: { label: 'Generation failed', color: 'text-red-500', dot: 'bg-red-400', bg: 'bg-red-50 border-red-100' },
};

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[-•✅🎮💾🔧📊🎨🌐💼⚡🎯🏆🔑📱🖥️]\s+/gm, '<span class="inline-block mr-1">$&</span>')
    .replace(/\n/g, '<br/>');
}

export default function StreamingOutput({
  status,
  streamedCode,
  currentWebsite,
  onPreview,
  errorMessage,
  summaryMessage,
  summaryStatus,
}: StreamingOutputProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current && status === 'streaming') {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [streamedCode, status]);

  useEffect(() => {
    if (summaryRef.current && summaryStatus === 'generating') {
      summaryRef.current.scrollTop = summaryRef.current.scrollHeight;
    }
  }, [summaryMessage, summaryStatus]);

  const copyCode = async () => {
    if (!streamedCode) return;
    await navigator.clipboard.writeText(streamedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'idle') return null;
  const cfg = statusConfig[status];

  const lineCount = streamedCode ? streamedCode.split('\n').length : 0;
  const charCount = streamedCode ? streamedCode.length : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Code Output Block */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col rounded-2xl overflow-hidden bg-white border border-surface-border shadow-card"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-base-50">
          <div className="flex items-center gap-3">
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>

            {cfg && (
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                {status === 'done' ? (
                  <CheckCircle2 size={11} />
                ) : status === 'error' ? (
                  <AlertCircle size={11} />
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                )}
                {cfg.label}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {streamedCode && (
              <>
                <span className="text-xs text-text-muted font-mono hidden sm:block">
                  {lineCount} lines · {charCount.toLocaleString()} chars
                </span>

                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-base-100 text-text-secondary text-xs font-semibold border border-surface-border transition-colors shadow-button"
                >
                  {copied ? <Check size={11} className="text-sage-accent" /> : <Copy size={11} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </>
            )}

            {status === 'done' && currentWebsite && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onPreview(currentWebsite.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-accent hover:bg-accent-dim transition-all shadow-button"
              >
                <Eye size={11} />
                Open Preview
              </motion.button>
            )}
          </div>
        </div>

        {/* File tab */}
        {streamedCode && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-surface-border">
            <Code2 size={12} className="text-text-muted" />
            <span className="text-xs font-mono text-text-secondary">
              {currentWebsite ? currentWebsite.id + '.html' : 'index.html'}
            </span>
            {status === 'streaming' && (
              <span className="ml-auto text-xs font-mono text-accent">
                writing<span className="cursor-blink">▋</span>
              </span>
            )}
          </div>
        )}

        {/* Code content */}
        <div className="relative max-h-[400px] overflow-hidden bg-gray-50">
          {status === 'thinking' ? (
            <div className="flex flex-col gap-3 p-6">
              {[75, 55, 85, 45, 65].map((w, i) => (
                <div
                  key={i}
                  className="shimmer h-3 rounded-full"
                  style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          ) : status === 'error' ? (
            <div className="flex items-start gap-3 p-5 bg-red-50">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-600">Generation Failed</p>
                <p className="text-xs text-red-400 mt-1">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <pre
              ref={codeRef}
              className="overflow-y-auto overflow-x-auto text-xs font-mono leading-relaxed text-text-code p-4"
              style={{ maxHeight: 400, tabSize: 2, fontFamily: "'Fira Code', monospace" }}
            >
              <code>{streamedCode}</code>
              {status === 'streaming' && (
                <span className="cursor-blink text-accent">▋</span>
              )}
            </pre>
          )}

          {streamedCode && status === 'streaming' && (
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Done footer */}
        <AnimatePresence>
          {status === 'done' && currentWebsite && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-t border-emerald-100 px-4 py-3 bg-emerald-50 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-sage-accent" />
                  <span className="text-sm font-semibold text-text-primary">
                    {currentWebsite.name}
                  </span>
                  <span className="text-xs text-text-muted font-mono hidden sm:block">
                    · {currentWebsite.id}
                  </span>
                </div>
                <button
                  onClick={() => onPreview(currentWebsite.id)}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Preview →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Summary Chat Bubble */}
      <AnimatePresence>
        {(summaryStatus === 'generating' || summaryStatus === 'done') && summaryMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-start gap-3"
          >
            {/* AI Avatar */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-accent-muted border border-accent/15">
              <Bot size={14} className="text-accent" />
            </div>

            {/* Bubble */}
            <div className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3.5 bg-white border border-surface-border shadow-card">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles size={11} className="text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  CobasiteAI
                </span>
                {summaryStatus === 'generating' && (
                  <span className="ml-1 text-xs text-text-muted">
                    is typing<span className="cursor-blink">▋</span>
                  </span>
                )}
              </div>

              <div
                ref={summaryRef}
                className="text-text-secondary text-sm leading-relaxed overflow-y-auto"
                style={{ maxHeight: 300 }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(summaryMessage) }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary skeleton */}
      <AnimatePresence>
        {summaryStatus === 'generating' && !summaryMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-accent-muted border border-accent/15">
              <Bot size={14} className="text-accent" />
            </div>
            <div className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3.5 bg-white border border-surface-border shadow-card">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles size={11} className="text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider">CobasiteAI</span>
              </div>
              <div className="flex flex-col gap-2">
                {[68, 88, 52, 78].map((w, i) => (
                  <div
                    key={i}
                    className="shimmer h-2.5 rounded-full"
                    style={{ width: `${w}%`, animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
