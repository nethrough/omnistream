import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Tv2, Film } from 'lucide-react';

export default function MovieCard({ movie }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isSeries = movie.type === 'series';

  return (
    <Link
      to={`/watch/${movie.imdbId}`}
      state={{ type: movie.type, title: movie.title, poster: movie.poster, year: movie.year }}
      style={{ display: 'block', height: '100%', textDecoration: 'none' }}
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          position: 'relative',
          borderRadius: '14px',
          overflow: 'hidden',
          border: `1px solid ${hovered ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.07)'}`,
          boxShadow: hovered ? '0 12px 48px rgba(124,58,237,0.2)' : 'none',
          cursor: 'pointer',
          background: '#0d0d1c',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'border-color 0.25s, box-shadow 0.25s',
        }}
      >
        {/* Poster */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', background: '#111124', overflow: 'hidden' }}>
          {movie.poster && !imgError ? (
            <img
              src={movie.poster}
              alt={movie.title}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: '10px', color: 'rgba(255,255,255,0.15)',
            }}>
              {isSeries ? <Tv2 size={36} /> : <Film size={36} />}
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>No Poster</span>
            </div>
          )}

          {/* Type badge */}
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            padding: '3px 10px', borderRadius: '100px', fontSize: '0.65rem',
            fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            backdropFilter: 'blur(12px)',
            background: isSeries ? 'rgba(6,182,212,0.15)' : 'rgba(124,58,237,0.15)',
            border: `1px solid ${isSeries ? 'rgba(6,182,212,0.4)' : 'rgba(124,58,237,0.4)'}`,
            color: isSeries ? '#67e8f9' : '#c4b5fd',
          }}>
            {isSeries ? 'Series' : 'Film'}
          </div>

          {/* Play overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(7,7,14,0.85) 0%, transparent 50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(124,58,237,0.85)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(124,58,237,0.6)',
            }}>
              <Play size={20} fill="white" color="white" style={{ marginLeft: '3px' }} />
            </div>
          </motion.div>
        </div>

        {/* Info */}
        <div style={{
          padding: '12px 14px 14px',
          background: 'linear-gradient(to bottom, rgba(13,13,28,0.9), #0d0d1c)',
          flex: 1, display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          <h3 style={{
            fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.35,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {movie.title}
          </h3>
          {movie.year && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {movie.year}
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
