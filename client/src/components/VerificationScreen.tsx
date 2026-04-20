import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Download, Edit2, FileText, Info } from 'lucide-react';

interface VerificationScreenProps {
  formData: any;
  onEdit: () => void;
  onDownload: () => void;
}

const VerificationScreen: React.FC<VerificationScreenProps> = ({ formData, onEdit, onDownload }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      onDownload();
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container max-w-4xl mx-auto px-4 py-12 space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Review Your Details</h2>
        <p className="text-muted-foreground">Please verify the information collected by our assistant.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="font-bold text-lg flex items-center space-x-2">
                <FileText size={20} className="text-primary" />
                <span>Business Identity</span>
              </h3>
              <button 
                onClick={onEdit}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-primary transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business Name</span>
                <span className="font-semibold text-slate-800">{formData.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">State</span>
                <span className="font-semibold text-slate-800">{formData.state}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-muted-foreground">Principal Office</span>
                <span className="font-semibold text-slate-800">{formData.principalOfficeAddress}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-lg flex items-center space-x-2 border-b border-slate-50 pb-4">
              <Check size={20} className="text-emerald-500" />
              <span>Registered Agent</span>
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-semibold text-slate-800">{formData.registeredAgentName}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-muted-foreground">Address</span>
                <span className="font-semibold text-slate-800">{formData.registeredAgentAddress}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 text-white relative flex flex-col items-center justify-center space-y-4 overflow-hidden shadow-2xl min-h-[400px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-500"></div>
          <FileText size={64} className="text-white/20 mb-4" />
          <h3 className="text-xl font-bold">Articles of Organization</h3>
          <p className="text-white/60 text-sm italic">Preview not available in browser</p>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6 pt-8">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="w-full max-w-md h-16 bg-primary text-white rounded-xl font-bold text-lg flex items-center justify-center space-x-3 shadow-xl hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download size={24} />
          )}
          <span>{isGenerating ? 'Generating Documents...' : 'Complete & Download Pack'}</span>
        </button>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          <Info size={16} />
          <span>Filing fees apply (State dependent)</span>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationScreen;
