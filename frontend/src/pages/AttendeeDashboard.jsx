import React, { useState } from 'react';
import { Ticket, Video, MapPin, Calendar, CheckCircle2, QrCode, ToggleLeft, ToggleRight, Clock, Award, ShieldCheck, DollarSign, Printer, ExternalLink, Sparkles, Building2 } from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

export const AttendeeDashboard = ({ user, conferences = [], tickets = [], onBookTicket }) => {
  const [selectedConfId, setSelectedConfId] = useState(() => conferences[0]?.id || 1);
  const [payTarget, setPayTarget] = useState(null);
  const [paymentRequired, setPaymentRequired] = useState(true);

  const selectedConf = conferences.find(c => c.id == selectedConfId) || conferences[0] || {
    id: 1,
    title: 'Lahore Leads University National Innovation & Research Summit 2026',
    description: 'Annual gathering showcasing top student research presentations to venture capital investors and national industry leaders.',
    event_date: '2026-09-15',
    event_time: '10:00 AM - 04:00 PM',
    venue: 'Lahore Leads University Main Campus Grand Auditorium (Kamahan Road) & HD Live Stream',
    stream_link: 'https://meet.google.com/xyz-demo-stream',
    onsite_ticket_price: 500,
    online_ticket_price: 200
  };

  const userTickets = tickets.filter(t => t.user_id === user.id || t.user_name === user.full_name);

  const handleBookingClick = (type, price) => {
    if (paymentRequired) {
      setPayTarget({ type, price, confId: selectedConf.id });
    } else {
      onBookTicket(type, price, null, selectedConf.id);
    }
  };

  const handlePrintTicket = (t) => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0A192F] text-amber-400 border border-amber-400/40 flex items-center justify-center font-black shadow-md">
            <Ticket className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
                Conference Passes & Attendee Portal
              </h1>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                E-TICKETING
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Book Onsite Auditorium Passes with Assigned Seats or Access Live Virtual Remote Streams.
            </p>
          </div>
        </div>

        {/* Payment Required Toggle */}
        <button
          onClick={() => setPaymentRequired(!paymentRequired)}
          className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition shadow-sm ${
            paymentRequired ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}
          title="Toggle between Challan Payment verification vs instant test booking"
        >
          {paymentRequired ? <ToggleRight className="w-5 h-5 text-amber-600" /> : <ToggleLeft className="w-5 h-5 text-emerald-600" />}
          Challan Proof: <strong>{paymentRequired ? 'Mandatory Slip Upload' : 'Instant (Demo Mode)'}</strong>
        </button>
      </div>

      {/* Conference Selector Tabs if multiple conferences exist */}
      {conferences.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {conferences.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedConfId(c.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                selectedConf.id === c.id
                  ? 'bg-[#0A192F] text-amber-400 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{c.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Conference Event Booking Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <span className="text-[11px] font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-flex items-center gap-1.5 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> HEC Recognized National Summit
            </span>
            <h2 className="text-2xl font-black text-[#0A192F]">{selectedConf.title}</h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{selectedConf.description}</p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#005A9C]" />
              <span>{selectedConf.event_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>{selectedConf.event_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>{selectedConf.venue}</span>
            </div>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Onsite Ticket */}
          <div className="p-6 rounded-3xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50/40 to-white flex flex-col justify-between space-y-5 hover:shadow-lg transition">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  PHYSICAL DELEGATE PASS
                </span>
                <span className="text-2xl font-black text-slate-900">PKR {selectedConf.onsite_ticket_price || 500}</span>
              </div>
              <h3 className="text-lg font-black text-[#0A192F]">Onsite Main Auditorium Pass</h3>
              <ul className="text-xs text-slate-600 space-y-2 pt-1 font-medium">
                <li className="flex items-center gap-2">✓ <strong>Reserved Auditorium Seat</strong> (Row & Seat Number Allocation)</li>
                <li className="flex items-center gap-2">✓ <strong>Live VC Pitch Sessions</strong> & Direct Networking</li>
                <li className="flex items-center gap-2">✓ <strong>Printed Delegate Conference Kit</strong> & Certificate</li>
                <li className="flex items-center gap-2">✓ <strong>Networking Lunch & Tea</strong> at Leads Grand Lawn</li>
              </ul>
            </div>

            <button
              onClick={() => handleBookingClick('onsite', selectedConf.onsite_ticket_price || 500)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" /> Book Onsite Auditorium Pass
            </button>
          </div>

          {/* Virtual Pass */}
          <div className="p-6 rounded-3xl border-2 border-blue-300 bg-gradient-to-b from-blue-50/40 to-white flex flex-col justify-between space-y-5 hover:shadow-lg transition">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-blue-800 bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
                  VIRTUAL ACCESS
                </span>
                <span className="text-2xl font-black text-slate-900">PKR {selectedConf.online_ticket_price || 200}</span>
              </div>
              <h3 className="text-lg font-black text-[#0A192F]">Live HD Virtual Stream Pass</h3>
              <ul className="text-xs text-slate-600 space-y-2 pt-1 font-medium">
                <li className="flex items-center gap-2">✓ <strong>Encrypted HD 1080p Stream Link</strong></li>
                <li className="flex items-center gap-2">✓ <strong>Downloadable Conference Proceedings PDF</strong></li>
                <li className="flex items-center gap-2">✓ <strong>Digital Attendance Certificate</strong></li>
                <li className="flex items-center gap-2">✓ <strong>Interactive Q&A Access</strong> via Live Chat</li>
              </ul>
            </div>

            <button
              onClick={() => handleBookingClick('online', selectedConf.online_ticket_price || 200)}
              className="w-full py-3 bg-[#0A192F] hover:bg-[#002B49] text-amber-400 font-black rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4 text-amber-400" /> Book HD Virtual Stream Pass
            </button>
          </div>
        </div>
      </div>

      {/* Booked Tickets List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-[#0A192F] flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-600" /> My Booked Conference Passes ({userTickets.length})
          </h2>
          <span className="text-xs text-slate-500 font-bold">
            Print or present QR Pass at University Auditorium Entrance
          </span>
        </div>

        {userTickets.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-2">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No Tickets Booked Yet</h3>
            <p className="text-xs">Choose an option above to book your physical or online conference pass.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userTickets.map((t) => {
              const isPending = t.payment_status === 'Pending Admin Verification';
              const isOnsite = t.ticket_type === 'onsite';

              return (
                <div
                  key={t.id}
                  className={`bg-white rounded-3xl p-6 border-2 shadow-md space-y-4 relative overflow-hidden flex flex-col justify-between transition-all ${
                    isPending ? 'border-amber-300 bg-amber-50/10' : 'border-emerald-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
                            isOnsite
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-purple-100 text-purple-900 border-purple-300'
                          }`}>
                            {isOnsite ? '🏛️ PHYSICAL PASS' : '💻 VIRTUAL STREAM'}
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            {isPending ? '⏳ Pending Admin Verification' : '✅ Verified & Issued'}
                          </span>
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                            {t.booked_at || 'Recorded'}
                          </span>
                        </div>
                        <h4 className="font-black text-lg text-[#0A192F] mt-2 leading-tight">
                          Pass Code: <span className="font-mono text-[#005A9C]">{t.ticket_code}</span>
                        </h4>
                      </div>

                      <div className={`p-2 rounded-2xl border flex flex-col items-center shrink-0 ${
                        isPending ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <QrCode className={`w-12 h-12 ${isPending ? 'text-amber-500 opacity-60' : 'text-[#0A192F]'}`} />
                        <span className="text-[9px] font-mono font-bold text-slate-500 mt-1">
                          {isPending ? 'PENDING' : 'SCAN AT GATE'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Attendee</span>
                        <span className="font-bold text-slate-800">{t.user_name || user.full_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">
                          {isOnsite ? 'Allocated Auditorium Seat' : 'Live Stream Link'}
                        </span>
                        <span className={`font-bold font-mono text-xs ${
                          isPending ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          {isPending
                            ? '⏳ Awaiting Admin Approval'
                            : (t.seat_number || (isOnsite ? 'Seat Assigned' : 'HD Stream Unlocked'))}
                        </span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Event Venue & Time</span>
                        <span className="font-semibold text-slate-700 text-[11px] block">{t.venue || selectedConf.venue}</span>
                        <span className="font-bold text-[#0A192F] text-[11px]">{t.event_date || selectedConf.event_date} &bull; {t.event_time || selectedConf.event_time}</span>
                      </div>
                    </div>
                  </div>

                  {isPending ? (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Payment slip under review by ORIC Admin. Once approved, your allocated seat / stream link and valid QR pass will unlock here.
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handlePrintTicket(t)}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-4 h-4" /> Print Ticket Pass
                      </button>
                      {t.ticket_type === 'online' && (
                        <a
                          href={t.stream_link || 'https://meet.google.com/xyz-demo-stream'}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2.5 bg-[#0A192F] hover:bg-[#002B49] text-amber-400 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-4 h-4" /> Open Live Stream
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {payTarget && (
        <PaymentModal
          isOpen={!!payTarget}
          onClose={() => setPayTarget(null)}
          title={`Book ${payTarget.type === 'onsite' ? 'Onsite Auditorium Seat' : 'Live Virtual Pass'}`}
          amount={payTarget.price}
          feeType="Conference Pass"
          onSuccess={(paymentProof) => {
            onBookTicket(payTarget.type, payTarget.price, paymentProof, payTarget.confId);
            setPayTarget(null);
          }}
        />
      )}
    </div>
  );
};
