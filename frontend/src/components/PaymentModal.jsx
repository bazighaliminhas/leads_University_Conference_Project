import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Lock, Smartphone, Upload, FileText, X, Printer, Building2 } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, title, amount, feeType = 'Publication', onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [senderBank, setSenderBank] = useState('HBL Mobile App');
  const [transactionId, setTransactionId] = useState(() => `TRX-${Math.floor(100000 + Math.random() * 900000)}`);
  const [senderMobile, setSenderMobile] = useState('0300-1234567');

  if (!isOpen) return null;

  const handleReceiptChange = (e) => {
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

  const handlePay = (e) => {
    e.preventDefault();
    if (!receiptPreview && !receiptName) {
      alert('⚠️ Please upload your payment receipt screenshot / challan proof to proceed');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        receipt_url: receiptPreview,
        receiptName,
        sender_bank: senderBank,
        transaction_id: transactionId,
        sender_mobile: senderMobile
      });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative text-slate-900 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#0A192F] text-amber-400 flex items-center justify-center font-black text-xs border border-amber-400">
            ORIC
          </div>
          <div>
            <h3 className="text-xl font-black text-[#0A192F]">{title || 'University Fee Challan'}</h3>
            <p className="text-[11px] text-slate-500 font-semibold">Lahore Leads University • ORIC Accounts & Verification</p>
          </div>
        </div>

        {/* Formal University Challan Voucher */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl my-4 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-[11px] font-black text-[#0A192F] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              Official Fee Voucher ({feeType})
            </span>
            <span className="text-[11px] font-mono text-slate-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
              CHALLAN-#LLU-{Math.floor(10000 + Math.random() * 90000)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-0.5">
            <span className="text-xs text-slate-600 font-bold">Payable Amount:</span>
            <span className="text-2xl font-black text-emerald-600">PKR {amount}</span>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3.5 rounded-xl border border-blue-200 text-xs space-y-1.5 text-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">🏦 Bank Name:</span>
              <strong className="text-[#0A192F]">Habib Bank Limited (HBL)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">📄 Account Title:</span>
              <strong className="text-[#0A192F]">Lahore Leads University ORIC</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">🔢 Account / IBAN:</span>
              <strong className="font-mono text-blue-900 bg-white px-1.5 py-0.5 rounded border border-blue-200">PK48HABB0054757000123003</strong>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
              <span className="font-semibold text-slate-600">📱 Easypaisa / JazzCash:</span>
              <strong className="font-mono text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">0348-2727605</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handlePay} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Payment Method / Bank</label>
              <select
                value={senderBank}
                onChange={(e) => setSenderBank(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
              >
                <option value="HBL Mobile App">HBL Mobile App</option>
                <option value="Meezan Bank">Meezan Bank</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Bank Alfalah">Bank Alfalah</option>
                <option value="UBL Digital">UBL Digital</option>
                <option value="Physical Bank Branch Challan">Physical Bank Branch Challan</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Transaction ID / Ref #</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TID-948201"
                required
                className="w-full text-xs font-mono font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Sender Mobile Number</label>
            <input
              type="text"
              value={senderMobile}
              onChange={(e) => setSenderMobile(e.target.value)}
              placeholder="e.g. 0300-1234567"
              required
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-700 block mb-1 font-bold">
              Upload Payment Screenshot / Challan Stamped Slip <span className="text-rose-500">*</span>
            </label>
            <div className="relative border-2 border-dashed border-slate-300 hover:border-[#0A192F] rounded-2xl p-4 text-center bg-slate-50 transition cursor-pointer">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <Upload className="w-5 h-5 text-[#0A192F]" />
                <span className="text-xs font-bold text-slate-800">
                  {receiptName ? `Selected: ${receiptName}` : 'Click to Upload Challan / Receipt Screenshot'}
                </span>
                <span className="text-[10px] text-slate-500">Supports PNG, JPG, JPEG (Max 10MB)</span>
              </div>
            </div>
            {receiptPreview && (
              <div className="mt-2 text-center">
                <img src={receiptPreview} alt="Receipt Preview" className="h-20 mx-auto rounded-xl border-2 border-emerald-500 shadow-sm object-cover" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#0A192F] hover:bg-[#002B49] text-amber-400 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              {loading ? (
                <>Submitting Proof...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Submit Payment Proof
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
