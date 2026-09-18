import React, { useState, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  ExternalLink,
  CheckCircle2,
  Building2,
  ShieldCheck,
  FileText,
  Printer,
  AlertCircle,
  Copy,
  Check,
  Image as ImageIcon,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

const BACKEND_BASE = 'http://localhost:5000';

function normalizeUrl(rawUrl) {
  if (!rawUrl) return '';
  if (typeof rawUrl === 'object') {
    return rawUrl.webViewLink || rawUrl.directLink || rawUrl.previewLink || rawUrl.localUrl || '';
  }
  if (typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  // If local relative upload path like /uploads/receipts/xyz.png
  if (trimmed.startsWith('/uploads/')) {
    return `${BACKEND_BASE}${trimmed}`;
  }

  return trimmed;
}

function extractGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  // Match standard file/d/ID, id=ID, thumbnail?id=ID, lh3/d/ID, uc?id=ID
  const match = url.match(/(?:file\/d\/|id=|thumbnail\?id=|\/d\/|uc\?id=)([a-zA-Z0-9_-]{20,})/);
  return match ? match[1] : null;
}

export const ProofViewerModal = ({ isOpen, onClose, proofData }) => {
  // 1. ALL HOOKS UNCONDITIONALLY AT THE TOP
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState('document'); // 'document' | 'drive_preview' | 'ledger'
  const [imgAttemptIndex, setImgAttemptIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [copiedTrx, setCopiedTrx] = useState(false);

  const rawUrl = proofData ? (proofData.url || proofData.receipt_url || proofData.submission_receipt_url || proofData.publication_receipt_url || proofData.presentation_receipt_url || '') : '';
  const normalized = normalizeUrl(rawUrl);
  const driveFileId = extractGoogleDriveFileId(normalized);

  const isPdf = Boolean(
    normalized && (
      normalized.startsWith('data:application/pdf') ||
      normalized.toLowerCase().endsWith('.pdf') ||
      normalized.toLowerCase().includes('.pdf?') ||
      proofData?.fileName?.toLowerCase()?.endsWith('.pdf') ||
      proofData?.fileType === 'application/pdf'
    )
  );

  // Candidate sources for Google Drive images in order of resilience:
  // 1. Backend proxy route (zero CORS / zero auth barriers)
  // 2. Google lh3 CDN
  // 3. Drive thumbnail
  // 4. Raw normalized URL
  const imageSources = driveFileId ? [
    `${BACKEND_BASE}/api/drive-proxy/${driveFileId}`,
    `https://lh3.googleusercontent.com/d/${driveFileId}`,
    `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w2000`,
    `https://drive.google.com/uc?export=view&id=${driveFileId}`,
    normalized
  ] : [normalized];

  const currentImgSrc = imageSources[Math.min(imgAttemptIndex, imageSources.length - 1)] || normalized;

  const hasImage = Boolean(
    currentImgSrc &&
    !isPdf &&
    (
      currentImgSrc.startsWith('data:image/') ||
      currentImgSrc.startsWith('http://') ||
      currentImgSrc.startsWith('https://') ||
      currentImgSrc.startsWith('/uploads/') ||
      Boolean(driveFileId)
    )
  );

  useEffect(() => {
    if (isOpen && proofData) {
      setImageError(false);
      setImgAttemptIndex(0);
      setZoomLevel(1);
      setCopiedTrx(false);
      setViewMode(hasImage || isPdf ? 'document' : 'ledger');
    }
  }, [isOpen, proofData, rawUrl]);

  // 2. CONDITIONAL RETURN ONLY AFTER ALL HOOKS
  if (!isOpen || !proofData) return null;

  const title = String(proofData.title || 'Official Payment Challan Proof');
  const type = String(proofData.type || 'Fee Proof');
  const senderBank = String(proofData.senderBank || 'HBL Mobile App / Online Transfer');
  const transactionId = String(proofData.transactionId || 'TRX-LLU-948201');
  const senderMobile = String(proofData.senderMobile || '0348-2727605');
  const studentName = String(proofData.studentName || 'Student Researcher');
  const amount = String(proofData.amount || 'PKR 1,500');
  const date = String(proofData.date || new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }));

  const googleDriveViewUrl = driveFileId
    ? `https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`
    : (normalized.startsWith('https://drive.google.com') ? normalized : null);

  const googleDrivePreviewUrl = driveFileId
    ? `https://drive.google.com/file/d/${driveFileId}/preview`
    : (normalized.startsWith('https://drive.google.com') ? normalized : null);

  const displayPdfUrl = (driveFileId && isPdf)
    ? `https://drive.google.com/file/d/${driveFileId}/preview`
    : normalized;

  const handleImageLoadError = () => {
    if (imgAttemptIndex < imageSources.length - 1) {
      setImgAttemptIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const handleCopyTrx = () => {
    if (transactionId) {
      navigator.clipboard?.writeText(transactionId);
      setCopiedTrx(true);
      setTimeout(() => setCopiedTrx(false), 2000);
    }
  };

  const handleOpenDriveDirect = () => {
    if (googleDriveViewUrl) {
      window.open(googleDriveViewUrl, '_blank', 'noopener,noreferrer');
    } else if (normalized.startsWith('http')) {
      window.open(normalized, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = () => {
    if (googleDriveViewUrl) {
      window.open(googleDriveViewUrl, '_blank');
      return;
    }
    const targetUrl = isPdf ? displayPdfUrl : currentImgSrc;
    if (targetUrl && (targetUrl.startsWith('http') || targetUrl.startsWith('data:'))) {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.download = `Leads_Payment_Slip_${transactionId || 'challan'}.${isPdf ? 'pdf' : 'png'}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      handlePrint();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-slate-900">
      <div className="w-full max-w-4xl bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xl space-y-3 relative max-h-[96vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center font-black text-xs border border-amber-400/50 shadow-md">
              ORIC
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-[#0A192F]">{title}</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attached Proof
                </span>
                {driveFileId && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                    <FolderOpen className="w-3 h-3 text-blue-600" /> Google Drive Synced
                  </span>
                )}
                {isPdf && (
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-rose-600" /> PDF SLIP
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">
                Lahore Leads University &bull; ORIC Accounts & Verification Directorate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition"
            title="Close Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Tabs & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 text-xs">
          {/* Switch Views */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 flex-wrap">
            <button
              onClick={() => setViewMode('document')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'document'
                  ? 'bg-[#0A192F] text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isPdf ? <FileText className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
              <span>{isPdf ? 'PDF Slip' : 'Slip Image'}</span>
            </button>

            {driveFileId && (
              <button
                onClick={() => setViewMode('drive_preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'drive_preview'
                    ? 'bg-[#0A192F] text-amber-400 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Drive Preview</span>
              </button>
            )}

            <button
              onClick={() => setViewMode('ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'ledger'
                  ? 'bg-[#0A192F] text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>University Bank Voucher</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 justify-end flex-wrap">
            {viewMode === 'document' && hasImage && !imageError && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-bold transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-blue-600" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-bold transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-blue-600" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
              </div>
            )}

            <button
              onClick={handleCopyTrx}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1 shadow-2xs transition"
              title="Copy Transaction ID"
            >
              {copiedTrx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copiedTrx ? 'Copied' : 'TID'}</span>
            </button>

            {googleDriveViewUrl && (
              <button
                onClick={handleOpenDriveDirect}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition"
                title="Open directly in Google Drive"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
                <span>Open in Drive</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
              title="Print Receipt Voucher"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition"
              title="Download Slip"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 overflow-auto bg-slate-900/5 rounded-2xl border border-slate-200 p-2 sm:p-4 flex items-center justify-center min-h-[360px] max-h-[64vh]">
          {viewMode === 'drive_preview' && googleDrivePreviewUrl ? (
            /* Google Drive Embedded Preview */
            <div className="w-full h-[58vh] flex flex-col rounded-xl overflow-hidden shadow-inner bg-white border border-slate-300 relative">
              <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">DRIVE</span>
                  <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">{studentName} - Google Drive File</span>
                </div>
                <button
                  onClick={handleOpenDriveDirect}
                  className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Open in Drive Tab
                </button>
              </div>

              <iframe
                src={googleDrivePreviewUrl}
                title="Google Drive Document Viewer"
                className="w-full flex-1 border-0 bg-slate-100"
                allow="autoplay"
              />
            </div>
          ) : viewMode === 'document' && isPdf ? (
            /* PDF Frame */
            <div className="w-full h-[58vh] flex flex-col rounded-xl overflow-hidden shadow-inner bg-white border border-slate-300 relative">
              <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">PDF</span>
                  <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">{studentName}_Payment_Challan.pdf</span>
                </div>
                <button
                  onClick={handleOpenDriveDirect}
                  className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Full Screen
                </button>
              </div>

              {displayPdfUrl ? (
                <iframe
                  src={`${displayPdfUrl}#toolbar=1&navpanes=0`}
                  title="Payment PDF Challan"
                  className="w-full flex-1 border-0 bg-slate-100"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-50">
                  <AlertCircle className="w-10 h-10 text-amber-500" />
                  <p className="text-xs text-slate-600 font-semibold">PDF preview loading...</p>
                </div>
              )}
            </div>
          ) : viewMode === 'document' && hasImage && !imageError ? (
            /* Uploaded Image / Screenshot with Zoom */
            <div className="flex flex-col items-center gap-2 max-w-full">
              {googleDriveViewUrl && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl text-[11px] text-blue-900">
                  <span>📁 Uploaded & Stored in Google Drive</span>
                  <button
                    onClick={handleOpenDriveDirect}
                    className="text-blue-700 font-bold hover:underline flex items-center gap-1 ml-1"
                  >
                    Open Full Image <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div
                className="transition-transform duration-200 ease-out origin-center max-w-full overflow-hidden flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={currentImgSrc}
                  alt="Uploaded Payment Slip Screenshot"
                  onError={handleImageLoadError}
                  className="max-h-[50vh] max-w-full rounded-xl object-contain shadow-md border border-slate-300 bg-white"
                />
              </div>
            </div>
          ) : (
            /* Official University Bank Voucher */
            <div
              className="w-full max-w-lg bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#1e3a68] shadow-xl text-left space-y-4 transition-transform duration-200"
              style={{ transform: `scale(${viewMode === 'ledger' ? zoomLevel : 1})` }}
            >
              <div className="flex justify-between items-start border-b-2 border-slate-200 pb-3">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-serif font-black tracking-widest text-[#1e3a68] uppercase">
                    LAHORE LEADS UNIVERSITY
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    ORIC OFFICIAL BANK CHALLAN RECEIPT
                  </div>
                  <div className="text-[9.5px] text-slate-500 font-semibold">
                    Habib Bank Limited (HBL) &bull; A/C # 1042-79014529-03
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" /> VERIFIED PAID
                  </span>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">{date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Depositor / Student:</span>
                  <strong className="text-slate-900 text-xs">{studentName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Challan Category:</span>
                  <strong className="text-[#0A192F] text-xs">{type}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Payment Method:</span>
                  <strong className="text-blue-900">{senderBank}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Transaction Ref / TRX:</span>
                  <strong className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-xs">
                    {transactionId}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Sender Mobile:</span>
                  <strong className="font-mono text-slate-700">{senderMobile || '0348-2727605'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Amount Paid:</span>
                  <strong className="text-sm font-black text-emerald-700">{amount}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-[10px] leading-tight font-extrabold">
                    DIGITALLY STAMPED & RECORDED
                    <span className="block font-normal text-[9px] text-slate-500">
                      ORIC Treasury Reference: #LLU-ACC-2026-VAL
                    </span>
                  </div>
                </div>

                <div className="w-20 h-11 border-2 border-dashed border-emerald-600 rounded-lg flex flex-col items-center justify-center text-[8.5px] font-black text-emerald-700 uppercase tracking-tighter bg-emerald-50/70">
                  <span>ORIC LLU</span>
                  <span>PAID</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span><strong>Depositor:</strong> {studentName}</span>
            <span>&bull;</span>
            <span><strong>Amount:</strong> <span className="font-mono text-emerald-700 font-bold">{amount}</span></span>
            <span>&bull;</span>
            <span><strong>TID:</strong> <span className="font-mono text-slate-900 font-bold">{transactionId}</span></span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-[#0A192F] hover:bg-[#0F2C59] text-amber-400 font-bold rounded-xl text-xs transition shadow-sm"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
