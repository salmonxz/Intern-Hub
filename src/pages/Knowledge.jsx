import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  FileText, 
  CheckCircle2
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDateIndo } from '../utils/formatters';

export default function Knowledge({ 
  knowledgeList = [], 
  onSaveKnowledge, 
  onDeleteKnowledge 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedItem, setSelectedItem] = useState(knowledgeList[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const initialForm = {
    title: '',
    category: 'SOP BPS',
    tags: '',
    content: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      tags: item.tags || '',
      content: item.content
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveKnowledge({
      ...formData,
      id: editingItem ? editingItem.id : undefined
    });
    setIsModalOpen(false);
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Filter list
  const filteredList = useMemo(() => {
    return knowledgeList.filter(item => {
      const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchSearch = searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [knowledgeList, selectedCategory, searchTerm]);

  // Keep active item selected or default to first
  const activeArticle = useMemo(() => {
    if (selectedItem && knowledgeList.some(k => k.id === selectedItem.id)) {
      return knowledgeList.find(k => k.id === selectedItem.id);
    }
    return filteredList[0] || null;
  }, [selectedItem, knowledgeList, filteredList]);

  // Markdown renderer
  const renderMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeContent = [];
    let codeLanguage = '';
    const elements = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          const codeSnippet = codeContent.join('\n');
          elements.push(
            <div key={`code-${idx}`} style={{ position: 'relative', margin: '1.25rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1c1a18', padding: '0.45rem 1rem', borderRadius: '10px 10px 0 0', borderBottom: '1px solid #2f2a26' }}>
                <span className="mono-num" style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                  {codeLanguage || 'code'}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem', color: '#e8e3dc' }}
                  onClick={() => handleCopyText(codeSnippet, idx)}
                >
                  {copiedIndex === idx ? <Check size={13} style={{ color: '#22c55e' }} /> : <Copy size={13} />}
                  <span>{copiedIndex === idx ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>
              <pre style={{
                backgroundColor: '#141211',
                color: '#fdf6ea',
                padding: '1.15rem',
                borderRadius: '0 0 10px 10px',
                overflowX: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.865rem',
                lineHeight: '1.6',
                border: '1px solid #1c1a18',
                borderTop: 'none'
              }}>
                <code>{codeSnippet}</code>
              </pre>
            </div>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(<h4 key={idx} style={{ margin: '1.35rem 0 0.5rem', fontSize: '1.1rem', color: 'var(--text-heading)' }}>{line.replace('### ', '')}</h4>);
      } else if (line.startsWith('## ')) {
        elements.push(<h3 key={idx} style={{ margin: '1.65rem 0 0.75rem', fontSize: '1.3rem', color: 'var(--text-heading)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>{line.replace('## ', '')}</h3>);
      } else if (line.startsWith('# ')) {
        elements.push(<h2 key={idx} style={{ margin: '1.85rem 0 0.85rem', fontSize: '1.5rem', color: 'var(--text-heading)' }}>{line.replace('# ', '')}</h2>);
      } else if (line.startsWith('- ')) {
        elements.push(<li key={idx} style={{ marginLeft: '1.5rem', marginBottom: '0.4rem', color: 'var(--text-main)', fontSize: '0.925rem' }}>{line.replace('- ', '')}</li>);
      } else if (line.trim() === '') {
        elements.push(<div key={idx} style={{ height: '0.5rem' }} />);
      } else {
        elements.push(<p key={idx} style={{ marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '0.935rem', lineHeight: '1.65' }}>{line}</p>);
      }
    });

    return elements;
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            <BookOpen size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Knowledge Base & SOP BPS</span>
          </h1>
          <p className="page-subtitle">
            Katalog dokumentasi teknis, rumus Excel statistik, skrip koding R/Python, dan glosarium istilah Badan Pusat Statistik.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={15} />
          <span>+ Tambah Materi SOP</span>
        </button>
      </div>

      {/* Main Grid: Left List, Right Reader */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '1.75rem' }}>
        
        {/* Left Column: Search & Articles List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Search Box */}
          <div className="card" style={{ padding: '1rem' }}>
            <div className="navbar-search" style={{ width: '100%' }}>
              <Search size={15} className="navbar-search-icon" />
              <input
                type="text"
                className="navbar-search-input"
                placeholder="Cari SOP, rumus, koding..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
              {['Semua', 'SOP BPS', 'Script R/Python', 'Rumus Excel', 'Glosarium Statistik'].map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List of articles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {filteredList.length === 0 ? (
              <div className="empty-state card" style={{ padding: '2rem 1rem' }}>
                <BookOpen className="empty-icon" />
                <p>Tidak ada artikel yang sesuai</p>
              </div>
            ) : (
              filteredList.map((item) => {
                const isActive = activeArticle?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      padding: '1.15rem',
                      cursor: 'pointer',
                      borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-card)',
                      backgroundColor: isActive ? 'var(--bg-card-secondary)' : 'var(--bg-card)'
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                        {formatDateIndo(item.created_at)}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.35rem', lineHeight: '1.35' }}>
                      {item.title}
                    </h4>

                    {item.tags && (
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {item.tags.split(',').map((t, idx) => (
                          <span key={idx} className="badge badge-gray" style={{ fontSize: '0.675rem' }}>
                            #{t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Article Reader / Detail View */}
        <div className="card" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', padding: '2.25rem' }}>
          {activeArticle ? (
            <div>
              {/* Article Top Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.35rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-amber">{activeArticle.category}</span>
                    {activeArticle.tags && activeArticle.tags.split(',').map((t, i) => (
                      <span key={i} className="badge badge-gray">#{t.trim()}</span>
                    ))}
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                    {activeArticle.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(activeArticle)}>
                    <Edit3 size={13} /> <span>Edit Materi</span>
                  </button>
                  <button 
                    className="btn btn-ghost btn-icon btn-sm" 
                    onClick={() => setDeleteTargetId(activeArticle.id)}
                    style={{ color: 'var(--accent-rose)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Rendered Content */}
              <div style={{ color: 'var(--text-main)' }}>
                {renderMarkdown(activeArticle.content)}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ margin: 'auto' }}>
              <FileText className="empty-icon" />
              <p>Pilih salah satu materi di sebelah kiri untuk membaca</p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Dokumentasi Materi' : 'Buat Dokumentasi SOP Baru'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              <CheckCircle2 size={15} />
              <span>{editingItem ? 'Simpan Perubahan' : 'Terbitkan Materi'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Judul Materi / SOP</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: SOP Validasi Kuesioner Sakernas 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="SOP BPS">SOP BPS</option>
                <option value="Script R/Python">Script R/Python</option>
                <option value="Rumus Excel">Rumus Excel</option>
                <option value="Glosarium Statistik">Glosarium Statistik</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags / Kata Kunci (pisahkan koma)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Sakernas, Validasi, R, Excel"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Isi Konten (Mendukung Markdown & Code Blocks ```)</label>
            <textarea
              className="form-textarea mono-num"
              placeholder="Gunakan format Markdown: ## Judul, - List, ```r untuk code block..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) onDeleteKnowledge(deleteTargetId);
        }}
        title="Hapus Materi SOP"
        message="Apakah Anda yakin ingin menghapus materi dokumentasi ini?"
      />
    </div>
  );
}
