import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Lock, Smartphone, Upload, FileText } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, title, amount, onSuccess }) => {
  const [method, setMethod] = useState('challan');
  const [loading, setLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptName, setReceiptName] = useState('');

  if (!isOpen) return null;

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptName(file.name);
      setReceiptImage(URL.createObjectURL(file));
    }
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (!receiptName && method === 'challan') {
      alert('Please upload payment receipt screenshot/challan proof to proceed');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ receiptName, receiptImage });
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-slate-800 shadow-2xl relative">
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-400 mb-4">Official University Fee Challan & Payment Verification</p>

        {/* Formal University Challan Voucher */}
        <div className="bg-slate-900 p-4 rounded-2xl mb-5 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">University Official Fee Voucher</span>
            <span className="text-xs font-mono text-slate-400">CHALLAN-#UCP-{Math.floor(10000 + Math.random() * 90000)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 text-sm">
            <span className="text-slate-300 font-medium">Total Fee Payable:</span>
            <span className="text-2xl font-black text-emerald-400">PKR {amount}</span>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 text-xs space-y-1 text-slate-200 mt-2">
            <div>🏦 <strong>Bank Account (HBL/UBL):</strong> 54757000123003</div>
            <div>📱 <strong>Easypaisa / JazzCash:</strong> 03482727605</div>
            <div className="text-[11px] text-slate-400 italic">Pay fee via Bank/JazzCash & upload receipt screenshot below for Admin verification.</div>
          </div>
        </div>

        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold">Upload Payment Receipt / Challan Screenshot (Mandatory)</label>
            <div className="relative border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-2xl p-4 text-center bg-slate-900/60 transition">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-1">
                <Upload className="w-6 h-6 text-blue-400" />
                <span className="text-xs font-medium text-slate-300">
                  {receiptName ? `Uploaded: ${receiptName}` : 'Click to Upload Challan / Receipt Screenshot'}
                </span>
                <span className="text-[10px] text-slate-500">Supports PNG, JPG, JPEG or PDF</span>
              </div>
            </div>
            {receiptImage && (
              <div className="mt-2 text-center">
                <img src={receiptImage} alt="Receipt Preview" className="h-20 mx-auto rounded-lg border border-slate-700 object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Transaction Ref / Sender Mobile No</label>
            <input
              type="text"
              placeholder="e.g. TRX-99812 or 03482727605"
              defaultValue="TRX-99812"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              {loading ? 'Verifying Receipt...' : <><Lock className="w-4 h-4" /> Submit Receipt & Proceed</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

