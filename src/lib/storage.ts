import { supabase } from './supabase';
import type { Website } from '../types';

export const storage = {
  async getAll(): Promise<Website[]> {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('getAll error:', error); return []; }
    return data ?? [];
  },

  async getById(id: string): Promise<Website | null> {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .single();
    if (error) { console.error('getById error:', error); return null; }
    return data;
  },

  async getByPageName(page_name: string): Promise<Website | null> {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('page_name', page_name)
      .single();
    if (error) { console.error('getByPageName error:', error); return null; }
    return data;
  },

  async save(website: Website): Promise<void> {
    const { error } = await supabase
      .from('websites')
      .upsert(website, { onConflict: 'id' });
    if (error) console.error('save error:', error);
  },

  async update(id: string, data: Partial<Website>): Promise<void> {
    const { error } = await supabase
      .from('websites')
      .update(data)
      .eq('id', id);
    if (error) console.error('update error:', error);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', id);
    if (error) console.error('delete error:', error);
  },

  generateId(): string {
    return `site_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  },
};