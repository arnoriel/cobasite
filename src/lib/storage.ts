import { supabase } from './supabase';
import type { Website } from '../types';

export const storage = {
  /**
   * Ambil semua websites milik user yang sedang login.
   *
   * Double protection:
   * 1. .eq('user_id', user.id) — filter eksplisit di query (frontend)
   * 2. RLS policy di Supabase       — enforce di sisi server (backend)
   *
   * Kalau salah satu gagal, yang lain tetap jaga.
   */
  async getAll(): Promise<Website[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('user_id', user.id)          // ← filter eksplisit, jangan andalkan RLS saja
      .order('created_at', { ascending: false });

    if (error) { console.error('getAll error:', error); return []; }
    return data ?? [];
  },

  /**
   * Ambil satu website by id.
   * Tetap filter by user_id untuk mencegah akses silang antar user.
   */
  async getById(id: string): Promise<Website | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)          // ← pastikan hanya milik user ini
      .single();

    if (error) { console.error('getById error:', error); return null; }
    return data;
  },

  /**
   * Ambil website by page_name — ini public, tidak filter by user_id.
   * Dipakai untuk fitur /page/:slug yang bisa diakses tanpa login.
   */
  async getByPageName(page_name: string): Promise<Website | null> {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('page_name', page_name)
      .single();

    if (error) {
      // PGRST116 = no rows returned (normal "not found")
      // Selain itu = bisa jadi permission error
      if (error.code !== 'PGRST116') {
        console.error('getByPageName unexpected error:', error.code, error.message);
      }
      return null;
    }
    return data;
  },

  /**
   * Simpan website baru.
   * user_id WAJIB disertakan agar RLS INSERT policy lolos.
   */
  async save(website: Website): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('save error: user not logged in');
      return;
    }

    const { error } = await supabase
      .from('websites')
      .upsert(
        { ...website, user_id: user.id },
        { onConflict: 'id' }
      );

    if (error) console.error('save error:', error);
  },

  /**
   * Update partial fields website.
   * Filter by user_id sebagai double protection.
   */
  async update(id: string, data: Partial<Website>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('websites')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id);        // ← jangan bisa update punya orang lain

    if (error) console.error('update error:', error);
  },

  /**
   * Hapus website.
   * Filter by user_id sebagai double protection.
   */
  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);        // ← jangan bisa hapus punya orang lain

    if (error) console.error('delete error:', error);
  },

  generateId(): string {
    return `site_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  },
};