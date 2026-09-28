import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  CheckSquare, 
  Clock, 
  Tag, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  List, 
  Columns, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDateIndo, getPriorityBadgeClass } from '../utils/formatters';

export default function Tasks({ 
  tasks = [], 
  onSaveTask, 
  onUpdateTaskStatus, 
  onDeleteTask 
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const initialTaskForm = {
    title: '',
    description: '',
    priority: 'Medium',
    due_date: '',
    status: 'Todo',
    tags: ''
  };

  const [formData, setFormData] = useState(initialTaskForm);

  const openCreateModal = (defaultStatus = 'Todo') => {
    setSelectedTask(null);
    setFormData({ ...initialTaskForm, status: defaultStatus });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? task.due_date.replace(' ', 'T').slice(0, 16) : '',
      status: task.status,
      tags: task.tags || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveTask({
      ...formData,
      id: selectedTask ? selectedTask.id : undefined
    });
    setIsModalOpen(false);
  };

  // Group tasks by status for Kanban
  const kanbanColumns = useMemo(() => {
    return {
      'Todo': tasks.filter(t => t.status === 'Todo'),
      'In Progress': tasks.filter(t => t.status === 'In Progress'),
      'Completed': tasks.filter(t => t.status === 'Completed')
    };
  }, [tasks]);

  // Helper to check deadline urgency
  const getDeadlineStatus = (dueDateStr) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 3600);

    if (diffHours < 0) {
      return { text: 'Terlewat', class: 'badge-rose' };
    } else if (diffHours <= 24) {
      return { text: 'Hari Ini', class: 'badge-rose' };
    } else if (diffHours <= 72) {
      return { text: 'Segera (H-3)', class: 'badge-amber' };
    }
    return { text: formatDateIndo(dueDateStr), class: 'badge-gray' };
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            <CheckSquare size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Manajemen Tugas & Proyek</span>
          </h1>
          <p className="page-subtitle">
            Lacak penugasan kerja dari pembimbing lapangan, pantau tenggat waktu, dan kelola alur kerja magang.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-sm)' }}>
            <button 
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board"
            >
              <Columns size={14} />
              <span>Kanban</span>
            </button>
            <button 
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('list')}
              title="Checklist View"
            >
              <List size={14} />
              <span>Daftar</span>
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => openCreateModal('Todo')}>
            <Plus size={15} />
            <span>+ Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="kanban-grid">
          {/* Column: To Do */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span className="pulse-dot pulse-amber"></span>
                <span>Belum Dimulai (To Do)</span>
              </div>
              <span className="badge badge-gray mono-num">{kanbanColumns['Todo'].length}</span>
            </div>

            <div className="kanban-cards-list">
              {kanbanColumns['Todo'].map((task) => (
                <div key={task.id} className="kanban-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h4 className="kanban-card-title">{task.title}</h4>
                    <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className="kanban-card-desc">{task.description}</p>
                  )}

                  {task.tags && (
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {task.tags.split(',').map((tag, i) => (
                        <span key={i} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="kanban-card-footer">
                    {task.due_date ? (
                      <span className={`badge ${getDeadlineStatus(task.due_date)?.class}`}>
                        <Clock size={11} />
                        <span>{getDeadlineStatus(task.due_date)?.text}</span>
                      </span>
                    ) : <span />}

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => openEditModal(task)}
                        title="Edit Tugas"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setDeleteTargetId(task.id)}
                        style={{ color: 'var(--accent-rose)' }}
                        title="Hapus Tugas"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
                        onClick={() => onUpdateTaskStatus(task.id, 'In Progress')}
                        title="Mulai Pengerjaan"
                      >
                        Mulai <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                className="btn btn-ghost" 
                style={{ border: '1px dashed var(--border-accent)', width: '100%', justifyContent: 'center' }}
                onClick={() => openCreateModal('Todo')}
              >
                <Plus size={14} /> <span>Tambah Tugas</span>
              </button>
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span className="pulse-dot pulse-amber"></span>
                <span>Sedang Dikerjakan</span>
              </div>
              <span className="badge badge-amber mono-num">{kanbanColumns['In Progress'].length}</span>
            </div>

            <div className="kanban-cards-list">
              {kanbanColumns['In Progress'].map((task) => (
                <div key={task.id} className="kanban-card" style={{ borderColor: 'var(--border-card-hover)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h4 className="kanban-card-title">{task.title}</h4>
                    <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className="kanban-card-desc">{task.description}</p>
                  )}

                  {task.tags && (
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {task.tags.split(',').map((tag, i) => (
                        <span key={i} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="kanban-card-footer">
                    {task.due_date ? (
                      <span className={`badge ${getDeadlineStatus(task.due_date)?.class}`}>
                        <Clock size={11} />
                        <span>{getDeadlineStatus(task.due_date)?.text}</span>
                      </span>
                    ) : <span />}

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => openEditModal(task)}
                        title="Edit Tugas"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        className="btn btn-success btn-sm"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => onUpdateTaskStatus(task.id, 'Completed')}
                        title="Tandai Selesai"
                      >
                        <CheckCircle2 size={12} /> Selesai
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                className="btn btn-ghost" 
                style={{ border: '1px dashed var(--border-accent)', width: '100%', justifyContent: 'center' }}
                onClick={() => openCreateModal('In Progress')}
              >
                <Plus size={14} /> <span>Tambah Tugas</span>
              </button>
            </div>
          </div>

          {/* Column: Completed */}
          <div className="kanban-column">
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span className="pulse-dot pulse-green"></span>
                <span>Selesai (Completed)</span>
              </div>
              <span className="badge badge-green mono-num">{kanbanColumns['Completed'].length}</span>
            </div>

            <div className="kanban-cards-list">
              {kanbanColumns['Completed'].map((task) => (
                <div key={task.id} className="kanban-card" style={{ opacity: 0.85, backgroundColor: 'var(--bg-card-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h4 className="kanban-card-title" style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                      {task.title}
                    </h4>
                    <span className="badge badge-green">Done</span>
                  </div>

                  {task.description && (
                    <p className="kanban-card-desc">{task.description}</p>
                  )}

                  <div className="kanban-card-footer">
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-sage)', fontWeight: 600 }}>
                      ✓ Selesai
                    </span>

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                        onClick={() => onUpdateTaskStatus(task.id, 'In Progress')}
                        title="Buka Kembali"
                      >
                        <ArrowLeft size={11} /> Buka lagi
                      </button>
                      <button 
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setDeleteTargetId(task.id)}
                        style={{ color: 'var(--accent-rose)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checklist / Table View */}
      {viewMode === 'list' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Status</th>
                <th>Judul Tugas & Rincian</th>
                <th style={{ width: '130px' }}>Prioritas</th>
                <th style={{ width: '160px' }}>Tenggat Waktu</th>
                <th style={{ width: '140px' }}>Label/Tags</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const isDone = task.status === 'Completed';
                return (
                  <tr key={task.id} style={{ opacity: isDone ? 0.75 : 1 }}>
                    <td>
                      <input 
                        type="checkbox"
                        checked={isDone}
                        onChange={() => onUpdateTaskStatus(task.id, isDone ? 'Todo' : 'Completed')}
                        style={{ width: 17, height: 17, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                      />
                    </td>
                    <td>
                      <strong style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text-heading)' }}>
                        {task.title}
                      </strong>
                      {task.description && (
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      {task.due_date ? (
                        <span className={`badge ${getDeadlineStatus(task.due_date)?.class}`}>
                          {getDeadlineStatus(task.due_date)?.text}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      {task.tags ? (
                        <span className="badge badge-gray">{task.tags}</span>
                      ) : '-'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => openEditModal(task)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setDeleteTargetId(task.id)}
                          style={{ color: 'var(--accent-rose)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTask ? 'Edit Penugasan' : 'Buat Penugasan Baru'}
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              <CheckCircle2 size={15} />
              <span>{selectedTask ? 'Simpan Perubahan' : 'Tambahkan Tugas'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama / Judul Tugas</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Selesaikan Cleaning Batch 2 Sakernas"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tingkat Prioritas</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="High">High (Prioritas Utama)</option>
                <option value="Medium">Medium (Standar)</option>
                <option value="Low">Low (Fleksibel)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status Alur</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Todo">To Do (Belum)</option>
                <option value="In Progress">In Progress (Sedang)</option>
                <option value="Completed">Completed (Selesai)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tenggat Waktu (Deadline)</label>
              <input
                type="datetime-local"
                className="form-input mono-num"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Label / Tags (pisahkan koma)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Pengolahan, Sakernas, DDA"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Catatan & Rincian Instruksi Tugas</label>
            <textarea
              className="form-textarea"
              placeholder="Instruksi khusus dari pembimbing lapangan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) onDeleteTask(deleteTargetId);
        }}
        title="Hapus Penugasan"
        message="Apakah Anda yakin ingin menghapus catatan tugas ini?"
      />
    </div>
  );
}
