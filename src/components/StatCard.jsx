import React from 'react';

export default function StatCard({
  title,
  value,
  unit = '',
  icon: Icon,
  iconBg = 'var(--bg-subtle)',
  iconColor = 'var(--text-heading)',
  badgeText,
  badgeType = 'amber', // amber, green, rose, blue
  progress, // 0 - 100
  subtitle,
  onClick
}) {
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-card-top">
        <span className="stat-card-label">{title}</span>
        {Icon && (
          <div 
            className="stat-card-icon" 
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '0.1rem' }}>
        <span className="stat-card-value mono-num">{value}</span>
        {unit && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{unit}</span>}
      </div>

      {progress !== undefined && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.35rem' }}>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: progress >= 100 ? 'var(--accent-sage)' : 'var(--accent-primary)'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <span className="mono-num" style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{progress}% tercapai</span>
            {subtitle && <span>{subtitle}</span>}
          </div>
        </div>
      )}

      {badgeText && (
        <div style={{ marginTop: '0.25rem' }}>
          <span className={`badge badge-${badgeType}`}>
            {badgeText}
          </span>
        </div>
      )}

      {!progress && subtitle && (
        <div className="stat-card-meta">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
