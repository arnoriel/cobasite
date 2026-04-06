import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Key, Wand2, ChevronDown } from 'lucide-react';
import type { GenerationStatus } from '../types';
import { ENV } from '../lib/env';

const PROMPT_SUGGESTIONS = [
  'Landing page untuk startup fintech dengan tema gelap elegan, warna biru elektrik & emas, animasi particles di hero, fitur grid bento, dan pricing table',
  'Website restaurant fine dining mewah dengan tema Japandi, warna cream & charcoal, font Cormorant Garamond, hero full-screen, dan menu grid yang elegan',
  'Portfolio fotografer dengan aesthetic film noir hitam putih, galeri masonry, smooth hover, dan kontak form minimalis',
  'Buat game Snake classic tapi versi modern — dark neon aesthetic, dengan high score yang tersimpan, level progression, dan sound effects',
  'Game puzzle sliding tile 4x4 dengan timer, move counter, high score leaderboard di localStorage, tema dark cyberpunk',
  'Quiz game "Tebak Ibukota Negara" — 20 pertanyaan random, timer per soal, skor akhir, dan animasi yang satisfying saat jawaban benar/salah',
  'Buat aplikasi Todo List / Task Manager seperti Notion tapi lebih simple — ada categories, priority level, due date, filter/search, dan dark mode. Data disimpan di localStorage',
  'Platform CRM sederhana untuk freelancer — manage clients, projects, invoice tracker. Ada login simulation, dashboard dengan stats, dan tabel data yang bisa di-CRUD',
  'Kanban board seperti Trello — drag and drop tasks antar kolom (Backlog, In Progress, Done), add/edit/delete cards, localStorage persistence',
  'Buat kalkulator BMI + kalkulator kalori harian dengan hasil yang langsung muncul, history 10 terakhir tersimpan, dan UI yang clean modern',
  'Color palette generator — input hex/RGB, generate complementary/analogous/triadic colors, copy to clipboard, history tersimpan',
];

interface PromptInputProps {
  onSubmit: (prompt: string, apiKey: string) => void;
  status: GenerationStatus;
}

export default function PromptInput({ onSubmit, status }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState(() => ENV.apiKey ?? localStorage.getItem('cobasiteai_api_key') ?? '');
  const [showApiInput] = useState(!ENV.hasEnvKey && !localStorage.getItem('cobasiteai_api_key'));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isGenerating = status === 'thinking' || status === 'streaming';

  useEffect(() => {
    if (apiKey) localStorage.setItem('cobasiteai_api_key', apiKey);
  }, [apiKey]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isGenerating) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    if (!apiKey.trim() && !ENV.hasEnvKey) return;
    onSubmit(prompt.trim(), apiKey.trim());
    setPrompt('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const applySuggestion = (s: string) => {
    setPrompt(s);
    setShowSuggestions(false);
    textareaRef.current?.focus();
    setTimeout(autoResize, 10);
  };

  const canSubmit = prompt.trim() && (apiKey.trim() || ENV.hasEnvKey) && !isGenerating;

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* API Key */}
      <AnimatePresence>
        {showApiInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-surface-border shadow-card">
              <Key size={13} className="text-text-muted flex-shrink-0" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="OpenRouter API Key (sk-or-...)"
                className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none min-w-0"
              />
              {apiKey && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-accent" />
                  <span className="text-xs text-sage-accent font-medium">Saved</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input */}
      <div className={`relative rounded-2xl bg-white border transition-all shadow-card ${
        showSuggestions ? 'border-accent/40 shadow-glow-accent' : 'border-surface-border focus-within:border-accent/40 focus-within:shadow-glow-accent'
      }`}>
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-3.5 md:px-4 pt-3 pb-1.5">
          <div className="flex items-center gap-2">
            <Wand2 size={13} className="text-accent" />
            <span className="text-xs font-semibold text-text-secondary">Describe your website</span>
          </div>
          <button
            onClick={() => setShowSuggestions((s) => !s)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              showSuggestions
                ? 'bg-accent text-white shadow-button'
                : 'bg-base-100 hover:bg-base-200 text-text-secondary border border-surface-border'
            }`}
          >
            <Sparkles size={10} />
            <span className="hidden sm:inline">Ideas</span>
            <ChevronDown size={10} className={`transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); autoResize(); }}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          placeholder="Deskripsikan apa yang mau dibikin — landing page, game, SaaS app, tool, atau apapun..."
          rows={3}
          className="w-full bg-transparent text-text-primary placeholder-text-muted text-sm leading-relaxed px-3.5 md:px-4 py-2 resize-none outline-none disabled:opacity-50"
          style={{ minHeight: 80, maxHeight: 200 }}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3.5 md:px-4 py-2.5 border-t border-surface-border">
          <div className="flex items-center gap-2">
            {prompt.length > 0 && (
              <span className="text-xs text-text-muted font-mono">{prompt.length} chars</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted hidden sm:block">Ctrl+↵</span>
            <motion.button
              whileHover={{ scale: canSubmit ? 1.02 : 1 }}
              whileTap={{ scale: canSubmit ? 0.97 : 1 }}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex items-center gap-2 px-3.5 md:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                canSubmit
                  ? 'bg-accent text-white shadow-button hover:bg-accent-dim'
                  : 'bg-base-100 text-text-muted border border-surface-border cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Generating…</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  Generate
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            className="rounded-2xl bg-white border border-surface-border shadow-card-hover overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-surface-border flex items-center gap-2">
              <Sparkles size={12} className="text-accent" />
              <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Prompt Ideas
              </p>
            </div>
            <div className="flex flex-col divide-y divide-surface-border max-h-64 overflow-y-auto">
              {PROMPT_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => applySuggestion(s)}
                  className="w-full text-left px-4 py-3 text-xs text-text-secondary hover:text-text-primary hover:bg-base-50 transition-colors leading-relaxed group"
                >
                  <span className="text-accent mr-2 font-bold group-hover:mr-3 transition-all">→</span>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
