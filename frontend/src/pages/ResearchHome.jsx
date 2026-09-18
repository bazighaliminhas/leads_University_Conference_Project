import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Building2,
  Activity,
  Compass,
  GraduationCap,
  Award,
  Users,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export function ResearchHome() {
  const navigate = useNavigate();

  const researchCards = [
    {
      id: 'journals',
      title: 'Peer-Reviewed Journals',
      description: 'Official HEC-indexed academic journals of Lahore Leads University disseminating empirical discoveries and peer-reviewed scholarly articles.',
      image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
      link: '/journals',
      badge: '6 Official Journals',
      icon: BookOpen
    },
    {
      id: 'conferences',
      title: 'Conferences & Summits',
      description: 'National and international research summits bringing global scholars, keynote speakers, and venture capital investors to Lahore Leads University.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      link: '/conferences',
      badge: 'Annual Summits 2026',
      icon: Calendar
    },
    {
      id: 'oric-incubation',
      title: 'ORIC Incubation Labs',
      description: 'The Office of Research, Innovation & Commercialization (ORIC) bridging student academic breakthroughs directly into funded commercial ventures.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      link: '/showcase',
      badge: 'Innovation Incubator',
      icon: Building2
    },
    {
      id: 'computing-ai',
      title: 'Computer Science & AI Lab',
      description: 'Frontier research in Machine Learning, Large Language Models, Autonomous Robotics, Cyber Defense, and Distributed Systems at Leads CS Dept.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      link: '/journal/ljccs',
      badge: 'LJCCS Research',
      icon: Activity
    },
    {
      id: 'knowledge-support',
      title: 'Research Grants & Ethics',
      description: 'Dedicated institutional ethics review boards (IRB), grant writing guidance, and HEC compliance support for faculty and student authors.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      link: '/journals',
      badge: 'Academic Support',
      icon: Compass
    },
    {
      id: 'postgrad',
      title: 'Post-Graduate Research',
      description: 'Empowering MS and PhD scholars at Lahore Leads University to conduct impactful thesis research with experienced professorial mentorship.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      link: '/journals',
      badge: 'MS & PhD Programs',
      icon: GraduationCap
    },
    {
      id: 'impact',
      title: 'Socio-Economic Impact',
      description: 'Applied research tackling sustainable energy, legal jurisprudence, public policy, educational pedagogy, and fintech economics.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      link: '/showcase',
      badge: 'National Impact',
      icon: Award
    },
    {
      id: 'researchers',
      title: 'Distinguished Faculty',
      description: 'Celebrating Lahore Leads University faculty and student investigators with high citations, peer awards, and patent clearances.',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      link: '/showcase',
      badge: 'Research Fellows',
      icon: Users
    }
  ];

  const highlights = [
    { label: 'Official Research Journals', value: '6 Indexed', icon: BookOpen, sub: 'LJCCS, LIJEB, LJEAS, LJLSP, LJHE, LJMCS' },
    { label: 'Published Papers', value: '150+ Papers', icon: FileCheck, sub: 'Double-Blind Peer Reviewed' },
    { label: 'Venture Capital Pool', value: '$125K+ Pledged', icon: TrendingUp, sub: 'Commercialized via ORIC' },
    { label: 'Accreditation', value: 'HEC Recognized', icon: ShieldCheck, sub: 'Chartered University Status' }
  ];

  return (
    <div className="space-y-10 font-sans pb-16">
      {/* Top Banner Header */}
      <div className="border-b border-slate-200 bg-white pb-8 pt-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F2C59] uppercase tracking-wider mb-3">
          <span>Home</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-amber-700">Lahore Leads University Research Ecosystem</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A192F] tracking-tight">
              RESEARCH AT LAHORE LEADS UNIVERSITY
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              At Lahore Leads University, research is at the heart of our academic mission. Under the stewardship of the <strong className="text-slate-800">Office of Research, Innovation & Commercialization (ORIC)</strong>, we cultivate an environment of rigorous inquiry, technological innovation, and societal problem-solving across our Kamahan Main Campus and City Campus.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 self-start lg:self-auto">
            <button
              onClick={() => navigate('/journals')}
              className="px-5 py-3 rounded-xl bg-[#0F2C59] hover:bg-[#0A192F] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Explore Journals</span>
            </button>
            <button
              onClick={() => navigate('/conferences')}
              className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Conferences 2026</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {highlights.map((h, idx) => {
            const HIcon = h.icon;
            return (
              <div key={idx} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
                <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0F2C59] shadow-sm flex-shrink-0">
                  <HIcon className="w-5 h-5 text-[#0F2C59]" />
                </div>
                <div className="truncate">
                  <div className="text-lg font-black text-[#0A192F] tracking-tight">{h.value}</div>
                  <div className="text-xs font-semibold text-slate-700 truncate">{h.label}</div>
                  <div className="text-[11px] text-slate-400 truncate">{h.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8 Feature Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight">
            Research Pillars & Academic Gateways
          </h2>
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            8 Key Discovery Areas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {researchCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => navigate(card.link)}
                className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(15,44,89,0.12)] hover:border-[#0F2C59]/40 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
              >
                {/* Card Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={card.image}
                    alt={card.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#0A192F]/90 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full shadow border border-white/10">
                    {card.badge}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0F2C59] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#0A192F] group-hover:text-amber-700 transition-colors line-clamp-1">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {card.description}
                    </p>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs font-bold text-[#0F2C59] group-hover:text-amber-700 transition-colors">
                      Explore Gateway
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#0F2C59] group-hover:bg-amber-600 text-white flex items-center justify-center transition-colors shadow-sm">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Strip */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#0F2C59] to-[#1E3A8A] rounded-2xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Lahore Leads University — Call for Papers 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Ready to Publish Your Research?</h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Submit your manuscript to Lahore Leads University's official peer-reviewed journals (LJCCS, LIJEB, LJEAS, LJLSP, LJHE, LJMCS) or apply for oral presentation at the National Research Summit.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10">
          <button
            onClick={() => navigate('/journals')}
            className="px-5 py-2.5 rounded-xl bg-white text-[#0A192F] font-bold text-sm hover:bg-slate-100 shadow transition"
          >
            Browse Journals
          </button>
          <button
            onClick={() => navigate('/conferences')}
            className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 shadow transition"
          >
            Conferences 2026
          </button>
        </div>
      </div>
    </div>
  );
}
