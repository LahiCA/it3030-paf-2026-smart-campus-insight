import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios-instance';
import './NotificationPreferences.css';

const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axiosInstance.get('/notifications/preferences');
      setPrefs(response.data);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await axiosInstance.put('/notifications/preferences', prefs);
      setPrefs(response.data);
      setSuccessMsg('Preferences saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="prefs-loading">Loading preferences...</div>;
  if (!prefs) return <div className="prefs-error">Failed to load preferences.</div>;

  const prefItems = [
    { key: 'bookingApproved', label: 'Booking Approved', desc: 'When your facility booking is approved' },
    { key: 'bookingRejected', label: 'Booking Rejected', desc: 'When your facility booking is rejected' },
    { key: 'ticketCreated', label: 'Ticket Created', desc: 'When a new ticket is assigned to you' },
    { key: 'ticketUpdated', label: 'Ticket Updated', desc: 'When a ticket status changes' },
    { key: 'commentAdded', label: 'Comment Added', desc: 'When someone comments on your ticket' },
    { key: 'bookingComment', label: 'Booking Comment', desc: 'When someone comments on your booking' },
    { key: 'general', label: 'General', desc: 'System announcements and general notifications' },
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
  ];

  return (
    <div className="notification-prefs">
      <div className="prefs-header">
        <h2>Notification Preferences</h2>
        <p>Choose which notifications you want to receive</p>
      </div>

      {successMsg && <div className="prefs-success">{successMsg}</div>}

      <div className="prefs-list">
        {prefItems.map((item) => (
          <div key={item.key} className="pref-item">
            <div className="pref-info">
              <span className="pref-label">{item.label}</span>
              <span className="pref-desc">{item.desc}</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={prefs[item.key] || false}
                onChange={() => handleToggle(item.key)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        ))}
      </div>

      <button className="prefs-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
};

export default NotificationPreferences;
