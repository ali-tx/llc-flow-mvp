import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Download,
  Edit2,
  FileText,
  Building2,
  Users,
  MapPin,
  Shield,
  Pen,
  Loader2,
} from 'lucide-react';
import axios from 'axios';

interface VerificationScreenProps {
  formData: any;
  sessionId: string;
  onEdit: () => void;
}

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-800 leading-snug">{value || '—'}</span>
  </div>
);

const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
    <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
        {icon}
      </div>
      <h3 className="font-bold text-sm text-slate-800">{title}</h3>
    </div>
    <div className="grid grid-cols-2 gap-4">{children}</div>
  </div>
);

const VerificationScreen: React.FC<VerificationScreenProps> = ({ formData, sessionId, onEdit }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post(
        `/api/formations/${sessionId}/generate`,
        { formData },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfReady(true);
    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback: generate client-side PDF with jsPDF
      generateClientSidePdf();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateClientSidePdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const W = doc.internal.pageSize.getWidth();
    const margin = 72;

    // Navy Header
    doc.setFillColor(26, 35, 126);
    doc.rect(0, 0, W, 80, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('STATE OF DELAWARE', W / 2, 28, { align: 'center' });
    doc.text('CERTIFICATE OF FORMATION', W / 2, 46, { align: 'center' });
    doc.text('OF LIMITED LIABILITY COMPANY', W / 2, 64, { align: 'center' });

    // Body
    doc.setTextColor(183, 28, 28); // dark red
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    const preamble =
      'The undersigned authorized person, desiring to form a limited liability company pursuant to the ' +
      'Limited Liability Company Act of the State of Delaware, hereby certifies as follows:';
    const wrapped = doc.splitTextToSize(preamble, W - margin * 2);
    doc.text(wrapped, margin, 110);

    // Section 1
    doc.setFontSize(11);
    let y = 110 + wrapped.length * 16 + 20;
    doc.text('1.', margin, y);
    const s1 = `The name of the limited liability company is ${formData.businessName || '_______________'}.`;
    const ws1 = doc.splitTextToSize(s1, W - margin * 2 - 20);
    doc.text(ws1, margin + 24, y);
    y += ws1.length * 16 + 8;
    doc.setDrawColor(0, 0, 0);
    doc.line(margin + 24, y, W - margin, y);
    y += 24;

    // Section 2
    doc.text('2.', margin, y);
    const agentAddr = formData.registeredAgentAddress || '8 The Green, Ste B, Dover, DE 19901';
    const agentName = formData.registeredAgentName || 'Northwest Registered Agent';
    const s2 =
      `The Registered Office of the limited liability company in the State of Delaware is located at ` +
      `${agentAddr} (street), in the City of Dover, Zip Code 19901. The name of the Registered Agent ` +
      `at such address upon whom process against this limited liability company may be served is ${agentName}.`;
    const ws2 = doc.splitTextToSize(s2, W - margin * 2 - 20);
    doc.text(ws2, margin + 24, y);
    y += ws2.length * 16 + 8;
    doc.line(margin + 24, y, W - margin, y);
    y += 60;

    // Signatures
    const sigName = formData.authorizedSignerName || formData.members?.[0]?.name || 'Authorized Person';
    const sigX = W / 2;

    doc.setFontSize(11);
    doc.text(`By: /s/ ${sigName}`, sigX, y + 20, { align: 'center' });
    doc.line(sigX - 120, y, sigX + 120, y);
    doc.setFontSize(10);
    doc.text('Authorized Person', sigX, y + 14, { align: 'center' });

    y += 60;
    doc.text(`Name: ${sigName}`, sigX, y + 20, { align: 'center' });
    doc.line(sigX - 120, y, sigX + 120, y);
    doc.text('Print or Type', sigX, y + 14, { align: 'center' });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setPdfReady(true);
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${(formData.businessName || 'Formation').replace(/\s+/g, '_')}_Certificate.pdf`;
    a.click();
  };

  const members = Array.isArray(formData.members) ? formData.members : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto px-4 py-10 space-y-8"
    >
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 mb-3">
          <CheckCircle2 size={14} />
          <span>Information Collected</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Review Your Details</h2>
        <p className="text-slate-500 text-sm">Confirm everything looks right before generating your documents.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-3 space-y-4">
          <SectionCard icon={<Building2 size={15} />} title="Business Identity">
            <Field label="Company Name" value={formData.businessName} />
            <Field label="Entity Type" value={formData.entityType || 'LLC'} />
            <Field label="State" value={formData.state} />
            <Field label="Entity Ending" value={formData.entityEnding || 'LLC'} />
          </SectionCard>

          <SectionCard icon={<MapPin size={15} />} title="Business Address">
            <Field label="Principal Office" value={formData.principalOfficeAddress} />
            <div /> {/* spacer */}
          </SectionCard>

          <SectionCard icon={<Shield size={15} />} title="Registered Agent">
            <Field label="Agent Name" value={formData.registeredAgentName} />
            <Field label="Agent Address" value={formData.registeredAgentAddress} />
          </SectionCard>

          <SectionCard icon={<Users size={15} />} title="Members / Ownership">
            {members.length > 0 ? (
              members.map((m: any, i: number) => (
                <React.Fragment key={i}>
                  <Field label={`Member ${members.length > 1 ? i + 1 : ''} Name`.trim()} value={m.name} />
                  <Field label="Ownership" value={`${m.ownershipPercentage || 100}%`} />
                </React.Fragment>
              ))
            ) : (
              <Field label="Member" value="—" />
            )}
          </SectionCard>

          <SectionCard icon={<Pen size={15} />} title="Authorized Signer">
            <Field label="Name" value={formData.authorizedSignerName} />
            <Field label="Title" value={formData.authorizedSignerTitle || 'Managing Member'} />
          </SectionCard>

          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mt-1"
          >
            <Edit2 size={14} />
            <span>Go back to make changes</span>
          </button>
        </div>

        {/* Right: Document Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">
            {/* Document header */}
            <div className="bg-[#1a237e] text-white text-center py-5 px-4">
              <FileText className="mx-auto mb-2 opacity-80" size={28} />
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Delaware</p>
              <p className="text-sm font-bold leading-tight">Certificate of Formation</p>
              <p className="text-xs opacity-70 mt-0.5">Limited Liability Company</p>
            </div>

            {/* Document preview */}
            <div className="p-5 space-y-4 text-[11px] font-serif text-[#b71c1c] bg-white leading-relaxed">
              <p className="text-[10px] text-slate-500 italic leading-snug">
                The undersigned authorized person, desiring to form a limited liability company pursuant
                to the LLC Act of the State of Delaware, hereby certifies as follows:
              </p>

              <div>
                <p className="font-bold text-slate-600 text-[10px] uppercase tracking-wide mb-1">1. Company Name</p>
                <p className="border-b border-slate-300 pb-1">{formData.businessName || '—'}</p>
              </div>

              <div>
                <p className="font-bold text-slate-600 text-[10px] uppercase tracking-wide mb-1">2. Registered Office & Agent</p>
                <p className="border-b border-slate-300 pb-1">{formData.registeredAgentAddress || '—'}</p>
                <p className="border-b border-slate-300 pb-1 mt-1">{formData.registeredAgentName || '—'}</p>
              </div>

              <div className="pt-4 space-y-3">
                <div>
                  <div className="border-t border-slate-400 mb-1" />
                  <p className="text-[10px] text-slate-500">Authorized Person</p>
                  <p>By: /s/ {formData.authorizedSignerName || '—'}</p>
                </div>
                <div>
                  <div className="border-t border-slate-400 mb-1" />
                  <p className="text-[10px] text-slate-500">Print or Type</p>
                  <p>Name: {formData.authorizedSignerName || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Actions */}
          {!pdfReady ? (
            <button
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating PDF…
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Generate Certificate PDF
                </>
              )}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm font-semibold">
                <CheckCircle2 size={16} />
                <span>Certificate of Formation ready!</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Download size={16} />
                Download PDF Certificate
              </button>
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center text-xs text-indigo-600 hover:underline py-1"
                >
                  Open in new tab ↗
                </a>
              )}
            </motion.div>
          )}

          <p className="text-center text-[11px] text-slate-400 leading-tight">
            This document is generated for filing purposes. State filing fees apply separately.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationScreen;
