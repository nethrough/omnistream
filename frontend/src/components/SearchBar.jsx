import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        maxWidth: '640px',
        margin: '0 auto',
        padding: '10px 10px 10px 20px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(124,58,237,0.55)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '100px',
        boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12), 0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.2)',
        transition: 'border 0.2s, box-shadow 0.2s',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Search size={18} color={focused ? '#a78bfa' : '#52525b'} style={{ flexShrink: 0, transition: 'color 0.2s' }} />

      <input
        type="text"
        placeholder="Search movies & TV series..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={isLoading}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text)',
          fontSize: '0.98rem',
          letterSpacing: '0.01em',
        }}
      />

      <motion.button
        type="submit"
        disabled={isLoading || !query.trim()}
        whileTap={{ scale: 0.96 }}
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          background: isLoading || !query.trim()
            ? 'rgba(124,58,237,0.35)'
            : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          color: 'white',
          border: 'none',
          padding: '9px 22px',
          borderRadius: '100px',
          cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          boxShadow: query.trim() && !isLoading ? '0 4px 16px rgba(124,58,237,0.4)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {isLoading ? (
          <>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            Searching
          </>
        ) : 'Search'}
      </motion.button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.form>
  );
}
