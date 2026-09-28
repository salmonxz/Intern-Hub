import React, { useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  FileSpreadsheet, 
  ArrowRight, 
  Sparkles, 
  Award, 
  Layers,
  Clock,
  CalendarCheck
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { formatDateIndo, calculateDaysBetween, getPriorityBadgeClass, getCategoryBadgeClass } from '../utils/formatters';

export default function Dashboard({ 
  profile, 
  logs = [], 
  tasks = [], 
  todayAttendance = null,
  onClockIn,
  onClockOut,
  setActiveTab, 
  onAddLog, 
  onAddTask, 
  onToggleTaskStatus 
}) {
  // Statistics Calculations
  const stats = useMemo(() => {
    const completedLogs = logs.filter(l => l.status === 'Selesai');

    // Days calculation
    const daysInfo = calculateDaysBetween(profile?.start_date, profile?.end_date);

    // Tasks calculation
    const pendingTasks = tasks.filter(t => t.status !== 'Completed');
    const urgentTasks = pendingTasks.filter(t => t.priority === 'High');

    // Category distribution by count of entries
    const categoryCounts = {};
    logs.forEach(l => {
      const cat = l.category || 'Lainnya';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Check today's log
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === todayStr);

    return {
      daysInfo,
      completedLogsCount: completedLogs.length,
      draftLogsCount: logs.length - completedLogs.length,
      pendingTasks,
      urgentTasks,
      categoryCounts,
      todayLog
    };
  }, [profile, logs, tasks]);

  const totalLogsCount = logs.length;

  return (
    <div className="animate-fade-in">
      {/* Welcome Editorial Banner */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '1.5rem', 
          backgroundColor: 'var(--bg-card-secondary)', 
          border: '1px solid var(--border-card)',
          padding: '2.25rem 2.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-amber">
                <Sparkles size={12} />
                <span>Internship Tracker</span>
              </span>
              <span className="badge badge-gray">{profile?.division || 'BPS'}</span>
            </div>
            
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.035em' }}>
              Selamat datang, {profile?.full_name?.split(' ')[0] || 'Mahasiswa'} 👋
            </h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
              Pembimbing Lapangan: <strong style={{ color: 'var(--text-heading)' }}>{profile?.mentor_name || '-'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onAddLog}>
              <Plus size={15} />
              <span>Entri Aktivitas Baru</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('recap')}>
              <FileSpreadsheet size={15} />
              <span>Lihat Rekapitulasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Attendance Widget */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '2rem', 
          border: '1px solid var(--border-card)',
          backgroundColor: 'var(--bg-card)',
          padding: '1.25rem 1.75rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: todayAttendance?.time_in ? 'var(--accent-sage-bg)' : 'var(--bg-card-secondary)',
              color: todayAttendance?.time_in ? 'var(--accent-sage)' : 'var(--text-muted)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <CalendarCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.975rem' }}>
                  Presensi Hari Ini:
                </span>
                {!todayAttendance?.time_in ? (
                  <span className="badge badge-gray" style={{ fontSize: '0.78rem' }}>Belum Absen Masuk</span>
                ) : !todayAttendance?.time_out ? (
                  <span className="badge badge-green" style={{ fontSize: '0.78rem' }}>
                    Hadir Aktif (Masuk {todayAttendance.time_in})
                  </span>
                ) : (
                  <span className="badge badge-blue" style={{ fontSize: '0.78rem' }}>
                    Selesai ({todayAttendance.time_in} - {todayAttendance.time_out})
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {todayAttendance?.work_location ? `${todayAttendance.work_location} • ` : ''}
                {todayAttendance?.status ? `${todayAttendance.status} • ` : ''}
                Waktu lokal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {!todayAttendance?.time_in ? (
              <button 
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                onClick={() => {
                  const now = new Date();
                  if (onClockIn) {
                    onClockIn({ time_in: now.toTimeString().slice(0, 5), status: 'Hadir (WFO)', work_location: 'Kantor BPS' });
                  }
                }}
              >
                <CalendarCheck size={15} />
                <span>Clock-In Sekarang</span>
              </button>
            ) : !todayAttendance?.time_out ? (
              <button 
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', backgroundColor: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', color: '#fff' }}
                onClick={() => {
                  const now = new Date();
                  if (onClockOut) {
                    onClockOut({ time_out: now.toTimeString().slice(0, 5) });
                  }
                }}
              >
                <Clock size={15} />
                <span>Clock-Out Pulang</span>
              </button>
            ) : null}

            <button 
              className="btn btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}
              onClick={() => setActiveTab('attendance')}
            >
              <span>Detail Presensi</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <StatCard
          title="Masa Magang"
          value={stats.daysInfo.daysPassed}
          unit={`/ ${stats.daysInfo.totalDays} Hari`}
          icon={Calendar}
          iconBg="var(--accent-sage-bg)"
          iconColor="var(--accent-sage)"
          progress={stats.daysInfo.percentPassed}
          subtitle={`Tersisa ${stats.daysInfo.daysRemaining} hari kalender`}
        />

        <StatCard
          title="Total Catatan Log"
          value={logs.length}
          unit="Entri"
          icon={CheckCircle2}
          iconBg="var(--bg-subtle)"
          iconColor="var(--text-heading)"
          badgeText={`${stats.completedLogsCount} Selesai • ${stats.draftLogsCount} Draft`}
          badgeType="amber"
          onClick={() => setActiveTab('daily-logs')}
        />

        <StatCard
          title="Tugas Tertunda"
          value={stats.pendingTasks.length}
          unit="Tugas"
          icon={AlertCircle}
          iconBg={stats.urgentTasks.length > 0 ? "var(--accent-rose-bg)" : "var(--bg-subtle)"}
          iconColor={stats.urgentTasks.length > 0 ? "var(--accent-rose)" : "var(--text-heading)"}
          badgeText={stats.urgentTasks.length > 0 ? `${stats.urgentTasks.length} Prioritas Tinggi!` : 'Semua Terjadwal'}
          badgeType={stats.urgentTasks.length > 0 ? 'rose' : 'amber'}
          onClick={() => setActiveTab('tasks')}
        />
      </div>

      {/* Bottom Section: Today's Log Widget, Category Distribution & Urgent Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        
        {/* Left Column: Today's Log & Category Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Today's Log Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
                <span>Status Log Hari Ini</span>
              </div>
              {stats.todayLog ? (
                <span className="badge badge-green">Sudah Diisi</span>
              ) : (
                <span className="badge badge-amber">Belum Diisi</span>
              )}
            </div>

            {stats.todayLog ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                  {stats.todayLog.title}
                </div>
                {stats.todayLog.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {stats.todayLog.description}
                  </p>
                )}
                {stats.todayLog.category && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                    <span className={`badge ${getCategoryBadgeClass(stats.todayLog.category)}`}>
                      {stats.todayLog.category}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.75rem 1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  Kamu belum mencatat aktivitas kerja BPS hari ini. Catat kegiatan harian Anda sekarang.
                </p>
                <button className="btn btn-primary" onClick={onAddLog}>
                  <Plus size={15} />
                  <span>Catat Aktivitas Hari Ini</span>
                </button>
              </div>
            )}
          </div>

          {/* Category Breakdown Progress */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Award size={18} style={{ color: 'var(--accent-sage)' }} />
                <span>Distribusi Kategori Kegiatan</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('daily-logs')}>
                Detail <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {Object.entries(stats.categoryCounts).length === 0 ? (
                <div className="empty-state" style={{ padding: '1.75rem 1rem' }}>
                  <Layers className="empty-icon" />
                  <p>Belum ada entri kegiatan yang dicatat</p>
                </div>
              ) : (
                Object.entries(stats.categoryCounts).map(([cat, count], index) => {
                  const percent = totalLogsCount > 0 ? Math.round((count / totalLogsCount) * 100) : 0;
                  const fillColors = ['#181513', '#b45309', '#166534', '#1e3a5f', '#78716c'];
                  const color = fillColors[index % fillColors.length];

                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.865rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{cat}</span>
                        <span className="mono-num" style={{ color: 'var(--text-muted)' }}>
                          <strong>{count} Log</strong> ({percent}%)
                        </span>
                      </div>
                      <div className="progress-bar-container" style={{ height: '5px' }}>
                        <div 
                          className="progress-bar-fill" 
                          style={{ 
                            width: `${percent}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Urgent Tasks Checklist */}
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={18} style={{ color: 'var(--accent-rose)' }} />
              <span>Tugas & Deadline Terdekat</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('tasks')}>
              Semua Tugas <ArrowRight size={13} />
            </button>
          </div>

          {stats.pendingTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '3.5rem 1rem', margin: 'auto' }}>
              <CheckCircle2 className="empty-icon" style={{ color: 'var(--accent-sage)' }} />
              <p>Semua tugas magang telah terselesaikan dengan baik 🎉</p>
              <button className="btn btn-secondary btn-sm" onClick={onAddTask} style={{ marginTop: '0.75rem' }}>
                <Plus size={13} /> <span>Tambah Tugas Baru</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.pendingTasks.slice(0, 6).map((task) => (
                <div 
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-card-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                    <input 
                      type="checkbox"
                      checked={task.status === 'Completed'}
                      onChange={() => onToggleTaskStatus(task.id, 'Completed')}
                      style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)', width: 16, height: 16 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '0.885rem', fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </span>
                      {task.due_date && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Deadline: {formatDateIndo(task.due_date)}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
