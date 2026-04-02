import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Globe, Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PromptInput from '../components/PromptInput';
import StreamingOutput from '../components/StreamingOutput';
import type { Website, GenerationStatus } from '../types';
import { storage } from '../lib/storage';
import { generateWebsite, extractWebsiteName } from '../lib/ai';

export default function Home() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [streamedCode, setStreamedCode] = useState('');
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
        if (status !== 'streaming') setStatus('streaming');
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
      },
      onError: async (err) => {
        setErrorMessage(err);
        setStatus('error');
        await storage.delete(id);
        await refreshWebsites();
      },
    });
  }, [refreshWebsites]);

  const handlePreview = (id: string) => {
    navigate(`/websites/${id}/preview`);
  };

  const handleDelete = async (id: string) => {
    if (activeId === id) {
      setActiveId(undefined);
      setStatus('idle');
      setStreamedCode('');
      setCurrentWebsite(null);
    }
    await refreshWebsites();
  };

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-surface-border bg-base-50/50">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg bg-base-100 hover:bg-base-200 text-text-muted hover:text-text-primary transition-colors"
            >
              <Menu size={18} />
            </button>

            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #00E5D4)' }}
            >
              <Globe size={15} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-text-primary leading-none">
                CobasiteAI
              </h1>
              <p className="text-xs text-text-muted mt-0.5 hidden sm:block">Agentic Website Builder</p>
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <main className="flex-1 overflow-y-auto bg-grid-pattern">
          {status === 'idle' && websites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 md:px-6 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="max-w-xl w-full"
              >
                {/* Glow orb */}
                <div className="relative mx-auto w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8">
                  <div
                    className="absolute inset-0 rounded-full opacity-30 animate-pulse"
                    style={{ background: 'radial-gradient(circle, #7C5CFC 0%, transparent 70%)' }}
                  />
                  <div
                    className="relative w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #7C5CFC20, #00E5D420)', border: '1px solid #7C5CFC40' }}
                  >
                    <Sparkles size={30} className="text-accent-glow md:hidden" />
                    <Sparkles size={36} className="text-accent-glow hidden md:block" />
                  </div>
                </div>

                <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-3">
                  Describe Your{' '}
                  <span className="text-gradient-accent">Dream Website</span>
                </h2>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6 md:mb-8">
                  CobasiteAI adalah agentic website builder yang mengubah deskripsi teks kamu
                  menjadi website full HTML yang siap pakai — lengkap dengan desain, animasi,
                  dan konten yang compelling.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 md:mb-8">
                  {[
                    { icon: '🎨', label: 'Custom Design', desc: 'Tema, warna & font sesuai keinginan' },
                    { icon: '⚡', label: 'Instant Preview', desc: 'Preview langsung di browser' },
                    { icon: '☁️', label: 'Saved to Cloud', desc: 'Semua website tersimpan di Supabase' },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="p-3 rounded-xl bg-base-100 border border-surface-border text-left"
                    >
                      <span className="text-xl">{f.icon}</span>
                      <p className="text-xs font-semibold text-text-primary mt-1.5">{f.label}</p>
                      <p className="text-xs text-text-muted mt-0.5 leading-snug">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col gap-4">
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
                      className="group p-4 rounded-xl bg-base-50 border border-surface-border hover:border-accent/40 cursor-pointer transition-all hover:shadow-glow-accent"
                      onClick={() => handlePreview(site.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                          <Globe size={14} className="text-accent-glow" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-glow transition-colors">
                            {site.name}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-snug">
                            {site.prompt}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                        <span className="px-1.5 py-0.5 rounded bg-accent-muted text-accent-glow font-mono">
                          {site.source_code.length.toLocaleString()} chars
                        </span>
                        <span>· Tap to preview</span>
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
                />
              )}
            </div>
          )}
        </main>

        {/* Bottom prompt area */}
        <div className="border-t border-surface-border bg-base-50/80 backdrop-blur px-3 md:px-6 py-3 md:py-4">
          <div className="max-w-4xl mx-auto">
            <PromptInput onSubmit={handleGenerate} status={status} />
          </div>
        </div>
      </div>
    </div>
  );
}