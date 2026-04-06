import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ── Dark mode: sync dengan sistem OS/browser ──────────────────────────
// Ini yang fix masalah: kita set class "dark" di <html> sesuai preferensi sistem,
// bukan bergantung pada browser default styling yang inconsistent.
function applyTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', prefersDark);
}

applyTheme();

// Update otomatis kalau user ganti tema sistem saat app terbuka
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);