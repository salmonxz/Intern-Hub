import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Check, 
  Eye, 
  Sparkles, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import Modal from './Modal';
import PrintDocument from './PrintDocument';
import { api } from '../utils/api';

export default function ExportModal({
  isOpen,
  onClose,
  profile,
  allLogs = [],
  filteredLogs = [],
  attendances = [],
  currentFilters = {}
}) {
  const [activeFormat, setActiveFormat] = useState('pdf'); // 'pdf' | 'excel'
  const [scope, setScope] = useState('filtered'); // 'filtered' | 'all'
  const [layout, setLayout] = useState('landscape'); // 'landscape' | 'portrait'
  const [showOutput, setShowOutput] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [showKpi, setShowKpi] = useState(true);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  // Selected dataset based on scope
  const targetLogs = useMemo(() => {
    return scope === 'filtered' ? filteredLogs : allLogs;
  }, [scope, filteredLogs, allLogs]);

  // Handle Excel Export Download
  const handleDownloadExcel = () => {
    let params = {};
    if (scope === 'filtered') {
      if (currentFilters.startDate) params.startDate = currentFilters.startDate;
      if (currentFilters.endDate) params.endDate = currentFilters.endDate;
      if (currentFilters.category && currentFilters.category !== 'Semua') params.category = currentFilters.category;
      if (currentFilters.status && currentFilters.status !== 'Semua') params.status = currentFilters.status;
      if (currentFilters.search) params.search = currentFilters.search;
    }

    const url = api.getExcelExportUrl(params);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Logbook_BPS_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle PDF Print / Save to PDF
  const handlePrintPdf = () => {
    // Open isolated clean print window
    const printWindow = window.open('', '_blank', 'width=1120,height=850');
    if (!printWindow) {
      // If popup blocker intervened, fallback to native window print
      window.print();
      return;
    }

    const previewElement = document.getElementById('export-modal-preview-doc');
    const docHtml = previewElement ? previewElement.innerHTML : '';

    const printHtml = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>Logbook_Magang_BPS_${(profile?.full_name || 'Mahasiswa').replace(/\s+/g, '_')}</title>
          <style>
            @page {
              size: A4 ${layout};
              margin: 10mm 12mm 10mm 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 9pt;
              line-height: 1.35;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .document-preview-paper {
              width: 100% !important;
              max-width: 100% !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .doc-bps-header {
              border-bottom: 3px double #0f172a;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .doc-bps-header-left {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .doc-bps-logo-svg {
              width: 48px;
              height: 48px;
            }
            .doc-bps-inst-title {
              font-size: 13.5pt;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: 0.04em;
              text-transform: uppercase;
              line-height: 1.15;
            }
            .doc-bps-inst-sub {
              font-size: 9pt;
              font-weight: 700;
              color: #334155;
              letter-spacing: 0.02em;
              text-transform: uppercase;
              margin-top: 2px;
            }
            .doc-bps-inst-desc {
              font-size: 8pt;
              color: #64748b;
              margin-top: 1px;
            }
            .doc-bps-header-right {
              text-align: right;
              font-size: 8pt;
              color: #475569;
              line-height: 1.4;
            }
            .doc-bps-doc-title {
              text-align: center;
              font-size: 11.5pt;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: #0f172a;
              margin: 10px 0 16px;
              padding: 5px 0;
              border-top: 1px solid #cbd5e1;
              border-bottom: 1px solid #cbd5e1;
            }
            .doc-bps-meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 24px;
              margin-bottom: 14px;
              font-size: 8.75pt;
              background-color: #f8fafc;
              padding: 10px 14px;
              border: 1px solid #e2e8f0;
              border-radius: 4px;
            }
            .doc-bps-meta-table {
              width: 100%;
              border-collapse: collapse;
            }
            .doc-bps-meta-table td {
              padding: 2px 0;
              vertical-align: top;
            }
            .doc-bps-meta-label {
              width: 135px;
              color: #475569;
              font-weight: 600;
            }
            .doc-bps-meta-val {
              color: #0f172a;
              font-weight: 500;
            }
            .doc-bps-kpi-row {
              display: flex;
              gap: 10px;
              margin-bottom: 14px;
            }
            .doc-bps-kpi-card {
              flex: 1;
              border: 1px solid #cbd5e1;
              border-radius: 4px;
              padding: 6px 10px;
              text-align: center;
              background: #ffffff;
            }
            .doc-bps-kpi-title {
              font-size: 7pt;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 700;
              color: #64748b;
            }
            .doc-bps-kpi-value {
              font-size: 11pt;
              font-weight: 800;
              color: #0f172a;
              margin-top: 1px;
            }
            .doc-bps-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 6px;
              font-size: 8.5pt;
            }
            .doc-bps-table th {
              background-color: #f1f5f9 !important;
              color: #0f172a !important;
              font-weight: 700;
              text-align: center;
              border: 1px solid #94a3b8 !important;
              padding: 6px 6px;
              font-size: 8pt;
              text-transform: uppercase;
            }
            .doc-bps-table td {
              border: 1px solid #cbd5e1 !important;
              padding: 6px 7px;
              color: #1e293b !important;
              vertical-align: top;
              line-height: 1.4;
            }
            .doc-bps-table tr:nth-child(even) td {
              background-color: #fafbfd;
            }
            .doc-bps-table tfoot td {
              background-color: #f1f5f9 !important;
              font-weight: 800;
              border-top: 2px solid #0f172a !important;
              border-bottom: 2px solid #0f172a !important;
            }
            .doc-bps-output-box {
              margin-top: 4px;
              font-size: 7.75pt;
              font-weight: 600;
              color: #047857;
              background: #ecfdf5;
              padding: 3px 6px;
              border-radius: 3px;
              border-left: 2.5px solid #059669;
            }
            .doc-bps-tag-category {
              display: inline-block;
              font-size: 7.25pt;
              font-weight: 600;
              padding: 1px 5px;
              background-color: #e0f2fe;
              color: #0369a1;
              border-radius: 3px;
              border: 1px solid #bae6fd;
            }
            .doc-bps-status-selesai {
              font-weight: 700;
              color: #15803d;
            }
            .doc-bps-status-draft {
              font-weight: 700;
              color: #b45309;
            }
            .doc-bps-signature-section {
              margin-top: 26px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 32px;
              page-break-inside: avoid;
            }
            .doc-bps-signature-box {
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .doc-bps-signature-space {
              height: 55px;
            }
            .doc-bps-signature-name {
              font-weight: 800;
              font-size: 9.5pt;
              color: #0f172a;
              text-decoration: underline;
            }
            .doc-bps-doc-footer {
              margin-top: 22px;
              padding-top: 8px;
              border-top: 1px dashed #cbd5e1;
              font-size: 7pt;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
            }
            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${docHtml}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ekspor & Cetak Logbook Magang"
      size="xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Jumlah data diekspor: <strong className="mono-num" style={{ color: 'var(--text-heading)' }}>{targetLogs.length} Catatan Kegiatan</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Tutup
            </button>

            {activeFormat === 'pdf' ? (
              <button className="btn btn-primary" onClick={handlePrintPdf}>
                <Printer size={15} />
                <span>Cetak / Simpan PDF</span>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleDownloadExcel}>
                <Download size={15} />
                <span>Unduh Berkas Excel (.xlsx)</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Format Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          <div 
            onClick={() => setActiveFormat('pdf')}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: activeFormat === 'pdf' ? '2px solid var(--accent-primary)' : '1px solid var(--border-card)',
              backgroundColor: activeFormat === 'pdf' ? 'var(--bg-card-secondary)' : 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeFormat === 'pdf' ? 'var(--accent-primary)' : 'var(--bg-subtle)',
              color: activeFormat === 'pdf' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                📄 Dokumen PDF (Siap Cetak / Simpan)
              </div>
              <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Format resmi lembar logbook Badan Pusat Statistik (BPS) siap tanda tangan.
              </div>
            </div>
          </div>

          <div 
            onClick={() => setActiveFormat('excel')}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: activeFormat === 'excel' ? '2px solid var(--accent-primary)' : '1px solid var(--border-card)',
              backgroundColor: activeFormat === 'excel' ? 'var(--bg-card-secondary)' : 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeFormat === 'excel' ? 'var(--accent-emerald)' : 'var(--bg-subtle)',
              color: activeFormat === 'excel' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                📊 Spreadsheet Excel (.xlsx)
              </div>
              <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Kolom terpisah rapi, autofilter, formula total jam, dan kop surat terstruktur.
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Scope Selection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                Cakupan Data:
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${scope === 'filtered' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setScope('filtered')}
                  title="Ekspor hanya data yang cocok dengan pencarian dan filter saat ini"
                >
                  <Check size={13} style={{ display: scope === 'filtered' ? 'inline' : 'none' }} />
                  <span>Filter Aktif ({filteredLogs.length})</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${scope === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setScope('all')}
                  title="Ekspor seluruh data logbook magang tanpa filter"
                >
                  <Check size={13} style={{ display: scope === 'all' ? 'inline' : 'none' }} />
                  <span>Semua Data ({allLogs.length})</span>
                </button>
              </div>
            </div>

            {/* Layout Orientation (for PDF) */}
            {activeFormat === 'pdf' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                  Tata Letak Kertas:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${layout === 'landscape' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setLayout('landscape')}
                  >
                    <span>Landscape (Mendatar)</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${layout === 'portrait' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setLayout('portrait')}
                  >
                    <span>Portrait (Tegak)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Additional Options for PDF */}
          {activeFormat === 'pdf' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={showOutput} 
                  onChange={(e) => setShowOutput(e.target.checked)} 
                />
                <span>Sertakan rincian output pekerjaan</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={showSignatures} 
                  onChange={(e) => setShowSignatures(e.target.checked)} 
                />
                <span>Sertakan tanda tangan Mahasiswa &amp; Pembimbing</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={showKpi} 
                  onChange={(e) => setShowKpi(e.target.checked)} 
                />
                <span>Sertakan kotak ringkasan jam kerja</span>
              </label>
            </div>
          )}
        </div>

        {/* Content Preview based on Active Format */}
        {activeFormat === 'pdf' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                Pratinjau Dokumen Cetak (WYSIWYG Standar BPS):
              </span>
              <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                Ukuran Kertas: A4 ({layout === 'landscape' ? 'Mendatar 297x210mm' : 'Tegak 210x297mm'})
              </span>
            </div>

            <div className="document-preview-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <div id="export-modal-preview-doc">
                <PrintDocument
                  profile={profile}
                  logs={targetLogs}
                  attendances={attendances}
                  layout={layout}
                  options={{
                    showOutput,
                    showSignatures,
                    showKpi
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-card)' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <FileSpreadsheet size={32} />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
              Buku Catatan Logbook Format Microsoft Excel (.xlsx)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '540px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
              Berkas spreadsheet diunduh dengan struktur kolom resmi BPS: Hari, Tanggal, Judul Aktivitas, Kategori, Uraian Lengkap, Kolom Output Terpisah, Jam Kerja dengan Formula Auto-Sum, dan Kolom Paraf Pembimbing.
            </p>

            <div style={{ display: 'inline-flex', gap: '0.75rem', padding: '0.75rem 1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
              <div style={{ fontSize: '0.825rem' }}>
                <div>✓ <strong>Kop Surat Dinas BPS</strong> (Title Merge Baris 1-3)</div>
                <div>✓ <strong>AutoFilter Aktif</strong> (Header tabel siap sort &amp; filter)</div>
              </div>
              <div style={{ fontSize: '0.825rem' }}>
                <div>✓ <strong>Kolom Output Khusus</strong> (Mudah dievaluasi pembimbing)</div>
                <div>✓ <strong>Formula Otomatis Total Jam</strong> (=SUM baris jam kerja)</div>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem' }}>
              <button className="btn btn-primary" onClick={handleDownloadExcel} style={{ padding: '0.7rem 1.75rem', fontSize: '0.95rem' }}>
                <Download size={16} />
                <span>Unduh Berkas Excel ({targetLogs.length} Catatan)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
