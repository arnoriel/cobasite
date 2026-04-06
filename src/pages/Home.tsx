import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Globe, Menu, Wand2, Gamepad2, LayoutDashboard, Wrench } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PromptInput from '../components/PromptInput';
import StreamingOutput from '../components/StreamingOutput';
import type { Website, GenerationStatus } from '../types';
import { storage } from '../lib/storage';
import { generateWebsite, generateWebsiteSummary, extractWebsiteName } from '../lib/ai';

export type SummaryStatus = 'idle' | 'generating' | 'done';

export default function Home() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [streamedCode, setStreamedCode] = useState('');
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [summaryMessage, setSummaryMessage] = useState('');
  const [summaryStatus, setSummaryStatus] = useState<SummaryStatus>('idle');

  useEffect(() => {
    storage.getAll().then(setWebsites);
  }, []);

  const refreshWebsites = useCallback(async () => {
    const all = await storage.getAll();
    setWebsites(all);
  }, []);

  const handleGenerate = useCallback(async (prompt: string, apiKey: string) => {
    setStatus('thinking');
    setStreamedCode('');
    setCurrentWebsite(null);
    setErrorMessage('');
    setSummaryMessage('');
    setSummaryStatus('idle');

    const id = storage.generateId();
    const name = extractWebsiteName(prompt);

    const newSite: Website = {
      id,
      name,
      prompt,
      source_code: '',
      created_at: new Date().toISOString(),
    };

    await storage.save(newSite);
    setActiveId(id);
    setCurrentWebsite(newSite);
    await refreshWebsites();

    let accumulatedCode = '';

    await generateWebsite(apiKey, prompt, {
      onChunk: (chunk) => {
        accumulatedCode += chunk;
        setStreamedCode(accumulatedCode);
        setStatus('streaming');
      },
      onDone: async (fullCode) => {
        await storage.update(id, { source_code: fullCode });
        const updatedSite = { ...newSite, source_code: fullCode };
        setCurrentWebsite(updatedSite);
        setStreamedCode(fullCode);
        setStatus('done');
        await refreshWebsites();

        setSummaryStatus('generating');
        let summaryAcc = '';

        await generateWebsiteSummary(apiKey, prompt, fullCode, {
          onChunk: (chunk) => {
            summaryAcc += chunk;
            setSummaryMessage(summaryAcc);
          },
          onDone: (full) => {
            setSummaryMessage(full);
            setSummaryStatus('done');
          },
          onError: () => {
            setSummaryStatus('done');
          },
        });
      },
      onError: async (err) => {
        setErrorMessage(err);
        setStatus('error');
        await storage.delete(id);
        await refreshWebsites();
      },
    });
  }, [refreshWebsites]);

  const handlePreview = (id: string) => navigate(`/websites/${id}/preview`);

  const handleDelete = async (id: string) => {
    if (activeId === id) {
      setActiveId(undefined);
      setStatus('idle');
      setStreamedCode('');
      setCurrentWebsite(null);
      setSummaryMessage('');
      setSummaryStatus('idle');
    }
    await refreshWebsites();
  };

  const CAPABILITIES = [
    { icon: Globe, label: 'Landing Pages', desc: 'Marketing, portfolio, company sites', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { icon: Gamepad2, label: 'Games', desc: 'Arcade, puzzle, quiz, platformer', color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { icon: LayoutDashboard, label: 'SaaS / Apps', desc: 'Dashboard, CRM, todo, kanban', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { icon: Wrench, label: 'Tools', desc: 'Calculator, converter, generator', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  ];

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <Sidebar
        websites={websites}
        activeId={activeId}
        onSelect={setActiveId}
        onPreview={handlePreview}
        onDelete={handleDelete}
        onRefresh={refreshWebsites}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-surface-border bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-base-100 text-text-muted hover:text-text-secondary transition-colors"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-button"
                style={{ background: 'linear-gradient(135deg, #2563EB, #10A37F)' }}
              >
                <Wand2 size={14} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-base font-bold text-text-primary leading-none">
                  CobasiteAI
                </h1>
                <p className="text-xs text-text-muted mt-0.5 hidden sm:block">
                  Agentic Website Builder
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Powered by AI
            </span>
          </div>
        </header>

        {/* Main scrollable body */}
        <main className="flex-1 overflow-y-auto bg-dot-pattern">
          {status === 'idle' && websites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 md:px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="max-w-2xl w-full"
              >
                {/* Hero badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-muted border border-accent/20 mb-6">
                  <Sparkles size={12} className="text-accent" />
                  <span className="text-xs font-semibold text-accent">AI Website Builder</span>
                </div>

                <h2 className="font-display text-3xl md:text-4xl text-text-primary mb-3 leading-tight">
                  Build{' '}
                  <em className="text-gradient-accent not-italic">anything</em>
                  {' '}with a prompt
                </h2>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto">
                  CobasiteAI bisa bikin apa aja — landing page premium, game yang beneran bisa dimainkan,
                  SaaS platform, atau tools yang fungsional. Tinggal deskripsiin.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CAPABILITIES.map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <motion.div
                        key={f.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="p-4 rounded-2xl bg-white border border-surface-border text-left shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-3 ${f.color}`}>
                          <Icon size={16} />
                        </div>
                        <p className="text-sm font-semibold text-text-primary">{f.label}</p>
                        <p className="text-xs text-text-muted mt-1 leading-snug">{f.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-5 md:py-6 flex flex-col gap-4">
              {/* Recent sites grid */}
              {websites.length > 0 && status === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                  {websites.slice(0, 6).map((site, i) => (
                    <motion.div
                      key={site.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="group p-4 rounded-2xl bg-white border border-surface-border hover:border-accent/30 cursor-pointer transition-all hover:shadow-card-hover hover:-translate-y-0.5"
                      onClick={() => handlePreview(site.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent-muted border border-accent/15 flex items-center justify-center flex-shrink-0">
                          <Globe size={14} className="text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                            {site.name}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-snug">
                            {site.prompt}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                        <span className="px-2 py-0.5 rounded-full bg-base-100 border border-surface-border text-text-secondary font-mono text-xs">
                          {site.source_code.length.toLocaleString()} chars
                        </span>
                        <span className="text-accent font-medium">→ Preview</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {status !== 'idle' && (
                <StreamingOutput
                  status={status}
                  streamedCode={streamedCode}
                  currentWebsite={currentWebsite}
                  onPreview={handlePreview}
                  errorMessage={errorMessage}
                  summaryMessage={summaryMessage}
                  summaryStatus={summaryStatus}
                />
              )}
            </div>
          )}
        </main>

        {/* Bottom input area */}
        <div className="border-t border-surface-border bg-white/90 backdrop-blur-md px-3 md:px-6 py-3 md:py-4">
          <div className="max-w-4xl mx-auto">
            <PromptInput onSubmit={handleGenerate} status={status} />
          </div>
        </div>
      </div>
    </div>
  );
}
