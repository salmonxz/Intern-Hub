import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Database, 
  Save, 
  Download, 
  RotateCcw, 
  ShieldCheck
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../utils/api';

export default function Settings({ 
  profile, 
  onSaveProfile, 
  onResetDb 
}) {
  const [formData, setFormData] = useState({
    full_name: '',
    nim: '',
    university: '',
    division: '',
    mentor_name: '',
    start_date: '2026-07-01',
    end_date: '2026-09-30'
  });

  const [dbStats, setDbStats] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        nim: profile.nim || '',
        university: profile.university || '',
        division: profile.division || '',
        mentor_name: profile.mentor_name || '',
        start_date: profile.start_date || '2026-07-01',
        end_date: profile.end_date || '2026-09-30'
      });
    }
  }, [profile]);

  useEffect(() => {
    loadDbStats();
  }, []);

  const loadDbStats = async () => {
    try {
      const stats = await api.getDbStats();
      setDbStats(stats);
    } catch (e) {
      console.error('Could not load DB stats:', e);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleBackupDownload = () => {
    window.location.href = api.getBackupUrl();
  };

  const handleConfirmReset = async () => {
    await onResetDb();
    loadDbStats();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            <SettingsIcon size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Profil & Manajemen Database</span>
          </h1>
          <p className="page-subtitle">
            Kelola data diri mahasiswa magang, penempatan seksi BPS, pembimbing lapangan, serta cadangan basis data lokal SQLite.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <User size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Data Diri & Penempatan BPS</span>
            </div>
            <span className="badge badge-green">Aktif</span>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap Mahasiswa</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nama Lengkap"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">NIM (Nomor Induk Mahasiswa)</label>
                <input
                  type="text"
                  className="form-input mono-num"
                  placeholder="2215091044"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Asal Universitas / Jurusan</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Universitas Indonesia - Statistika"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Fungsi / Seksi Penempatan BPS</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ketik fungsi/seksi (contoh: IPDS / Statistik Sosial / Nerwilis / Distribusi / Produksi)"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nama Pembimbing Lapangan BPS</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nama Pembimbing Lapangan BPS"
                value={formData.mentor_name}
                onChange={(e) => setFormData({ ...formData, mentor_name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tanggal Mulai Magang</label>
                <input
                  type="date"
                  className="form-input mono-num"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal Selesai Magang</label>
                <input
                  type="date"
                  className="form-input mono-num"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={15} />
                <span>{saving ? 'Menyimpan...' : 'Simpan Profil Magang'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database Management Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Database size={18} style={{ color: 'var(--accent-sage)' }} />
                <span>Basis Data Lokal SQLite (`laporan_bps.sqlite`)</span>
              </div>
              <span className="badge badge-green">Terhubung</span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Database lokal portabel yang menyimpan seluruh entri profil, log harian, tugas kanban, dokumen arsip, dan materi SOP.
            </p>

            {dbStats && (
              <div style={{ backgroundColor: 'var(--bg-card-secondary)', borderRadius: 'var(--radius-md)', padding: '1.15rem', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Nama File:</span>
                    <div className="mono-num" style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{dbStats.db_name}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Ukuran DB:</span>
                    <div className="mono-num" style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{dbStats.file_size_formatted}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Total Log Harian:</span>
                    <div className="mono-num" style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{dbStats.counts?.daily_logs} entri ({dbStats.counts?.total_hours} Jam)</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Tugas & Materi:</span>
                    <div className="mono-num" style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{dbStats.counts?.tasks} Tugas / {dbStats.counts?.knowledge_base} SOP</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Backup Download Button */}
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleBackupDownload}
              >
                <Download size={15} />
                <span>Unduh Salinan Backup SQLite (1-Klik)</span>
              </button>

              {/* Reset Data Button */}
              <button 
                type="button" 
                className="btn btn-ghost" 
                style={{ color: 'var(--accent-rose)', width: '100%', justifyContent: 'center', border: '1px dashed var(--accent-rose-border)' }}
                onClick={() => setIsResetConfirmOpen(true)}
              >
                <RotateCcw size={15} />
                <span>Reset Database ke Data Contoh Awal</span>
              </button>
            </div>
          </div>

          {/* Quick Info & Tips */}
          <div className="card" style={{ backgroundColor: 'var(--bg-card-secondary)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-heading)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-sage)' }} />
              <span>Kerahasiaan Data Statistik BPS</span>
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
              Sesuai UU No. 16 Tahun 1997 tentang Statistik, seluruh data operasional survei wajib dijaga kerahasiaannya. Aplikasi InternBPS beroperasi secara offline pada database SQLite lokal Anda tanpa transmisi ke server luar.
            </p>
          </div>

        </div>
      </div>

      {/* Reset Confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Basis Data"
        message="Tindakan ini akan mengosongkan log dan tugas yang Anda buat saat ini, lalu mengisi ulang database dengan data contoh BPS awal. Lanjutkan?"
      />
    </div>
  );
}
