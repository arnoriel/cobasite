import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Sparkles, Loader2, AlertTriangle, Globe, Layers, Zap } from 'lucide-react';
import { signInWithGoogle } from '../lib/supabase';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal. Coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-base">
      {/* Left: Decorative panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] bg-white border-r border-surface-border p-12 relative overflow-hidden">
        {/* Background dots */}
        <div className="absolute inset-0 bg-dot-pattern opacity-60 pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-button"
            style={{ background: 'linear-gradient(135deg, #2563EB, #10A37F)' }}
          >
            <Wand2 size={18} className="text-white" />
          </div>
          <div>
            <span className="font-display text-xl font-bold text-text-primary">CobasiteAI</span>
            <p className="text-xs text-text-muted">Agentic Website Builder</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="font-display text-4xl text-text-primary leading-tight mb-4">
            Build websites{' '}
            <em className="text-gradient-accent not-italic">10x faster</em>
            {' '}with AI
          </h2>
          <p className="text-text-secondary text-base leading-relaxed mb-8">
            Dari landing page premium, game interaktif, sampai SaaS platform — tinggal deskripsiin dan AI langsung bikinkan.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: Globe, label: 'Landing Pages & Portfolios', color: 'text-blue-600 bg-blue-50 border-blue-100' },
              { icon: Layers, label: 'SaaS Apps & Dashboards', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { icon: Zap, label: 'Games & Interactive Tools', color: 'text-purple-600 bg-purple-50 border-purple-100' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-base-50 border border-surface-border">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${f.color}`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-sm font-semibold text-text-primary">{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-text-muted relative z-10">
          © 2025 CobasiteAI. Powered by AI.
        </p>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563EB, #10A37F)' }}
          >
            <Wand2 size={16} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-text-primary">CobasiteAI</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-display text-3xl text-text-primary mb-2">Welcome back</h1>
            <p className="text-text-secondary text-sm">
              Login untuk mulai membuat website dengan AI
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-card">
            {/* Features preview */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { icon: '🎨', label: 'AI Builder' },
                { icon: '☁️', label: 'Cloud Save' },
                { icon: '🚀', label: 'Deploy' },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-base-50 border border-surface-border"
                >
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-xs text-text-secondary font-semibold">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-base-50 text-text-primary font-semibold text-sm border border-surface-border transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-card hover:shadow-card-hover"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-text-muted" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {loading ? 'Menghubungkan…' : 'Lanjutkan dengan Google'}
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100"
              >
                <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-500">{error}</p>
              </motion.div>
            )}

            <p className="text-center text-xs text-text-muted mt-4">
              Dengan login, kamu setuju dengan{' '}
              <span className="text-accent cursor-pointer hover:underline font-medium">
                Terms of Service
              </span>{' '}
              kami.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-text-muted">
            <Sparkles size={11} className="text-accent" />
            <span>Powered by Supabase Auth + Google OAuth</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
