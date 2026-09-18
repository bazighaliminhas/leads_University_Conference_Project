import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Bell, Check, ExternalLink, X, Trash2, CheckCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function NotificationBell({ user, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const token = localStorage.getItem('univ_token') || '';

  const load = async () => {
    if (!user || !token) return;
    try {
      const res = await axios.get(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.warn('Notification fetch failed:', e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    load();
    if (!user) return undefined;
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [user?.id]);

  const unread = useMemo(() => items.filter(n => !n.is_read).length, [items]);

  const markRead = async (item) => {
    try {
      await axios.put(`${API_BASE}/notifications/${item.id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
    } catch (_) {}
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_BASE}/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (_) {}
  };

  const deleteItem = async (item, e) => {
    if (e) e.stopPropagation();
    setDeletingId(item.id);
    try {
      await axios.delete(`${API_BASE}/notifications/${item.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.filter(n => n.id !== item.id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to delete and clear all notifications?')) return;
    setClearing(true);
    try {
      await axios.delete(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      setItems([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    } finally {
      setClearing(false);
    }
  };

  const openItem = async (item) => {
    if (!item.is_read) await markRead(item);
    setOpen(false);
    if (item.link && onNavigate) onNavigate(item.link);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen(v => !v); if (!open) load(); }}
        className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[370px] max-w-[92vw] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[80] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-[#0A192F]">Notifications & Messages</div>
              <div className="text-[10px] text-slate-500">{unread} unread &bull; {items.length} total</div>
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="px-2 py-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Read All</span>
                </button>
              )}
              {items.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  disabled={clearing}
                  className="px-2 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1 transition"
                  title="Delete and clear all notifications"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition ml-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                No active notifications or messages.
              </div>
            ) : items.map(item => (
              <div
                key={item.id}
                onClick={() => openItem(item)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition cursor-pointer flex items-start justify-between gap-3 group ${!item.is_read ? 'bg-amber-50/40' : 'bg-white'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-slate-900">{item.title}</span>
                    {!item.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 mt-0.5">{item.message}</p>
                  <div className="text-[9px] text-slate-400 mt-1 font-mono">
                    {new Date(item.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 mt-0.5">
                  <button
                    type="button"
                    onClick={(e) => deleteItem(item, e)}
                    disabled={deletingId === item.id}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete this message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {item.link && (
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
