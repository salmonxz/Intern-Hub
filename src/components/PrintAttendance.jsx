import React from 'react';
import { formatDateIndo } from '../utils/formatters';
import { BpsEmblemSvg } from './PrintDocument';

export default function PrintAttendance({
  profile = {},
  attendances = [],
  layout = 'landscape', // 'landscape' | 'portrait'
  options = {
    showSignatures: true,
    showKpi: true
  },
  customPeriod = null
}) {
  const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Calculate stats
  let countHadir = 0;
  let countDinas = 0;
  let countIzin = 0;
  let countSakit = 0;
  let totalWorkHours = 0;

  attendances.forEach(item => {
    if (item.status && item.status.includes('Hadir')) countHadir++;
    else if (item.status === 'Dinas Luar' || item.status === 'Dinas Luar / Lapangan') countDinas++;
    else if (item.status === 'Izin') countIzin++;
    else if (item.status === 'Sakit') countSakit++;

    if (item.time_in && item.time_out) {
      const [h1, m1] = item.time_in.split(':').map(Number);
      const [h2, m2] = item.time_out.split(':').map(Number);
      if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
        const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diff > 0) {
          totalWorkHours += diff / 60;
        }
      }
    }
  });

  const totalRecords = attendances.length;
  const now = new Date();
  const printDateStr = formatDateIndo(now);

  const getDayName = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr + 'T00:00:00');
    return isNaN(d.getTime()) ? '-' : indonesianDays[d.getDay()];
  };

  const getDurationStr = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return '-';
    const [h1, m1] = timeIn.split(':').map(Number);
    const [h2, m2] = timeOut.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '-';
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff <= 0) return '-';
    return `${(diff / 60).toFixed(1)} Jam`;
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
              REKAPITULASI PRESENSI &amp; DAFTAR HADIR MAGANG MAHASISWA
            </div>
            <div className="doc-bps-inst-desc">
              Unit Penempatan: <strong>{profile?.division || 'Badan Pusat Statistik'}</strong>
            </div>
          </div>
        </div>

        <div className="doc-bps-header-right">
          <div><strong>FORMULIR: PRES-BPS-2026</strong></div>
          <div>Tanggal Cetak: {printDateStr}</div>
          <div>Status: Lembar Sah Kehadiran</div>
        </div>
      </div>

      {/* Judul Dokumen */}
      <div className="doc-bps-doc-title">
        DAFTAR KEHADIRAN &amp; PRESENSI MAGANG MAHASISWA
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
                <td className="doc-bps-meta-label">Periode Presensi</td>
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
            <div className="doc-bps-kpi-title">Kehadiran (WFO/WFH)</div>
            <div className="doc-bps-kpi-value" style={{ color: '#15803d' }}>{countHadir} Hari</div>
          </div>
          <div className="doc-bps-kpi-card">
            <div className="doc-bps-kpi-title">Dinas Luar / Lapangan</div>
            <div className="doc-bps-kpi-value" style={{ color: '#0284c7' }}>{countDinas} Hari</div>
          </div>
          <div className="doc-bps-kpi-card">
            <div className="doc-bps-kpi-title">Izin &amp; Sakit</div>
            <div className="doc-bps-kpi-value" style={{ color: '#b45309' }}>{countIzin + countSakit} Hari</div>
          </div>
          <div className="doc-bps-kpi-card">
            <div className="doc-bps-kpi-title">Total Akumulasi Jam</div>
            <div className="doc-bps-kpi-value">{totalWorkHours.toFixed(1)} Jam</div>
          </div>
        </div>
      )}

      {/* Tabel Presensi */}
      <table className="doc-bps-table">
        <thead>
          <tr>
            <th style={{ width: '32px' }}>No</th>
            <th style={{ width: layout === 'landscape' ? '120px' : '100px' }}>Hari / Tanggal</th>
            <th style={{ width: '80px' }}>Jam Datang</th>
            <th style={{ width: '80px' }}>Jam Pulang</th>
            <th style={{ width: '80px' }}>Durasi</th>
            <th style={{ width: layout === 'landscape' ? '130px' : '110px' }}>Status Kehadiran</th>
            <th style={{ width: layout === 'landscape' ? '140px' : '110px' }}>Lokasi Penugasan</th>
            <th>Keterangan / Catatan</th>
            <th style={{ width: '75px' }}>Paraf</th>
          </tr>
        </thead>
        <tbody>
          {attendances.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                Tidak ada data presensi pada periode atau filter yang dipilih.
              </td>
            </tr>
          ) : (
            attendances.map((item, idx) => (
              <tr key={item.id || idx}>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{getDayName(item.date)}</div>
                  <div style={{ fontSize: '7.5pt', color: '#64748b' }}>{formatDateIndo(item.date)}</div>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600, color: item.time_in ? '#0f172a' : '#94a3b8' }}>
                  {item.time_in || '-'}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600, color: item.time_out ? '#0f172a' : '#94a3b8' }}>
                  {item.time_out || '-'}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                  {getDurationStr(item.time_in, item.time_out)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={
                    item.status?.includes('Hadir') 
                      ? 'doc-bps-status-selesai' 
                      : item.status === 'Sakit' 
                        ? 'doc-bps-status-draft' 
                        : 'doc-bps-tag-category'
                  }>
                    {item.status || 'Hadir (WFO)'}
                  </span>
                </td>
                <td>{item.work_location || 'Kantor BPS'}</td>
                <td style={{ color: '#334155' }}>{item.notes || '-'}</td>
                <td style={{ textAlign: 'center', color: '#94a3b8' }}>
                  [ &nbsp; &nbsp; ]
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} style={{ textAlign: 'right', paddingRight: '1rem' }}>
              TOTAL AKUMULASI JAM PRESENSI:
            </td>
            <td style={{ textAlign: 'center', color: '#0f172a', fontSize: '9pt', fontWeight: 700 }}>
              {totalWorkHours.toFixed(1)}
            </td>
            <td colSpan={4} style={{ fontSize: '8pt', color: '#475569' }}>
              Total Catatan: {totalRecords} Hari (Hadir: {countHadir}, Lapangan: {countDinas}, Izin: {countIzin}, Sakit: {countSakit})
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
        <div>Dokumen Rekapitulasi Presensi &amp; Kehadiran Magang Mahasiswa di Lingkungan Badan Pusat Statistik</div>
        <div>Halaman 1 dari 1</div>
      </div>
    </div>
  );
}
