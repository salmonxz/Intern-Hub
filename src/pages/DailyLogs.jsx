import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  List, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  FileCheck,
  CheckCircle,
  FileText,
  Sparkles,
  Printer
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ExportModal from '../components/ExportModal';
import { formatDateIndo, getCategoryBadgeClass } from '../utils/formatters';

export default function DailyLogs({ 
  profile,
  logs = [], 
  attendances = [],
  onSaveLog, 
  onDeleteLog, 
  isModalOpen, 
  setIsModalOpen, 
  selectedLog, 
  setSelectedLog 
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [quickExportLogs, setQuickExportLogs] = useState(null);

  // Dynamic categories list from logs
  const dynamicCategories = useMemo(() => {
    const cats = new Set(logs.map(l => l.category).filter(Boolean));
    return Array.from(cats);
  }, [logs]);

  // Calendar navigation state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Form State
  const initialForm = {
    date: new Date().toISOString().split('T')[0],
    title: '',
    category: '',
    hours_spent: 7.5,
    status: 'Selesai',
    description: '',
    output: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const openCreateModal = () => {
    setSelectedLog(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (log) => {
    setSelectedLog(log);
    setFormData({
      date: log.date,
      title: log.title,
      category: log.category,
      hours_spent: log.hours_spent,
      status: log.status,
      description: log.description || '',
      output: log.output || '',
      notes: log.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveLog({
      ...formData,
      id: selectedLog ? selectedLog.id : undefined
    });
    setIsModalOpen(false);
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = searchTerm === '' || 
        log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.output && log.output.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.category && log.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = categoryFilter === 'Semua' || log.category === categoryFilter;
      const matchStatus = statusFilter === 'Semua' || log.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [logs, searchTerm, categoryFilter, statusFilter]);

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, dateStr: '', logs: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayLogs = logs.filter(l => l.date === dateStr);
      days.push({ day, dateStr, logs: dayLogs });
    }

    return days;
  }, [currentYear, currentMonth, logs]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            <CalendarIcon size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Log Aktivitas Harian Magang</span>
          </h1>
          <p className="page-subtitle">
            Catat pekerjaan harian, durasi jam kerja, dan output kegiatan magang di Badan Pusat Statistik.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* View Mode Switcher */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-sm)' }}>
            <button 
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('table')}
              title="Tampilan Tabel"
            >
              <List size={14} />
              <span>Tabel</span>
            </button>
            <button 
              className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('calendar')}
              title="Tampilan Kalender"
            >
              <CalendarIcon size={14} />
              <span>Kalender</span>
            </button>
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setQuickExportLogs(null);
              setIsExportModalOpen(true);
            }}
            title="Ekspor PDF atau Excel dari catatan log aktivitas"
          >
            <Printer size={15} />
            <span>Ekspor Data</span>
          </button>

          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={15} />
            <span>+ Catat Aktivitas</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '1rem 1.35rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div className="navbar-search" style={{ width: '100%', maxWidth: '320px' }}>
            <Search size={15} className="navbar-search-icon" />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Cari judul, kegiatan, output..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Category Filter */}
            {dynamicCategories.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Kategori:</span>
                <select 
                  className="form-select" 
                  style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="Semua">Semua Kategori</option>
                  {dynamicCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Status:</span>
              <select 
                className="form-select" 
                style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Semua">Semua Status</option>
                <option value="Selesai">Selesai</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode 1: Table View */}
      {viewMode === 'table' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Tanggal</th>
                <th>Aktivitas & Rincian Kegiatan</th>
                <th style={{ width: '180px' }}>Kategori BPS</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <FileText className="empty-icon" />
                      <p>Tidak ada catatan log yang sesuai dengan filter pencarian</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div className="mono-num" style={{ fontWeight: 700, fontSize: '0.865rem', color: 'var(--text-heading)' }}>
                        {formatDateIndo(log.date)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <strong style={{ color: 'var(--text-heading)', fontSize: '0.94rem' }}>{log.title}</strong>
                        {log.description && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: '1.5' }}>
                            {log.description}
                          </p>
                        )}
                        {log.output && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                            <FileCheck size={13} />
                            <span>Output: {log.output}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getCategoryBadgeClass(log.category)}`}>
                        {log.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${log.status === 'Selesai' ? 'badge-green' : 'badge-amber'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => {
                            setQuickExportLogs([log]);
                            setIsExportModalOpen(true);
                          }}
                          title="Cetak / Ekspor Lembar Log Ini"
                        >
                          <Printer size={14} />
                        </button>
                        <button 
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => openEditModal(log)}
                          title="Edit Log"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setDeleteTargetId(log.id)}
                          style={{ color: 'var(--accent-rose)' }}
                          title="Hapus Log"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View Mode 2: Calendar View */}
      {viewMode === 'calendar' && (
        <div className="calendar-container">
          <div className="calendar-header">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-heading)' }}>
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary btn-icon btn-sm"
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
              >
                <ChevronLeft size={15} />
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setCurrentMonth(new Date().getMonth());
                  setCurrentYear(new Date().getFullYear());
                }}
              >
                Bulan Ini
              </button>
              <button 
                className="btn btn-secondary btn-icon btn-sm"
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((dayName) => (
              <div key={dayName} className="calendar-day-header">{dayName}</div>
            ))}

            {calendarDays.map((item, idx) => {
              if (!item.day) {
                return <div key={`empty-${idx}`} className="calendar-cell inactive" />;
              }

              const isToday = item.dateStr === new Date().toISOString().split('T')[0];
              const totalHoursDay = item.logs.reduce((sum, l) => sum + (Number(l.hours_spent) || 0), 0);

              return (
                <div 
                  key={item.dateStr} 
                  className={`calendar-cell ${isToday ? 'today' : ''}`}
                  onClick={() => {
                    if (item.logs.length > 0) {
                      openEditModal(item.logs[0]);
                    } else {
                      setFormData({ ...initialForm, date: item.dateStr });
                      setSelectedLog(null);
                      setIsModalOpen(true);
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="calendar-date-number mono-num">{item.day}</span>
                    {totalHoursDay > 0 && (
                      <span className="mono-num" style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        {totalHoursDay}h
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px', overflow: 'hidden' }}>
                    {item.logs.map(l => (
                      <div key={l.id} className="calendar-entry-pill" title={`${l.title} (${l.hours_spent}h)`}>
                        {l.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Log Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLog ? 'Edit Log Aktivitas' : 'Entri Log Aktivitas Baru'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              <CheckCircle size={15} />
              <span>{selectedLog ? 'Simpan Perubahan' : 'Catat Aktivitas'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tanggal Kegiatan</label>
              <input
                type="date"
                className="form-input mono-num"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fungsi / Kategori Kegiatan</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ketik kategori (contoh: Pengolahan Data / Lapangan / Analisis)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Judul Aktivitas / Tugas</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Validasi Kewajaran Data Sakernas Blok IV"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rincian Aktivitas, Metode, dan Kendala</label>
            <textarea
              className="form-textarea"
              placeholder="Jelaskan proses kerja, software/tools yang digunakan, kendala teknis..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hasil / Output Pekerjaan</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: 25 Kuesioner selesai diperiksa"
                value={formData.output}
                onChange={(e) => setFormData({ ...formData, output: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status Log</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Selesai">Selesai</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) onDeleteLog(deleteTargetId);
        }}
        title="Hapus Catatan Log"
        message="Apakah Anda yakin ingin menghapus catatan kegiatan ini? Alokasi jam kerja akan disesuaikan otomatis."
      />

      {/* Export / Print Logbook Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setQuickExportLogs(null);
        }}
        profile={profile}
        allLogs={quickExportLogs || logs}
        filteredLogs={quickExportLogs || filteredLogs}
        attendances={attendances}
        currentFilters={{
          category: categoryFilter,
          status: statusFilter,
          search: searchTerm
        }}
      />
    </div>
  );
}
