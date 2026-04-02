import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { storage } from '../lib/storage';
import type { Website } from '../types';

/**
 * PageResolver — handles the shareable /page/:page_name route.
 *
 * Renders the page DIRECTLY (full screen, no CobasiteAI banner) so the URL
 * stays at {origin}/page/{page_name}. The page title is taken from the
 * website's source code <title> tag.
 */
export default function PageResolver() {
  const { page_name } = useParams<{ page_name: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [website, setWebsite] = useState<Website | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Lookup by page_name
  useEffect(() => {
    if (!page_name) { setNotFound(true); return; }
    storage.getByPageName(page_name).then((site) => {
      if (!site) setNotFound(true);
      else setWebsite(site);
    });
  }, [page_name]);

  // ── Set srcdoc langsung ke iframe — tidak pakai doc.write sama sekali.
  // Menghindari "Identifier already declared" SyntaxError dari double-write
  // yang dipicu React Strict Mode (effects jalan 2x di development).
  useEffect(() => {
    if (!website?.source_code || !iframeRef.current) return;
    iframeRef.current.srcdoc = website.source_code;

    // Sync document title dari <title> tag source HTML
    const titleMatch = website.source_code.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch?.[1]) {
      document.title = titleMatch[1].trim();
    } else {
      document.title = website.name ?? page_name ?? 'Page';
    }
  }, [website?.source_code, website?.name, page_name]);

  const handleIframeLoad = () => setIsLoading(false);

  // ── Not Found ──────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Page Not Found</h2>
        <p className="text-text-muted mb-6 max-w-sm text-sm">
          No page named{' '}
          <code className="text-accent-glow font-mono">/{page_name}</code>{' '}
          was found. Make sure the page has been deployed.
        </p>
      </div>
    );
  }

  // ── Loading / resolving ────────────────────────────────────
  if (!website) {
    return (
      <div className="flex items-center justify-center h-screen bg-base">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-xs text-zinc-400">Loading page…</p>
        </div>
      </div>
    );
  }

  // ── Full-screen render, no CobasiteAI banner ────────────────
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-xs text-zinc-400">Loading page…</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        onLoad={handleIframeLoad}
        className="w-full h-full border-0 block"
        title={website.name}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}