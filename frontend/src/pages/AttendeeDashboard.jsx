import React, { useState } from 'react';
import { Ticket, Video, MapPin, Calendar, CheckCircle2, QrCode, ToggleLeft, ToggleRight } from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

export const AttendeeDashboard = ({ user, conferences, tickets, onBookTicket }) => {
  const [payTarget, setPayTarget] = useState(null);
  const [paymentRequired, setPaymentRequired] = useState(false); // Default OFF as requested for easy testing

  const conf = conferences[0] || {
    id: 1,
    title: 'National Innovation & Research Conference 2026',
    description: 'Annual gathering of university innovators, researchers, and venture capital investors.',
    event_date: '2026-09-15 10:00:00',
    venue: 'University Main Auditorium & Virtual Stream',
    stream_link: 'https://meet.google.com/xyz-demo-stream',
    onsite_ticket_price: 5000,
    online_ticket_price: 2000
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
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Ticket className="w-8 h-8 text-emerald-500" /> Conference Attendee Portal
          </h1>
          <p className="text-slate-400 mt-1">Book Onsite Auditorium Passes or Access Live Online Remote Streams.</p>
        </div>

        {/* Testing Toggle for Payment Requirement */}
        <button
          onClick={() => setPaymentRequired(!paymentRequired)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
            paymentRequired ? 'bg-amber-950/60 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-emerald-400 border-slate-700'
          }`}
          title="Click to toggle ticket payment mandatory mode"
        >
          {paymentRequired ? <ToggleRight className="w-5 h-5 text-amber-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
          Ticket Payment: <strong>{paymentRequired ? 'Mandatory (PKR)' : 'OFF (Free Test Mode)'}</strong>
        </button>
      </div>

      {/* Conference Event Booking Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Upcoming Main Event
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">{conf.title}</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">{conf.description}</p>
          </div>

          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> {conf.event_date}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> {conf.venue}</div>
          </div>
        </div>

        {/* Ticket Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" /> Onsite Pass (Auditorium)
                </h3>
                <span className="text-xl font-bold text-emerald-400">PKR {conf.onsite_ticket_price}</span>
              </div>
              <p className="text-xs text-slate-400">Includes live entry to main hall, networking lunch with investors, and physical conference kit.</p>
            </div>
            <button
              onClick={() => handleBookingClick('onsite', conf.onsite_ticket_price)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-emerald-600/20"
            >
              {paymentRequired ? `Book Onsite Ticket (PKR ${conf.onsite_ticket_price})` : '⚡ Reserve Onsite Pass (Free Test)'}
            </button>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-400" /> Remote / Virtual Pass
                </h3>
                <span className="text-xl font-bold text-blue-400">PKR {conf.online_ticket_price}</span>
              </div>
              <p className="text-xs text-slate-400">Full HD remote live stream access, Q&A chat participation, and downloadable digital proceedings.</p>
            </div>
            <button
              onClick={() => handleBookingClick('online', conf.online_ticket_price)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-blue-600/20"
            >
              {paymentRequired ? `Book Virtual Ticket (PKR ${conf.online_ticket_price})` : '⚡ Reserve Stream Ticket (Free Test)'}
            </button>
          </div>
        </div>
      </div>

      {/* Booked Tickets List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">My Active Conference Tickets</h2>

        {userTickets.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-slate-800 text-slate-400 text-sm">
            You haven't purchased any tickets yet. Select an option above to join the conference.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userTickets.map((t) => (
              <div key={t.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase ${
                      t.ticket_type === 'onsite' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-blue-950 text-blue-400 border border-blue-500/30'
                    }`}>
                      {t.ticket_type} Access Pass
                    </span>
                    <h3 className="text-base font-bold text-white mt-2">{t.ticket_code}</h3>
                  </div>
                  <QrCode className="w-10 h-10 text-slate-400 bg-slate-900 p-1.5 rounded-lg border border-slate-800" />
                </div>

                <div className="pt-2 text-xs text-slate-400 flex justify-between items-center border-t border-slate-800/80">
                  <span>Paid: <strong>PKR {t.amount_paid}</strong></span>
                  {t.ticket_type === 'online' && (
                    <a
                      href={conf.stream_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Stream Link
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
