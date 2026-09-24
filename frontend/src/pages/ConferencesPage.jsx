import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  MapPin,
  Ticket,
  Video,
  ChevronRight,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Share2,
  Building,
  ShieldCheck
} from 'lucide-react';
import { TicketBookingModal } from '../components/TicketBookingModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function ConferencesPage({ user, onOpenAuth }) {
  const navigate = useNavigate();

  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedConfModal, setSelectedConfModal] = useState(null);
  const [ticketModalConf, setTicketModalConf] = useState(null);

  const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

  // Seed sample conferences for Lahore Leads University
  const sampleConferences2026 = [
    {
      id: 1,
      title: 'Lahore Leads University National Innovation & Research Summit 2026',
      description: 'Annual flagship summit showcasing top student research presentations directly to venture capital investors, industry partners, and academic deans.',
      event_date: '2026-09-15',
      event_time: '10:00 AM - 04:00 PM',
      venue: 'Lahore Leads University Main Campus Grand Auditorium (Kamahan Road) & Global Virtual Stream',
      stream_link: 'https://meet.google.com/xyz-demo-stream',
      cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
      onsite_ticket_price: 50,
      online_ticket_price: 20,
      presenting_students: 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography), Ali Ahmed (Nanomedicine), Ali Ahmed (Agri Drones)',
      attending_investors: 'John Malik (Apex Tech Capital), Dr. Sarah Vance (BioHealth VC), Hamza Qureshi (FinTech Angels)'
    },
    {
      id: 2,
      title: 'Global AI & Clean Energy Summit 2026',
      description: 'Premier international summit showcasing renewable energy research and deep learning models for sustainable municipal micro-grids.',
      event_date: '2026-11-20',
      event_time: '09:00 AM - 05:00 PM',
      venue: 'Lahore Leads University City Campus Hall A & Live HD Stream',
      stream_link: 'https://meet.google.com/ai-clean-energy',
      cover_image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
      onsite_ticket_price: 750,
      online_ticket_price: 300,
      presenting_students: 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)',
      attending_investors: 'Silicon Venture Partners, Apex Tech Capital'
    },
    {
      id: 3,
      title: 'International Conference on Healthcare Challenges and Innovations in the 21st Century (HCIC 2026)',
      description: 'Interdisciplinary gathering of biochemists, healthcare practitioners, and AI diagnostic researchers addressing digital healthcare frameworks.',
      event_date: '2026-06-10',
      event_time: '09:30 AM - 04:30 PM',
      venue: 'Lahore Leads University Health & Applied Sciences Complex',
      stream_link: 'https://meet.google.com/hcic-2026',
      cover_image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
      onsite_ticket_price: 600,
      online_ticket_price: 250
    },
    {
      id: 4,
      title: '9th International Conference on Pure and Applied Sciences (ICPAS-2026)',
      description: 'Leading symposium covering applied mathematics, computational fluid dynamics, engineering modeling, and numerical optimization.',
      event_date: '2026-06-04',
      event_time: '10:00 AM - 04:00 PM',
      venue: 'Engineering Block Auditorium 3, Kamahan Campus',
      stream_link: 'https://meet.google.com/icpas-2026',
      cover_image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
      onsite_ticket_price: 450,
      online_ticket_price: 150
    },
    {
      id: 5,
      title: '3rd International Conference on Frontiers in Computer Science & AI (ICFCS-2026)',
      description: 'Bringing together computer scientists on Large Language Models, quantum cryptographic defenses, and autonomous edge computing.',
      event_date: '2026-05-20',
      event_time: '09:00 AM - 05:00 PM',
      venue: 'Faculty of Computer Science Hall 1, Lahore Leads University',
      stream_link: 'https://meet.google.com/icfcs-2026',
      cover_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      onsite_ticket_price: 800,
      online_ticket_price: 350
    },
    {
      id: 6,
      title: '4th International Business & Entrepreneurship Symposium (IBES-2026)',
      description: 'Strategic analysis on venture capital finance, digital corporate governance, Islamic banking, and SME scalability in South Asia.',
      event_date: '2026-05-13',
      event_time: '10:00 AM - 03:30 PM',
      venue: 'Lahore Leads University Business School Executive Hall',
      stream_link: 'https://meet.google.com/ibes-2026',
      cover_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      onsite_ticket_price: 500,
      online_ticket_price: 200
    }
  ];

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/conferences`);
      if (res.data && res.data.length > 0) {
        const existingIds = new Set(res.data.map(c => c.id));
        const combined = [...res.data, ...sampleConferences2026.filter(s => !existingIds.has(s.id))];
        setConferences(combined);
      } else {
        setConferences(sampleConferences2026);
      }
    } catch (err) {
      setConferences(sampleConferences2026);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTicket = (conf) => {
    if (!user || !user.id || user.role === 'guest' || !user.email) {
      if (onOpenAuth) {
        onOpenAuth('login');
      } else {
        navigate('/login');
      }
      return;
    }
    setTicketModalConf(conf);
  };

  return (
    <div className="space-y-10 font-sans pb-24">
      {/* Top Banner Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200">
        {/* Campus Background Image with Overlay */}
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80"
            alt="Lahore Leads University Campus"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0F2C59]/80 to-[#0A192F]/40" />

          {/* Banner Text */}
          <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-end text-white space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ORIC &bull; Lahore Leads University</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight drop-shadow">
              CONFERENCES & SUMMITS
            </h1>

            {/* Sub-nav Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => navigate('/journals')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/20 shadow backdrop-blur-sm"
              >
                Journals
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-amber-600 text-white transition shadow font-extrabold"
              >
                Conferences
              </button>
              <button
                onClick={() => navigate('/showcase')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/20 shadow backdrop-blur-sm"
              >
                Innovation Centers
              </button>
            </div>
          </div>
        </div>

        {/* Sub-strip Note */}
        <div className="bg-[#0F2C59] text-white px-6 py-3.5 text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-blue-900">
          <span>Official research conferences and academic symposia hosted at Lahore Leads University.</span>
          <span className="text-xs text-amber-300 font-bold">Kamahan Main Campus & City Campus</span>
        </div>
      </div>

      {/* Year Section Header & Filter Pills */}
      <div className="text-center space-y-6 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
          Annual Conferences ({selectedYear})
        </h2>

        {/* Year Pills Navigation */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          {years.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                selectedYear === yr
                  ? 'bg-[#0F2C59] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#0F2C59] hover:bg-slate-100'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Conference Grid */}
      {selectedYear !== '2026' ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">Archived Proceedings for Year {selectedYear}</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Conference proceedings and digital records for {selectedYear} are available in the Lahore Leads University institutional archives repository.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {conferences.map((conf) => (
            <div
              key={conf.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(15,44,89,0.12)] hover:border-[#0F2C59]/40 transition-all duration-300 p-5 sm:p-6 flex flex-col sm:flex-row gap-5 group"
            >
              {/* Left Thumbnail Photo / Cover */}
              <div
                onClick={() => setSelectedConfModal(conf)}
                className="w-full sm:w-44 h-40 sm:h-44 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer shadow border border-slate-200 relative"
              >
                <img
                  src={conf.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80'}
                  alt={conf.title}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Right Side Info */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  {/* Date Tag with Calendar Icon */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    <span>
                      {new Date(conf.event_date || '2026-09-15').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Conference Title */}
                  <h3
                    onClick={() => setSelectedConfModal(conf)}
                    className="text-base sm:text-lg font-black text-[#0A192F] group-hover:text-amber-700 transition-colors cursor-pointer leading-snug"
                  >
                    {conf.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span>{conf.venue || 'Lahore Leads University Main Auditorium'}</span>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedConfModal(conf)}
                      className="text-xs font-bold text-[#0F2C59] hover:text-amber-700 transition"
                    >
                      View Details
                    </button>
                    {conf.stream_link && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                        title="Virtual stream available for pass holders"
                      >
                        <Video className="w-3 h-3 text-blue-600" />
                        <span>HD Stream Available</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={conf.calendar_html_link || `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(conf.title)}&dates=20261015T050000Z/20261015T110000Z&details=${encodeURIComponent('Lahore Leads University Conference\nAuditorium & Virtual Stream Access')}&location=${encodeURIComponent(conf.venue || 'Lahore Leads University')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
                      title="Add to Google Calendar"
                    >
                      <Calendar className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleBookTicket(conf)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Book Pass</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conference Details Modal */}
      {selectedConfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Lahore Leads University Conference</span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#0A192F]">
                  {selectedConfModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedConfModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span><strong className="text-[#0A192F]">Date:</strong> {selectedConfModal.event_date}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-amber-700" />
                <span><strong className="text-[#0A192F]">Time:</strong> {selectedConfModal.event_time || '10:00 AM - 04:00 PM'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 sm:col-span-2">
                <MapPin className="w-4 h-4 text-amber-700" />
                <span><strong className="text-[#0A192F]">Venue:</strong> {selectedConfModal.venue}</span>
              </div>
              {selectedConfModal.stream_link && (
                <div className="flex items-center gap-2 text-slate-700 sm:col-span-2 bg-blue-50/60 p-2.5 rounded-xl border border-blue-200/60 text-xs">
                  <Video className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span><strong>Virtual Live Stream:</strong> Secure Google Meet link & QR access pass delivered to your portal & Gmail upon pass verification.</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">Conference Scope & Overview</h4>
              <p className="text-slate-700 text-sm leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {selectedConfModal.description}
              </p>
            </div>

            {selectedConfModal.presenting_students && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">Presenting Research Innovators</h4>
                <p className="text-slate-700 text-xs bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  {selectedConfModal.presenting_students}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <a
                  href={selectedConfModal.calendar_html_link || `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedConfModal.title)}&dates=20261015T050000Z/20261015T110000Z&details=${encodeURIComponent('Lahore Leads University Conference\nVirtual Meet: ' + (selectedConfModal.stream_link || ''))}&location=${encodeURIComponent(selectedConfModal.venue || 'Lahore Leads University')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 border border-blue-200 transition flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add to Google Calendar</span>
                </a>
                <button
                  onClick={() => setSelectedConfModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>

              <button
                onClick={() => {
                  const target = selectedConfModal;
                  setSelectedConfModal(null);
                  handleBookTicket(target);
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow transition"
              >
                <Ticket className="w-4 h-4" />
                <span>Book Ticket Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Booking Modal */}
      {ticketModalConf && (
        <TicketBookingModal
          isOpen={!!ticketModalConf}
          onClose={() => setTicketModalConf(null)}
          conference={ticketModalConf}
          user={user}
          onSuccess={(ticket) => {
            // Success handler
          }}
        />
      )}
    </div>
  );
}
