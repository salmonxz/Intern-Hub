import React, { useState, useMemo } from 'react';
import { 
  FolderOpen, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Search, 
  FileCheck,
  FileBadge
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDateIndo, formatFileSize } from '../utils/formatters';

export default function Documents({ 
  documents = [], 
  onUploadDocument, 
  onDeleteDocument 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Surat Tugas');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', selectedCategory);

    setUploading(true);
    try {
      await onUploadDocument(formData);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (err) {
      alert('Gagal mengunggah file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Filter list
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchCat = categoryFilter === 'Semua' || doc.category === categoryFilter;
      const matchSearch = searchTerm === '' || 
        doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [documents, categoryFilter, searchTerm]);

  // Document Icon helper
  const getDocIcon = (category) => {
    switch (category) {
      case 'Surat Tugas':
        return FileBadge;
      case 'SPTJB':
        return FileCheck;
      case 'Form Penilaian':
        return FileText;
      case 'Sertifikat':
        return FileBadge;
      default:
        return FileText;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            <FolderOpen size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Arsip Dokumen Magang BPS</span>
          </h1>
          <p className="page-subtitle">
            Katalog penyimpanan berkas fisik digital (Surat Pengantar, SPTJB, Surat Tugas, Form Penilaian, & Sertifikat).
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)}>
          <Upload size={15} />
          <span>+ Upload Dokumen</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '1rem 1.35rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div className="navbar-search" style={{ width: '100%', maxWidth: '320px' }}>
            <Search size={15} className="navbar-search-icon" />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Cari berkas dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Kategori:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Surat Tugas">Surat Tugas</option>
              <option value="SPTJB">SPTJB</option>
              <option value="Form Penilaian">Form Penilaian</option>
              <option value="Sertifikat">Sertifikat</option>
              <option value="Absensi Fisik">Absensi Fisik</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            <span className="badge badge-gray mono-num">
              {filteredDocs.length} Berkas
            </span>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.35rem' }}>
        {filteredDocs.length === 0 ? (
          <div className="card empty-state" style={{ gridColumn: '1 / -1', padding: '3.5rem 1rem' }}>
            <FolderOpen className="empty-icon" />
            <p>Belum ada berkas dokumen yang tersimpan</p>
            <button className="btn btn-primary btn-sm" onClick={() => setIsUploadModalOpen(true)}>
              Unggah Dokumen Pertama
            </button>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const Icon = getDocIcon(doc.category);
            return (
              <div 
                key={doc.id} 
                className="card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem', padding: '1.5rem' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-secondary)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                      <Icon size={20} />
                    </div>
                    <span className="badge badge-amber" style={{ fontSize: '0.725rem' }}>
                      {doc.category}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-heading)', lineHeight: '1.4', marginBottom: '0.4rem', wordBreak: 'break-word' }}>
                    {doc.original_name}
                  </h4>

                  <div style={{ display: 'flex', gap: '0.65rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <span className="mono-num">{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span className="mono-num">{formatDateIndo(doc.created_at)}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPreviewDoc(doc)}
                    title="Pratinjau Dokumen"
                  >
                    <Eye size={13} /> <span>Lihat</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <a 
                      href={doc.file_path} 
                      download={doc.original_name} 
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Unduh Berkas"
                    >
                      <Download size={14} />
                    </a>
                    <button 
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => setDeleteTargetId(doc.id)}
                      style={{ color: 'var(--accent-rose)' }}
                      title="Hapus Berkas"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Berkas Magang Baru"
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleUploadSubmit} disabled={!selectedFile || uploading}>
              <Upload size={15} />
              <span>{uploading ? 'Mengunggah...' : 'Upload Dokumen'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit}>
          <div className="form-group">
            <label className="form-label">Kategori Berkas</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Surat Tugas">Surat Tugas Magang BPS</option>
              <option value="SPTJB">SPTJB / Surat Tanggung Jawab</option>
              <option value="Form Penilaian">Form Penilaian Pembimbing Lapangan</option>
              <option value="Sertifikat">Sertifikat Magang</option>
              <option value="Absensi Fisik">Absensi Fisik / Presensi Manual</option>
              <option value="Laporan Mingguan">Laporan Mingguan / Catatan Teknis</option>
              <option value="Lainnya">Dokumen Lainnya</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pilih File (PDF, DOCX, XLSX, PNG, JPG)</label>
            <div style={{
              border: '2px dashed var(--border-accent)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.25rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-card-secondary)',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                id="file-upload-input"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
              />
              <label htmlFor="file-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                <Upload size={32} style={{ color: 'var(--accent-gold)' }} />
                <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.925rem' }}>
                  {selectedFile ? selectedFile.name : 'Klik untuk memilih berkas dari komputer'}
                </div>
                <div style={{ fontSize: '0.785rem', color: 'var(--text-dim)' }}>
                  Mendukung berkas hingga 25MB
                </div>
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewDoc(null)}
          title={`Pratinjau: ${previewDoc.original_name}`}
          size="xl"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span className="badge badge-amber">{previewDoc.category} • {formatFileSize(previewDoc.file_size)}</span>
              <a href={previewDoc.file_path} download={previewDoc.original_name} className="btn btn-primary btn-sm">
                <Download size={13} /> <span>Unduh Berkas</span>
              </a>
            </div>
          }
        >
          <div style={{ minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            {previewDoc.file_type?.includes('image') ? (
              <img 
                src={previewDoc.file_path} 
                alt={previewDoc.original_name} 
                style={{ maxWidth: '100%', maxHeight: '580px', objectFit: 'contain' }}
              />
            ) : (
              <iframe
                src={previewDoc.file_path}
                title={previewDoc.original_name}
                style={{ width: '100%', height: '540px', border: 'none', borderRadius: 'var(--radius-md)' }}
              />
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) onDeleteDocument(deleteTargetId);
        }}
        title="Hapus Dokumen"
        message="Apakah Anda yakin ingin menghapus berkas ini dari direktori lokal?"
      />
    </div>
  );
}
