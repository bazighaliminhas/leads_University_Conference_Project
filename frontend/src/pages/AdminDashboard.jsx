import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck,
  Edit3,
  Award,
  Sparkles,
  CheckCircle2,
  Search,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  Globe,
  Check,
  FileText,
  AlertCircle,
  Eye,
  Download,
  Users,
  X,
  Printer,
  Image as ImageIcon,
  CheckCircle,
  CreditCard,
  Building2,
  ExternalLink,
  ChevronDown,
  Ticket,
  Bell,
  Phone,
  Mail,
  Send,
  MessageSquare,
  RefreshCw,
  Zap,
  BookOpen,
  Plus,
  Trash2,
  KeyRound,
  Filter,
  ArrowRight,
  Unlock,
  Lock,
  Settings,
  HardDrive,
  Save,
  Video
} from 'lucide-react';
import { TierBadge } from '../components/TierBadge';
import { ProofViewerModal } from '../components/ProofViewerModal';
import { ManuscriptModal } from '../components/ManuscriptModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const AdminDashboard = ({
  articles = [],
  conferences = [],
  registeredInvestors = [],
  journals = [],
  onUpdateArticle,
  onPublishArticle,
  onDeleteArticle,
  onUpdateConference,
  onCreateInvestor,
  onMarkRead,
  onNavigateTab
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSubTabFromPath = () => {
    if (location.pathname.includes('/journals')) return 'journals';
    if (location.pathname.includes('/conference')) return 'conference';
    if (location.pathname.includes('/tickets')) return 'tickets';
    if (location.pathname.includes('/readers')) return 'readers';
    if (location.pathname.includes('/investors')) return 'investors';
    if (location.pathname.includes('/inquiries')) return 'inquiries';
    if (location.pathname.includes('/notifications')) return 'notifications';
    if (location.pathname.includes('/settings')) return 'settings';
    if (location.pathname.includes('/users')) return 'users';
    return 'articles';
  };

  const [activeSubTab, setActiveSubTab] = useState(getSubTabFromPath);

  useEffect(() => {
    setActiveSubTab(getSubTabFromPath());
  }, [location.pathname]);

  const switchTab = (tab) => {
    setActiveSubTab(tab);
    if (tab === 'articles') navigate('/admin/articles');
    else if (tab === 'journals') navigate('/admin/journals');
    else if (tab === 'conference') navigate('/admin/conference');
    else if (tab === 'tickets') navigate('/admin/tickets');
    else if (tab === 'readers') navigate('/admin/readers');
    else if (tab === 'investors') navigate('/admin/investors');
    else if (tab === 'inquiries') navigate('/admin/inquiries');
    else if (tab === 'notifications') navigate('/admin/notifications');
    else if (tab === 'settings') navigate('/admin/settings');
    else if (tab === 'users') navigate('/admin/users');
  };

  // Journals Management State
  const [journalsList, setJournalsList] = useState(journals);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [journalFormData, setJournalFormData] = useState({
    title: '',
    short_code: '',
    slug: '',
    description: '',
    cover_image: '',
    banner_image: '',
    issn_print: '2709-1234',
    issn_online: '2709-5678',
    category: 'Artificial Intelligence & Robotics',
    chief_editor: 'Prof. Dr. M. Arshad (Dean of Research)',
    current_volume: 1,
    current_issue: 1,
    current_issue_title: 'Vol. 1 No. 1 (2026): Spring Issue',
    call_for_papers_title: 'Call for Papers Volume 1 Issue 1 2026',
    call_for_papers_deadline: '2026-11-30',
    call_for_papers_image: '',
    scope_keywords: 'Machine Learning, Robotics, Computer Vision, AI in Healthcare'
  });
  const [journalActionMsg, setJournalActionMsg] = useState('');

  const fetchAdminJournals = async () => {
    try {
      setLoadingJournals(true);
      const res = await axios.get(`${API_BASE}/journals`);
      setJournalsList(res.data || []);
    } catch (err) {
      console.error('Error fetching admin journals:', err);
    } finally {
      setLoadingJournals(false);
    }
  };

  useEffect(() => {
    fetchAdminJournals();
  }, []);

  const handleOpenCreateJournal = () => {
    setEditingJournal(null);
    setJournalFormData({
      title: '',
      short_code: '',
      slug: '',
      description: '',
      cover_image: '',
      banner_image: '',
      issn_print: '2709-1234',
      issn_online: '2709-5678',
      category: 'Artificial Intelligence & Robotics',
      chief_editor: 'Prof. Dr. M. Arshad (Dean of Research)',
      current_volume: 1,
      current_issue: 1,
      current_issue_title: 'Vol. 1 No. 1 (2026): Spring Issue',
      call_for_papers_title: 'Call for Papers Volume 1 Issue 1 2026',
      call_for_papers_deadline: '2026-11-30',
      call_for_papers_image: '',
      scope_keywords: 'Machine Learning, Robotics, Computer Vision, AI in Healthcare'
    });
    setShowJournalModal(true);
  };

  const handleOpenEditJournal = (journal) => {
    setEditingJournal(journal);
    setJournalFormData({
      title: journal.title || '',
      short_code: journal.short_code || '',
      slug: journal.slug || '',
      description: journal.description || '',
      cover_image: journal.cover_image || '',
      banner_image: journal.banner_image || '',
      issn_print: journal.issn_print || '2709-1234',
      issn_online: journal.issn_online || '2709-5678',
      category: journal.category || 'Artificial Intelligence & Robotics',
      chief_editor: journal.chief_editor || '',
      current_volume: journal.current_volume || 1,
      current_issue: journal.current_issue || 1,
      current_issue_title: journal.current_issue_title || 'Vol. 1 No. 1 (2026)',
      call_for_papers_title: journal.call_for_papers_title || '',
      call_for_papers_deadline: journal.call_for_papers_deadline || '2026-11-30',
      call_for_papers_image: journal.call_for_papers_image || '',
      scope_keywords: journal.scope_keywords || ''
    });
    setShowJournalModal(true);
  };

  const handleSaveJournalSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('univ_token');
      if (editingJournal) {
        await axios.put(`${API_BASE}/admin/journals/${editingJournal.id}`, journalFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJournalActionMsg(`✓ Journal '${journalFormData.title}' updated successfully!`);
      } else {
        await axios.post(`${API_BASE}/admin/journals`, journalFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJournalActionMsg(`✓ New University Journal '${journalFormData.title}' published successfully!`);
      }
      setShowJournalModal(false);
      fetchAdminJournals();
      setTimeout(() => setJournalActionMsg(''), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving journal');
    }
  };

  const handleDeleteJournal = async (journalId, title) => {
    if (!window.confirm(`Are you sure you want to delete the journal '${title}'?`)) return;
    try {
      const token = localStorage.getItem('univ_token');
      await axios.delete(`${API_BASE}/admin/journals/${journalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJournalActionMsg(`✓ Journal deleted successfully.`);
      fetchAdminJournals();
      setTimeout(() => setJournalActionMsg(''), 6000);
    } catch (err) {
      alert('Error deleting journal');
    }
  };

  // WhatsApp & Email Notifications Audit Log State
  const [notifState, setNotifState] = useState({
    admin_whatsapp: '+923482727605',
    admin_email: 'bazighminhas1@gmail.com',
    history: []
  });
  const [testingNotif, setTestingNotif] = useState(false);
  const [notifSuccessMsg, setNotifSuccessMsg] = useState('');
  const [notifFilter, setNotifFilter] = useState('all');

  const fetchNotificationLogs = async () => {
    try {
      const token = localStorage.getItem('univ_token');
      const res = await axios.get(`${API_BASE}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifState({
        admin_whatsapp: res.data.admin_whatsapp || '+923482727605',
        admin_email: res.data.admin_email || 'bazighminhas1@gmail.com',
        history: res.data.history || []
      });
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotificationLogs();
    const interval = setInterval(fetchNotificationLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendTestNotification = async () => {
    setTestingNotif(true);
    setNotifSuccessMsg('');
    try {
      const token = localStorage.getItem('univ_token');
      await axios.post(`${API_BASE}/admin/notifications/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifSuccessMsg('🚀 Test notification dispatched to WhatsApp (+92 348 2727605) & Email (bazighminhas1@gmail.com)!');
      fetchNotificationLogs();
    } catch (err) {
      setNotifSuccessMsg('⚠️ Could not trigger test notification.');
    } finally {
      setTestingNotif(false);
      setTimeout(() => setNotifSuccessMsg(''), 6000);
    }
  };

  const handleClearNotificationLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all notification history logs?')) return;
    try {
      const token = localStorage.getItem('univ_token');
      await axios.delete(`${API_BASE}/admin/notifications/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifState(prev => ({ ...prev, history: [] }));
      setNotifSuccessMsg('🧹 Notification dispatch history cleared successfully.');
      setTimeout(() => setNotifSuccessMsg(''), 4000);
    } catch (err) {
      setNotifSuccessMsg('⚠️ Could not clear notification history.');
    }
  };

  // Storage Settings + User Management State
  const [storage, setStorage] = useState({ folderId: '', folderName: '', serviceAccountEmail: '', success: false, error: '', credentialSource: '' });
  const [storageFolderId, setStorageFolderId] = useState('');
  const [storageCredentialFile, setStorageCredentialFile] = useState(null);
  const [storageMsg, setStorageMsg] = useState('');
  const [savingStorage, setSavingStorage] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);

  const fetchStorageStatus = async () => {
    try {
      const token = localStorage.getItem('univ_token');
      const res = await axios.get(`${API_BASE}/admin/drive/status`, { headers: { Authorization: `Bearer ${token}` } });
      setStorage(res.data || {});
      setStorageFolderId(res.data?.folderId || '');
    } catch (err) {
      setStorage(prev => ({ ...prev, success: false, error: err.response?.data?.error || err.response?.data?.message || 'Storage status unavailable' }));
    }
  };

  const saveStorageSettings = async (e) => {
    e.preventDefault();
    setSavingStorage(true); setStorageMsg('');
    try {
      const token = localStorage.getItem('univ_token');
      const form = new FormData();
      form.append('folderId', storageFolderId.trim());
      if (storageCredentialFile) form.append('credentials', storageCredentialFile);
      const res = await axios.put(`${API_BASE}/admin/drive/settings`, form, { headers: { Authorization: `Bearer ${token}` } });
      setStorageMsg('✓ Google Drive connection verified and activated.');
      setStorageCredentialFile(null);
      await fetchStorageStatus();
    } catch (err) {
      setStorageMsg(`✕ ${err.response?.data?.error || err.response?.data?.message || 'Could not update Drive settings'}`);
    } finally { setSavingStorage(false); }
  };

  const testStorage = async () => {
    setStorageMsg('');
    try {
      const token = localStorage.getItem('univ_token');
      const res = await axios.post(`${API_BASE}/admin/drive/test`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setStorage(res.data || {}); setStorageMsg(`✓ Connected to ${res.data?.folderName || 'Google Drive'}.`);
    } catch (err) { setStorageMsg(`✕ ${err.response?.data?.error || 'Drive connection failed'}`); }
  };

  const backupDrive = async () => {
    setStorageMsg('');
    try {
      const token = localStorage.getItem('univ_token');
      const res = await axios.post(`${API_BASE}/admin/drive/backup`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setStorageMsg(`✓ Backup uploaded: ${res.data?.fileName || 'database snapshot'}`);
    } catch (err) { setStorageMsg(`✕ ${err.response?.data?.error || err.response?.data?.message || 'Backup failed'}`); }
  };

  const fetchAdminUsers = async () => {
    try {
      const token = localStorage.getItem('univ_token');
      const res = await axios.get(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      setAdminUsers(Array.isArray(res.data) ? res.data : []);
    } catch (_) {}
  };

  const deleteAdminUser = async (id) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      const token = localStorage.getItem('univ_token');
      await axios.delete(`${API_BASE}/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAdminUsers();
    } catch (err) { alert(err.response?.data?.message || 'Could not delete user'); }
  };

  useEffect(() => { fetchStorageStatus(); fetchAdminUsers(); }, []);

  // Article Review & Inspection State
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [viewProofModal, setViewProofModal] = useState(null); // { title, url, type, senderBank, transactionId, senderMobile, studentName, amount }
  const [viewManuscriptArticle, setViewManuscriptArticle] = useState(null);
  const [tier, setTier] = useState('None');
  const [plagiarismScore, setPlagiarismScore] = useState(5);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [articleFilter, setArticleFilter] = useState('all');

  // Booked Tickets & Passes State
  const [ticketsList, setTicketsList] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [verifyingTicketId, setVerifyingTicketId] = useState(null);
  const [allocatingSeat, setAllocatingSeat] = useState({});
  const [allocatingLink, setAllocatingLink] = useState({});
  const [ticketActionMsg, setTicketActionMsg] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all'); // 'all' | 'pending' | 'verified'
  const [ticketSearch, setTicketSearch] = useState('');

  // Reader Access Requests State
  const [readerRequestsList, setReaderRequestsList] = useState([]);
  const [loadingReaderRequests, setLoadingReaderRequests] = useState(false);
  const [approvingReaderId, setApprovingReaderId] = useState(null);
  const [readerActionMsg, setReaderActionMsg] = useState('');
  const [readerFilter, setReaderFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [readerSearch, setReaderSearch] = useState('');

  const fetchReaderRequests = async () => {
    try {
      setLoadingReaderRequests(true);
      const token = localStorage.getItem('univ_token');
      const res = await axios.get(`${API_BASE}/admin/reader-access`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setReaderRequestsList(res.data || []);
    } catch (err) {
      console.log('Error fetching reader access requests');
    } finally {
      setLoadingReaderRequests(false);
    }
  };

  useEffect(() => {
    fetchReaderRequests();
  }, []);

  const handleApproveReaderAccess = async (reqItem) => {
    try {
      setApprovingReaderId(reqItem.id);
      const token = localStorage.getItem('univ_token');
      await axios.put(`${API_BASE}/admin/reader-access/${reqItem.id}/approve`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setReaderRequestsList(prev => prev.map(r => r.id === reqItem.id ? { ...r, status: 'Approved' } : r));
      setReaderActionMsg(`✓ Full research paper reading access granted to '${reqItem.user_name}'!`);
      setTimeout(() => setReaderActionMsg(''), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving reader access');
    } finally {
      setApprovingReaderId(null);
    }
  };

  const fetchAdminTickets = async () => {
    try {
      setLoadingTickets(true);
      const token = localStorage.getItem('univ_token');
      const res = await axios.get(`${API_BASE}/admin/tickets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setTicketsList(res.data || []);
    } catch (err) {
      console.log('Error fetching admin tickets');
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchAdminTickets();
  }, []);

  const handleVerifyTicket = async (ticket) => {
    try {
      setVerifyingTicketId(ticket.id);
      const token = localStorage.getItem('univ_token');
      const conf = conferences.find(c => c.id == ticket.conference_id) || conferences[0];
      const seat = allocatingSeat[ticket.id] !== undefined ? allocatingSeat[ticket.id] : (ticket.seat_number || 'Auditorium Row A - Seat #15');
      const link = allocatingLink[ticket.id] !== undefined ? allocatingLink[ticket.id] : (ticket.stream_link || conf?.stream_link || 'https://meet.google.com/leads-summit-2026');

      const res = await axios.put(`${API_BASE}/admin/tickets/${ticket.id}/verify`, {
        seat_number: seat,
        stream_link: link
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setTicketsList(prev => prev.map(t => t.id === ticket.id ? (res.data.ticket || { ...t, payment_status: 'Verified & Issued', seat_number: seat, stream_link: link }) : t));
      setTicketActionMsg(`✓ Pass for '${ticket.user_name}' verified & issued! Google Meet: ${link}`);
      setTimeout(() => setTicketActionMsg(''), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error verifying ticket pass');
    } finally {
      setVerifyingTicketId(null);
    }
  };

  // Conference Form State
  const activeConf = conferences[0] || {
    id: 1,
    title: 'National Innovation & Research Conference 2026',
    description: 'Annual summit bringing together university student innovators, academic evaluation boards, and venture capital investors.',
    cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    event_date: '2026-09-15',
    event_time: '10:00 AM - 04:00 PM',
    venue: 'University Main Auditorium & Global HD Live Stream',
    stream_link: 'https://meet.google.com/xyz-demo-stream',
    onsite_ticket_price: 500.00,
    online_ticket_price: 200.00,
    presenting_students: 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)',
    attending_investors: 'John Malik (Apex Tech Capital), Dr. Sarah Vance (BioHealth VC)',
    status: 'Upcoming'
  };

  const [confData, setConfData] = useState({
    title: activeConf?.title || 'National Innovation & Research Conference 2026',
    description: activeConf?.description || 'Annual summit bringing together university student innovators, academic evaluation boards, and venture capital investors.',
    cover_image: activeConf?.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    event_date: activeConf?.event_date || '2026-09-15',
    event_time: activeConf?.event_time || '10:00 AM - 04:00 PM',
    venue: activeConf?.venue || 'University Main Auditorium',
    stream_link: activeConf?.stream_link || 'https://meet.google.com/xyz-demo-stream',
    onsite_ticket_price: activeConf?.onsite_ticket_price || 500.00,
    online_ticket_price: activeConf?.online_ticket_price || 200.00,
    presenting_students: activeConf?.presenting_students || 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)',
    attending_investors: activeConf?.attending_investors || 'John Malik (Apex Tech Capital), Dr. Sarah Vance (BioHealth VC)',
    status: activeConf?.status || 'Upcoming'
  });

  const [selectedArticleToAttach, setSelectedArticleToAttach] = useState('');

  const handleAttachArticleToConference = () => {
    if (!selectedArticleToAttach) return;
    const art = articles.find(a => a.id == selectedArticleToAttach);
    if (!art) return;

    const presenterTag = `${art.student_name} (${art.title.length > 35 ? art.title.slice(0, 35) + '...' : art.title})`;
    const currentPresenters = confData.presenting_students ? confData.presenting_students.split(',').map(s => s.trim()) : [];
    
    if (!currentPresenters.includes(presenterTag)) {
      const updated = currentPresenters.length > 0 ? `${confData.presenting_students}, ${presenterTag}` : presenterTag;
      setConfData({ ...confData, presenting_students: updated });
    }
  };

  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [testingReminder, setTestingReminder] = useState(false);
  const [confActionMsg, setConfActionMsg] = useState('');

  const handleSyncCalendar = async () => {
    try {
      setSyncingCalendar(true);
      setConfActionMsg('');
      const token = localStorage.getItem('univ_token');
      const confId = activeConf?.id || 1;
      const res = await axios.post(`${API_BASE}/admin/conferences/${confId}/sync-calendar`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.conference) {
        setConfData(prev => ({
          ...prev,
          stream_link: res.data.conference.stream_link,
          calendar_html_link: res.data.conference.calendar_html_link
        }));
        setConfActionMsg(`✓ Google Meet link generated & Google Calendar synchronized (${res.data.conference.stream_link})`);
      } else {
        setConfActionMsg('✓ Google Meet & Calendar synchronized successfully.');
      }
    } catch (err) {
      setConfActionMsg(`⚠️ Sync notice: ${err.response?.data?.message || 'Generated Google Meet link directly.'}`);
    } finally {
      setSyncingCalendar(false);
      setTimeout(() => setConfActionMsg(''), 7000);
    }
  };

  const handleTestReminder = async () => {
    try {
      setTestingReminder(true);
      setConfActionMsg('');
      const token = localStorage.getItem('univ_token');
      const confId = activeConf?.id || 1;
      await axios.post(`${API_BASE}/admin/conferences/${confId}/test-reminder`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setConfActionMsg('🚀 Conference day reminder dispatched! Check Admin WhatsApp (+92 348 2727605) & Email (bazighminhas1@gmail.com).');
      if (typeof fetchNotificationLogs === 'function') fetchNotificationLogs();
    } catch (err) {
      setConfActionMsg('⚠️ Could not trigger conference reminder.');
    } finally {
      setTestingReminder(false);
      setTimeout(() => setConfActionMsg(''), 7000);
    }
  };

  const handleConferenceSubmit = (e) => {
    e.preventDefault();
    onUpdateConference(activeConf?.id || 1, confData);
    setConfActionMsg('✅ University Conference details, Google Meet link & schedule saved!');
    setTimeout(() => setConfActionMsg(''), 6000);
  };

  // Investors Full CRUD State
  const [investorList, setInvestorList] = useState(registeredInvestors);
  const [showInvestorModal, setShowInvestorModal] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState(null);
  const [investorFormData, setInvestorFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    organization: 'Apex Tech Capital'
  });

  const fetchInvestorsList = async () => {
    try {
      const token = localStorage.getItem('univ_token');
      const res = await axios.get(`${API_BASE}/admin/investors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestorList(res.data || []);
    } catch (err) {
      setInvestorList(registeredInvestors);
    }
  };

  useEffect(() => {
    fetchInvestorsList();
  }, [registeredInvestors]);

  const handleOpenCreateInvestor = () => {
    setEditingInvestor(null);
    setInvestorFormData({
      full_name: '',
      email: '',
      password: '',
      organization: 'Apex Tech Capital'
    });
    setShowInvestorModal(true);
  };

  const handleOpenEditInvestor = (inv) => {
    setEditingInvestor(inv);
    setInvestorFormData({
      full_name: inv.full_name || '',
      email: inv.email || '',
      password: '',
      organization: inv.organization || 'Venture Capital Fund'
    });
    setShowInvestorModal(true);
  };

  const handleSaveInvestorSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('univ_token');
      if (editingInvestor) {
        await axios.put(`${API_BASE}/admin/investors/${editingInvestor.id}`, investorFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✓ Investor credentials updated successfully!');
      } else {
        if (onCreateInvestor) {
          await onCreateInvestor(investorFormData);
        } else {
          await axios.post(`${API_BASE}/admin/create-investor`, investorFormData, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        alert('✓ New Venture Investor account provisioned successfully!');
      }
      setShowInvestorModal(false);
      fetchInvestorsList();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving investor');
    }
  };

  const handleResetInvestorPassword = async (inv) => {
    const newPass = prompt(`Enter new password for ${inv.full_name} (${inv.email}):`, `Pass#${Math.floor(100000 + Math.random() * 900000)}`);
    if (!newPass) return;
    try {
      const token = localStorage.getItem('univ_token');
      const res = await axios.put(`${API_BASE}/admin/investors/${inv.id}/reset-password`, { new_password: newPass }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`✓ Password reset successful for ${inv.full_name}!\nNew Password: ${res.data.newPassword || newPass}`);
      fetchInvestorsList();
    } catch (err) {
      alert('Error resetting password');
    }
  };

  const handleDeleteInvestor = async (inv) => {
    if (!window.confirm(`Are you sure you want to permanently delete investor account: ${inv.full_name} (${inv.email})?`)) return;
    try {
      const token = localStorage.getItem('univ_token');
      await axios.delete(`${API_BASE}/admin/investors/${inv.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✓ Investor account removed.');
      fetchInvestorsList();
    } catch (err) {
      alert('Error deleting investor');
    }
  };

  // Student Inquiries Management State
  const [inquiriesList, setInquiriesList] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquiryFilter, setInquiryFilter] = useState('all'); // 'all' | 'pending' | 'replied'
  const [inquirySearch, setInquirySearch] = useState('');
  const [replyTextMap, setReplyTextMap] = useState({});
  const [replyingInquiryId, setReplyingInquiryId] = useState(null);
  const [inquiryActionMsg, setInquiryActionMsg] = useState('');

  const fetchAdminInquiries = async () => {
    try {
      setLoadingInquiries(true);
      const token = localStorage.getItem('univ_token');
      const res = await axios.get(`${API_BASE}/inquiries`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setInquiriesList(res.data || []);
    } catch (err) {
      console.error('Error fetching inquiries in AdminDashboard:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    fetchAdminInquiries();
  }, []);

  const handleSendAdminReply = async (inquiry) => {
    const text = replyTextMap[inquiry.id];
    if (!text || !text.trim()) {
      alert('Please enter a response message to send to the student.');
      return;
    }

    try {
      setReplyingInquiryId(inquiry.id);
      setInquiryActionMsg('');
      const token = localStorage.getItem('univ_token');
      await axios.post(`${API_BASE}/inquiries/${inquiry.id}/reply`, {
        reply_text: text.trim(),
        admin_name: 'Lahore Leads University ORIC Desk'
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setInquiryActionMsg(`✓ Response dispatched to ${inquiry.student_name} (${inquiry.student_email || 'Gmail'})! Email sent and conversation archived in Google Drive.`);
      setReplyTextMap(prev => ({ ...prev, [inquiry.id]: '' }));
      fetchAdminInquiries();
      setTimeout(() => setInquiryActionMsg(''), 8000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending reply to student');
    } finally {
      setReplyingInquiryId(null);
    }
  };

  // Review Submissions
  const handleOpenReview = (art) => {
    setSelectedArticle(art);
    const initialTier = (art.tier && art.tier !== 'None') 
      ? art.tier 
      : 'None (Initial Review - Mistakes Identified)';
    setTier(initialTier);
    setPlagiarismScore(art.plagiarism_score || 5);
    setNotes(art.reviewer_notes || art.admin_revision_notes || '');
    if (art.admin_unread && onMarkRead) {
      onMarkRead(art.id);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedArticle) return;

    const isMistakesMode = tier.includes('None') || tier.includes('Needs Revision') || tier.includes('Mistakes');
    const newStatus = isMistakesMode 
      ? 'Needs Revision' 
      : 'Approved - Awaiting Publication Fee';

    onUpdateArticle(selectedArticle.id, {
      tier: isMistakesMode ? 'None' : tier,
      plagiarism_score: plagiarismScore,
      reviewer_notes: notes,
      admin_revision_notes: notes,
      status: newStatus
    });

    if (isMistakesMode) {
      alert(`⚠️ Mistakes sent to ${selectedArticle.student_name}!\nStatus set to: Needs Revision.\nStudent notified to resubmit corrected manuscript.`);
    } else {
      alert(`🎉 Quality Category (${tier}) assigned to "${selectedArticle.title}"!\nStatus set to: Approved - Awaiting Publication Fee.\nStudent notified to pay PKR 3,000 publication fee.`);
    }
    setSelectedArticle(null);
  };

  const handleDirectPublish = (art) => {
    if (!window.confirm(`Verify and publish "${art.title}" live to the main portal?`)) return;
    onPublishArticle(art.id, {
      is_published: true,
      status: 'Published'
    });
    alert(`🎉 Article "${art.title}" is now PUBLISHED live with official DOI assigned!`);
  };

  // Filter Articles
  const filteredArticles = articles.filter(a => {
    const matchesSearch = (a.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (a.student_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (a.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (articleFilter === 'unread') return a.admin_unread;
    if (articleFilter === 'awaiting_review') return a.status?.includes('Awaiting Review') || a.status === 'Submitted';
    if (articleFilter === 'pub_fee_paid') return a.status?.includes('Pub Fee Paid');
    if (articleFilter === 'published') return a.is_published;
    return true;
  });

  const unreadCount = articles.filter(a => a.admin_unread).length;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* Top Banner Control Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center font-black text-xl border-2 border-amber-400 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F]">University Admin Control Panel</h1>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
                  {unreadCount} Unreviewed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Peer Review Management, Mistake Identification, Fee Proof Verification, and ORIC Schedule.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => switchTab('articles')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'articles'
                ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Articles & Reviews</span>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('journals')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'journals'
                ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Journals ({journalsList.length || 12})</span>
          </button>

          <button
            onClick={() => switchTab('conference')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'conference'
                ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Conferences</span>
          </button>

          <button
            onClick={() => switchTab('tickets')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'tickets'
                ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Booked Passes ({ticketsList.length})</span>
            {ticketsList.filter(t => t.payment_status === 'Pending Admin Verification').length > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {ticketsList.filter(t => t.payment_status === 'Pending Admin Verification').length}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('readers')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'readers'
                ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>Reader Passes ({readerRequestsList.length})</span>
            {readerRequestsList.filter(r => r.status === 'Pending Admin Verification').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {readerRequestsList.filter(r => r.status === 'Pending Admin Verification').length}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('investors')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'investors'
                ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Investors ({investorList.length || 3})</span>
          </button>

          <button
            onClick={() => switchTab('inquiries')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'inquiries'
                ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Student Inquiries ({inquiriesList.length})</span>
            {inquiriesList.filter(i => i.status === 'Pending').length > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {inquiriesList.filter(i => i.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('users')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${activeSubTab === 'users' ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black' : 'text-slate-700 hover:bg-white'}`}
          >
            <Users className="w-4 h-4" />
            <span>Users</span>
          </button>

          <button
            onClick={() => switchTab('settings')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${activeSubTab === 'settings' ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black' : 'text-slate-700 hover:bg-white'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => switchTab('notifications')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'notifications'
                ? 'bg-[#0A192F] text-amber-400 shadow-sm font-black'
                : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ARTICLES & PEER REVIEWS                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'articles' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student, paper title, or category..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs font-bold">
              <button
                onClick={() => setArticleFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  articleFilter === 'all' ? 'bg-[#0A192F] text-amber-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Papers ({articles.length})
              </button>
              <button
                onClick={() => setArticleFilter('unread')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  articleFilter === 'unread' ? 'bg-rose-600 text-white font-black' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <span>🔴 Action Needed</span>
                <span className="bg-white text-rose-700 text-[10px] px-1.5 rounded-full font-black">{unreadCount}</span>
              </button>
              <button
                onClick={() => setArticleFilter('pub_fee_paid')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  articleFilter === 'pub_fee_paid' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                💰 Fee Paid
              </button>
              <button
                onClick={() => setArticleFilter('published')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  articleFilter === 'published' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                Published
              </button>
            </div>
          </div>

          {/* Articles Grid / List */}
          <div className="space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-700 text-sm">No submissions match the current filter.</p>
              </div>
            ) : (
              filteredArticles.map((art) => {
                const isUnread = art.admin_unread;
                const isPubFeePaid = art.status?.includes('Pub Fee Paid') || art.publication_fee_paid;
                const isPresFeePaid = art.presentation_fee_paid;

                return (
                  <div
                    key={art.id}
                    className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                      isUnread
                        ? 'border-amber-400 ring-2 ring-amber-400/30 bg-gradient-to-r from-amber-50/50 via-white to-blue-50/30'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Article Details */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {Boolean(isUnread) && (
                            <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              🔴 ACTION NEEDED
                            </span>
                          )}
                          <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                            {art.category || 'General Science'}
                          </span>
                          <TierBadge tier={art.tier || 'None'} />
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            art.is_published
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            {art.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-[#0A192F] hover:text-blue-900 transition cursor-pointer" onClick={() => setViewManuscriptArticle(art)}>
                          {art.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                          <span>Student: <strong className="text-slate-900">{art.student_name}</strong></span>
                          <span>•</span>
                          <span>Plagiarism: <strong className={art.plagiarism_score > 15 ? 'text-rose-600' : 'text-emerald-600'}>{art.plagiarism_score || 5}%</strong></span>
                          <span>•</span>
                          <span className="font-mono text-slate-600">DOI: {art.doi || `10.5281/leads.2026.${art.id}`}</span>
                        </div>

                        {Boolean(art.reviewer_notes) && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2">
                            <strong className="text-slate-800">Admin/Reviewer Feedback:</strong> {art.reviewer_notes}
                          </div>
                        )}
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Inspect Submission Proof */}
                        <button
                          onClick={() => setViewProofModal({
                            title: `Submission Fee Proof — ${art.student_name}`,
                            url: art.submission_receipt_url || art.receipt_url,
                            type: 'Submission Fee (PKR 1,500)',
                            senderBank: art.sender_bank || 'HBL Mobile App',
                            transactionId: art.transaction_id || `TRX-${art.id}948`,
                            senderMobile: art.sender_mobile || '0348-2727605',
                            studentName: art.student_name,
                            amount: 'PKR 1,500'
                          })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1 border border-slate-300"
                          title="Inspect Student Challan Proof"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>Submission Slip</span>
                        </button>

                        {/* Inspect Publication Proof if paid */}
                        {Boolean(isPubFeePaid) && (
                          <button
                            onClick={() => setViewProofModal({
                              title: `Publication Fee Proof — ${art.student_name}`,
                              url: art.publication_receipt_url || art.receipt_url,
                              type: 'Publication Fee (PKR 3,000)',
                              senderBank: art.sender_bank || 'HBL Mobile App',
                              transactionId: art.transaction_id || `TRX-PUB-${art.id}`,
                              senderMobile: art.sender_mobile || '0348-2727605',
                              studentName: art.student_name,
                              amount: 'PKR 3,000'
                            })}
                            className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs rounded-xl transition flex items-center gap-1 border border-purple-300"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-purple-700" />
                            <span>Pub Slip (PKR 3k)</span>
                          </button>
                        )}

                        {/* Inspect Presentation Proof if paid */}
                        {Boolean(art.presentation_receipt_url || art.presentation_fee_paid) && (
                          <button
                            onClick={() => setViewProofModal({
                              title: `Conference Presentation Proof — ${art.student_name}`,
                              url: art.presentation_receipt_url || art.receipt_url,
                              type: 'Conference Presentation Fee (PKR 2,000)',
                              senderBank: art.sender_bank || 'HBL Mobile App',
                              transactionId: art.transaction_id || `TRX-CONF-${art.id}`,
                              senderMobile: art.sender_mobile || '0348-2727605',
                              studentName: art.student_name,
                              amount: 'PKR 2,000'
                            })}
                            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-xl transition flex items-center gap-1 border border-emerald-300"
                            title="Inspect Conference Presentation Fee Slip"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Conf Slip (PKR 2k)</span>
                          </button>
                        )}

                        {/* Read Manuscript */}
                        <button
                          onClick={() => setViewManuscriptArticle(art)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs rounded-xl transition flex items-center gap-1 border border-blue-200"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                          <span>Read Manuscript</span>
                        </button>

                        {/* Review / Grade Button */}
                        <button
                          onClick={() => handleOpenReview(art)}
                          className="px-4 py-2 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Evaluate & Grade</span>
                        </button>

                        {/* Verify & Publish Live */}
                        {Boolean(isPubFeePaid && !art.is_published) && (
                          <button
                            onClick={() => handleDirectPublish(art)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Publish Live</span>
                          </button>
                        )}

                        {/* Delete Paper Option */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to permanently delete "${art.title}"?`)) {
                              if (onDeleteArticle) onDeleteArticle(art.id);
                            }
                          }}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition"
                          title="Delete this paper submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: JOURNALS MANAGEMENT (FULL CRUD)                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'journals' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-[#0A192F]">Leads University Academic Journals Directory</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Manage 20+ specialized academic research journals, editors, and Call for Papers.
              </p>
            </div>
            <button
              onClick={handleOpenCreateJournal}
              className="px-4 py-2 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add New University Journal
            </button>
          </div>

          {journalActionMsg && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 px-4 py-3 rounded-xl text-xs font-bold animate-fade-in">
              {journalActionMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {journalsList.map((j) => (
              <div key={j.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-[#0A192F] text-amber-400">
                      {j.short_code}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                      {j.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-[#0A192F] leading-snug line-clamp-2">
                    {j.title}
                  </h3>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {j.description}
                  </p>

                  <div className="text-[10px] text-slate-500 font-semibold border-t border-slate-100 pt-2 space-y-0.5">
                    <div><strong>Editor:</strong> {j.chief_editor || 'Prof. Dr. M. Arshad'}</div>
                    <div><strong>ISSN Print:</strong> {j.issn_print || '2709-1234'} • <strong>Online:</strong> {j.issn_online || '2709-5678'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleOpenEditJournal(j)}
                    className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition text-xs font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteJournal(j.id, j.title)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONFERENCES SETUP & SCHEDULE (WITH AUTO ARTICLE LINKER)             */}
      {/* ========================================================================= */}
      {activeSubTab === 'conference' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Executive ORIC Summit</span>
            <h2 className="text-2xl font-black text-[#0A192F]">University Conference Setup & Schedule</h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure event date, auditorium tickets, virtual streaming link, and attach presenting student articles.
            </p>
          </div>

          {/* Action / Sync Feedback Message */}
          {confActionMsg && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{confActionMsg}</span>
            </div>
          )}

          {/* Google Meet & Google Calendar Integration Hub */}
          <div className="bg-gradient-to-r from-blue-900 via-[#0A192F] to-slate-900 text-white p-5 rounded-2xl shadow-md border border-blue-800/40 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Google Meet & Calendar Integration</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono">
                      ACTIVE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Auto-schedules Google Calendar events, generates Google Meet room links, and sends reminders on conference day.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncCalendar}
                  disabled={syncingCalendar}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingCalendar ? 'animate-spin' : ''}`} />
                  <span>{syncingCalendar ? 'Syncing...' : 'Sync Meet & Calendar'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestReminder}
                  disabled={testingReminder}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow disabled:opacity-50"
                >
                  <Bell className="w-3.5 h-3.5 text-slate-950" />
                  <span>{testingReminder ? 'Sending...' : 'Test Day Reminder'}</span>
                </button>
              </div>
            </div>

            {/* Meet Link Display & Actions */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 truncate max-w-full">
                <span className="text-slate-400 font-semibold shrink-0">🎥 Google Meet:</span>
                <span className="font-mono text-amber-300 truncate">{confData.stream_link || 'https://meet.google.com'}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={confData.stream_link || 'https://meet.google.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold text-[11px] border border-blue-400/30 flex items-center gap-1 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Join Room</span>
                </a>
                <a
                  href={confData.calendar_html_link || `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(confData.title)}&dates=20261015T050000Z/20261015T110000Z&details=${encodeURIComponent('Lahore Leads University Conference\nMeet: ' + confData.stream_link)}&location=${encodeURIComponent(confData.venue)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] border border-emerald-400/30 flex items-center gap-1 transition"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Calendar View</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Attach Article Presenter */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2">
            <label className="text-xs font-black text-[#0A192F] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Auto-Attach Approved Paper & Student to Conference Presentation List
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedArticleToAttach}
                onChange={(e) => setSelectedArticleToAttach(e.target.value)}
                className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl border border-blue-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
              >
                <option value="">-- Select an approved article from repository --</option>
                {articles.map(art => (
                  <option key={art.id} value={art.id}>
                    {art.student_name} — {art.title} ({art.category})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAttachArticleToConference}
                className="px-4 py-2 bg-[#0A192F] text-amber-400 hover:bg-[#0F2C59] font-bold text-xs rounded-xl transition shrink-0"
              >
                + Add as Presenter
              </button>
            </div>
          </div>

          <form onSubmit={handleConferenceSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Conference Title *</label>
                <input
                  type="text"
                  required
                  value={confData.title}
                  onChange={(e) => setConfData({ ...confData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Conference Status *</label>
                <select
                  value={confData.status}
                  onChange={(e) => setConfData({ ...confData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold"
                >
                  <option value="Upcoming Summit">Upcoming Summit</option>
                  <option value="Live Now">Live Now</option>
                  <option value="Completed / Archive">Completed / Archive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Event Date *</label>
                <input
                  type="date"
                  required
                  value={confData.event_date}
                  onChange={(e) => setConfData({ ...confData, event_date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Time Duration *</label>
                <input
                  type="text"
                  required
                  value={confData.event_time}
                  onChange={(e) => setConfData({ ...confData, event_time: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Physical Venue Location *</label>
                <input
                  type="text"
                  required
                  value={confData.venue}
                  onChange={(e) => setConfData({ ...confData, venue: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <label className="text-slate-900 block font-black text-xs">Official Google Meet Room (Virtual Stream & Passes) *</label>
                    <p className="text-[11px] text-slate-500 font-medium">All students & delegates booking passes for this conference will automatically receive this exact Google Meet link!</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <a
                      href="https://meet.google.com/new"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
                      title="Create an instant room in your logged-in Google/Gmail account"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>+ Create in Google Meet</span>
                    </a>
                    {confData.stream_link && (
                      <a
                        href={confData.stream_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
                        title="Test Conference Google Meet Room"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Test Room</span>
                      </a>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={confData.stream_link}
                  onChange={(e) => setConfData({ ...confData, stream_link: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono font-bold text-blue-700 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="https://meet.google.com/abc-defg-hij"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Onsite Physical Ticket Price (PKR) *</label>
                <input
                  type="number"
                  value={confData.onsite_ticket_price}
                  onChange={(e) => setConfData({ ...confData, onsite_ticket_price: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Virtual Stream Ticket Price (PKR) *</label>
                <input
                  type="number"
                  value={confData.online_ticket_price}
                  onChange={(e) => setConfData({ ...confData, online_ticket_price: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 block mb-1 font-bold">Presenting Students & Pitching Papers</label>
              <textarea
                rows={3}
                value={confData.presenting_students}
                onChange={(e) => setConfData({ ...confData, presenting_students: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
                placeholder="e.g. Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-3 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black rounded-xl text-xs transition shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Save & Update Live Conference Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3.5: BOOKED DELEGATE PASSES & TICKETS VERIFICATION                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'tickets' && (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">ORIC Summit E-Ticketing</span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                  DELEGATE VERIFICATION
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#0A192F] tracking-tight mt-0.5">
                Booked Passes & Tickets Management
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Inspect fee challan slips, allocate auditorium seat numbers or virtual stream links, and issue official passes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <div className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                Total Bookings: <strong className="text-sm font-black text-[#0A192F]">{ticketsList.length}</strong>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                Pending Verification: <strong className="text-sm font-black text-amber-700">{ticketsList.filter(t => t.payment_status === 'Pending Admin Verification').length}</strong>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                Issued Passes: <strong className="text-sm font-black text-emerald-700">{ticketsList.filter(t => t.payment_status === 'Verified & Issued').length}</strong>
              </div>
            </div>
          </div>

          {/* Action Message */}
          {ticketActionMsg && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{ticketActionMsg}</span>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Search by attendee name, email, or pass code..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs font-bold">
              <button
                onClick={() => setTicketFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  ticketFilter === 'all' ? 'bg-[#0A192F] text-amber-400 font-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Passes ({ticketsList.length})
              </button>
              <button
                onClick={() => setTicketFilter('pending')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  ticketFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>⏳ Pending ({ticketsList.filter(t => t.payment_status === 'Pending Admin Verification').length})</span>
              </button>
              <button
                onClick={() => setTicketFilter('verified')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  ticketFilter === 'verified' ? 'bg-emerald-600 text-white font-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>✅ Issued ({ticketsList.filter(t => t.payment_status === 'Verified & Issued').length})</span>
              </button>
            </div>
          </div>

          {/* Booked Tickets List Table */}
          {ticketsList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-2">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No Conference Passes Booked Yet</h3>
              <p className="text-xs">When students or delegates book tickets, their payment slips and verification requests will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {ticketsList
                .filter(t => {
                  if (ticketFilter === 'pending') return t.payment_status === 'Pending Admin Verification';
                  if (ticketFilter === 'verified') return t.payment_status === 'Verified & Issued';
                  return true;
                })
                .filter(t => {
                  if (!ticketSearch) return true;
                  const q = ticketSearch.toLowerCase();
                  return (
                    (t.user_name && t.user_name.toLowerCase().includes(q)) ||
                    (t.user_email && t.user_email.toLowerCase().includes(q)) ||
                    (t.ticket_code && t.ticket_code.toLowerCase().includes(q)) ||
                    (t.transaction_id && t.transaction_id.toLowerCase().includes(q))
                  );
                })
                .map((ticket) => {
                  const isPending = ticket.payment_status === 'Pending Admin Verification';
                  const isOnsite = ticket.ticket_type === 'onsite';

                  return (
                    <div
                      key={ticket.id}
                      className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all space-y-4 shadow-sm ${
                        isPending ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                      }`}
                    >
                      {/* Top Row: Delegate Info & Status */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                            isOnsite ? 'bg-[#0A192F] text-amber-400' : 'bg-purple-900 text-purple-200'
                          }`}>
                            <Ticket className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-black text-[#0A192F]">
                                {ticket.user_name || 'Delegate User'}
                              </h3>
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border">
                                {ticket.ticket_code}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>✉️ {ticket.user_email || 'delegate@univ.edu'}</span>
                              <span>•</span>
                              <span>📱 {ticket.sender_mobile || '0348-2727605'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            isOnsite
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-purple-100 text-purple-900 border-purple-300'
                          }`}>
                            {isOnsite ? '🏛️ Onsite Auditorium Pass (PKR 500)' : '💻 Virtual HD Live Stream (PKR 200)'}
                          </span>

                          <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            {isPending ? '⏳ Verification Required' : '✅ Verified & Issued'}
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Event & Payment Challan Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        {/* Event Details */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Conference Event</span>
                          <strong className="text-[#0A192F] block leading-tight truncate">
                            {ticket.conference_title || 'Annual Innovation & Research Summit 2026'}
                          </strong>
                          <span className="text-slate-600 text-[11px] block">
                            📅 {ticket.event_date || '2026-09-15'} • ⏰ {ticket.event_time || '10:00 AM - 04:00 PM'}
                          </span>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Deposit Proof</span>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700">{ticket.sender_bank || 'HBL Mobile App'}</span>
                            <strong className="text-emerald-700 font-mono">PKR {ticket.amount_paid || 500}</strong>
                          </div>
                          <div className="font-mono text-[11px] text-slate-600">
                            TRX TID: <strong>{ticket.transaction_id || 'TRX-948201'}</strong>
                          </div>
                        </div>

                        {/* Inspect Screenshot Button */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Challan / Slip Screenshot</span>
                          <button
                            type="button"
                            onClick={() => setViewProofModal({
                              title: `Conference Pass Payment Proof — ${ticket.user_name}`,
                              url: ticket.receipt_url,
                              type: `${isOnsite ? 'Onsite Auditorium' : 'Virtual Live Stream'} Pass Fee`,
                              senderBank: ticket.sender_bank || 'HBL Mobile App',
                              transactionId: ticket.transaction_id || `TRX-CONF-${ticket.id}`,
                              senderMobile: ticket.sender_mobile || '0348-2727605',
                              studentName: ticket.user_name,
                              amount: `PKR ${ticket.amount_paid || (isOnsite ? 500 : 200)}`
                            })}
                            className="w-full py-1.5 bg-white hover:bg-slate-100 text-blue-900 rounded-xl text-xs font-bold border border-slate-300 flex items-center justify-center gap-1.5 transition shadow-2xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                            <span>Inspect Payment Proof</span>
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Seat Number Allocation & Issue Action */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <span className="font-bold text-slate-700 shrink-0">
                            {isOnsite ? '💺 Assigned Seat Number:' : '🎥 Stream Access Link:'}
                          </span>
                          {isOnsite ? (
                            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                              <input
                                type="text"
                                value={allocatingSeat[ticket.id] !== undefined ? allocatingSeat[ticket.id] : (ticket.seat_number || 'Auditorium Row A - Seat #15')}
                                onChange={(e) => setAllocatingSeat({ ...allocatingSeat, [ticket.id]: e.target.value })}
                                placeholder="e.g. Auditorium Row B - Seat #12"
                                className="w-full sm:w-64 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-bold"
                              />
                              <div className="flex gap-1 shrink-0">
                                {['Row A', 'Row B', 'Row C'].map(r => (
                                  <button
                                    key={r}
                                    type="button"
                                    onClick={() => setAllocatingSeat({ ...allocatingSeat, [ticket.id]: `${r} - Seat #${Math.floor(Math.random() * 25) + 1}` })}
                                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[10px] font-bold"
                                  >
                                    {r}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 w-full sm:w-auto flex-1 flex-wrap">
                              <input
                                type="text"
                                value={allocatingLink[ticket.id] !== undefined ? allocatingLink[ticket.id] : (ticket.stream_link || (conferences.find(c => c.id == ticket.conference_id) || activeConf)?.stream_link || 'https://meet.google.com/nrc-inno-sum')}
                                onChange={(e) => setAllocatingLink({ ...allocatingLink, [ticket.id]: e.target.value })}
                                placeholder="https://meet.google.com/abc-defg-hij"
                                className="w-full sm:w-72 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-semibold"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const letters = 'abcdefghijklmnopqrstuvwxyz';
                                  const pick = (len) => Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
                                  const validCode = `https://meet.google.com/${pick(3)}-${pick(4)}-${pick(3)}`;
                                  setAllocatingLink({ ...allocatingLink, [ticket.id]: validCode });
                                }}
                                className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-[11px] font-bold border border-amber-300 flex items-center gap-1 shrink-0"
                                title="Generate valid Google Meet code (3-4-3 format)"
                              >
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                <span>Auto-Gen Code</span>
                              </button>
                              <a
                                href="https://meet.google.com/new"
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-[11px] font-bold border border-purple-200 flex items-center gap-1 shrink-0"
                                title="Open Google Meet in your account to create a live room"
                              >
                                <ExternalLink className="w-3 h-3 text-purple-600" />
                                <span>+ New from Google</span>
                              </a>
                              {(allocatingLink[ticket.id] || ticket.stream_link || activeConf?.stream_link) && (
                                <a
                                  href={allocatingLink[ticket.id] || ticket.stream_link || activeConf?.stream_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-[11px] font-bold border border-blue-200 flex items-center gap-1 shrink-0"
                                  title="Test Google Meet Room in new tab"
                                >
                                  <Video className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Test Room</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={verifyingTicketId === ticket.id}
                            onClick={() => handleVerifyTicket(ticket)}
                            className={`px-5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm ${
                              isPending
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-amber-300" />
                            <span>
                              {verifyingTicketId === ticket.id
                                ? 'Issuing...'
                                : isPending
                                  ? 'Approve & Issue Pass'
                                  : 'Update Seat / Pass'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: RESEARCH ARTICLE READER ACCESS PASSES (VERIFY & UNLOCK)            */}
      {/* ========================================================================= */}
      {activeSubTab === 'readers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#0A192F]">Research Article Reader Passes</h2>
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                  Fee: PKR 500
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                Inspect paid student challan receipts (PDF or Screenshot), verify deposit, and unlock full paper reading permission.
              </p>
            </div>

            <button
              onClick={fetchReaderRequests}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Requests
            </button>
          </div>

          {readerActionMsg && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-3.5 rounded-2xl text-xs font-bold animate-fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{readerActionMsg}</span>
            </div>
          )}

          {/* Search & Status Filter */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={readerSearch}
                onChange={(e) => setReaderSearch(e.target.value)}
                placeholder="Search by reader name, email, or article..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold self-end sm:self-auto">
              <button
                onClick={() => setReaderFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  readerFilter === 'all' ? 'bg-[#0A192F] text-amber-400 font-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({readerRequestsList.length})
              </button>
              <button
                onClick={() => setReaderFilter('pending')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  readerFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Pending ({readerRequestsList.filter(r => r.status === 'Pending Admin Verification').length})
              </button>
              <button
                onClick={() => setReaderFilter('approved')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  readerFilter === 'approved' ? 'bg-emerald-600 text-white font-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Approved ({readerRequestsList.filter(r => r.status === 'Approved').length})
              </button>
            </div>
          </div>

          {/* Reader Access Requests List */}
          {readerRequestsList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-2">
              <Unlock className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No Reader Access Requests Recorded</h3>
              <p className="text-xs">When students submit fee proofs to unlock research papers, their verification requests will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {readerRequestsList
                .filter(r => {
                  if (readerFilter === 'pending') return r.status === 'Pending Admin Verification';
                  if (readerFilter === 'approved') return r.status === 'Approved';
                  return true;
                })
                .filter(r => {
                  if (!readerSearch) return true;
                  const q = readerSearch.toLowerCase();
                  return (
                    (r.user_name && r.user_name.toLowerCase().includes(q)) ||
                    (r.user_email && r.user_email.toLowerCase().includes(q)) ||
                    (r.article_title && r.article_title.toLowerCase().includes(q)) ||
                    (r.transaction_id && r.transaction_id.toLowerCase().includes(q))
                  );
                })
                .map((reqItem) => {
                  const isPending = reqItem.status === 'Pending Admin Verification';

                  return (
                    <div
                      key={reqItem.id}
                      className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all space-y-4 shadow-sm ${
                        isPending ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                      }`}
                    >
                      {/* Top Row: Reader & Article Info */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center font-black text-xs">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-black text-[#0A192F]">
                                {reqItem.user_name || 'Student Researcher'}
                              </h3>
                              <span className="text-xs text-slate-500 font-normal">
                                ({reqItem.user_email || 'student@leads.edu.pk'})
                              </span>
                            </div>
                            <p className="text-xs font-bold text-blue-900 mt-0.5 line-clamp-1">
                              📄 Article: {reqItem.article_title}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            {isPending ? '⏳ Awaiting Verification' : '✅ Access Approved'}
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Deposit Proof Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Bank & Method</span>
                          <strong className="text-[#0A192F] block text-sm">
                            {reqItem.sender_bank || 'HBL Mobile App'}
                          </strong>
                          <span className="text-slate-500 font-mono text-[11px]">
                            Mobile: {reqItem.sender_mobile || '0348-2727605'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Deposit Amount & TID</span>
                          <div className="flex justify-between items-center">
                            <strong className="text-emerald-700 text-sm font-black">PKR {reqItem.amount_paid || 500}</strong>
                          </div>
                          <div className="font-mono text-[11px] text-slate-700">
                            TRX TID: <strong>{reqItem.transaction_id || 'TRX-94821'}</strong>
                          </div>
                        </div>

                        {/* Inspect Proof Button */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Receipt / Challan</span>
                          <button
                            type="button"
                            onClick={() => setViewProofModal({
                              title: `Reader Access Payment Proof — ${reqItem.user_name}`,
                              url: reqItem.receipt_url,
                              type: 'Research Article Reader Pass (PKR 500)',
                              senderBank: reqItem.sender_bank || 'HBL Mobile App',
                              transactionId: reqItem.transaction_id || `TRX-READ-${reqItem.id}`,
                              senderMobile: reqItem.sender_mobile || '0348-2727605',
                              studentName: reqItem.user_name,
                              amount: `PKR ${reqItem.amount_paid || 500}`
                            })}
                            className="w-full py-1.5 bg-white hover:bg-slate-100 text-blue-900 rounded-xl text-xs font-bold border border-slate-300 flex items-center justify-center gap-1.5 transition shadow-2xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                            <span>Inspect Fee Proof (PDF / Slip)</span>
                          </button>
                        </div>
                      </div>

                      {/* Bottom Action: Approve Access */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        {isPending ? (
                          <button
                            type="button"
                            disabled={approvingReaderId === reqItem.id}
                            onClick={() => handleApproveReaderAccess(reqItem)}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                            <span>{approvingReaderId === reqItem.id ? 'Granting Access...' : 'Approve & Unlock Reader Pass'}</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full Paper Reading Access Unlocked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: VENTURE INVESTORS CRUD                                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'investors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-[#0A192F]">Registered Venture Investors & Capital Funds</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Provision new venture capitalist accounts, edit details, reset passwords, or manage access.
              </p>
            </div>
            <button
              onClick={handleOpenCreateInvestor}
              className="px-4 py-2 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-4 h-4" /> Provision New Investor Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investorList.map((inv) => (
              <div key={inv.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-black text-sm">
                      {inv.full_name?.charAt(0) || 'I'}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {inv.organization || 'Venture Capital'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">{inv.full_name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{inv.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 pt-3 text-xs font-bold">
                  <button
                    onClick={() => handleResetInvestorPassword(inv)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    title="Reset Password"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditInvestor(inv)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteInvestor(inv)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: STUDENT INQUIRIES & DIRECT SUPPORT DESK                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Student-Admin Communication Pipeline</span>
              <h2 className="text-2xl font-black text-[#0A192F]">Student Inquiries & Helpdesk Desk</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Real-time inquiry desk connected to WhatsApp (+92 348 2727605), Gmail, and Google Drive archival. Replying sends an official email directly to the student's inbox and updates their portal in real time.
              </p>
            </div>

            <button
              onClick={fetchAdminInquiries}
              disabled={loadingInquiries}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingInquiries ? 'animate-spin' : ''}`} />
              <span>Refresh Messages</span>
            </button>
          </div>

          {inquiryActionMsg && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-4 rounded-2xl text-xs font-bold animate-fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{inquiryActionMsg}</span>
            </div>
          )}

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                placeholder="Search by student, email, subject, or message..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none transition"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold self-end sm:self-auto">
              <button
                onClick={() => setInquiryFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  inquiryFilter === 'all' ? 'bg-[#0A192F] text-amber-400 font-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Messages ({inquiriesList.length})
              </button>
              <button
                onClick={() => setInquiryFilter('pending')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                  inquiryFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>⏳ Pending Reply</span>
                <span className="bg-white text-amber-950 text-[10px] px-1.5 rounded-full font-black">
                  {inquiriesList.filter(i => i.status === 'Pending').length}
                </span>
              </button>
              <button
                onClick={() => setInquiryFilter('replied')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  inquiryFilter === 'replied' ? 'bg-emerald-700 text-white font-black' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                ✓ Replied ({inquiriesList.filter(i => i.status === 'Replied').length})
              </button>
            </div>
          </div>

          {/* Inquiries Cards */}
          {inquiriesList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-2">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">No Student Inquiries Recorded</h3>
              <p className="text-xs">When students submit questions from their dashboard, they will appear here in real time with instant reply capabilities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiriesList
                .filter(inq => {
                  if (inquiryFilter === 'pending') return inq.status === 'Pending';
                  if (inquiryFilter === 'replied') return inq.status === 'Replied';
                  return true;
                })
                .filter(inq => {
                  if (!inquirySearch) return true;
                  const q = inquirySearch.toLowerCase();
                  return (
                    (inq.student_name && inq.student_name.toLowerCase().includes(q)) ||
                    (inq.student_email && inq.student_email.toLowerCase().includes(q)) ||
                    (inq.subject && inq.subject.toLowerCase().includes(q)) ||
                    (inq.message && inq.message.toLowerCase().includes(q)) ||
                    (inq.category && inq.category.toLowerCase().includes(q))
                  );
                })
                .map((inquiry) => {
                  const isPending = inquiry.status === 'Pending';
                  const currentReply = replyTextMap[inquiry.id] || '';

                  return (
                    <div
                      key={inquiry.id}
                      className={`bg-white rounded-3xl p-6 border-2 transition-all space-y-4 shadow-sm ${
                        isPending ? 'border-amber-300 bg-amber-50/15' : 'border-slate-200'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center font-black text-sm shrink-0 border border-amber-400/30">
                            🎓
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-black text-[#0A192F]">{inquiry.student_name}</h3>
                              <span className="text-xs font-mono text-slate-500 font-semibold">({inquiry.student_email || 'student@leads.edu.pk'})</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                                {inquiry.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              Inquiry ID: #{inquiry.id} • Submitted: {inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : 'Recently'}
                            </p>
                          </div>
                        </div>

                        <div>
                          <span className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            {isPending ? '⏳ Awaiting Admin Reply' : '✅ Replied & Sent to Gmail'}
                          </span>
                        </div>
                      </div>

                      {/* Inquiry Content */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <div className="text-xs font-black text-[#0A192F] flex items-center gap-1.5">
                          <span>Subject:</span>
                          <span className="font-bold text-blue-900">{inquiry.subject}</span>
                        </div>
                        <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                          {inquiry.message}
                        </div>
                      </div>

                      {/* Existing Response Display */}
                      {inquiry.reply_text && (
                        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-amber-400/30 space-y-2 shadow-inner">
                          <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4" /> Previous Response from {inquiry.admin_name || 'Admin Desk'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {inquiry.replied_at ? new Date(inquiry.replied_at).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{inquiry.reply_text}</p>
                        </div>
                      )}

                      {/* Inline Reply Box */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-black text-[#0A192F] flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 text-blue-600" />
                            <span>{inquiry.reply_text ? 'Send Additional Response / Follow-up' : 'Compose Official Response to Student'}</span>
                          </label>

                          {/* Quick Canned Responses */}
                          <div className="flex flex-wrap items-center gap-1 text-[11px]">
                            <span className="text-slate-400 text-[10px] font-bold mr-1">Quick Templates:</span>
                            <button
                              type="button"
                              onClick={() => setReplyTextMap(prev => ({
                                ...prev,
                                [inquiry.id]: `Dear ${inquiry.student_name},\n\nYour manuscript has been evaluated by the ORIC Editorial Board. Please review the revision notes attached to your submission and submit the corrected draft.\n\nBest regards,\nORIC Research Cell\nLahore Leads University`
                              }))}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-medium"
                            >
                              Revision Notes Sent
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyTextMap(prev => ({
                                ...prev,
                                [inquiry.id]: `Dear ${inquiry.student_name},\n\nYour fee challan deposit proof has been verified by the university accounts desk. Your paper has been moved to the live publishing schedule.\n\nBest regards,\nORIC Research Cell\nLahore Leads University`
                              }))}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-medium"
                            >
                              Challan Verified
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyTextMap(prev => ({
                                ...prev,
                                [inquiry.id]: `Dear ${inquiry.student_name},\n\nYour conference pass and delegate seating have been allocated. You can view your official E-Pass and Google Meet link in your student portal.\n\nBest regards,\nConference Secretariat\nLahore Leads University`
                              }))}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-medium"
                            >
                              Pass Allocated
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={3}
                          value={currentReply}
                          onChange={(e) => setReplyTextMap(prev => ({ ...prev, [inquiry.id]: e.target.value }))}
                          placeholder="Type your official response here. This will be emailed directly to the student's Gmail and synced in their student portal..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                        />

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span>📧 Student Gmail: <strong className="text-slate-800">{inquiry.student_email || 'bazighminhas1@gmail.com'}</strong></span>
                            <span>•</span>
                            <span>📁 Google Drive: <strong className="text-slate-800">Student_Inquiries/</strong></span>
                          </div>

                          <button
                            type="button"
                            disabled={replyingInquiryId === inquiry.id || !currentReply.trim()}
                            onClick={() => handleSendAdminReply(inquiry)}
                            className="px-5 py-2 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black text-xs rounded-xl transition shadow-md flex items-center gap-1.5 border border-amber-400/40 disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5 text-amber-400" />
                            <span>{replyingInquiryId === inquiry.id ? 'Dispatching Email & Syncing Drive...' : 'Send Official Response to Student'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Administration</span>
            <h2 className="text-2xl font-black text-[#0A192F]">User Management</h2>
            <p className="text-xs text-slate-500">Admin can view and remove portal accounts. Role/profile edits are available through the admin API.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Organization</th><th className="text-right">Action</th></tr></thead>
              <tbody>
                {adminUsers.map(u => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="py-3 font-bold text-slate-900">{u.full_name}</td><td>{u.email}</td><td className="uppercase font-bold">{u.role}</td><td>{u.organization || '—'}</td>
                    <td className="text-right"><button onClick={() => deleteAdminUser(u.id)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50" title="Delete user"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700"><HardDrive className="w-5 h-5" /></div>
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">System Settings</span>
              <h2 className="text-2xl font-black text-[#0A192F]">Google Drive & Cloud Storage</h2>
              <p className="text-xs text-slate-500">Replace the active Drive when storage is full. Credentials are validated before activation and never shown back in the browser.</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${storage.success ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="text-xs font-black text-slate-900">{storage.success ? 'Connected' : 'Needs attention'}</div>
            <div className="text-[11px] text-slate-600 mt-1">Folder: {storage.folderName || storage.folderId || 'Not configured'}</div>
            <div className="text-[11px] text-slate-600">Service account: {storage.serviceAccountEmail || 'Not configured'} • Source: {storage.credentialSource || 'unknown'}</div>
            {storage.error && <div className="text-[11px] text-rose-700 mt-1">{storage.error}</div>}
          </div>

          <form onSubmit={saveStorageSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">Google Drive Folder ID</label>
              <input value={storageFolderId} onChange={e => setStorageFolderId(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-400 outline-none" placeholder="1jDaTM-..." />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">Replace Service Account Credential (JSON)</label>
              <input type="file" accept="application/json,.json" onChange={e => setStorageCredentialFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs bg-slate-50" />
              <p className="text-[10px] text-slate-500 mt-1">Leave empty to keep the currently active credential and only change the folder.</p>
            </div>
            {storageMsg && <div className={`p-3 rounded-xl text-xs font-bold ${storageMsg.startsWith('✓') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>{storageMsg}</div>}
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={savingStorage} className="px-4 py-2.5 bg-[#0A192F] text-amber-400 rounded-xl text-xs font-black flex items-center gap-2"><Save className="w-4 h-4" />{savingStorage ? 'Verifying...' : 'Save & Activate'}</button>
              <button type="button" onClick={testStorage} className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50"><RefreshCw className="w-4 h-4 inline mr-1" />Test Connection</button>
              <button type="button" onClick={backupDrive} className="px-4 py-2.5 border border-blue-200 bg-blue-50 rounded-xl text-xs font-black text-blue-800"><HardDrive className="w-4 h-4 inline mr-1" />Backup Database Now</button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: NOTIFICATIONS AUDIT LOG                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Automated Notification Engine</span>
              <h2 className="text-2xl font-black text-[#0A192F]">WhatsApp & Email Dispatch Logs</h2>
              <p className="text-xs text-slate-500">
                Admin Phone: <strong className="text-slate-800 font-mono">{notifState.admin_whatsapp}</strong> • Email: <strong className="text-slate-800">{notifState.admin_email}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {notifState.history.length > 0 && (
                <button
                  onClick={handleClearNotificationLogs}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1.5"
                  title="Clear all notification dispatch logs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clear History</span>
                </button>
              )}
              <button
                onClick={handleSendTestNotification}
                disabled={testingNotif}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingNotif ? 'Dispatching...' : 'Send Live Test Ping'}</span>
              </button>
            </div>
          </div>

          {notifSuccessMsg && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-3 rounded-xl text-xs font-bold animate-fade-in">
              {notifSuccessMsg}
            </div>
          )}

          <div className="space-y-2">
            {notifState.history.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-bold">
                No notification logs recorded yet.
              </div>
            ) : (
              notifState.history.map((log) => (
                <div key={log.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-black text-[#0A192F] flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded text-[10px] uppercase font-mono ${
                        log.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.channel}
                      </span>
                      <span>{log.title}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-1">{log.content}</p>
                  </div>
                  <div className="text-right shrink-0 text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EVALUATION & GRADING MODAL (WITH EMBEDDED MANUSCRIPT & FEE SLIPS)        */}
      {/* ========================================================================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in text-slate-900">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-slate-100 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-slate-100 pb-3 pr-8">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">ORIC Editorial Board Review</span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  selectedArticle.is_published ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  Status: {selectedArticle.status}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] leading-snug mt-1">{selectedArticle.title}</h2>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span>Author: <strong className="text-slate-900 font-bold">{selectedArticle.student_name}</strong></span>
                <span>•</span>
                <span>Category / Journal: <strong className="text-blue-900 font-bold">{selectedArticle.category}</strong></span>
                <span>•</span>
                <span className="font-mono text-slate-600">DOI: {selectedArticle.doi || `10.5281/leads.2026.${selectedArticle.id}`}</span>
              </div>
            </div>

            {/* SECTION 1: MANUSCRIPT CONTENT & PDF VIEWER */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-[#0A192F] flex items-center gap-1.5 uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-blue-700" /> Submitted Manuscript & Abstract
                </span>
                <button
                  type="button"
                  onClick={() => setViewManuscriptArticle(selectedArticle)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-blue-900 font-bold text-[11px] rounded-lg border border-slate-300 flex items-center gap-1 shadow-2xs transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Open Full PDF Manuscript
                </button>
              </div>

              <div className="text-xs text-slate-700 space-y-2 max-h-36 overflow-y-auto bg-white p-3.5 rounded-xl border border-slate-200">
                <strong className="text-[#0A192F] block text-[11px] uppercase font-bold">Abstract:</strong>
                <p className="italic text-slate-800 leading-relaxed font-serif">"{selectedArticle.abstract}"</p>
                {selectedArticle.full_text && selectedArticle.full_text !== selectedArticle.abstract && (
                  <div className="pt-2 border-t border-slate-100 font-serif whitespace-pre-wrap text-[11px] text-slate-700">
                    <strong className="font-sans text-[#0A192F] uppercase block text-[10px] mb-1">Body Text Excerpt:</strong>
                    {selectedArticle.full_text.slice(0, 500)}...
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: UPLOADED PAYMENT FEE SLIPS & CHALLAN SCREENSHOTS */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-[#0A192F] flex items-center gap-1.5 uppercase tracking-wide">
                  <CreditCard className="w-4 h-4 text-emerald-700" /> Attached Bank Challan & Payment Proofs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Proof 1: Submission Fee Slip */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Submission Fee Proof</span>
                      <strong className="text-xs text-blue-950">PKR 1,500 (Initial Deposit)</strong>
                    </div>
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {selectedArticle.submission_receipt_url ? 'Attached' : 'Generated'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewProofModal({
                        title: `Submission Fee Slip — ${selectedArticle.student_name}`,
                        url: selectedArticle.submission_receipt_url || selectedArticle.receipt_url,
                        type: 'Manuscript Submission Fee',
                        senderBank: selectedArticle.sender_bank || 'HBL Mobile App',
                        transactionId: selectedArticle.transaction_id || `TRX-${selectedArticle.id}948`,
                        senderMobile: selectedArticle.sender_mobile || '0348-2727605',
                        studentName: selectedArticle.student_name,
                        amount: 'PKR 1,500'
                      })}
                      className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-bold border border-blue-200 flex items-center justify-center gap-1 transition"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-blue-700" /> Inspect Submission Slip
                    </button>
                  </div>
                </div>

                {/* Proof 2: Publication Fee Slip */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Publication Fee Proof</span>
                      <strong className="text-xs text-purple-950">PKR 3,000 (Live Publishing)</strong>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      (selectedArticle.publication_receipt_url || selectedArticle.receipt_url) ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {(selectedArticle.publication_receipt_url || selectedArticle.receipt_url) ? 'Paid & Attached' : 'Pending Payment'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {(selectedArticle.publication_receipt_url || selectedArticle.receipt_url) ? (
                      <button
                        type="button"
                        onClick={() => setViewProofModal({
                          title: `Publication Fee Slip — ${selectedArticle.student_name}`,
                          url: selectedArticle.publication_receipt_url || selectedArticle.receipt_url,
                          type: 'Live Publication Fee',
                          senderBank: selectedArticle.sender_bank || 'HBL Mobile App',
                          transactionId: selectedArticle.transaction_id || `TRX-PUB-${selectedArticle.id}`,
                          senderMobile: selectedArticle.sender_mobile || '0348-2727605',
                          studentName: selectedArticle.student_name,
                          amount: 'PKR 3,000'
                        })}
                        className="w-full py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-xs font-bold border border-purple-200 flex items-center justify-center gap-1 transition"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-purple-700" /> Inspect Publication Slip
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic text-center w-full block py-1">
                        Student will upload after category approval
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: EDITORIAL EVALUATION, TIER & MISTAKES FORM */}
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              {/* Quick Preset Templates */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTier('None (Initial Review - Mistakes Identified)');
                    setNotes('Mistakes Identified: 1. Please format references following IEEE guidelines. 2. Expand the methodology section with comparative benchmarks. 3. Fix grammatical phrasing in Abstract.');
                  }}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-bold border border-amber-300 transition"
                >
                  📝 Identify Mistakes & Request Fix
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTier('Platinum (Top 5% - Full Publication & Summit Pitch)');
                    setNotes('🎉 Outstanding manuscript! Quality verified and accepted for Platinum indexation. Please deposit the Publication Fee (PKR 3,000) using the challan voucher to finalize live website publication.');
                  }}
                  className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-[10px] font-bold border border-purple-300 transition"
                >
                  🏆 Platinum Approval & Request Pub Fee
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTier('Gold (Top 15% - Accepted & Presentation Eligible)');
                    setNotes('🎉 Revisions verified and accepted! Please deposit the Publication Fee (PKR 3,000) to publish your paper live on the portal.');
                  }}
                  className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-[10px] font-bold border border-emerald-300 transition"
                >
                  ⭐ Gold Acceptance & Request Pub Fee
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Assign Quality Category / Tier *</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                  >
                    <option value="None (Initial Review - Mistakes Identified)">None (Initial Review - Mistakes Identified / Revision Required)</option>
                    <option value="Bronze (Needs Major Revision - Corrections Required)">Bronze (Needs Major Revision - Corrections Required)</option>
                    <option value="Silver (Archive / Minor Corrections Needed)">Silver (Archive / Minor Corrections Needed)</option>
                    <option value="Gold (Top 15% - Accepted & Presentation Eligible)">Gold (Top 15% - Accepted & Eligible for Publication)</option>
                    <option value="Platinum (Top 5% - Full Publication & Summit Pitch)">Platinum (Top 5% - Flagship Acceptance & Summit Pitch)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Plagiarism Similarity Index (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={plagiarismScore}
                    onChange={(e) => setPlagiarismScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">
                  Editorial Review Feedback / Mistakes Identified / Instructions for Student *
                </label>
                <textarea
                  rows={4}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="State exact mistakes for student to correct OR write acceptance instructions for publication fee payment..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed font-sans focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              {/* Dynamic Status Action Preview */}
              {(() => {
                const isMistakes = tier.includes('None') || tier.includes('Needs Revision') || tier.includes('Mistakes');
                return (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isMistakes 
                      ? 'bg-rose-50 border-rose-200 text-rose-900' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    {isMistakes ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          <strong>Mistakes Mode:</strong> Status will be set to <em>"Needs Revision"</em>. Student will see your feedback notes and can submit a corrected draft.
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Category Approval Mode:</strong> Status will be set to <em>"Approved - Awaiting Publication Fee"</em>. Student's resubmit button will be hidden, and they will be prompted to deposit PKR 3,000.
                        </span>
                      </>
                    )}
                  </div>
                );
              })()}

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {(() => {
                    const isMistakes = tier.includes('None') || tier.includes('Needs Revision') || tier.includes('Mistakes');
                    if (isMistakes) {
                      return (
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                        >
                          <AlertCircle className="w-4 h-4 text-white" />
                          <span>Send Mistakes & Request Revisions (Notify Student)</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5 border border-amber-400/40"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Approve Category & Request Publication Fee (PKR 3,000)</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT INVESTOR MODAL */}
      {showInvestorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-slate-900">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowInvestorModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-lg font-black text-[#0A192F]">
                {editingInvestor ? 'Edit Investor Credentials' : 'Provision Venture Investor Account'}
              </h3>
            </div>

            <form onSubmit={handleSaveInvestorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Investor Full Name *</label>
                <input
                  type="text"
                  required
                  value={investorFormData.full_name}
                  onChange={(e) => setInvestorFormData({ ...investorFormData, full_name: e.target.value })}
                  placeholder="e.g. John Malik"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Email Address (Login Username) *</label>
                <input
                  type="email"
                  required
                  value={investorFormData.email}
                  onChange={(e) => setInvestorFormData({ ...investorFormData, email: e.target.value })}
                  placeholder="e.g. name@venturefund.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">
                  {editingInvestor ? 'New Password (Leave blank to keep unchanged)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingInvestor}
                  value={investorFormData.password}
                  onChange={(e) => setInvestorFormData({ ...investorFormData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Venture Firm / Organization *</label>
                <input
                  type="text"
                  required
                  value={investorFormData.organization}
                  onChange={(e) => setInvestorFormData({ ...investorFormData, organization: e.target.value })}
                  placeholder="e.g. Apex Tech Capital"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInvestorModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black rounded-xl text-xs transition shadow-sm"
                >
                  {editingInvestor ? 'Save Changes' : 'Create Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT JOURNAL MODAL */}
      {showJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-slate-900">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => setShowJournalModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xl font-black text-[#0A192F]">
                {editingJournal ? `Edit Journal: ${editingJournal.short_code}` : 'Create New University Journal'}
              </h3>
            </div>

            <form onSubmit={handleSaveJournalSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Journal Full Title *</label>
                  <input
                    type="text"
                    required
                    value={journalFormData.title}
                    onChange={(e) => setJournalFormData({ ...journalFormData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Short Code (e.g. LJ-AIML) *</label>
                  <input
                    type="text"
                    required
                    value={journalFormData.short_code}
                    onChange={(e) => setJournalFormData({ ...journalFormData, short_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Scope & Description</label>
                <textarea
                  rows={3}
                  value={journalFormData.description}
                  onChange={(e) => setJournalFormData({ ...journalFormData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Category / Discipline *</label>
                  <input
                    type="text"
                    required
                    value={journalFormData.category}
                    onChange={(e) => setJournalFormData({ ...journalFormData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Chief Editor</label>
                  <input
                    type="text"
                    value={journalFormData.chief_editor}
                    onChange={(e) => setJournalFormData({ ...journalFormData, chief_editor: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowJournalModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black rounded-xl text-xs transition shadow-sm"
                >
                  {editingJournal ? 'Update Journal' : 'Create Journal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROOF INSPECTOR MODAL */}
      <ProofViewerModal
        isOpen={Boolean(viewProofModal)}
        onClose={() => setViewProofModal(null)}
        proofData={viewProofModal}
      />

      {/* MANUSCRIPT PDF MODAL */}
      <ManuscriptModal
        isOpen={Boolean(viewManuscriptArticle)}
        onClose={() => setViewManuscriptArticle(null)}
        article={viewManuscriptArticle}
        user={{ role: 'admin', full_name: 'System Admin' }}
      />
    </div>
  );
};
