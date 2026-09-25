import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  QrCode,
  Calendar,
  FileText,
  CreditCard,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { LeadsLogo } from './LeadsLogo';

/**
 * Converts a numeric PKR amount into English words (e.g., 1500 -> "One Thousand Five Hundred Rupees Only")
 */
function amountToWords(amount) {
  let num = parseInt(amount, 10);
  if (isNaN(num) || num === 0) return 'Zero Rupees Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(n) {
    let groupStr = '';
    if (n >= 100) {
      groupStr += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      groupStr += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      groupStr += ones[n] + ' ';
    }
    return groupStr;
  }

  let words = '';
  if (num >= 10000000) {
    words += convertGroup(Math.floor(num / 10000000)) + 'Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    words += convertGroup(Math.floor(num / 100000)) + 'Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    words += convertGroup(Math.floor(num / 1000)) + 'Thousand ';
    num %= 1000;
  }
  if (num > 0) {
    words += convertGroup(num);
  }

  return `Rupees ${words.trim()} Only`;
}

/**
 * Single Challan Copy Card component (Rendered 4 times for standard University 4-Part Sheet)
 */
const ChallanSingleCopy = ({
  copyName,
  challanNo,
  issueDate,
  dueDate,
  studentName,
  rollNo,
  degreeProgram,
  department,
  contactNo,
  particularsTitle,
  feeType,
  amount,
  amountWords
}) => {
  return (
    <div className="bg-white border-2 border-[#0A192F] rounded-xl p-3.5 sm:p-4 text-slate-900 text-xs flex flex-col justify-between shadow-sm relative overflow-hidden print:border-black print:p-3 print:rounded-none print:shadow-none">
      {/* Watermark Logo in Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
        <span className="text-8xl font-black tracking-widest text-[#0A192F]">LEADS</span>
      </div>

      <div>
        {/* Top University Header */}
        <div className="border-b-2 border-[#0A192F] pb-2 mb-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <LeadsLogo size="sm" showSubtitle={false} />
          </div>
          <div className="text-[8px] text-slate-500 font-medium leading-none">
            Chartered by Govt. of Punjab • Recognized by HEC Pakistan • Kamahan Road, Lahore
          </div>
        </div>

        {/* Copy Header Badge */}
        <div className="flex justify-between items-center bg-[#0A192F] text-white px-2.5 py-1 rounded mb-2">
          <span className="text-[10px] font-black tracking-wider uppercase text-amber-400">
            {copyName}
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-200">
            FEE VOUCHER
          </span>
        </div>

        {/* Challan Ref, Dates & Barcode */}
        <div className="grid grid-cols-2 gap-1.5 mb-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px]">
          <div>
            <span className="text-slate-500 font-medium block text-[8.5px]">CHALLAN NO:</span>
            <strong className="font-mono text-[#0A192F] font-bold">{challanNo}</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-medium block text-[8.5px]">ISSUE / DUE DATE:</span>
            <strong className="text-slate-800 font-semibold">{issueDate}</strong> / <span className="text-rose-700 font-bold">{dueDate}</span>
          </div>
        </div>

        {/* Student / Author Particulars */}
        <table className="w-full text-[9.5px] mb-2 border border-slate-200 rounded">
          <tbody>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <td className="p-1 font-semibold text-slate-500 w-24">Student / Author:</td>
              <td className="p-1 font-bold text-slate-900">{studentName || 'Student Delegate'}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-1 font-semibold text-slate-500">Roll / Reg No:</td>
              <td className="p-1 font-mono font-bold text-slate-800">{rollNo || 'REG-2026-LEADS-984'}</td>
            </tr>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <td className="p-1 font-semibold text-slate-500">Dept / Program:</td>
              <td className="p-1 text-slate-800 truncate max-w-[160px]">{department} ({degreeProgram})</td>
            </tr>
            <tr>
              <td className="p-1 font-semibold text-slate-500">Contact / Cell:</td>
              <td className="p-1 font-mono text-slate-800">{contactNo || '0348-2727605'}</td>
            </tr>
          </tbody>
        </table>

        {/* Bank Account Details */}
        <div className="bg-amber-50/70 border border-amber-200/90 p-2 rounded-lg mb-2 text-[9px] space-y-0.5">
          <div className="flex justify-between">
            <span className="text-slate-600 font-bold">Designated Bank:</span>
            <strong className="text-[#0A192F]">Habib Bank Limited (HBL)</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-bold">Account Title:</span>
            <strong className="text-slate-900">Lahore Leads University ORIC</strong>
          </div>
          <div className="flex justify-between items-center pt-0.5">
            <span className="text-slate-600 font-bold">IBAN (All Branches):</span>
            <strong className="font-mono text-blue-900 bg-white px-1 py-0.5 rounded border border-blue-200 text-[8.5px]">
              PK48HABB0054757000123003
            </strong>
          </div>
          <div className="flex justify-between items-center pt-0.5 border-t border-amber-200/50">
            <span className="text-slate-600 font-bold">Easypaisa / JazzCash:</span>
            <strong className="font-mono text-emerald-800 bg-white px-1 py-0.5 rounded border border-emerald-200 text-[8.5px]">
              0348-2727605
            </strong>
          </div>
        </div>

        {/* Fee Itemization Table */}
        <table className="w-full text-[9.5px] border border-slate-300 mb-2">
          <thead>
            <tr className="bg-[#0A192F] text-white">
              <th className="p-1 text-left font-bold">Head of Account</th>
              <th className="p-1 text-right font-bold w-20">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="p-1 text-slate-800">
                <span className="font-bold">{feeType} Fee</span>
                <span className="block text-[8px] text-slate-500 truncate max-w-[170px]">{particularsTitle}</span>
              </td>
              <td className="p-1 text-right font-mono font-semibold text-slate-900">{amount}</td>
            </tr>
            <tr className="bg-slate-50/50 text-[8.5px]">
              <td className="p-1 text-slate-500">HEC Plagiarism & Review Indexing</td>
              <td className="p-1 text-right font-mono text-emerald-700 font-bold">INCLUSIVE</td>
            </tr>
            <tr className="bg-slate-50/50 text-[8.5px]">
              <td className="p-1 text-slate-500">Google Drive Cloud Archival</td>
              <td className="p-1 text-right font-mono text-emerald-700 font-bold">INCLUSIVE</td>
            </tr>
            <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
              <td className="p-1 text-left uppercase text-[9px]">Total Amount Payable:</td>
              <td className="p-1 text-right font-mono text-emerald-700 text-[11px]">PKR {amount}</td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="bg-slate-50 p-1.5 rounded border border-slate-200 text-[8.5px] mb-2">
          <span className="text-slate-500 font-semibold">Amount in Words: </span>
          <strong className="text-[#0A192F] font-bold">{amountWords}</strong>
        </div>

        {/* Barcode Graphic Simulation */}
        <div className="text-center my-1.5 border-t border-b border-dashed border-slate-300 py-1">
          <div className="font-mono text-[9px] tracking-widest text-slate-700 font-bold flex justify-center items-center gap-1">
            <span className="inline-block tracking-tighter text-[11px] font-black">||| | | |||| | || | ||| |||| | | |||</span>
          </div>
          <span className="text-[7.5px] font-mono text-slate-500">{challanNo} • VERIFIED-ORIC</span>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="pt-3 mt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[8px] text-slate-600 text-center">
        <div className="border-t border-slate-400 pt-1">
          <span className="font-semibold block">Depositor / Student</span>
          <span className="text-[7px] text-slate-400">Signature</span>
        </div>
        <div className="border-t border-slate-400 pt-1">
          <span className="font-semibold block text-[#0A192F]">Authorized Bank / Cashier</span>
          <span className="text-[7px] text-slate-400">Stamp & Signature</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Official Lahore Leads University Fee Challan Modal
 */
export const OfficialChallanModal = ({
  isOpen,
  onClose,
  feeDetails = {},
  user = {},
  onProceedToUpload = null
}) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' (4 copies) | 'student' | 'bank' | 'university' | 'accounts'
  const [copiedIBAN, setCopiedIBAN] = useState(false);
  const [copiedChallan, setCopiedChallan] = useState(false);
  const printRef = useRef(null);

  if (!isOpen) return null;

  const feeType = feeDetails.feeType || 'Manuscript Submission';
  const amount = Number(feeDetails.amount || 1500).toLocaleString();
  const rawAmount = parseInt(String(feeDetails.amount || 1500).replace(/[^0-9]/g, ''), 10) || 1500;
  const amountWords = amountToWords(rawAmount);

  const studentName = feeDetails.studentName || user?.full_name || 'Student Researcher';
  const rollNo = feeDetails.rollNo || user?.roll_no || `LLU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const department = feeDetails.department || 'Faculty of Computer Science & IT';
  const degreeProgram = feeDetails.degreeProgram || 'BS / MS Research';
  const contactNo = feeDetails.contactNo || user?.mobile || '0348-2727605';
  const particularsTitle = feeDetails.title || 'Official Academic Submission / Conference Pass';

  const today = new Date();
  const issueDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const dueDateObj = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueDate = dueDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const randomCode = Math.floor(100000 + Math.random() * 900000);
  const challanNo = feeDetails.challanNo || `LLU-ORIC-2026-${randomCode}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyIBAN = () => {
    navigator.clipboard?.writeText('PK48HABB0054757000123003');
    setCopiedIBAN(true);
    setTimeout(() => setCopiedIBAN(false), 2000);
  };

  const handleCopyChallanNo = () => {
    navigator.clipboard?.writeText(challanNo);
    setCopiedChallan(true);
    setTimeout(() => setCopiedChallan(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-6xl bg-white rounded-3xl p-4 sm:p-7 border border-slate-200 shadow-2xl relative text-slate-900 my-4 max-h-[96vh] flex flex-col">
        {/* Top Modal Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center font-black text-sm border border-amber-400 shadow-md">
              ORIC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#0A192F]">
                  Lahore Leads University Official Fee Challan
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                  HEC Approved Voucher
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Voucher #{challanNo} • Issued for {feeType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#0A192F] hover:bg-[#002B49] text-amber-400 font-bold text-xs shadow-sm transition flex items-center gap-1.5"
              title="Print standard A4 sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Challan</span>
            </button>

            <button
              onClick={handleCopyIBAN}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
              title="Copy Bank IBAN"
            >
              {copiedIBAN ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedIBAN ? 'IBAN Copied!' : 'Copy IBAN'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs (Screen Only) */}
        <div className="flex items-center justify-between gap-2 py-2.5 px-1 shrink-0 overflow-x-auto print:hidden border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeTab === 'all'
                ? 'bg-[#0A192F] text-amber-400 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              All 4 Copies (Print View)
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeTab === 'bank'
                ? 'bg-[#0A192F] text-amber-400 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Bank Copy
            </button>
            <button
              onClick={() => setActiveTab('university')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeTab === 'university'
                ? 'bg-[#0A192F] text-amber-400 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              University / ORIC Copy
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeTab === 'accounts'
                ? 'bg-[#0A192F] text-amber-400 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Accounts Copy
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeTab === 'student'
                ? 'bg-[#0A192F] text-amber-400 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Student Copy
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-semibold hidden md:block">
            🏦 Deposit at any HBL Branch / Online Banking / Easypaisa
          </div>
        </div>

        {/* Printable Multi-Copy Container */}
        <div ref={printRef} className="flex-1 overflow-y-auto py-3 px-1">
          {activeTab === 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 print:grid-cols-4 print:gap-2 print:p-0">
              <ChallanSingleCopy
                copyName="1. BANK COPY"
                challanNo={challanNo}
                issueDate={issueDate}
                dueDate={dueDate}
                studentName={studentName}
                rollNo={rollNo}
                degreeProgram={degreeProgram}
                department={department}
                contactNo={contactNo}
                particularsTitle={particularsTitle}
                feeType={feeType}
                amount={amount}
                amountWords={amountWords}
              />
              <ChallanSingleCopy
                copyName="2. UNIVERSITY / ORIC COPY"
                challanNo={challanNo}
                issueDate={issueDate}
                dueDate={dueDate}
                studentName={studentName}
                rollNo={rollNo}
                degreeProgram={degreeProgram}
                department={department}
                contactNo={contactNo}
                particularsTitle={particularsTitle}
                feeType={feeType}
                amount={amount}
                amountWords={amountWords}
              />
              <ChallanSingleCopy
                copyName="3. ACCOUNTS COPY"
                challanNo={challanNo}
                issueDate={issueDate}
                dueDate={dueDate}
                studentName={studentName}
                rollNo={rollNo}
                degreeProgram={degreeProgram}
                department={department}
                contactNo={contactNo}
                particularsTitle={particularsTitle}
                feeType={feeType}
                amount={amount}
                amountWords={amountWords}
              />
              <ChallanSingleCopy
                copyName="4. STUDENT COPY"
                challanNo={challanNo}
                issueDate={issueDate}
                dueDate={dueDate}
                studentName={studentName}
                rollNo={rollNo}
                degreeProgram={degreeProgram}
                department={department}
                contactNo={contactNo}
                particularsTitle={particularsTitle}
                feeType={feeType}
                amount={amount}
                amountWords={amountWords}
              />
            </div>
          ) : (
            <div className="max-w-md mx-auto py-2">
              <ChallanSingleCopy
                copyName={
                  activeTab === 'bank' ? '1. BANK COPY' :
                    activeTab === 'university' ? '2. UNIVERSITY / ORIC COPY' :
                      activeTab === 'accounts' ? '3. ACCOUNTS COPY' : '4. STUDENT COPY'
                }
                challanNo={challanNo}
                issueDate={issueDate}
                dueDate={dueDate}
                studentName={studentName}
                rollNo={rollNo}
                degreeProgram={degreeProgram}
                department={department}
                contactNo={contactNo}
                particularsTitle={particularsTitle}
                feeType={feeType}
                amount={amount}
                amountWords={amountWords}
              />
            </div>
          )}
        </div>

        {/* Bottom Actions Bar (Screen Only) */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden bg-slate-50/70 p-3 rounded-2xl">
          <div className="text-xs text-slate-600 space-y-0.5 text-center sm:text-left">
            <p className="font-bold text-slate-800">
              💡 Instructions:
            </p>
            <p className="text-[11px] text-slate-500">
              Deposit fee at any HBL branch or transfer via Mobile App to <strong>0348-2727605</strong> / <strong>PK48HABB0054757000123003</strong>, then upload the stamped slip/screenshot.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Print Challan Sheet
            </button>

            {onProceedToUpload && (
              <button
                onClick={() => {
                  onProceedToUpload({ challanNo, amount: rawAmount, feeType });
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-[#0A192F] hover:bg-[#002B49] text-amber-400 font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                I Have Paid — Upload Proof
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
