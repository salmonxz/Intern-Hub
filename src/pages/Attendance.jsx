import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  CalendarCheck, 
  Calendar, 
  MapPin, 
  Plus, 
  FileSpreadsheet, 
  Printer, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileText,
  Building,
  Home,
  Briefcase
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatCard from '../components/StatCard';
import TimeInput24 from '../components/TimeInput24';
import { formatDateIndo, formatDateLong, getAttendanceBadgeClass } from '../utils/formatters';
import { api } from '../utils/api';

export default function Attendance({
  profile,
  attendances = [],
  todayAttendance,
  onClockIn,
  onClockOut,
  onSaveAttendance,
  onDeleteAttendance,
  onOpenDailyLogModal,
  setActiveTab
}) {
  // Live ticking clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick clock in options state
  const [quickLocation, setQuickLocation] = useState('Kantor BPS');
  const [quickStatus, setQuickStatus] = useState('Hadir (WFO)');
  const [quickNotes, setQuickNotes] = useState('');

  // Table filters
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal manual entry / edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const initialForm = {
    date: new Date().toLocaleDateString('en-CA'),
    time_in: '07:45',
    time_out: '16:30',
    status: 'Hadir (WFO)',
    work_location: 'Kantor BPS',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Month options for filter (from profile or attendances)
  const monthOptions = [
    { value: 'all', label: 'Semua Bulan' },
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  // Open Create Modal
  const openCreateModal = () => {
    setSelectedItem(null);
    setFormData({
      date: new Date().toLocaleDateString('en-CA'),
      time_in: '07:45',
      time_out: '16:30',
      status: 'Hadir (WFO)',
      work_location: 'Kantor BPS',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      id: item.id,
      date: item.date,
      time_in: item.time_in || '',
      time_out: item.time_out || '',
      status: item.status || 'Hadir (WFO)',
      work_location: item.work_location || 'Kantor BPS',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) return;
    await onSaveAttendance({
      ...(selectedItem ? { id: selectedItem.id } : {}),
      ...formData
    });
    setIsModalOpen(false);
  };

  // Calculate Duration
  const getDurationHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    const [h1, m1] = timeIn.split(':').map(Number);
    const [h2, m2] = timeOut.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff <= 0) return 0;
    return +(diff / 60).toFixed(1);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    let hadirCount = 0;
    let wfhCount = 0;
    let dinasCount = 0;
    let izinCount = 0;
    let sakitCount = 0;
    let totalWorkHours = 0;

    attendances.forEach(item => {
      if (item.status === 'Hadir (WFO)') hadirCount++;
      else if (item.status === 'Hadir (WFH)') wfhCount++;
      else if (item.status === 'Dinas Luar' || item.status === 'Dinas Luar / Lapangan') dinasCount++;
      else if (item.status === 'Izin') izinCount++;
      else if (item.status === 'Sakit') sakitCount++;

      const hours = getDurationHours(item.time_in, item.time_out);
      totalWorkHours += hours;
    });

    const totalDaysRecorded = attendances.length;
    const totalPresent = hadirCount + wfhCount + dinasCount;
    const avgHours = totalPresent > 0 ? (totalWorkHours / totalPresent).toFixed(1) : '0.0';

    return {
      totalDaysRecorded,
      hadirCount,
      wfhCount,
      dinasCount,
      totalPresent,
      izinCount,
      sakitCount,
      totalWorkHours,
      avgHours
    };
  }, [attendances]);

  // Filtered attendance list
  const filteredAttendances = useMemo(() => {
    return attendances.filter(item => {
      // Month filter
      if (selectedMonth !== 'all') {
        const itemMonth = item.date?.split('-')[1];
        if (itemMonth !== selectedMonth) return false;
      }
      // Status filter
      if (selectedStatus !== 'Semua' && item.status !== selectedStatus) {
        return false;
      }
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const dateStr = (item.date || '').toLowerCase();
        const loc = (item.work_location || '').toLowerCase();
        const notes = (item.notes || '').toLowerCase();
        if (!dateStr.includes(term) && !loc.includes(term) && !notes.includes(term)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.id - b.id));
  }, [attendances, selectedMonth, selectedStatus, searchTerm]);

  // Today attendance status
  const isClockedIn = Boolean(todayAttendance && todayAttendance.time_in);
  const isClockedOut = Boolean(todayAttendance && todayAttendance.time_out);

  const handleQuickClockIn = () => {
    onClockIn({
      time_in: currentTime.toTimeString().slice(0, 5),
      status: quickStatus,
      work_location: quickLocation,
      notes: quickNotes
    });
  };

  const handleQuickClockOut = () => {
    onClockOut({
      time_out: currentTime.toTimeString().slice(0, 5)
    });
  };

  const handleExportExcel = () => {
    const params = {};
    if (selectedStatus !== 'Semua') params.status = selectedStatus;
    const url = api.getAttendanceExcelUrl(params);
    window.open(url, '_blank');
  };

  const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const getDayName = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr + 'T00:00:00');
    return isNaN(d.getTime()) ? '-' : indonesianDays[d.getDay()];
  };

  return (
    <div className="animate-fade-in">
      {/* Editorial Welcome Header */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '2rem', 
          backgroundColor: 'var(--bg-card-secondary)', 
          border: '1px solid var(--border-card)',
          padding: '2rem 2.25rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-amber">
                <CalendarCheck size={12} />
                <span>Presensi &amp; Kehadiran</span>
              </span>
              <span className="badge badge-gray">{profile?.division || 'Badan Pusat Statistik'}</span>
            </div>
            
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.03em' }}>
              Pencatatan Kehadiran Magang BPS
            </h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Pantau jam kerja, kedisiplinan dinas harian, dan unduh daftar presensi berkop resmi.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleExportExcel}>
              <FileSpreadsheet size={15} />
              <span>Unduh Excel Presensi</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('recap')}>
              <Printer size={15} />
              <span>Lihat Lembar Sah BPS</span>
            </button>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={15} />
              <span>Entri / Koreksi Manual</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK CLOCK-IN / CLOCK-OUT LIVE CARD */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '2rem', 
          border: '1px solid var(--border-card)',
          background: 'var(--bg-card)',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          {/* Live Digital Clock */}
          <div style={{ borderRight: '1px solid var(--border-card)', paddingRight: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--accent-gold)' }}>
              WAKTU SISTEM REALTIME
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-heading)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0.4rem 0' }}>
              {currentTime.toTimeString().slice(0, 8)}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
              {formatDateLong(currentTime)}
            </div>
          </div>

          {/* Clock In / Out Action Panel */}
          <div>
            {!isClockedIn ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className="badge badge-gray" style={{ fontSize: '0.8rem' }}>
                    <AlertCircle size={13} />
                    <span>Belum Catat Kehadiran Hari Ini</span>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Status Kehadiran</label>
                    <select 
                      className="form-select" 
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', lineHeight: 'normal' }}
                      value={quickStatus} 
                      onChange={(e) => {
                        setQuickStatus(e.target.value);
                        if (e.target.value === 'Hadir (WFH)') setQuickLocation('Rumah / Remote');
                        else if (e.target.value === 'Dinas Luar') setQuickLocation('Lapangan / Pencacahan');
                        else setQuickLocation('Kantor BPS');
                      }}
                    >
                      <option value="Hadir (WFO)">Hadir (WFO Kantor)</option>
                      <option value="Hadir (WFH)">Hadir (WFH Remote)</option>
                      <option value="Dinas Luar">Dinas Luar / Lapangan</option>
                    </select>
                  </div>

                  <div style={{ flex: '1 1 140px' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Lokasi Penugasan</label>
                    <select 
                      className="form-select" 
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', lineHeight: 'normal' }}
                      value={quickLocation} 
                      onChange={(e) => setQuickLocation(e.target.value)}
                    >
                      <option value="Kantor BPS">Kantor BPS</option>
                      <option value="BPS Provinsi">BPS Provinsi</option>
                      <option value="Lapangan / Pencacahan">Lapangan / Pencacahan</option>
                      <option value="Rumah / Remote">Rumah / Remote</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, justifyContent: 'center' }}
                  onClick={handleQuickClockIn}
                >
                  <CalendarCheck size={18} />
                  <span>Catat Jam Masuk Sekarang ({currentTime.toTimeString().slice(0, 5)})</span>
                </button>
              </div>
            ) : !isClockedOut ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-green" style={{ fontSize: '0.8rem' }}>
                    <CheckCircle2 size={13} />
                    <span>Sedang Berdinas Aktif</span>
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Masuk pukul <strong style={{ color: 'var(--text-heading)' }}>{todayAttendance.time_in}</strong>
                  </span>
                </div>

                <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-card-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                    <strong style={{ color: 'var(--text-heading)' }}>{todayAttendance.status}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Lokasi:</span>
                    <strong style={{ color: 'var(--text-heading)' }}>{todayAttendance.work_location || 'Kantor BPS'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, backgroundColor: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', color: '#fff', justifyContent: 'center' }}
                    onClick={handleQuickClockOut}
                  >
                    <Clock size={16} />
                    <span>Catat Jam Pulang ({currentTime.toTimeString().slice(0, 5)})</span>
                  </button>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      if (onOpenDailyLogModal) onOpenDailyLogModal();
                      else setActiveTab('daily-logs');
                    }}
                    title="Catat aktivitas harian di buku logbook"
                  >
                    <FileText size={16} />
                    <span>Tulis Logbook</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-green" style={{ fontSize: '0.8rem' }}>
                    <CheckCircle2 size={13} />
                    <span>Presensi Hari Ini Lengkap</span>
                  </span>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-card-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', marginBottom: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jam Masuk</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>{todayAttendance.time_in}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jam Pulang</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>{todayAttendance.time_out}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Durasi Kerja</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        {getDurationHours(todayAttendance.time_in, todayAttendance.time_out)} Jam
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => openEditModal(todayAttendance)}
                  >
                    <Edit3 size={15} />
                    <span>Koreksi Presensi Hari Ini</span>
                  </button>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      if (onOpenDailyLogModal) onOpenDailyLogModal();
                      else setActiveTab('daily-logs');
                    }}
                  >
                    <FileText size={15} />
                    <span>Tulis Logbook</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI STATS CARDS */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Kehadiran"
          value={stats.totalPresent}
          unit="Hari"
          icon={CheckCircle2}
          iconBg="var(--accent-sage-bg)"
          iconColor="var(--accent-sage)"
          subtitle={`WFO: ${stats.hadirCount} | WFH: ${stats.wfhCount}`}
        />

        <StatCard
          title="Dinas Luar / Lapangan"
          value={stats.dinasCount}
          unit="Hari"
          icon={Building}
          iconBg="var(--accent-blue-bg, rgba(2, 132, 199, 0.1))"
          iconColor="var(--accent-blue, #0284c7)"
          subtitle="Pencacahan survei / dinas BPS"
        />

        <StatCard
          title="Izin & Sakit"
          value={stats.izinCount + stats.sakitCount}
          unit="Hari"
          icon={AlertCircle}
          iconBg="var(--accent-rose-bg, rgba(225, 29, 72, 0.1))"
          iconColor="var(--accent-rose, #e11d48)"
          subtitle={`Izin: ${stats.izinCount} | Sakit: ${stats.sakitCount}`}
        />

        <StatCard
          title="Akumulasi Jam Presensi"
          value={stats.totalWorkHours.toFixed(1)}
          unit="Jam"
          icon={Clock}
          iconBg="var(--accent-gold-bg, rgba(217, 119, 6, 0.1))"
          iconColor="var(--accent-gold, #d97706)"
          subtitle={`Rata-rata: ${stats.avgHours} jam/hari`}
        />
      </div>

      {/* TABEL RIWAYAT PRESENSI */}
      <div className="card" style={{ border: '1px solid var(--border-card)' }}>
        {/* Header & Filter Controls */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              Riwayat Presensi Bulanan
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Menampilkan {filteredAttendances.length} entri presensi
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Month Filter */}
            <select 
              className="form-select"
              style={{ width: 'auto', minWidth: '145px', padding: '0.45rem 0.85rem', fontSize: '0.85rem', lineHeight: 'normal', cursor: 'pointer' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select 
              className="form-select"
              style={{ width: 'auto', minWidth: '150px', padding: '0.45rem 0.85rem', fontSize: '0.85rem', lineHeight: 'normal', cursor: 'pointer' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="Hadir (WFO)">Hadir (WFO)</option>
              <option value="Hadir (WFH)">Hadir (WFH)</option>
              <option value="Dinas Luar">Dinas Luar</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Libur">Libur</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                <th style={{ width: '140px' }}>Hari &amp; Tanggal</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Jam Masuk</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Jam Pulang</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Durasi</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Status</th>
                <th style={{ width: '150px' }}>Lokasi Kerja</th>
                <th>Keterangan</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <div style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>📂</div>
                    Belum ada riwayat presensi yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((item, index) => {
                  const duration = getDurationHours(item.time_in, item.time_out);
                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {index + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{getDayName(item.date)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDateIndo(item.date)}</div>
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
                        {item.time_in || '-'}
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
                        {item.time_out || '-'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: duration > 0 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                        {duration > 0 ? `${duration} Jam` : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${getAttendanceBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>
                        {item.work_location || 'Kantor BPS'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {item.notes || '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                          <button 
                            className="btn btn-ghost btn-icon" 
                            onClick={() => openEditModal(item)}
                            title="Edit presensi"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button 
                            className="btn btn-ghost btn-icon" 
                            style={{ color: 'var(--accent-rose, #e11d48)' }}
                            onClick={() => setDeleteTargetId(item.id)}
                            title="Hapus presensi"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MANUAL ENTRY / EDIT ATTENDANCE */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? "Koreksi / Edit Presensi" : "Entri Presensi Baru"}
        size="md"
        footer={(
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleFormSubmit}>
              Simpan Presensi
            </button>
          </div>
        )}
      >
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Tanggal <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Status Kehadiran <span style={{ color: 'red' }}>*</span></label>
              <select 
                className="form-input" 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="Hadir (WFO)">Hadir (WFO)</option>
                <option value="Hadir (WFH)">Hadir (WFH)</option>
                <option value="Dinas Luar">Dinas Luar / Lapangan</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Libur">Libur / Cuti</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label">Jam Masuk (Clock-In)</label>
              <TimeInput24 
                value={formData.time_in}
                onChange={(val) => setFormData({ ...formData, time_in: val })}
                placeholder="07:45"
                type="in"
              />
            </div>

            <div>
              <label className="form-label">Jam Pulang (Clock-Out)</label>
              <TimeInput24 
                value={formData.time_out}
                onChange={(val) => setFormData({ ...formData, time_out: val })}
                placeholder="16:30"
                type="out"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Lokasi Penugasan</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Contoh: Kantor BPS, Ruang IPDS, Pencacahan Susenas"
              value={formData.work_location}
              onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label className="form-label">Keterangan / Alasan (Opsional)</label>
            <textarea 
              className="form-input" 
              rows={3}
              placeholder="Tambahkan catatan khusus jika izin, sakit, atau ada penugasan luar kantor..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) {
            await onDeleteAttendance(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Hapus Catatan Presensi?"
        message="Apakah Anda yakin ingin menghapus catatan presensi tanggal ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        confirmType="danger"
      />
    </div>
  );
}
