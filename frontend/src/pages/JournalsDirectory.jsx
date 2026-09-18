import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Award
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function JournalsDirectory({ user, onOpenAuth }) {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/journals`);
      setJournals(res.data || []);
    } catch (err) {
      console.error('Error fetching journals:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(journals.map(j => j.category).filter(Boolean))];

  const filteredJournals = journals.filter(j => {
    const matchesSearch =
      j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.short_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.scope_keywords?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || j.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmissionClick = (journal) => {
    if (!user) {
      onOpenAuth('login');
    } else {
      navigate('/dashboard/student', { state: { selectedJournalId: journal.id } });
    }
  };

  return (
    <div className="space-y-8 font-sans pb-20">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0F2C59] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <span>Research</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-white">Lahore Leads University Journals Directory</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                LAHORE LEADS UNIVERSITY RESEARCH JOURNALS
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed">
                Official peer-reviewed, open-access, and HEC-recognized research journals published under the patronage of ORIC - Lahore Leads University.
              </p>
            </div>

            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else navigate('/dashboard/student');
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg transition whitespace-nowrap self-start md:self-auto"
            >
              <Send className="w-4 h-4" />
              <span>Submit Manuscript</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search journal title, ISSN, acronym (e.g. LJCCS), or keyword..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-4 h-4 text-amber-300 hidden sm:inline" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Disciplines' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Journals Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No Journals Found</h3>
          <p className="text-slate-500 text-sm">
            Try adjusting your search criteria or discipline filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJournals.map((journal) => (
            <div
              key={journal.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(15,44,89,0.12)] hover:border-[#0F2C59]/40 transition-all duration-300 p-5 sm:p-6 flex flex-col sm:flex-row gap-5"
            >
              {/* Journal Cover Art */}
              <div
                onClick={() => navigate(`/journal/${journal.slug || journal.id}`)}
                className="w-full sm:w-36 h-48 sm:h-56 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer shadow-md border border-slate-200 relative group"
              >
                <img
                  src={journal.cover_image || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80'}
                  alt={journal.title}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#0A192F]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                  <Eye className="w-4 h-4" />
                  <span>Open OJS</span>
                </div>
              </div>

              {/* Journal Details */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-[#0F2C59] text-amber-300 tracking-wider">
                      {journal.short_code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {journal.category || 'Peer-Reviewed'}
                    </span>
                    {journal.current_volume && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Vol {journal.current_volume}, Issue {journal.current_issue || 1}
                      </span>
                    )}
                  </div>

                  <h2
                    onClick={() => navigate(`/journal/${journal.slug || journal.id}`)}
                    className="text-base sm:text-lg font-black text-[#0A192F] hover:text-amber-700 transition-colors cursor-pointer leading-snug"
                  >
                    {journal.title}
                  </h2>

                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                    {journal.description}
                  </p>

                  <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                    {journal.issn_print && (
                      <div>
                        <span className="font-bold text-slate-700">ISSN (Print):</span> {journal.issn_print} &bull; <span className="font-bold text-slate-700">ISSN (Online):</span> {journal.issn_online || journal.issn_print}
                      </div>
                    )}
                    {journal.chief_editor && (
                      <div className="truncate">
                        <span className="font-bold text-slate-700">Chief Editor:</span> {journal.chief_editor}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => navigate(`/journal/${journal.slug || journal.id}`)}
                    className="text-xs font-bold text-[#0F2C59] hover:text-amber-700 flex items-center gap-1.5 transition"
                  >
                    <span>View Journal (OJS)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleSubmissionClick(journal)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>Submit Paper</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
