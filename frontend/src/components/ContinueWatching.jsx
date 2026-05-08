import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, X, Tv2, Film, History } from 'lucide-react';
import { getHistory, removeFromHistory } from '../services/history';

function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function HistoryCard({ item, onPlay, onRemove }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isSeries = item.type === 'series';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.18 } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onPlay(item)}
      style={{
        flexShrink: 0,
        width: '130px',
        cursor: 'pointer',
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hovered ? '0 8px 32px rgba(124,58,237,0.22)' : 'none',
        background: '#0d0d1c',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        position: 'relative',
      }}
    >
      {/* Poster */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', background: '#111124' }}>
        {item.poster && !imgError ? (
          <img
            src={item.poster}
            alt={item.title}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: 'rgba(255,255,255,0.12)',
          }}>
            {isSeries ? <Tv2 size={28} /> : <Film size={28} />}
          </div>
        )}

        {/* Play overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(7,7,14,0.9) 0%, rgba(0,0,0,0.3) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(124,58,237,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(124,58,237,0.6)',
              }}>
                <Play size={16} fill="white" color="white" style={{ marginLeft: '2px' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress badge */}
        {isSeries && (
          <div style={{
            position: 'absolute', bottom: '7px', left: '7px',
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            padding: '2px 7px', borderRadius: '6px',
            fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa',
            border: '1px solid rgba(167,139,250,0.2)',
          }}>
            S{item.season}·E{item.episode}
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={(e) => onRemove(item.imdbId, e)}
          style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '22px', height: '22px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s, background 0.15s',
            padding: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.7)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          <X size={11} />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '9px 10px 10px' }}>
        <div style={{
          fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: '4px',
        }}>
          {item.title || 'Unknown'}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          {timeAgo(item.watchedAt)}
        </div>
      </div>
    </motion.div>
  );
}

export default function ContinueWatching({ onHistoryChange }) {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleRemove = (imdbId, e) => {
    e.stopPropagation();
    e.preventDefault();
    removeFromHistory(imdbId);
    setHistory((prev) => prev.filter((h) => h.imdbId !== imdbId));
  };

  const handlePlay = (item) => {
    navigate(`/watch/${item.imdbId}`, {
      state: {
        type: item.type,
        title: item.title,
        poster: item.poster,
        year: item.year,
        season: item.season,
        episode: item.episode,
      },
    });
  };

  if (!history.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ marginBottom: '48px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <History size={14} style={{ color: 'var(--text-muted)' }} />
        <span style={{
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
        }}>
          Continue Watching
        </span>
      </div>

      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
        <AnimatePresence mode="popLayout">
          {history.map((item) => (
            <HistoryCard
              key={item.imdbId}
              item={item}
              onPlay={handlePlay}
              onRemove={handleRemove}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
