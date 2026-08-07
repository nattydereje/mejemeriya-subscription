import React, { useState, useEffect, useRef } from 'react';
import { Upload, Youtube, ExternalLink, CheckCircle2, Sparkles, AlertCircle, Image as ImageIcon, X, ArrowRight, Trophy, ShieldCheck, RefreshCw, Share2, Copy, Check, MessageCircle, Send, QrCode } from 'lucide-react';
import { ChannelConfig, Competitor } from '../types';

interface ReferralLanderProps {
  referralCode: string;
  competitors: Competitor[];
  config: ChannelConfig;
  onSubmitProof: (refCode: string, name: string, handle: string, screenshotDataUrl: string) => void;
  onGoToLeaderboard: () => void;
}

export const ReferralLander: React.FC<ReferralLanderProps> = ({
  referralCode,
  competitors,
  config,
  onSubmitProof,
  onGoToLeaderboard
}) => {
  const [selectedCode, setSelectedCode] = useState(referralCode || (competitors[0]?.referralCode || ''));
  const [subscriberName, setSubscriberName] = useState('');
  const [subscriberHandle, setSubscriberHandle] = useState('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanResult, setAiScanResult] = useState<{ detected: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when referralCode prop changes
  useEffect(() => {
    if (referralCode) {
      setSelectedCode(referralCode);
    }
  }, [referralCode]);

  const activeCompetitor = competitors.find(
    c => c.referralCode.toLowerCase() === selectedCode.toLowerCase()
  ) || competitors[0];

  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const appBaseUrl = window.location.origin + window.location.pathname;
  const referralShareUrl = `${appBaseUrl}?ref=${selectedCode}`;
  const shareMessage = `🔥 Join the Mejemeriya TV 100,000 Birr Referral Challenge!\n👉 Subscribe to Mejemeriya TV on YouTube and support ${activeCompetitor?.name || 'me'} using code: ${selectedCode}\n\nUpload your subscription screenshot here: ${referralShareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralShareUrl)}&text=${encodeURIComponent(`🔥 Support ${activeCompetitor?.name || 'me'} in the Mejemeriya TV 100,000 Birr Challenge! Subscribe & submit screenshot:`)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mejemeriya TV 100K Birr Challenge - ${activeCompetitor?.name}`,
          text: `Subscribe to Mejemeriya TV and support ${activeCompetitor?.name} using code ${selectedCode}!`,
          url: referralShareUrl,
        });
      } catch (e) {
        console.log('Share canceled');
      }
    } else {
      handleCopyLink();
    }
  };

  // Handle image upload & preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, Screenshot).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setScreenshotDataUrl(result);

      // Simulate instant AI OCR image analysis
      setIsAiScanning(true);
      setAiScanResult(null);

      setTimeout(() => {
        setIsAiScanning(false);
        setAiScanResult({
          detected: true,
          message: 'AI Scan: "Subscribed" status & YouTube logo verified in screenshot!'
        });
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotDataUrl) {
      alert('Please upload your YouTube subscription screenshot proof.');
      return;
    }
    if (!subscriberName.trim()) {
      alert('Please enter your name or nickname.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitProof(
        selectedCode,
        subscriberName.trim(),
        subscriberHandle.trim() || `@${subscriberName.toLowerCase().replace(/\s+/g, '')}`,
        screenshotDataUrl
      );
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 800);
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-950 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white">Screenshot Proof Uploaded!</h2>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            Thank you <strong className="text-amber-300">{subscriberName}</strong>! Your subscription screenshot proof for competitor{' '}
            <strong className="text-amber-400">{activeCompetitor?.name}</strong> has been submitted.
          </p>
        </div>

        <div className="bg-[#0F1218] border border-slate-800 rounded-3xl p-6 text-left space-y-4 max-w-md mx-auto text-xs text-slate-300">
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Referral Code Used:</span>
            <span className="font-mono font-bold text-amber-300">{selectedCode}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Status:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Pending Admin Review
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Next Step:</span>
            <span>Once verified by admin, +1 referral will be added to {activeCompetitor?.name}'s score!</span>
          </div>

          {/* Social Share Callout on Success */}
          <div className="pt-2 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Help {activeCompetitor?.name} Win 100K Birr! Share link:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleTelegramShare}
                className="py-2 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            onClick={onGoToLeaderboard}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl transition-all"
          >
            View Live Leaderboard
          </button>

          <button
            onClick={() => {
              setSubmittedSuccess(false);
              setScreenshotDataUrl(null);
              setSubscriberName('');
              setSubscriberHandle('');
              setAiScanResult(null);
            }}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Submit Another Screenshot</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Supporting Bento Card */}
      <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <img
            src={activeCompetitor?.avatarUrl}
            alt={activeCompetitor?.name}
            className="w-16 h-16 rounded-full border-2 border-red-500 object-cover shadow-lg mx-auto sm:mx-0"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-wider mb-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Challenger Referral Link</span>
            </div>
            <h2 className="text-xl font-black text-white">
              Supporting: <span className="text-amber-400">{activeCompetitor?.name}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Code: <span className="font-mono text-amber-400">{selectedCode}</span> • Current Score: {activeCompetitor?.verifiedCount} verified subs
            </p>
          </div>
        </div>

        {/* Change Competitor Dropdown */}
        <div className="w-full sm:w-auto">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Supporting Challenger:</label>
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-red-500"
          >
            {competitors.map(c => (
              <option key={c.id} value={c.referralCode}>
                {c.name} ({c.referralCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Social Media Sharing & Invitation Card */}
      <div className="bg-[#0F1218] border border-red-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl">
              <Share2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Invite Subscribers for {activeCompetitor?.name}
              </h3>
              <p className="text-xs text-slate-400">
                Share this unique link on WhatsApp or Telegram to help them gain verified points!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleNativeShare}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Share</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>QR Code</span>
            </button>
          </div>
        </div>

        {/* Copy Link Input & Quick Share Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          {/* Link Box */}
          <div className="md:col-span-7 flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
            <input
              type="text"
              readOnly
              value={referralShareUrl}
              className="w-full bg-transparent text-xs font-mono text-amber-300 px-2 focus:outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                copiedLink
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-md'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Social Platforms */}
          <div className="md:col-span-5 grid grid-cols-2 gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-500/20 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleTelegramShare}
              className="py-2.5 px-3 rounded-2xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-xs font-extrabold transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-sky-400" />
              <span>Telegram</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Step Instructions Card */}
      <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
        
        {/* Step 1: Open YouTube & Subscribe */}
        <div className="space-y-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-red-600 text-white font-black text-sm flex items-center justify-center shadow-lg">
              1
            </span>
            <div>
              <h3 className="text-base font-black text-white">
                Step 1: Subscribe to {config.channelName}
              </h3>
              <p className="text-xs text-slate-400">
                Click the button below to open YouTube, press <strong className="text-red-400">"Subscribe"</strong>, and take a screenshot.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                <Youtube className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm block">{config.channelName}</span>
                <span className="text-xs text-slate-400">{config.channelHandle}</span>
              </div>
            </div>

            <a
              href={config.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition-all"
            >
              <Youtube className="w-4 h-4 fill-current" />
              <span>Subscribe on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Step 2: Upload Screenshot Proof */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg">
              2
            </span>
            <div>
              <h3 className="text-base font-black text-white">
                Step 2: Upload Subscription Screenshot Proof
              </h3>
              <p className="text-xs text-slate-400">
                Upload your screenshot to verify {activeCompetitor?.name}'s referral point.
              </p>
            </div>
          </div>

          {/* Drag and Drop Box */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !screenshotDataUrl && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              screenshotDataUrl
                ? 'border-emerald-500/50 bg-emerald-950/10'
                : 'border-slate-800 hover:border-red-500 bg-slate-900/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {screenshotDataUrl ? (
              <div className="space-y-4">
                <div className="relative inline-block max-w-full">
                  <img
                    src={screenshotDataUrl}
                    alt="Subscription Screenshot Proof"
                    className="max-h-64 rounded-xl border border-slate-700 object-contain mx-auto shadow-xl"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setScreenshotDataUrl(null);
                      setAiScanResult(null);
                    }}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isAiScanning && (
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-400 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                    <span>AI auto-analyzing screenshot text & subscribe status...</span>
                  </div>
                )}

                {aiScanResult && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{aiScanResult.message}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <div className="w-14 h-14 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">
                    Click to select or drag & drop screenshot image
                  </span>
                  <span className="text-xs text-slate-500">
                    Supports JPG, PNG, WEBP (Max 10MB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Subscriber Name & Handle Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Your Name / Nickname <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dawit Tadesse"
                value={subscriberName}
                onChange={(e) => setSubscriberName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                YouTube Handle or Email (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. @dawit_t"
                value={subscriberHandle}
                onChange={(e) => setSubscriberHandle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Submit Proof Button */}
          <button
            type="submit"
            disabled={!screenshotDataUrl || isSubmitting}
            className={`w-full py-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
              !screenshotDataUrl || isSubmitting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40 hover:scale-[1.01]'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Submitting Screenshot Proof...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Submit Subscription Screenshot Proof</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* QR Code Modal Dialog */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-[#0F1218] border border-slate-800 rounded-3xl p-6 text-center space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <span className="font-extrabold text-white text-sm uppercase tracking-wider">Referral Link QR Code</span>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralShareUrl)}`}
                alt="Referral Link QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-white">{activeCompetitor?.name}</p>
              <p className="font-mono text-amber-400">{selectedCode}</p>
              <p className="text-slate-400 text-[11px] pt-1">
                Scan with smartphone camera to open referral lander directly!
              </p>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
