import React from 'react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import LoadingSkeleton from './LoadingSkeleton';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

const GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '20px',
  paddingTop: '32px',
};

export default function ResultsGrid({ results, isLoading }) {
  if (isLoading) {
    return (
      <div style={GRID}>
        {Array.from({ length: 10 }).map((_, i) => <LoadingSkeleton key={i} />)}
      </div>
    );
  }

  if (!results || results.length === 0) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={GRID}>
      {results.map((movie) => (
        <motion.div key={movie.imdbId} variants={item} style={{ height: '100%' }}>
          <MovieCard movie={movie} />
        </motion.div>
      ))}
    </motion.div>
  );
}
