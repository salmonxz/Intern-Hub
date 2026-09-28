import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Pages
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import DailyLogs from './pages/DailyLogs';
import Tasks from './pages/Tasks';
import Recap from './pages/Recap';
import Documents from './pages/Documents';
import Settings from './pages/Settings';

import { api } from './utils/api';

export default function App() {
  // Theme state: Default to luxury warm cream & white
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('intern_bps_theme') || 'theme-cream';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Application Data States
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Daily Log Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Toast Helper
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle Theme between Warm Cream & Dark Espresso
  const toggleTheme = () => {
    const nextTheme = theme === 'theme-cream' ? 'theme-dark' : 'theme-cream';
    setTheme(nextTheme);
    localStorage.setItem('intern_bps_theme', nextTheme);
    document.body.className = nextTheme;
  };

  // Initial Load
  useEffect(() => {
    document.body.className = theme;
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [profData, logsData, tasksData, docsData, attData, todayAttData] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getDailyLogs().catch(() => []),
        api.getTasks().catch(() => []),
        api.getDocuments().catch(() => []),
        api.getAttendance().catch(() => []),
        api.getTodayAttendance().catch(() => null)
      ]);

      if (profData) setProfile(profData);
      setLogs(logsData || []);
      setTasks(tasksData || []);
      setDocuments(docsData || []);
      setAttendances(attData || []);
      setTodayAttendance(todayAttData || null);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      addToast('Gagal memuat data dari database SQLite', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Handlers for Daily Logs
  // ==========================================
  const handleSaveLog = async (logData) => {
    try {
      if (logData.id) {
        const updated = await api.updateDailyLog(logData.id, logData);
        setLogs((prev) => prev.map((l) => (l.id === logData.id ? updated : l)));
        addToast('Log aktivitas berhasil diperbarui!');
      } else {
        const created = await api.createDailyLog(logData);
        setLogs((prev) => [created, ...prev]);
        addToast('Aktivitas baru berhasil dicatat!');

        // Trigger confetti for celebratory logging
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.85 },
          colors: ['#b45309', '#166534', '#181513', '#d97706']
        });
      }
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan log kegiatan', 'error');
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      await api.deleteDailyLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      addToast('Catatan kegiatan telah dihapus', 'info');
    } catch (err) {
      addToast(err.message || 'Gagal menghapus log', 'error');
    }
  };

  // ==========================================
  // Handlers for Tasks
  // ==========================================
  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        const updated = await api.updateTask(taskData.id, taskData);
        setTasks((prev) => prev.map((t) => (t.id === taskData.id ? updated : t)));
        addToast('Tugas berhasil diperbarui!');
      } else {
        const created = await api.createTask(taskData);
        setTasks((prev) => [...prev, created]);
        addToast('Tugas baru berhasil ditambahkan!');
      }
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan tugas', 'error');
    }
  };

  const handleUpdateTaskStatus = async (id, newStatus) => {
    try {
      const updated = await api.updateTaskStatus(id, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));

      if (newStatus === 'Completed') {
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#166534', '#b45309', '#181513']
        });
        addToast('Tugas selesai dikerjakan 🎉');
      } else {
        addToast(`Status tugas diubah ke ${newStatus}`);
      }
    } catch (err) {
      addToast(err.message || 'Gagal mengubah status tugas', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      addToast('Tugas telah dihapus', 'info');
    } catch (err) {
      addToast(err.message || 'Gagal menghapus tugas', 'error');
    }
  };

  // ==========================================
  // Handlers for Documents
  // ==========================================
  const handleUploadDocument = async (formData) => {
    try {
      const created = await api.uploadDocument(formData);
      setDocuments((prev) => [created, ...prev]);
      addToast('Berkas dokumen berhasil diunggah!');
    } catch (err) {
      addToast(err.message || 'Gagal mengunggah berkas', 'error');
      throw err;
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      addToast('Dokumen berhasil dihapus dari arsip', 'info');
    } catch (err) {
      addToast(err.message || 'Gagal menghapus berkas', 'error');
    }
  };

  // ==========================================
  // Handlers for Profile & DB Reset
  // ==========================================
  const handleSaveProfile = async (profileData) => {
    try {
      const updated = await api.updateProfile(profileData);
      setProfile(updated);
      addToast('Profil magang BPS berhasil disimpan!');
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan profil', 'error');
    }
  };

  const handleResetDb = async () => {
    try {
      await api.resetSeedDb();
      await loadAllData();
      addToast('Database berhasil dibersihkan!', 'info');
    } catch (err) {
      addToast(err.message || 'Gagal mereset database', 'error');
    }
  };

  // ==========================================
  // Handlers for Attendance (Presensi)
  // ==========================================
  const handleClockIn = async (clockData = {}) => {
    try {
      const record = await api.clockIn(clockData);
      setTodayAttendance(record);
      setAttendances((prev) => {
        const exists = prev.some((a) => a.id === record.id || a.date === record.date);
        if (exists) return prev.map((a) => (a.id === record.id || a.date === record.date ? record : a));
        return [record, ...prev];
      });
      addToast(`Presensi masuk tercatat (${record.time_in})! Semangat beraktivitas.`);
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.85 },
        colors: ['#166534', '#b45309', '#0284c7']
      });
    } catch (err) {
      addToast(err.message || 'Gagal mencatat jam masuk', 'error');
    }
  };

  const handleClockOut = async (clockData = {}) => {
    try {
      const record = await api.clockOut(clockData);
      setTodayAttendance(record);
      setAttendances((prev) => prev.map((a) => (a.id === record.id || a.date === record.date ? record : a)));
      addToast(`Presensi pulang tercatat (${record.time_out})! Selamat beristirahat.`);
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.85 },
        colors: ['#b45309', '#181513', '#d97706']
      });
    } catch (err) {
      addToast(err.message || 'Gagal mencatat jam pulang', 'error');
    }
  };

  const handleSaveAttendance = async (attData) => {
    try {
      const today = new Date().toLocaleDateString('en-CA');
      if (attData.id) {
        const updated = await api.updateAttendance(attData.id, attData);
        setAttendances((prev) => prev.map((a) => (a.id === attData.id ? updated : a)));
        if (updated.date === today) setTodayAttendance(updated);
        addToast('Data presensi berhasil diperbarui!');
      } else {
        const created = await api.createAttendance(attData);
        setAttendances((prev) => {
          const filtered = prev.filter((a) => a.date !== created.date);
          return [created, ...filtered];
        });
        if (created.date === today) setTodayAttendance(created);
        addToast('Presensi baru berhasil dicatat!');
      }
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan presensi', 'error');
    }
  };

  const handleDeleteAttendance = async (id) => {
    try {
      await api.deleteAttendance(id);
      const target = attendances.find((a) => a.id === id);
      const today = new Date().toLocaleDateString('en-CA');
      if (target && target.date === today) setTodayAttendance(null);
      setAttendances((prev) => prev.filter((a) => a.id !== id));
      addToast('Catatan presensi telah dihapus', 'info');
    } catch (err) {
      addToast(err.message || 'Gagal menghapus presensi', 'error');
    }
  };

  const pendingTaskCount = tasks.filter((t) => t.status !== 'Completed').length;

  return (
    <div className={`app-container ${theme}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        counts={{
          daily_logs: logs.length,
          tasks: pendingTaskCount,
          documents: documents.length,
          attendance: attendances.length
        }}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Navbar
          profile={profile}
          theme={theme}
          toggleTheme={toggleTheme}
          activeTab={activeTab}
          onQuickLogOpen={() => {
            setSelectedLog(null);
            setIsLogModalOpen(true);
            setActiveTab('daily-logs');
          }}
          taskCount={pendingTaskCount}
        />

        <main className="main-content-body">
          {loading ? (
            <div className="empty-state" style={{ minHeight: '50vh' }}>
              <div className="pulse-dot pulse-amber" style={{ width: 14, height: 14 }}></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Memuat basis data `laporan_bps.sqlite`...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  profile={profile}
                  logs={logs}
                  tasks={tasks}
                  todayAttendance={todayAttendance}
                  onClockIn={handleClockIn}
                  onClockOut={handleClockOut}
                  setActiveTab={setActiveTab}
                  onAddLog={() => {
                    setSelectedLog(null);
                    setIsLogModalOpen(true);
                    setActiveTab('daily-logs');
                  }}
                  onAddTask={() => setActiveTab('tasks')}
                  onToggleTaskStatus={handleUpdateTaskStatus}
                />
              )}

              {activeTab === 'attendance' && (
                <Attendance
                  profile={profile}
                  attendances={attendances}
                  todayAttendance={todayAttendance}
                  onClockIn={handleClockIn}
                  onClockOut={handleClockOut}
                  onSaveAttendance={handleSaveAttendance}
                  onDeleteAttendance={handleDeleteAttendance}
                  onOpenDailyLogModal={() => {
                    setSelectedLog(null);
                    setIsLogModalOpen(true);
                    setActiveTab('daily-logs');
                  }}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'daily-logs' && (
                <DailyLogs
                  profile={profile}
                  logs={logs}
                  attendances={attendances}
                  onSaveLog={handleSaveLog}
                  onDeleteLog={handleDeleteLog}
                  isModalOpen={isLogModalOpen}
                  setIsModalOpen={setIsLogModalOpen}
                  selectedLog={selectedLog}
                  setSelectedLog={setSelectedLog}
                />
              )}

              {activeTab === 'tasks' && (
                <Tasks
                  tasks={tasks}
                  onSaveTask={handleSaveTask}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {activeTab === 'recap' && (
                <Recap 
                  profile={profile} 
                  logs={logs} 
                  attendances={attendances} 
                />
              )}

              {activeTab === 'documents' && (
                <Documents
                  documents={documents}
                  onUploadDocument={handleUploadDocument}
                  onDeleteDocument={handleDeleteDocument}
                />
              )}

              {activeTab === 'settings' && (
                <Settings
                  profile={profile}
                  onSaveProfile={handleSaveProfile}
                  onResetDb={handleResetDb}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Toast Notification Container */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
