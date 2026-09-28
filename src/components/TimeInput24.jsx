import React, { useState, useRef, useEffect } from 'react';
import { Clock, Check, RotateCcw, Sparkles } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function TimeInput24({
  value = '',
  onChange,
  placeholder = 'HH:mm (Contoh: 16:30)',
  type = 'in', // 'in' or 'out'
  disabled = false,
  id
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  // Parse current value
  const [currentHour, currentMinute] = (value && value.includes(':'))
    ? value.split(':')
    : ['', ''];

  // Default presets for BPS internship
  const presets = type === 'in' 
    ? ['07:30', '07:45', '08:00', '08:30']
    : ['16:00', '16:30', '17:00', '17:30'];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Scroll active hour and minute into view when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hourListRef.current && currentHour) {
          const activeHourEl = hourListRef.current.querySelector('.time-picker-item.active');
          if (activeHourEl) {
            activeHourEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
        if (minuteListRef.current && currentMinute) {
          const activeMinEl = minuteListRef.current.querySelector('.time-picker-item.active');
          if (activeMinEl) {
            activeMinEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
      }, 50);
    }
  }, [isOpen, currentHour, currentMinute]);

  const handleSelectHour = (h) => {
    const min = currentMinute || '00';
    onChange(`${h}:${min}`);
  };

  const handleSelectMinute = (m) => {
    const hr = currentHour || (type === 'out' ? '16' : '07');
    onChange(`${hr}:${m}`);
  };

  const handleDirectInput = (e) => {
    let raw = e.target.value.replace(/[^0-9:]/g, '');
    
    // Auto-insert colon if user types 4 digits e.g. 1630 -> 16:30
    if (raw.length === 4 && !raw.includes(':')) {
      raw = `${raw.slice(0, 2)}:${raw.slice(2, 4)}`;
    }
    
    if (raw.length <= 5) {
      // Basic validation if complete
      if (raw.length === 5 && raw.includes(':')) {
        const [h, m] = raw.split(':').map(Number);
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          onChange(raw);
          return;
        }
      }
      onChange(raw);
    }
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    onChange(`${h}:${m}`);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="time24-container" ref={containerRef}>
      <div className="time24-input-group">
        <input
          id={id}
          type="text"
          className="form-input time24-input"
          placeholder={placeholder}
          value={value}
          onChange={handleDirectInput}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          maxLength={5}
        />
        <button
          type="button"
          className={`time24-toggle-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title="Buka Pilihan Jam (Format 24 Jam: 00 - 23)"
          tabIndex={-1}
        >
          <Clock size={16} />
          <span className="time24-badge-tag">24h</span>
        </button>
      </div>

      {/* Quick presets chip row below input */}
      <div className="time24-quick-row">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`time24-chip ${value === preset ? 'active' : ''}`}
            onClick={() => onChange(preset)}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* 24-Hour Picker Popover */}
      {isOpen && (
        <div className="time24-popover" role="dialog" aria-label="Pemilih Jam 24 Jam">
          <div className="time24-popover-header">
            <div>
              <div className="time24-preview">
                {currentHour || '--'} : {currentMinute || '--'}
              </div>
              <div className="time24-hint">
                Format 24 Jam (00:00 - 23:59)
              </div>
            </div>

            <div className="time24-header-actions">
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={handleSetCurrentTime}
                title="Gunakan waktu sekarang"
              >
                <Sparkles size={13} style={{ marginRight: 4 }} />
                Sekarang
              </button>
              {value && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-rose"
                  onClick={handleClear}
                  title="Kosongkan jam"
                >
                  <RotateCcw size={13} style={{ marginRight: 4 }} />
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="time24-columns">
            {/* Hour Column 00 - 23 */}
            <div className="time24-col">
              <div className="time24-col-title">
                Jam (00 - 23)
              </div>
              <div className="time24-scroll" ref={hourListRef}>
                {HOURS.map((h) => {
                  const isSelected = currentHour === h;
                  const isAfternoon = Number(h) >= 12;
                  return (
                    <button
                      key={h}
                      type="button"
                      className={`time-picker-item ${isSelected ? 'active' : ''} ${isAfternoon ? 'pm-hour' : ''}`}
                      onClick={() => handleSelectHour(h)}
                    >
                      <span>{h}</span>
                      {isSelected && <Check size={14} className="time-check" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minute Column 00 - 59 */}
            <div className="time24-col">
              <div className="time24-col-title">
                Menit (00 - 59)
              </div>
              <div className="time24-scroll" ref={minuteListRef}>
                {MINUTES.map((m) => {
                  const isSelected = currentMinute === m;
                  const isStep5 = Number(m) % 5 === 0;
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`time-picker-item ${isSelected ? 'active' : ''} ${isStep5 ? 'step-5' : ''}`}
                      onClick={() => handleSelectMinute(m)}
                    >
                      <span>{m}</span>
                      {isSelected && <Check size={14} className="time-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="time24-footer">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              onClick={() => setIsOpen(false)}
            >
              Selesai (Tutup)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
