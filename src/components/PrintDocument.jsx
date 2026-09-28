import React from 'react';
import { formatDateIndo } from '../utils/formatters';

export function BpsEmblemSvg({ size = 48, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Official BPS Colors: Blue #0284c7, Emerald #059669, Amber #d97706 */}
      <circle cx="50" cy="50" r="48" fill="#181513" stroke="#b45309" strokeWidth="2.5" />
      {/* Geometric BPS Data Diamond Nodes */}
      <path d="M50 18 L76 34 L76 66 L50 82 L24 66 L24 34 Z" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.4" />
      <polygon points="50,22 72,35 50,48 28,35" fill="#0284c7" />
      <polygon points="50,48 72,35 72,62 50,75" fill="#059669" />
      <polygon points="50,48 28,35 28,62 50,75" fill="#d97706" />
      {/* Central BPS Inset typography */}
      <circle cx="50" cy="50" r="14" fill="#181513" />
      <text x="50" y="54" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">BPS</text>
    </svg>
  );
}

export default function PrintDocument({
  profile = {},
  logs = [],
  attendances = [],
  layout = 'landscape', // 'landscape' | 'portrait'
  options = {
    showOutput: true,
    showSignatures: true,
    showKpi: true
  },
  customPeriod = null
}) {
  const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Calculate stats
  const totalHours = logs.reduce((acc, curr) => acc + (Number(curr.hours_spent) || 0), 0);
  const totalDays = logs.length;
  const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : '0.0';
  const completedCount = logs.filter(l => l.status === 'Selesai').length;

  const now = new Date();
  const printDateStr = formatDateIndo(now);

  const getDayName = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr + 'T00:00:00');
    return isNaN(d.getTime()) ? '-' : indonesianDays[d.getDay()];
  };

  return (
    <div className={`document-preview-paper layout-${layout}`}>
      {/* Kop Surat Dinas BPS */}
      <div className="doc-bps-header">
        <div className="doc-bps-header-left">
          <BpsEmblemSvg size={layout === 'landscape' ? 52 : 46} className="doc-bps-logo-svg" />
          <div>
            <div className="doc-bps-inst-title">BADAN PUSAT STATISTIK</div>
            <div className="doc-bps-inst-sub">
              REKAPITULASI AKTIVITAS &amp; LOGBOOK HARIAN MAGANG MAHASISWA
            </div>
            <div className="doc-bps-inst-desc">
              Penempatan: <strong>{profile?.division || 'Badan Pusat Statistik'}</strong>
            </div>
          </div>
        </div>

        <div className="doc-bps-header-right">
          <div><strong>FORMULIR: LK-BPS-2026</strong></div>
          <div>Tanggal Unduh: {printDateStr}</div>
          <div>Status: Lembar Sah Magang</div>
        </div>
      </div>

      {/* Judul Dokumen */}
      <div className="doc-bps-doc-title">
        BUKU CATATAN KEGIATAN HARIAN (DAILY LOGBOOK MAGANG)
      </div>

      {/* Identitas Mahasiswa & Pembimbing */}
      <div className="doc-bps-meta-grid">
        <div>
          <table className="doc-bps-meta-table">
            <tbody>
              <tr>
                <td className="doc-bps-meta-label">Nama Mahasiswa</td>
                <td className="doc-bps-meta-val">: <strong>{profile?.full_name || '-'}</strong></td>
              </tr>
              <tr>
                <td className="doc-bps-meta-label">NIM</td>
                <td className="doc-bps-meta-val">: {profile?.nim || '-'}</td>
              </tr>
              <tr>
                <td className="doc-bps-meta-label">Universitas / Prodi</td>
                <td className="doc-bps-meta-val">: {profile?.university || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <table className="doc-bps-meta-table">
            <tbody>
              <tr>
                <td className="doc-bps-meta-label">Pembimbing Lapangan</td>
                <td className="doc-bps-meta-val">: <strong>{profile?.mentor_name || '-'}</strong></td>
              </tr>
              <tr>
                <td className="doc-bps-meta-label">NIP Pembimbing</td>
                <td className="doc-bps-meta-val">: {profile?.mentor_nip || '-'}</td>
              </tr>
              <tr>
                <td className="doc-bps-meta-label">Periode Magang</td>
                <td className="doc-bps-meta-val">
                  : {customPeriod || `${formatDateIndo(profile?.start_date)} s.d ${formatDateIndo(profile?.end_date)}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {options.showKpi && (
        <div className="doc-bps-kpi-row">
          <div className="doc-bps-kpi-card">
            <div className="doc-bps-kpi-title">Total Entri Kegiatan</div>
            <div className="doc-bps-kpi-value">{totalDays} Log</div>
          </div>
          <div className="doc-bps-kpi-card">
            <div className="doc-bps-kpi-title">Akumulasi Jam Kerja</div>
            <div className="doc-bps-kpi-value" style={{ color: '#b45309' }}>{totalHours.toFixed(1)} Jam</div>
          </div>
          <div className="doc-bps-kpi-card">
            <div className="doc-bps-kpi-title">Rata-rata Jam / Hari</div>
            <div className="doc-bps-kpi-value">{avgHours} Jam</div>
          </div>
          <div className="doc-bps-kpi-card">
            <div className="doc-bps-kpi-title">Kegiatan Selesai</div>
            <div className="doc-bps-kpi-value" style={{ color: '#15803d' }}>{completedCount} / {totalDays}</div>
          </div>
        </div>
      )}

      {/* Tabel Rincian Aktivitas */}
      <table className="doc-bps-table">
        <thead>
          <tr>
            <th style={{ width: '32px' }}>No</th>
            <th style={{ width: layout === 'landscape' ? '110px' : '90px' }}>Hari / Tgl</th>
            <th style={{ width: layout === 'landscape' ? '180px' : '150px' }}>Judul Aktivitas</th>
            <th style={{ width: layout === 'landscape' ? '130px' : '110px' }}>Kategori BPS</th>
            <th>Uraian Pekerjaan, Metode &amp; Hasil</th>
            <th style={{ width: '55px' }}>Jam</th>
            <th style={{ width: '65px' }}>Status</th>
            <th style={{ width: layout === 'landscape' ? '125px' : '105px' }}>Presensi Kehadiran</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                Tidak ada data aktivitas harian pada periode atau filter yang dipilih.
              </td>
            </tr>
          ) : (
            logs.map((item, idx) => {
              const att = attendances.find(a => a.date === item.date);
              return (
                <tr key={item.id || idx}>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{getDayName(item.date)}</div>
                    <div style={{ fontSize: '7.5pt', color: '#64748b' }}>{formatDateIndo(item.date)}</div>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.title}</strong>
                  </td>
                  <td>
                    <span className="doc-bps-tag-category">{item.category}</span>
                  </td>
                  <td>
                    <div style={{ color: '#334155', whiteSpace: 'pre-line' }}>{item.description}</div>
                    {options.showOutput && item.output && (
                      <div className="doc-bps-output-box">
                        <strong>[Output]:</strong> {item.output}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    {item.hours_spent}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={item.status === 'Selesai' ? 'doc-bps-status-selesai' : 'doc-bps-status-draft'}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    {att ? (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '7.5pt', color: '#15803d' }}>
                          {att.status || 'Hadir (WFO)'}
                        </div>
                        <div style={{ fontSize: '7pt', color: '#475569', fontFamily: 'monospace', marginTop: '1px' }}>
                          {att.time_in && att.time_out ? `${att.time_in} - ${att.time_out}` : (att.time_in || '-')}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '8pt' }}>-</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} style={{ textAlign: 'right', paddingRight: '1rem' }}>
              TOTAL AKUMULASI JAM KERJA:
            </td>
            <td style={{ textAlign: 'center', color: '#0f172a', fontSize: '9pt' }}>
              {totalHours.toFixed(1)}
            </td>
            <td style={{ textAlign: 'center' }}>JAM</td>
            <td style={{ textAlign: 'center', fontSize: '7.5pt', color: '#15803d', fontWeight: 600 }}>
              {logs.length > 0 ? 'Terverifikasi' : '-'}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Dual Signatures Section */}
      {options.showSignatures && (
        <div className="doc-bps-signature-section">
          <div className="doc-bps-signature-box">
            <div style={{ color: '#475569', fontSize: '8pt' }}>Mengetahui,</div>
            <div style={{ fontWeight: 700, fontSize: '9pt', color: '#0f172a' }}>Mahasiswa Magang</div>
            <div className="doc-bps-signature-space"></div>
            <div className="doc-bps-signature-name">{profile?.full_name || 'Nama Mahasiswa'}</div>
            <div style={{ fontSize: '7.5pt', color: '#64748b' }}>
              NIM. {profile?.nim || '------------------'}
            </div>
          </div>

          <div className="doc-bps-signature-box">
            <div style={{ color: '#475569', fontSize: '8pt' }}>Disetujui oleh,</div>
            <div style={{ fontWeight: 700, fontSize: '9pt', color: '#0f172a' }}>Pembimbing Lapangan BPS</div>
            <div className="doc-bps-signature-space"></div>
            <div className="doc-bps-signature-name">{profile?.mentor_name || 'Nama Pembimbing'}</div>
            <div style={{ fontSize: '7.5pt', color: '#64748b' }}>
              NIP. {profile?.mentor_nip || '------------------'}
            </div>
          </div>
        </div>
      )}

      {/* Footer Legal */}
      <div className="doc-bps-doc-footer">
        <div>Dokumen Rekapitulasi Kegiatan Magang Mahasiswa di Lingkungan Badan Pusat Statistik</div>
        <div>Halaman 1 dari 1</div>
      </div>
    </div>
  );
}
