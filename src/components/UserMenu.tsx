import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronUp, User, Mail, Shield } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { signOut } from '../lib/supabase';

interface UserMenuProps {
  collapsed?: boolean;
}

export default function UserMenu({ collapsed = false }: UserMenuProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  };

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'User';
  const email = user.email ?? '';
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const provider = user.app_metadata?.provider as string | undefined;

  // ── Collapsed mode: cuma avatar kecil ──────────────────────
  if (collapsed) {
    return (
      <div ref={ref} className="relative flex items-center justify-center">
        <button
          onClick={() => setOpen((o) => !o)}
          title={name}
          className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-surface-border hover:ring-accent/50 transition-all"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-accent-muted flex items-center justify-center">
              <span className="text-[10px] font-bold text-accent-glow">{initials}</span>
            </div>
          )}
        </button>

        {/* Mini popup untuk collapsed mode */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-0 left-full ml-2 w-52 bg-base-50 border border-surface-border rounded-xl shadow-card-hover overflow-hidden z-50"
            >
              <ProfileCard
                name={name}
                email={email}
                initials={initials}
                avatarUrl={avatarUrl}
                provider={provider}
              />
              <LogoutButton loggingOut={loggingOut} onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Expanded mode: row clickable ────────────────────────────
  return (
    <div ref={ref} className="relative">
      {/* Trigger row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all group ${
          open ? 'bg-surface-hover' : 'hover:bg-surface-hover'
        }`}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-surface-border group-hover:ring-accent/40 transition-all">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-accent-muted flex items-center justify-center">
              <span className="text-[10px] font-bold text-accent-glow">{initials}</span>
            </div>
          )}
        </div>

        {/* Name & email */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-text-primary truncate leading-tight">{name}</p>
          <p className="text-[10px] text-text-muted truncate">{email}</p>
        </div>

        <ChevronUp
          size={12}
          className={`text-text-muted transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-base-50 border border-surface-border rounded-xl shadow-card-hover overflow-hidden z-50"
          >
            <ProfileCard
              name={name}
              email={email}
              initials={initials}
              avatarUrl={avatarUrl}
              provider={provider}
            />
            <LogoutButton loggingOut={loggingOut} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function Avatar({
  avatarUrl,
  initials,
  name,
  size = 'md',
}: {
  avatarUrl?: string;
  initials: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = size === 'lg' ? 'w-12 h-12' : size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-surface-border`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-accent-muted flex items-center justify-center">
          <span className="text-xs font-bold text-accent-glow">{initials}</span>
        </div>
      )}
    </div>
  );
}

function ProfileCard({
  name,
  email,
  initials,
  avatarUrl,
  provider,
}: {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  provider?: string;
}) {
  return (
    <div className="p-4 border-b border-surface-border">
      {/* Avatar besar + info */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar avatarUrl={avatarUrl} initials={initials} name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary truncate leading-tight">{name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Mail size={9} className="text-text-muted flex-shrink-0" />
            <p className="text-[10px] text-text-muted truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Provider badge */}
      {provider && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-base-100 border border-surface-border w-fit">
          {provider === 'google' ? (
            <svg width="10" height="10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          ) : (
            <Shield size={10} className="text-text-muted" />
          )}
          <span className="text-[10px] text-text-muted font-medium capitalize">
            Login via {provider ?? 'email'}
          </span>
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-1.5 mt-2.5">
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-medium">Online</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-base-100 border border-surface-border">
          <User size={9} className="text-text-muted" />
          <span className="text-[10px] text-text-muted font-medium">Free Plan</span>
        </div>
      </div>
    </div>
  );
}

function LogoutButton({
  loggingOut,
  onLogout,
}: {
  loggingOut: boolean;
  onLogout: () => void;
}) {
  return (
    <button
      onClick={onLogout}
      disabled={loggingOut}
      className="w-full flex items-center gap-2.5 px-4 py-3 text-red-400 hover:bg-red-500/8 transition-colors disabled:opacity-50 group"
    >
      <div className="w-6 h-6 rounded-md bg-red-500/10 group-hover:bg-red-500/15 flex items-center justify-center transition-colors flex-shrink-0">
        <LogOut size={12} className="text-red-400" />
      </div>
      <span className="text-xs font-semibold">
        {loggingOut ? 'Keluar…' : 'Keluar dari akun'}
      </span>
    </button>
  );
}