import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div style={{
      borderRadius: '14px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
      background: '#0d0d1c',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div className="skeleton" style={{ width: '100%', aspectRatio: '2/3', borderRadius: 0 }} />
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton" style={{ height: '14px', width: '75%' }} />
        <div className="skeleton" style={{ height: '11px', width: '35%' }} />
      </div>
    </div>
  );
}
