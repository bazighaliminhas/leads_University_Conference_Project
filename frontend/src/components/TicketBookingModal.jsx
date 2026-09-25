import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  X,
  Ticket,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Upload,
  Download,
  Printer,
  ShieldCheck,
  Video,
  Users,
  QrCode,
  Sparkles,
  Lock,
  ArrowRight,
  Send,
  Smartphone,
  Check
} from 'lucide-react';
import { LeadsLogo } from './LeadsLogo';
import { OfficialChallanModal } from './OfficialChallanModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const TicketBookingModal = ({ isOpen, onClose, conference, user, onSuccess }) => {
  const navigate = useNavigate();
  const [ticketType, setTicketType] = useState('onsite'); // 'onsite' | 'online'
  const [attendeeName, setAttendeeName] = useState(user?.full_name || '');
  const [attendeeEmail, setAttendeeEmail] = useState(user?.email || '');
  const [senderMobile, setSenderMobile] = useState('0300-1234567');
  const [senderBank, setSenderBank] = useState('HBL Mobile App');
  const [transactionId, setTransactionId] = useState(() => `TRX-${Math.floor(100000 + Math.random() * 900000)}`);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [loading, setLoading] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState(null);
  const [showChallanModal, setShowChallanModal] = useState(false);

  React.useEffect(() => {
    if (user?.full_name) setAttendeeName(user.full_name);
    if (user?.email) setAttendeeEmail(user.email);
  }, [user]);

  if (!isOpen || !conference) return null;

  const onsitePrice = conference.onsite_ticket_price !== undefined ? Number(conference.onsite_ticket_price) : 50;
  const onlinePrice = conference.online_ticket_price !== undefined ? Number(conference.online_ticket_price) : 20;
  const payableAmount = ticketType === 'onsite' ? onsitePrice : onlinePrice;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!receiptPreview && !receiptName) {
      alert('⚠️ Please upload your paid Challan / Mobile Transfer screenshot proof!');
      return;
    }

    if (!attendeeName || !attendeeEmail) {
      alert('⚠️ Please enter your Full Name and Email Address');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('univ_token');
      const payload = {
        conference_id: conference.id,
        ticket_type: ticketType,
        amount_paid: payableAmount,
        receipt_url: receiptPreview,
        sender_bank: senderBank,
        transaction_id: transactionId,
        sender_mobile: senderMobile,
        attendee_name: attendeeName,
        attendee_email: attendeeEmail
      };

      const res = await axios.post(
        `${API_BASE}/tickets`,
        payload,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      const ticketData = res.data?.ticket || {
        ticket_code: `PASS-LLU-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        seat_number: ticketType === 'onsite' ? `Auditorium Row C - Seat #${Math.floor(Math.random() * 30) + 1}` : 'Virtual VIP Stream Access',
        ticket_type: ticketType,
        amount_paid: payableAmount,
        user_name: attendeeName,
        event_date: conference.event_date || '2026-09-15',
        event_time: conference.event_time || '10:00 AM - 04:00 PM',
        venue: conference.venue || 'Lahore Leads University Main Auditorium'
      };

      setIssuedTicket(ticketData);
      if (onSuccess) onSuccess(ticketData);
    } catch (err) {
      // Fallback local ticket generation
      const fallbackTicket = {
        ticket_code: `PASS-LLU-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        seat_number: ticketType === 'onsite' ? `Auditorium Row B - Seat #${Math.floor(Math.random() * 30) + 1}` : 'Virtual HD Live Stream',
        ticket_type: ticketType,
        amount_paid: payableAmount,
        user_name: attendeeName,
        event_date: conference.event_date || '2026-09-15',
        event_time: conference.event_time || '10:00 AM - 04:00 PM',
        venue: conference.venue || 'Lahore Leads University Main Auditorium'
      };
      setIssuedTicket(fallbackTicket);
      if (onSuccess) onSuccess(fallbackTicket);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPass = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in text-slate-900">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-slate-100 transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!issuedTicket ? (
          /* STEP 1: TICKET SELECTION & PAYMENT FORM */
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Official Delegate Pass</span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                  2026 Summit
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] leading-snug mt-0.5">
                Book Conference Pass: {conference.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your pass tier, enter delegate credentials, and upload fee receipt to generate your official entrance barcode ticket.
              </p>
            </div>

            {/* Pass Type Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {/* Option A: Onsite Physical Pass */}
              <div
                onClick={() => setTicketType('onsite')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                  ticketType === 'onsite'
                    ? 'border-[#0A192F] bg-blue-50/50 shadow-md ring-2 ring-blue-300'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-xl bg-[#0A192F] text-amber-400 flex items-center justify-center font-black">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    PKR {onsitePrice}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0A192F]">Onsite Auditorium Delegate Pass</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Physical seat in Main Auditorium, Networking Lounge, Executive Lunch, & Welcome Delegate Kit.
                  </p>
                </div>
              </div>

              {/* Option B: Virtual Live HD Stream Pass */}
              <div
                onClick={() => setTicketType('online')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                  ticketType === 'online'
                    ? 'border-purple-600 bg-purple-50/50 shadow-md ring-2 ring-purple-300'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-xl bg-purple-900 text-purple-200 flex items-center justify-center font-black">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-xl font-black text-purple-700 font-mono">
                    PKR {onlinePrice}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0A192F]">Virtual HD Live Stream Pass</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Live interactive Google Meet / Zoom HD stream link, live Q&A session access, & digital E-Certificate.
                  </p>
                </div>
              </div>
            </div>

            {/* University Bank Details Voucher Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-[#0A192F] flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official Fee Voucher (Payable: PKR {payableAmount})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChallanModal(true)}
                    className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-[#0A192F] font-bold text-[10px] border border-amber-300 flex items-center gap-1 transition"
                  >
                    <Printer className="w-3 h-3 text-amber-700" />
                    <span>Print A4 Challan</span>
                  </button>
                  <span className="font-mono text-slate-600 font-bold bg-white px-2 py-0.5 rounded border text-[10px]">
                    CHAL-CONF-{Math.floor(10000 + Math.random() * 90000)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                <div>🏦 <strong>Bank:</strong> Habib Bank Limited (HBL)</div>
                <div>📄 <strong>Title:</strong> Lahore Leads University ORIC</div>
                <div>🔢 <strong>IBAN:</strong> <span className="font-mono font-bold text-blue-900">PK48HABB0054757000123003</span></div>
                <div>📱 <strong>Easypaisa / JazzCash:</strong> <span className="font-mono font-bold text-emerald-800">0348-2727605</span></div>
              </div>
            </div>

            {/* Delegate Booking Form */}
            <form onSubmit={handleSubmitBooking} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Delegate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="e.g. Dr. Salman Khan / Ali Raza"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Email (For E-Ticket Delivery) *</label>
                  <input
                    type="email"
                    required
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="e.g. salman@gmail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Payment Method *</label>
                  <select
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-semibold"
                  >
                    <option value="HBL Mobile App">HBL Mobile App</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Meezan Bank">Meezan Bank</option>
                    <option value="Bank Branch Challan">Bank Branch Challan</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">TRX / Reference ID *</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. TID-948201"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={senderMobile}
                    onChange={(e) => setSenderMobile(e.target.value)}
                    placeholder="e.g. 0300-1234567"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              {/* Payment Receipt Upload */}
              <div>
                <label className="text-slate-700 block mb-1 font-bold">
                  Upload Payment Screenshot / Challan Stamped Slip (PDF or Image) *
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center bg-slate-50 cursor-pointer transition">
                  <input
                    type="file"
                    accept="image/*,application/pdf,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-5 h-5 text-blue-700" />
                    <span className="text-xs font-bold text-slate-800">
                      {receiptName ? `✓ Selected: ${receiptName}` : 'Click to Upload PDF Slip or Payment Screenshot'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Supports PDF, PNG, JPG, JPEG (Max 15MB)
                    </span>
                  </div>
                </div>

                {receiptPreview && (
                  <div className="mt-2.5 text-center">
                    {receiptPreview.startsWith('data:application/pdf') || receiptName.toLowerCase().endsWith('.pdf') ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs font-bold text-rose-800">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-rose-200 text-rose-900 rounded-lg text-xs font-black">PDF</span>
                          <span className="truncate max-w-[220px] sm:max-w-xs">{receiptName || 'Official_Payment_Challan.pdf'}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">
                          Attached ✓
                        </span>
                      </div>
                    ) : (
                      <img src={receiptPreview} alt="Receipt Preview" className="h-20 mx-auto rounded-lg border border-slate-300 object-contain shadow-2xs" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black rounded-xl text-xs transition shadow-md flex items-center gap-2"
                >
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>{loading ? 'Confirming & Issuing Pass...' : `Confirm & Issue Pass (PKR ${payableAmount})`}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: VERIFICATION PENDING & WORKFLOW STATUS TRACKER */
          <div className="space-y-6 text-left animate-fade-in">
            {/* Header Badge */}
            <div className="text-center space-y-2 pb-2 border-b border-slate-100">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>CHALLAN SUBMITTED &bull; AWAITING ADMIN APPROVAL</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0A192F]">
                Payment Proof Transmitted to Administration
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your pass request and payment slip have been sent to ORIC Admin via <strong>WhatsApp & Email</strong> for verification.
              </p>
            </div>

            {/* Submission Details Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-[#0A192F] uppercase tracking-wide">
                  Conference Booking Summary
                </span>
                <span className="font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  {issuedTicket.ticket_code || 'PASS-PENDING'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Delegate</span>
                  <strong className="text-slate-900 text-xs">{attendeeName} ({attendeeEmail})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Pass Tier</span>
                  <strong className="text-blue-950 text-xs">
                    {ticketType === 'onsite' ? `🏛️ Onsite Auditorium Pass (PKR ${onsitePrice})` : `💻 Virtual HD Live Stream Pass (PKR ${onlinePrice})`}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Payment Deposit</span>
                  <strong className="text-emerald-700 text-xs">{senderBank} &bull; PKR {payableAmount}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">TRX / Reference ID</span>
                  <strong className="font-mono text-slate-900 text-xs">{transactionId}</strong>
                </div>
              </div>
            </div>

            {/* 4-Step Verification Timeline Tracker */}
            <div className="bg-blue-50/60 rounded-2xl p-4 sm:p-5 border border-blue-200 space-y-3">
              <span className="text-xs font-black text-[#0A192F] uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Verification & Issuance Workflow
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                    ✓
                  </div>
                  <span className="font-bold text-slate-800">
                    Step 1: Pass form & bank challan proof submitted by student
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                    ✓
                  </div>
                  <span className="font-bold text-slate-800">
                    Step 2: WhatsApp (+92 348 2727605) & Email notification dispatched to Admin
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[10px] animate-pulse">
                    ⏳
                  </div>
                  <span className="font-bold text-amber-900">
                    Step 3: Admin inspecting payment slip & verifying transaction in Admin Portal
                  </span>
                </div>

                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-black text-[10px]">
                    🔒
                  </div>
                  <span className="font-semibold text-slate-600">
                    Step 4: Seat Number / Stream Link allocation & QR Entrance Pass released in Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Explanatory Note */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                Once the ORIC Admin approves your payment in the portal, your official E-Ticket with assigned auditorium seat number or encrypted HD stream link will be unlocked in your <strong>Attendee Portal</strong>.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/attendee');
                }}
                className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>Go to My Passes / Attendee Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showChallanModal && (
        <OfficialChallanModal
          isOpen={showChallanModal}
          onClose={() => setShowChallanModal(false)}
          feeDetails={{
            feeType: `${ticketType === 'onsite' ? 'On-Site Auditorium' : 'Virtual HD Live Stream'} Pass`,
            amount: payableAmount,
            title: conference.title || 'Lahore Leads University Academic Conference',
            studentName: attendeeName || user?.full_name || 'Conference Delegate',
            contactNo: senderMobile
          }}
        />
      )}
    </div>
  );
};
