// Date and string formatters for InternBPS

export function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

export function formatDateLong(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

export function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '-';
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateTimeStr;
  }
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Pengolahan Data':
    case 'Pengolahan':
      return 'badge-blue';
    case 'Survei Lapangan':
    case 'Survei & Lapangan':
      return 'badge-green';
    case 'Analisis & Tabulasi':
    case 'Analisis':
      return 'badge-purple';
    case 'IT & Diseminasi':
    case 'IT & Admin':
    case 'IT/Admin':
      return 'badge-amber';
    default:
      return 'badge-gray';
  }
}

export function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'High':
    case 'Tinggi':
      return 'badge-rose';
    case 'Medium':
    case 'Sedang':
      return 'badge-amber';
    case 'Low':
    case 'Rendah':
      return 'badge-blue';
    default:
      return 'badge-gray';
  }
}

export function calculateDaysBetween(startDate, endDate) {
  if (!startDate || !endDate) return { totalDays: 0, daysPassed: 0, daysRemaining: 0, percentPassed: 0 };
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  const totalTime = end.getTime() - start.getTime();
  const totalDays = Math.max(1, Math.ceil(totalTime / (1000 * 3600 * 24)));

  const passedTime = Math.max(0, today.getTime() - start.getTime());
  const daysPassed = Math.min(totalDays, Math.ceil(passedTime / (1000 * 3600 * 24)));
  const daysRemaining = Math.max(0, totalDays - daysPassed);
  const percentPassed = Math.min(100, Math.round((daysPassed / totalDays) * 100));

  return { totalDays, daysPassed, daysRemaining, percentPassed };
}

export function getAttendanceBadgeClass(status) {
  switch (status) {
    case 'Hadir (WFO)':
      return 'badge-green';
    case 'Hadir (WFH)':
      return 'badge-blue';
    case 'Dinas Luar':
    case 'Dinas Luar / Lapangan':
      return 'badge-amber';
    case 'Sakit':
      return 'badge-rose';
    case 'Izin':
      return 'badge-purple';
    case 'Libur':
    case 'Libur Nasional':
      return 'badge-gray';
    default:
      return 'badge-gray';
  }
}
