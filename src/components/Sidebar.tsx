import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Trash2,
  Eye,
  Calendar,
  PanelLeftClose,
  PanelLeft,
  X,
  Layers,
} from 'lucide-react';
import type { Website } from '../types';
import { storage } from '../lib/storage';
import UserMenu from './UserMenu';

interface SidebarProps {
  websites: Website[];
  activeId?: string;
  onSelect: (id: string) => void;
  onPreview: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  websites,
  activeId,
  onSelect,
  onPreview,
  onDelete,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      await storage.delete(id);
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 2500);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-surface-border">
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-accent-muted border border-accent/20 flex items-center justify-center">
                <Layers size={13} className="text-accent" />
              </div>
              <div>
                <span className="font-body font-semibold text-sm text-text-primary leading-none block">
                  My Projects
                </span>
                <span className="text-xs text-text-muted mt-0.5 block">{websites.length} websites</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isMobile ? (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-base-100 transition-colors ml-auto"
          >
            <X size={16} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-base-100 transition-colors ml-auto"
          >
            {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {websites.length === 0 ? (
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 px-4 py-12 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-base-100 border border-surface-border flex items-center justify-center">
                  <Globe size={20} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm font-semibold">No websites yet</p>
                  <p className="text-text-muted text-xs mt-1 leading-relaxed">Describe your idea and let AI build it</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col gap-1 px-2">
            {websites.map((site, i) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onMouseEnter={() => setHoverId(site.id)}
                onMouseLeave={() => setHoverId(null)}
                className={`relative group rounded-xl cursor-pointer transition-all duration-200 ${
                  activeId === site.id
                    ? 'bg-accent-muted border border-accent/20 shadow-glow-accent'
                    : 'hover:bg-surface-hover border border-transparent hover:border-surface-border'
                }`}
              >
                {(collapsed && !isMobile) ? (
                  <button
                    onClick={() => onSelect(site.id)}
                    className="w-full flex items-center justify-center p-3"
                    title={site.name}
                  >
                    <Globe
                      size={16}
                      className={activeId === site.id ? 'text-accent' : 'text-text-muted'}
                    />
                  </button>
                ) : (
                  <div className="p-2.5">
                    <button
                      onClick={() => { onSelect(site.id); if (isMobile) onMobileClose?.(); }}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            activeId === site.id ? 'bg-accent/15' : 'bg-base-100 border border-surface-border'
                          }`}
                        >
                          <Globe
                            size={12}
                            className={activeId === site.id ? 'text-accent' : 'text-text-muted'}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate leading-tight ${
                            activeId === site.id ? 'text-accent-dim' : 'text-text-primary'
                          }`}>
                            {site.name}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar size={9} className="text-text-muted" />
                            <span className="text-xs text-text-muted truncate">
                              {formatDate(site.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {(hoverId === site.id || activeId === site.id || isMobile) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-1.5 mt-2 pt-2 border-t border-surface-border overflow-hidden"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreview(site.id);
                              if (isMobile) onMobileClose?.();
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold transition-all hover:bg-accent-dim shadow-button"
                          >
                            <Eye size={11} />
                            Preview
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(site.id); }}
                            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              confirmDelete === site.id
                                ? 'bg-red-50 text-red-500 border border-red-200'
                                : 'bg-base-100 hover:bg-red-50 text-text-muted hover:text-red-500 border border-surface-border'
                            }`}
                          >
                            <Trash2 size={11} />
                            {confirmDelete === site.id ? 'Sure?' : ''}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* User menu */}
      <div className={`border-t border-surface-border ${(collapsed && !isMobile) ? 'p-2' : 'p-3'}`}>
        <UserMenu collapsed={collapsed && !isMobile} />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 56 : 272 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex relative flex-col h-full bg-white border-r border-surface-border overflow-hidden flex-shrink-0"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-surface-border flex flex-col md:hidden shadow-card-lifted"
            >
              <SidebarContent isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
