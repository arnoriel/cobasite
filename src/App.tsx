import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PreviewPage from './pages/PreviewPage';
import ViewPage from './pages/view';
import PageResolver from './pages/PageResolver';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/websites/:id/preview" element={<PreviewPage />} />
        <Route path="/websites/:id/:page_name" element={<ViewPage />} />

        {/* Shareable route — lookup by page_name, redirect to canonical view */}
        <Route path="/page/:page_name" element={<PageResolver />} />
      </Routes>
    </BrowserRouter>
  );
}