import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios-instance';

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

  if (loading) return <div className="text-center p-10 text-slate-500">Loading preferences...</div>;
  if (!prefs) return <div className="text-center p-10 text-slate-500">Failed to load preferences.</div>;

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
    <div className="max-w-[700px] mx-auto px-5 py-[30px]">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Notification Preferences</h2>
        <p className="text-slate-500 text-sm mb-6">Choose which notifications you want to receive</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-100 text-emerald-900 px-4 py-3 rounded-lg mb-4 font-medium">
          {successMsg}
        </div>
      )}

      <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        {prefItems.map((item) => (
          <div key={item.key} className="flex justify-between items-center px-5 py-4 border-b border-slate-100 last:border-b-0">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-slate-900 text-sm">{item.label}</span>
              <span className="text-slate-400 text-[13px]">{item.desc}</span>
            </div>
            <label className="relative inline-block w-12 h-[26px] flex-shrink-0">
              <input
                type="checkbox"
                className="peer opacity-0 w-0 h-0"
                checked={prefs[item.key] || false}
                onChange={() => handleToggle(item.key)}
              />
              <span className="absolute cursor-pointer inset-0 bg-slate-300 rounded-[26px] transition-all duration-300
                before:absolute before:content-[''] before:h-5 before:w-5 before:left-[3px] before:bottom-[3px]
                before:bg-white before:rounded-full before:transition-all before:duration-300
                peer-checked:bg-teal-500 peer-checked:before:translate-x-[22px]">
              </span>
            </label>
          </div>
        ))}
      </div>

      <button
        className="w-full py-[14px] bg-teal-500 text-white border-0 rounded-[10px] text-[15px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
};

export default NotificationPreferences;
