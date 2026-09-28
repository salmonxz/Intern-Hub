import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container no-print">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = 'var(--bps-emerald)';
        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'var(--bps-rose)';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'var(--bps-blue-500)';
        }

        return (
          <div key={toast.id} className="toast">
            <Icon size={18} style={{ color: iconColor, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button 
              className="btn-ghost" 
              style={{ border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
              onClick={() => removeToast(toast.id)}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
