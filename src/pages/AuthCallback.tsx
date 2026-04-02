import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * AuthCallback — route: /auth/callback
 *
 * Supabase redirect user ke sini setelah Google OAuth selesai.
 * Supabase JS SDK otomatis parse hash/code dari URL dan set session.
 * Kita tinggal tunggu session, lalu redirect ke Home.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase akan otomatis parse URL dan store session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/', { replace: true });
      } else {
        // Kalau gagal (misalnya URL dimanipulasi), balik ke login
        navigate('/login', { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-base">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-sm text-text-muted">Memverifikasi akun…</p>
      </div>
    </div>
  );
}