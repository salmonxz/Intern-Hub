import React from 'react';
import { 
  Sun, 
  Moon, 
  Calendar as CalendarIcon, 
  Sparkles,
  Plus
} from 'lucide-react';
import { formatDateLong } from '../utils/formatters';

export default function Navbar({ 
  profile, 
  theme, 
  toggleTheme, 
  activeTab, 
  onQuickLogOpen,
  taskCount = 0
}) {
  const todayStr = formatDateLong(new Date());

  return (
    <header className="navbar no-print">
      <div className="navbar-left">
        <div className="navbar-date-badge">
          <CalendarIcon size={14} style={{ color: 'var(--accent-gold)' }} />
          <span className="mono-num">{todayStr}</span>
        </div>

        {taskCount > 0 && (
          <div className="badge badge-amber" style={{ cursor: 'pointer' }}>
            <span className="pulse-dot pulse-amber"></span>
            <span>{taskCount} Tugas Aktif</span>
          </div>
        )}
      </div>

      <div className="navbar-right">
        {/* Quick Action: Log Hari Ini */}
        <button 
          className="btn btn-primary btn-sm"
          onClick={onQuickLogOpen}
        >
          <Plus size={15} />
          <span>Catat Log Hari Ini</span>
        </button>

        {/* Theme Toggle (Warm Cream / Espresso Dark) */}
        <button 
          className="btn btn-secondary btn-icon"
          onClick={toggleTheme}
          title={theme === 'theme-dark' ? 'Ganti ke Mode Krem & Putih' : 'Ganti ke Mode Gelap'}
          aria-label="Toggle Theme"
        >
          {theme === 'theme-dark' ? <Sun size={16} style={{ color: 'var(--accent-gold)' }} /> : <Moon size={16} style={{ color: 'var(--text-muted)' }} />}
        </button>

        {/* Mini Profile Avatar */}
        <div 
          className="sidebar-avatar"
          style={{ width: 34, height: 34, fontSize: '0.8rem', cursor: 'pointer' }}
          title={profile?.full_name || 'Mahasiswa Magang BPS'}
        >
          {profile?.full_name ? profile.full_name.charAt(0) : 'B'}
        </div>
      </div>
    </header>
  );
}
