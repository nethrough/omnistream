import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ResultsGrid from '../components/ResultsGrid';
import ContinueWatching from '../components/ContinueWatching';
import { searchImdb } from '../services/api';

/* ── Wicky's banner of questionable decisions ── */
function WickyBanner() {
  const [brainPopped, setBrainPopped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{
        marginTop: '18px',
        borderRadius: '14px',
        border: '1px dashed rgba(167,139,250,0.3)',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.04) 100%)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      {/* Left: the warning label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Spinning caution emoji */}
        <motion.span
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3 }}
          style={{ fontSize: '1.2rem', display: 'inline-block' }}
        >
          ⚠️
        </motion.span>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--accent-light)', opacity: 0.7,
            }}>
              Open source by
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-light)' }}>
              Wicky
            </span>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              patches welcome,
            </span>
            {/* The interactive brain */}
            <motion.button
              onClick={() => setBrainPopped(p => !p)}
              whileTap={{ scale: 0.8 }}
              title="click me"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1rem', padding: 0, display: 'inline-flex', lineHeight: 1,
              }}
            >
              <motion.span
                animate={brainPopped
                  ? { rotate: [0, 20, -20, 20, 0], scale: [1, 1.4, 0.8, 1.2, 1] }
                  : { rotate: [0, 5, -5, 0] }
                }
                transition={{ duration: brainPopped ? 0.5 : 2.5, repeat: brainPopped ? 0 : Infinity, repeatDelay: 2 }}
                style={{ display: 'inline-block' }}
              >
                {brainPopped ? '💀' : '🧠'}
              </motion.span>
            </motion.button>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {brainPopped ? 'sanity has left the chat.' : 'sanity not included.'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ fontSize: '0.75rem' }}
            >
              ☕
            </motion.span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
              built at 2am with caffeine and questionable life choices
            </span>
          </div>
        </div>
      </div>

      {/* Right: portfolio link */}
      <motion.a
        href="https://wickydev.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 18px', borderRadius: '100px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.15))',
          border: '1px solid rgba(167,139,250,0.3)',
          color: 'var(--text)',
          textDecoration: 'none',
          fontSize: '0.82rem', fontWeight: 700,
          boxShadow: '0 0 20px rgba(124,58,237,0.12)',
          transition: 'box-shadow 0.2s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 28px rgba(124,58,237,0.35)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.12)')}
      >
        {/* Animated sparkle */}
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'inline-block', fontSize: '0.9rem' }}
        >
          ✦
        </motion.span>
        <span className="gradient-text" style={{ fontWeight: 800 }}>wickydev.vercel.app</span>
        <ExternalLink size={12} style={{ opacity: 0.6 }} />
      </motion.a>
    </motion.div>
  );
}

export default function Home() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef(null);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await searchImdb(query);
      if (response.success) {
        setResults(response.data);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      } else {
        setError(response.error);
        setResults([]);
      }
    } catch {
      setError('Could not reach the server.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>

      {/* ── Wicky banner ── */}
      <WickyBanner />

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', padding: '80px 0 52px' }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 14px', borderRadius: '100px', marginBottom: '24px',
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.3)',
            fontSize: '0.75rem', fontWeight: 600,
            color: 'var(--accent-light)', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          <Sparkles size={12} />
          Stream anything, instantly
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: '20px',
          }}
        >
          Watch any{' '}
          <span className="gradient-text">movie</span>
          <br />
          or{' '}
          <span className="gradient-text">TV series.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '400px', margin: '0 auto 40px' }}
        >
          Search millions of titles and start streaming in one click.
        </motion.p>

        {/* Search */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </motion.div>

      {/* ── Continue Watching ── */}
      <ContinueWatching />

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: 'center', color: '#f87171',
              fontSize: '0.9rem', marginTop: '16px',
              padding: '12px 20px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px', maxWidth: '480px', margin: '16px auto 0',
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence>
        {hasSearched && !isLoading && results.length === 0 && !error && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px', fontSize: '0.95rem' }}
          >
            No results found.
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={resultsRef}>
        <ResultsGrid results={results} isLoading={isLoading} />
      </div>

    </div>
  );
}
