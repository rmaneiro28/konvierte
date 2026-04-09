import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LazyMotion, domAnimation } from 'framer-motion';

// Pages
import LandingPage from './pages/LandingPage';
import ApiTestPage from './pages/ApiTestPage';
import NotFoundPage from './pages/NotFoundPage';


function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('konvierte_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch (e) { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('konvierte_theme', theme);
  }, [theme]);

  return (
    <LazyMotion features={domAnimation}>
      <Router>
        {/* Global Notifications */}
        <Toaster
          position="top-right"
          expand={false}
          richColors
          theme={theme}
          toastOptions={{
            style: {
              background: 'var(--surface-color)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '12px',
              padding: '12px',
              width: 'auto',
              minWidth: '200px',
              maxWidth: '300px',
            }
          }}
        />

        <Routes>
          <Route path="/" element={<LandingPage theme={theme} setTheme={setTheme} />} />
          <Route path="/docs" element={<ApiTestPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

      </Router>
    </LazyMotion>
  );
}

export default App;
