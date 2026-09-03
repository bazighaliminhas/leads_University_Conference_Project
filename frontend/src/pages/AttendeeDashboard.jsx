import React, { useState } from 'react';
import { Ticket, Video, MapPin, Calendar, CheckCircle2, QrCode, ToggleLeft, ToggleRight, Clock, Award, ShieldCheck } from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

export const AttendeeDashboard = ({ user, conferences = [], tickets = [], onBookTicket }) => {
  const [payTarget, setPayTarget] = useState(null);
  const [paymentRequired, setPaymentRequired] = useState(false);

  const conf = conferences[0] || {
    id: 1,
    title: 'National Innovation & Research Conference 2026',
    description: 'Annual gathering of university innovators, researchers, academic review committees, and venture capital investors.',
    event_date: '2026-09-15',
    event_time: '10:00 AM - 04:00 PM',
    venue: 'University Main Auditorium & HD Stream',
    stream_link: 'https://meet.google.com/xyz-demo-stream',
    onsite_ticket_price: 50,
    online_ticket_price: 20
  };

  const userTickets = tickets.filter(t => t.user_id === user.id || t.user_name === user.full_name);

  const handleBookingClick = (type, price) => {
    if (paymentRequired) {
      setPayTarget({ type, price });
    } else {
      onBookTicket(type, price);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Ticket className="w-8 h-8 text-emerald-500" /> Conference Attendee Portal
          </h1>
          <p className="text-slate-400 mt-1">Book Onsite Auditorium Passes with Assigned Seats or Access Live Virtual Remote Streams.</p>
        </div>

        {/* Payment Required Toggle */}
        <button
          onClick={() => setPaymentRequired(!paymentRequired)}
          className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
            paymentRequired ? 'bg-amber-950/60 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-emerald-400 border-slate-700'
          }`}
          title="Click to toggle ticket payment mandatory mode"
        >
          {paymentRequired ? <ToggleRight className="w-5 h-5 text-amber-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
          Ticket Payment: <strong>{paymentRequired ? 'Mandatory ($ / PKR)' : 'OFF (Free Test Mode)'}</strong>
        </button>
      </div>

      {/* Conference Event Booking Card */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Upcoming Main Summit
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">{conf.title}</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">{conf.description}</p>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> Date: <strong>{conf.event_date}</strong></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-400" /> Time: <strong>{conf.event_time || '10:00 AM - 04:00 PM'}</strong></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> Venue: <strong>{conf.venue}</strong></div>
          </div>
        </div>

        {/* Ticket Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" /> Onsite Pass (Auditorium Seat)
                </h3>
                <span className="text-xl font-bold text-emerald-400">${conf.onsite_ticket_price}</span>
              </div>
              <p className="text-xs text-slate-400">Includes guaranteed assigned auditorium seat, live Q&A, investor networking lunch, and physical conference kit.</p>
            </div>
            <button
              onClick={() => handleBookingClick('onsite', conf.onsite_ticket_price)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-600/20"
            >
              {paymentRequired ? `Book Onsite Ticket ($${conf.onsite_ticket_price})` : '⚡ Reserve Onsite Pass (Assigned Seat)'}
            </button>
          </div>

          <div className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-400" /> Remote / Virtual HD Pass
                </h3>
                <span className="text-xl font-bold text-blue-400">${conf.online_ticket_price}</span>
              </div>
              <p className="text-xs text-slate-400">Full HD remote live stream access token, live chat participation, and digital conference proceedings.</p>
            </div>
            <button
              onClick={() => handleBookingClick('online', conf.online_ticket_price)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/20"
            >
              {paymentRequired ? `Book Virtual Ticket ($${conf.online_ticket_price})` : '⚡ Reserve Virtual Stream Pass'}
            </button>
          </div>
        </div>
      </div>

      {/* Booked Tickets List with Seat Numbers & Token Codes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">My Active Conference Ticket Tokens</h2>

        {userTickets.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-slate-800 text-slate-400 text-sm">
            You haven't purchased any tickets yet. Select an option above to reserve your seat and get your ticket token.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userTickets.map((t) => (
              <div key={t.id} className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                      t.ticket_type === 'onsite' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-blue-950 text-blue-400 border border-blue-500/40'
                    }`}>
                      {t.ticket_type} Access Pass
                    </span>
                    <h3 className="text-lg font-black text-white tracking-tight mt-2">{t.ticket_code}</h3>
                    <div className="text-xs text-amber-400 font-bold mt-1">
                      🪑 {t.seat_number || 'Seat Row A - #04'}
                    </div>
                  </div>
                  <QrCode className="w-14 h-14 text-white bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner" />
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Event Date & Time:</span>
                    <strong className="text-white">{t.event_date || conf.event_date} ({t.event_time || '10:00 AM'})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Venue Location:</span>
                    <strong className="text-white">{t.venue || conf.venue}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Status:</span>
                    <strong className="text-emerald-400">✓ Paid Token Verified</strong>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 flex justify-between items-center border-t border-slate-800/80">
                  <span>Price Paid: <strong className="text-white">${t.amount_paid}</strong></span>
                  {t.ticket_type === 'online' && (
                    <a
                      href={conf.stream_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition flex items-center gap-1.5 text-xs"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Live HD Stream
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payTarget && (
        <PaymentModal
          isOpen={!!payTarget}
          onClose={() => setPayTarget(null)}
          title={`Book Conference Ticket (${payTarget.type.toUpperCase()})`}
          amount={payTarget.price}
          onSuccess={() => onBookTicket(payTarget.type, payTarget.price)}
        />
      )}
    </div>
  );
};
