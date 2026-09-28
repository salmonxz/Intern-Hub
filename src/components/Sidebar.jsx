import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck,
  CalendarDays, 
  CheckSquare, 
  FileSpreadsheet, 
  FolderOpen, 
  Settings
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  profile, 
  counts = {} 
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Ringkasan',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'attendance',
      label: 'Presensi',
      icon: CalendarCheck,
      badge: counts.attendance || null
    },
    {
      id: 'daily-logs',
      label: 'Log Aktivitas',
      icon: CalendarDays,
      badge: counts.daily_logs || 0
    },
    {
      id: 'tasks',
      label: 'Catatan Tugas',
      icon: CheckSquare,
      badge: counts.tasks || 0
    },
    {
      id: 'recap',
      label: 'Rekap & Ekspor',
      icon: FileSpreadsheet,
      badge: null
    },
    {
      id: 'documents',
      label: 'Arsip Dokumen',
      icon: FolderOpen,
      badge: counts.documents || null
    },
    {
      id: 'settings',
      label: 'Profil & Basis Data',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="sidebar no-print">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, fontStyle: 'italic' }}>B</span>
        </div>
        <div className="sidebar-brand-info">
          <div className="sidebar-brand-title">InternBPS</div>
          <div className="sidebar-brand-subtitle">Activity Hub</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <div className="sidebar-section-label">Navigasi Utama</div>
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.label}</span>
              {item.badge !== null && (
                <span className="sidebar-nav-badge mono-num">{item.badge}</span>
              )}
            </button>
          );
        })}

        <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>Dokumentasi & Pengaturan</div>
        {menuItems.slice(5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.label}</span>
              {item.badge !== null && (
                <span className="sidebar-nav-badge mono-num">{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Profile Footer */}
      <div className="sidebar-footer" onClick={() => setActiveTab('settings')} style={{ cursor: 'pointer' }}>
        <div className="sidebar-profile-card">
          <div className="sidebar-avatar">
            {profile?.full_name ? profile.full_name.charAt(0) : 'B'}
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{profile?.full_name || 'Peserta Magang'}</div>
            <div className="sidebar-profile-division">{profile?.division ? profile.division.split(' ')[0] : 'BPS Intern'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
