import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, AlertTriangle, Tv2, Film, SkipForward, X } from 'lucide-react';
import { getTvInfo } from '../services/api';
import { saveToHistory } from '../services/history';

/* ── Season tabs ── */
function SeasonTabs({ seasons, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', flexShrink: 0 }}>
      {seasons.map((s) => (
        <button
          key={s.seasonNumber}
          className={`pill-btn${selected === s.seasonNumber ? ' active' : ''}`}
          onClick={() => onSelect(s.seasonNumber)}
          style={{ padding: '7px 16px', whiteSpace: 'nowrap' }}
        >
          Season {s.seasonNumber}
        </button>
      ))}
    </div>
  );
}

/* ── Episode grid ── */
function EpisodeGrid({ count, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
      {Array.from({ length: count }, (_, i) => i + 1).map((ep) => (
        <button
          key={ep}
          className={`pill-btn${selected === ep ? ' active' : ''}`}
          onClick={() => onSelect(ep)}
          style={{ width: '42px', height: '38px', fontSize: '0.8rem' }}
        >
          {ep}
        </button>
      ))}
    </div>
  );
}

/* ── Fallback manual inputs ── */
function ManualSelector({ season, episode, onSeasonChange, onEpisodeChange }) {
  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      {[
        { label: 'Season', value: season, onChange: onSeasonChange },
        { label: 'Episode', value: episode, onChange: onEpisodeChange },
      ].map(({ label, value, onChange }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
          <input
            type="number" min="1" value={value}
            onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
            style={{
              width: '68px', textAlign: 'center',
              background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
              borderRadius: '8px', color: 'white', padding: '8px', outline: 'none',
              fontFamily: 'inherit', fontSize: '0.95rem',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Countdown ring SVG ── */
function CountdownRing({ seconds, total = 5 }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const progress = (seconds / total) * circ;
  return (
    <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
      <circle
        cx="26" cy="26" r={r} fill="none"
        stroke="#a78bfa" strokeWidth="3"
        strokeDasharray={`${progress} ${circ}`}
        style={{ transition: 'stroke-dasharray 1s linear' }}
      />
      <text
        x="26" y="26"
        textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize="13" fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: '26px 26px' }}
      >
        {seconds}
      </text>
    </svg>
  );
}

/* ══════════════ Main component ══════════════ */
export default function Watch() {
  const { imdbId } = useParams();
  const location = useLocation();
  const type = location.state?.type || 'movie';
  const title = location.state?.title;
  const year = location.state?.year;
  const isSeries = type === 'series';

  // Restore from history if navigated via Continue Watching
  const [season, setSeason] = useState(location.state?.season || 1);
  const [episode, setEpisode] = useState(location.state?.episode || 1);
  const [tvInfo, setTvInfo] = useState(null);
  const [tvLoading, setTvLoading] = useState(false);
  const [tvError, setTvError] = useState(null);

  // Auto-play next episode state
  const [nextEpOverlay, setNextEpOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (!isSeries) return;
    setTvLoading(true);
    setTvError(null);
    getTvInfo(imdbId)
      .then((res) => {
        if (res.success && res.data?.seasons?.length > 0) {
          setTvInfo(res.data);
        } else {
          setTvError(res.error || 'Season data unavailable');
        }
      })
      .catch(() => setTvError('Could not load episode data'))
      .finally(() => setTvLoading(false));
  }, [imdbId, isSeries]);

  // Save progress to history (debounced so rapid ep changes don't spam storage)
  useEffect(() => {
    const t = setTimeout(() => {
      saveToHistory({ imdbId, title, poster: location.state?.poster, year, type, season, episode });
    }, 1200);
    return () => clearTimeout(t);
  }, [imdbId, season, episode]);

  // Hide overlay whenever the user manually changes episode
  useEffect(() => {
    setNextEpOverlay(false);
    setCountdown(5);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, [season, episode]);

  const getNextEpisode = useCallback(() => {
    if (!tvInfo) return null;
    const curSeason = tvInfo.seasons.find((s) => s.seasonNumber === season);
    if (episode < (curSeason?.episodeCount ?? 0)) {
      return { season, episode: episode + 1 };
    }
    const nextSeason = tvInfo.seasons.find((s) => s.seasonNumber === season + 1);
    if (nextSeason) return { season: season + 1, episode: 1 };
    return null;
  }, [tvInfo, season, episode]);

  const playNext = useCallback(() => {
    const next = getNextEpisode();
    if (!next) return;
    setSeason(next.season);
    setEpisode(next.episode);
    setNextEpOverlay(false);
    setCountdown(5);
  }, [getNextEpisode]);

  const dismissOverlay = () => {
    setNextEpOverlay(false);
    setCountdown(5);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const showNextEpOverlay = useCallback(() => {
    if (!isSeries || !getNextEpisode()) return;
    setNextEpOverlay(true);
    setCountdown(5);
  }, [isSeries, getNextEpisode]);

  // Countdown tick
  useEffect(() => {
    if (!nextEpOverlay) return;
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [nextEpOverlay]);

  // Auto-play when countdown hits 0
  useEffect(() => {
    if (nextEpOverlay && countdown === 0) playNext();
  }, [countdown, nextEpOverlay, playNext]);

  // Listen for postMessage events from the embedded player (fires if the player supports it)
  useEffect(() => {
    const handler = (e) => {
      if (!isSeries) return;
      const d = e.data;
      const isEnded =
        d === 'ended' ||
        d?.event === 'ended' ||
        d?.type === 'ended' ||
        d?.status === 'ended' ||
        d?.action === 'ended' ||
        d?.state === 'ended';
      if (isEnded) showNextEpOverlay();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isSeries, showNextEpOverlay]);

  const currentSeason = tvInfo?.seasons?.find((s) => s.seasonNumber === season);
  const episodeCount = currentSeason?.episodeCount ?? 0;
  const nextEp = getNextEpisode();

  const iframeSrc = isSeries
    ? `https://streamimdb.ru/embed/tv/${imdbId}/${season}/${episode}`
    : `https://streamimdb.ru/embed/movie/${imdbId}`;

  const handleSeasonChange = (num) => {
    setSeason(num);
    setEpisode(1);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 60px' }}>

      {/* ── Back ── */}
      <Link
        to="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500,
          marginBottom: '28px', transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

        {/* ── Title row ── */}
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {title}
            </h1>
            {year && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{year}</span>}
            <span style={{
              padding: '3px 12px', borderRadius: '100px', fontSize: '0.68rem',
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              background: isSeries ? 'rgba(6,182,212,0.12)' : 'rgba(124,58,237,0.12)',
              border: `1px solid ${isSeries ? 'rgba(6,182,212,0.35)' : 'rgba(124,58,237,0.35)'}`,
              color: isSeries ? '#67e8f9' : '#c4b5fd',
              display: 'inline-flex', alignItems: 'center', gap: '5px',
            }}>
              {isSeries ? <Tv2 size={11} /> : <Film size={11} />}
              {isSeries ? 'TV Series' : 'Film'}
            </span>
          </div>
        )}

        {/* ── Player ── */}
        <div style={{
          position: 'relative', width: '100%', aspectRatio: '16/9',
          borderRadius: '16px', overflow: 'hidden', background: '#000',
          boxShadow: '0 16px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)',
        }}>
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            width="100%" height="100%"
            frameBorder="0" allowFullScreen
            allow="autoplay; encrypted-media; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            title="Player"
            style={{ border: 'none', display: 'block' }}
          />

          {/* ── Next episode overlay ── */}
          <AnimatePresence>
            {nextEpOverlay && nextEp && (
              <motion.div
                key="next-ep"
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: 'absolute', bottom: '20px', right: '20px',
                  background: 'rgba(10,10,20,0.92)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(167,139,250,0.25)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  minWidth: '260px',
                  zIndex: 10,
                }}
              >
                <CountdownRing seconds={countdown} />

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Up Next
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)' }}>
                    S{nextEp.season} · Episode {nextEp.episode}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={playNext}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                      color: 'white', border: 'none', borderRadius: '8px',
                      padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: '0 4px 14px rgba(124,58,237,0.45)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <SkipForward size={13} /> Play Now
                  </button>
                  <button
                    onClick={dismissOverlay}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                      padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <X size={11} /> Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Now playing bar ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '18px', flexWrap: 'wrap', gap: '10px',
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dim)' }}>
            {isSeries ? `Season ${season} · Episode ${episode}` : 'Now Playing'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Manual "next episode" trigger when tvInfo is loaded */}
            {isSeries && nextEp && !nextEpOverlay && (
              <button
                onClick={showNextEpOverlay}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(124,58,237,0.1)', color: 'var(--accent-light)',
                  border: '1px solid rgba(124,58,237,0.3)', borderRadius: '100px',
                  padding: '5px 14px', fontSize: '0.76rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
              >
                <SkipForward size={13} /> Next Episode
              </button>
            )}
            <span style={{
              padding: '5px 14px', borderRadius: '100px', fontSize: '0.72rem',
              fontWeight: 700, letterSpacing: '0.08em',
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
              color: 'var(--accent-light)',
            }}>
              NATIVE PLAYER
            </span>
          </div>
        </div>

        {/* ── Series episode selector (below player) ── */}
        <AnimatePresence>
          {isSeries && (
            <motion.div
              key="ep-selector"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass"
              style={{ padding: '20px 24px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {tvLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Loading episode data…
                </div>
              )}

              {!tvLoading && tvError && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fb923c', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <AlertTriangle size={14} /> {tvError} — using manual input
                  </div>
                  <ManualSelector
                    season={season} episode={episode}
                    onSeasonChange={setSeason} onEpisodeChange={setEpisode}
                  />
                </>
              )}

              {!tvLoading && tvInfo && (
                <>
                  <SeasonTabs seasons={tvInfo.seasons} selected={season} onSelect={handleSeasonChange} />
                  {episodeCount > 0 && (
                    <EpisodeGrid count={episodeCount} selected={episode} onSelect={setEpisode} />
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
