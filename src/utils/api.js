// API Client for InternBPS

const API_BASE = '/api';

async function fetchJSON(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Fetch Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Profile
  getProfile: () => fetchJSON('/profile'),
  updateProfile: (data) => fetchJSON('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Daily Logs
  getDailyLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`/daily-logs${query ? `?${query}` : ''}`);
  },
  createDailyLog: (data) => fetchJSON('/daily-logs', { method: 'POST', body: JSON.stringify(data) }),
  updateDailyLog: (id, data) => fetchJSON(`/daily-logs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDailyLog: (id) => fetchJSON(`/daily-logs/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => fetchJSON('/tasks'),
  createTask: (data) => fetchJSON('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => fetchJSON(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateTaskStatus: (id, status) => fetchJSON(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteTask: (id) => fetchJSON(`/tasks/${id}`, { method: 'DELETE' }),

  // Knowledge Base
  getKnowledge: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`/knowledge${query ? `?${query}` : ''}`);
  },
  createKnowledge: (data) => fetchJSON('/knowledge', { method: 'POST', body: JSON.stringify(data) }),
  updateKnowledge: (id, data) => fetchJSON(`/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteKnowledge: (id) => fetchJSON(`/knowledge/${id}`, { method: 'DELETE' }),

  // Documents
  getDocuments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`/documents${query ? `?${query}` : ''}`);
  },
  uploadDocument: async (formData) => {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload document');
    }
    return await res.json();
  },
  deleteDocument: (id) => fetchJSON(`/documents/${id}`, { method: 'DELETE' }),

  // Attendance (Presensi)
  getAttendance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`/attendance${query ? `?${query}` : ''}`);
  },
  getTodayAttendance: (date) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return fetchJSON(`/attendance/today${query}`);
  },
  clockIn: (data = {}) => fetchJSON('/attendance/clock-in', { method: 'POST', body: JSON.stringify(data) }),
  clockOut: (data = {}) => fetchJSON('/attendance/clock-out', { method: 'POST', body: JSON.stringify(data) }),
  createAttendance: (data) => fetchJSON('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  updateAttendance: (id, data) => fetchJSON(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAttendance: (id) => fetchJSON(`/attendance/${id}`, { method: 'DELETE' }),
  getAttendanceExcelUrl: (params = {}) => {
    const cleaned = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '' && val !== 'Semua') {
        cleaned[key] = val;
      }
    }
    const query = new URLSearchParams(cleaned).toString();
    return `${API_BASE}/export/attendance-excel${query ? `?${query}` : ''}`;
  },

  // Database Management
  getDbStats: () => fetchJSON('/db/stats'),
  resetSeedDb: () => fetchJSON('/db/seed-reset', { method: 'POST' }),
  getBackupUrl: () => `${API_BASE}/db/backup`,
  getExcelExportUrl: (params = {}) => {
    const cleaned = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '' && val !== 'Semua') {
        cleaned[key] = val;
      }
    }
    const query = new URLSearchParams(cleaned).toString();
    return `${API_BASE}/export/excel${query ? `?${query}` : ''}`;
  }
};
