import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, Eye, RefreshCw, Filter, Sparkles, Trophy, Download, Key, Lock, Unlock, Settings, RotateCcw, UserPlus, Copy, Check, Share2, Send, MessageCircle, FileSpreadsheet, FileJson, FileText, X, CheckSquare, Square } from 'lucide-react';
import { ChannelConfig, Competitor, ReferralSubmission, SubmissionStatus } from '../types';

interface AdminPortalProps {
  submissions: ReferralSubmission[];
  competitors: Competitor[];
  config: ChannelConfig;
  onUpdateStatus: (submissionId: string, status: SubmissionStatus, reason?: string) => void;
  onSaveConfig: (config: ChannelConfig) => void;
  onResetData: () => void;
  onViewScreenshot: (url: string) => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (val: boolean) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  submissions,
  competitors,
  config,
  onUpdateStatus,
  onSaveConfig,
  onResetData,
  onViewScreenshot,
  isAdminAuthenticated,
  setIsAdminAuthenticated
}) => {
  const [passcode, setPasscode] = useState('');
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Screenshot does not show "Subscribed" button active.');
  const [showSettings, setShowSettings] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Bulk Selection State
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);

  const toggleSelectSubmission = (id: string) => {
    setSelectedSubmissionIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    const approvableFiltered = filteredSubmissions.filter(s => s.status !== 'verified');
    const approvableIds = approvableFiltered.map(s => s.id);
    const allSelected = approvableIds.length > 0 && approvableIds.every(id => selectedSubmissionIds.includes(id));

    if (allSelected) {
      setSelectedSubmissionIds(prev => prev.filter(id => !approvableIds.includes(id)));
    } else {
      setSelectedSubmissionIds(prev => Array.from(new Set([...prev, ...approvableIds])));
    }
  };

  const handleBulkApprove = () => {
    if (selectedSubmissionIds.length === 0) return;
    if (window.confirm(`Approve ${selectedSubmissionIds.length} selected submission(s)? Each approved proof adds +1 referral point.`)) {
      selectedSubmissionIds.forEach(id => {
        onUpdateStatus(id, 'verified');
      });
      setSelectedSubmissionIds([]);
    }
  };

  const appBaseUrl = window.location.origin + window.location.pathname;
  const adminInviteUrl = `${appBaseUrl}?action=register&invite=admin_100k_challenge`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(adminInviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  // Editable config state
  const [editPrize, setEditPrize] = useState(config.prizeAmount);
  const [editChannelName, setEditChannelName] = useState(config.channelName);
  const [editChannelUrl, setEditChannelUrl] = useState(config.channelUrl);
  const [editRegistrationClosed, setEditRegistrationClosed] = useState(config.registrationClosed ?? true);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin123' || passcode.trim() === '') {
      setIsAdminAuthenticated(true);
    } else {
      alert('Incorrect passcode. Default passcode is: admin123');
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const verifiedCount = submissions.filter(s => s.status === 'verified').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  const handleApprove = (id: string) => {
    onUpdateStatus(id, 'verified');
  };

  const handleRejectSubmit = (id: string) => {
    onUpdateStatus(id, 'rejected', rejectReason);
    setRejectionModalId(null);
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      prizeAmount: Number(editPrize),
      channelName: editChannelName,
      channelUrl: editChannelUrl,
      registrationClosed: editRegistrationClosed
    });
    alert('Challenge settings updated successfully!');
    setShowSettings(false);
  };

  // 1. Export Competitors Summary CSV
  const downloadCompetitorsCSV = () => {
    const sortedCompetitors = [...competitors].sort((a, b) => b.verifiedCount - a.verifiedCount);
    const headers = ['Rank,Competitor Name,Referral Code,Contact Info,Verified Referrals,Pending Submissions,Rejected Submissions,Total Submissions,Registration Date\n'];
    const rows = sortedCompetitors.map((c, idx) => {
      const compSubs = submissions.filter(s => s.referralCode.toLowerCase() === c.referralCode.toLowerCase());
      const pending = compSubs.filter(s => s.status === 'pending').length;
      const rejected = compSubs.filter(s => s.status === 'rejected').length;
      const total = compSubs.length;
      const contact = (c.contactInfo || 'N/A').replace(/"/g, '""');
      const name = c.name.replace(/"/g, '""');
      const regDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A';
      return `"${idx + 1}","${name}","${c.referralCode}","${contact}","${c.verifiedCount}","${pending}","${rejected}","${total}","${regDate}"`;
    });

    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mejemeriya_competitors_summary_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // 2. Export Complete Contest JSON Report
  const downloadFullJSONReport = () => {
    const sortedCompetitors = [...competitors].sort((a, b) => b.verifiedCount - a.verifiedCount);
    const reportData = {
      reportType: "Mejemeriya TV 100,000 ETB Referral Challenge Report",
      exportedAt: new Date().toISOString(),
      channelConfig: {
        channelName: config.channelName,
        channelHandle: config.channelHandle,
        channelUrl: config.channelUrl,
        prizeAmount: config.prizeAmount,
        prizeCurrency: config.prizeCurrency,
        endDate: config.endDate
      },
      summaryStats: {
        totalChallengers: competitors.length,
        totalProofsSubmitted: submissions.length,
        verifiedSubmissionsCount: submissions.filter(s => s.status === 'verified').length,
        pendingSubmissionsCount: submissions.filter(s => s.status === 'pending').length,
        rejectedSubmissionsCount: submissions.filter(s => s.status === 'rejected').length
      },
      competitorsLeaderboard: sortedCompetitors.map((c, idx) => {
        const compSubs = submissions.filter(s => s.referralCode.toLowerCase() === c.referralCode.toLowerCase());
        return {
          rank: idx + 1,
          competitorId: c.id,
          competitorName: c.name,
          referralCode: c.referralCode,
          contactInfo: c.contactInfo || 'N/A',
          verifiedCount: c.verifiedCount,
          pendingCount: compSubs.filter(s => s.status === 'pending').length,
          rejectedCount: compSubs.filter(s => s.status === 'rejected').length,
          totalSubmittedProofs: compSubs.length,
          registeredAt: c.createdAt || null
        };
      }),
      submissionsLedger: submissions.map(s => ({
        submissionId: s.id,
        competitorName: s.competitorName,
        referralCode: s.referralCode,
        subscriberName: s.subscriberName,
        subscriberHandle: s.subscriberHandle,
        status: s.status,
        rejectionReason: s.rejectionReason || null,
        aiVerification: s.aiVerification || null,
        submittedAt: s.submittedAt
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mejemeriya_contest_full_report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // 3. Export Submissions Ledger CSV
  const downloadSubmissionsCSV = () => {
    const headers = ['Submission ID,Referral Code,Competitor Name,Subscriber Name,Subscriber Handle,Submitted Date,Status,Decline Reason\n'];
    const rows = submissions.map(s => {
      const reason = (s.rejectionReason || '').replace(/"/g, '""');
      const compName = s.competitorName.replace(/"/g, '""');
      const subName = s.subscriberName.replace(/"/g, '""');
      return `"${s.id}","${s.referralCode}","${compName}","${subName}","${s.subscriberHandle}","${s.submittedAt}","${s.status}","${reason}"`;
    });
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mejemeriya_submissions_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Organizer Admin Portal</h2>
            <p className="text-xs text-slate-400">
              Enter admin passcode to review uploaded subscriber screenshots and manage the 100,000 Birr challenge.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Passcode (default: admin123)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-center font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-red-900/40 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Review Portal</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => setIsAdminAuthenticated(true)}
              className="text-xs text-amber-400 underline font-semibold hover:text-amber-300"
            >
              Quick Demo Unlock (Click Here)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Admin Header */}
      <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-3 bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl shadow-lg">
            <ShieldCheck className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-[10px] font-black uppercase tracking-wider mb-1 border border-red-500/30">
              <Key className="w-3 h-3 text-amber-400" />
              <span>Organizer Verification Dashboard</span>
            </div>
            <h2 className="text-2xl font-black text-white">Screenshot Verification Portal</h2>
            <p className="text-xs text-slate-400">Review screenshots, approve referrals, or update contest settings.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>{showSettings ? 'Hide Settings' : 'Contest Settings'}</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30 border border-emerald-500/30"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>

          <button
            onClick={() => setIsAdminAuthenticated(false)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold transition-all border border-slate-800"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Admin Challenger Registration Link Generator */}
      <div className="bg-[#0F1218] border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">Unique Challenger Registration Link</h3>
              <p className="text-xs text-slate-400">Send this link to new contestants so they can create an account and join the contest.</p>
            </div>
          </div>

          <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-mono font-bold">
            Admin Invite Token Active
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              readOnly
              value={adminInviteUrl}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 focus:outline-none select-all"
            />

            <button
              onClick={handleCopyInvite}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 whitespace-nowrap"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Invite Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Registration Link</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(adminInviteUrl)}&text=${encodeURIComponent('You are invited to join the Mejemeriya TV 100,000 Birr Challenge! Click to register as a challenger:')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-300 hover:bg-sky-600/30 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invite via Telegram</span>
            </a>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`You are invited to join the Mejemeriya TV 100k Birr Challenge! Register here: ${adminInviteUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 font-bold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Invite via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Contest Settings Drawer */}
      {showSettings && (
        <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-2xl">
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Edit Contest Settings</span>
          </h3>

          <form onSubmit={handleSaveSettingsSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Prize Amount (ETB)</label>
              <input
                type="number"
                value={editPrize}
                onChange={(e) => setEditPrize(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">YouTube Channel Name</label>
              <input
                type="text"
                value={editChannelName}
                onChange={(e) => setEditChannelName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">YouTube Channel URL</label>
              <input
                type="text"
                value={editChannelUrl}
                onChange={(e) => setEditChannelUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="sm:col-span-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-xs text-white block">New Challenger Registration Status</span>
                <span className="text-[11px] text-slate-400">
                  {editRegistrationClosed
                    ? 'CLOSED — No new challengers can register (Existing challengers can still participate).'
                    : 'OPEN — Anyone can create a custom referral code and join the contest.'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setEditRegistrationClosed(!editRegistrationClosed)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  editRegistrationClosed
                    ? 'bg-red-600/30 text-red-400 border border-red-500/40 hover:bg-red-600/40'
                    : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/40'
                }`}
              >
                {editRegistrationClosed ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-red-400" />
                    <span>Closed (Locked)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open (Public)</span>
                  </>
                )}
              </button>
            </div>

            <div className="sm:col-span-3 flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={onResetData}
                className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 text-xs font-bold flex items-center gap-1.5 border border-red-900/40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Submissions</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Counters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('pending')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            filter === 'pending'
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-lg'
              : 'bg-[#0F1218] border-slate-800/80 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="block text-2xl font-black text-amber-400">{pendingCount}</span>
          <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
        </button>

        <button
          onClick={() => setFilter('verified')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            filter === 'verified'
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-lg'
              : 'bg-[#0F1218] border-slate-800/80 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="block text-2xl font-black text-emerald-400">{verifiedCount}</span>
          <span className="text-xs font-bold uppercase tracking-wider">Verified (+1 Added)</span>
        </button>

        <button
          onClick={() => setFilter('rejected')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            filter === 'rejected'
              ? 'bg-red-500/10 border-red-500/50 text-red-300 shadow-lg'
              : 'bg-[#0F1218] border-slate-800/80 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="block text-2xl font-black text-red-400">{rejectedCount}</span>
          <span className="text-xs font-bold uppercase tracking-wider">Rejected</span>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`p-5 rounded-3xl border text-left transition-all ${
            filter === 'all'
              ? 'bg-slate-800 border-slate-600 text-white shadow-lg'
              : 'bg-[#0F1218] border-slate-800/80 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="block text-2xl font-black text-white">{submissions.length}</span>
          <span className="text-xs font-bold uppercase tracking-wider">Total Proofs</span>
        </button>
      </div>

      {/* Submissions Review Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0F1218] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-red-500" />
              <span className="capitalize">{filter} Screenshot Submissions ({filteredSubmissions.length})</span>
            </h3>
          </div>

          {/* Bulk Controls Toolbar */}
          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={toggleSelectAllFiltered}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              {filteredSubmissions.filter(s => s.status !== 'verified').length > 0 &&
              filteredSubmissions.filter(s => s.status !== 'verified').every(s => selectedSubmissionIds.includes(s.id)) ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>Select All Approvable</span>
                </>
              )}
            </button>

            {selectedSubmissionIds.length > 0 && (
              <button
                onClick={handleBulkApprove}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-transform hover:scale-105 flex items-center gap-1.5 shadow-lg shadow-emerald-950 uppercase tracking-wider"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Bulk Approve ({selectedSubmissionIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-12 text-center text-slate-500 text-sm">
            No submissions in <strong className="text-slate-300">{filter}</strong> queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSubmissions.map(sub => {
              const isSelected = selectedSubmissionIds.includes(sub.id);
              const isVerified = sub.status === 'verified';

              return (
                <div
                  key={sub.id}
                  className={`bg-[#0F1218] border rounded-3xl p-5 space-y-4 shadow-xl transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500/70 bg-emerald-950/10'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Submission Header with Checkbox */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {!isVerified && (
                          <button
                            type="button"
                            onClick={() => toggleSelectSubmission(sub.id)}
                            className="mt-1 text-slate-400 hover:text-emerald-400 transition-colors"
                            title="Select for bulk action"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-600" />
                            )}
                          </button>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-base">{sub.subscriberName}</span>
                            <span className="text-xs text-amber-300 font-mono">{sub.subscriberHandle}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Challenger Code: <strong className="text-amber-400 font-mono">{sub.referralCode}</strong> ({sub.competitorName})
                          </p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold capitalize ${
                        sub.status === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : sub.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                  {/* Screenshot Thumbnail with Click to Zoom */}
                  <div
                    onClick={() => onViewScreenshot(sub.screenshotUrl)}
                    className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden cursor-pointer group h-48 flex items-center justify-center"
                  >
                    <img
                      src={sub.screenshotUrl}
                      alt="Uploaded Subscriber Screenshot"
                      className="max-h-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                      <Eye className="w-5 h-5 text-amber-400" />
                      <span>Enlarge Screenshot</span>
                    </div>
                  </div>

                  {/* AI Verification Report */}
                  {sub.aiVerification && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-amber-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Image Assistant Scan</span>
                        </span>
                        <span className="text-[11px] font-mono">{Math.round(sub.aiVerification.confidence * 100)}% Match</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{sub.aiVerification.notes}</p>
                    </div>
                  )}

                  {sub.rejectionReason && (
                    <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-300">
                      <strong>Rejection Reason:</strong> {sub.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Review Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-500">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {sub.status !== 'rejected' && (
                      <button
                        onClick={() => setRejectionModalId(sub.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 font-bold text-xs transition-colors flex items-center gap-1 border border-red-900/60"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    {sub.status !== 'verified' && (
                      <button
                        onClick={() => handleApprove(sub.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors flex items-center gap-1 shadow-md shadow-emerald-950"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve (+1 Point)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Rejection Modal Input */}
                {rejectionModalId === sub.id && (
                  <div className="mt-3 p-4 bg-slate-900 border border-red-500/40 rounded-2xl space-y-3">
                    <label className="block text-xs font-bold text-red-300">Reason for Rejection:</label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setRejectionModalId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRejectSubmit(sub.id)}
                        className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Download Report Modal Dialog */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">
                  <Download className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Download Contest Reports & Analytics</h3>
                  <p className="text-xs text-slate-400">Generate and export records in CSV or JSON format for external keeping.</p>
                </div>
              </div>

              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Report Options Grid */}
            <div className="space-y-4">
              {/* Option 1: Competitor Summary CSV */}
              <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-2xl space-y-3 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">1. Challenger Referral Stats Summary (CSV)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ranked list of all registered competitors, referral codes, contact details, and verified/pending/rejected referral totals.
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold rounded-lg shrink-0">
                    .CSV Format
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                  <span className="text-[11px] font-mono text-slate-400">{competitors.length} total competitors tracked</span>
                  <button
                    onClick={() => {
                      downloadCompetitorsCSV();
                      setShowReportModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Competitor CSV</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Full Contest Backup JSON */}
              <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-5 rounded-2xl space-y-3 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                      <FileJson className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">2. Complete Contest Data Audit (JSON)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Structured JSON export containing channel configuration, overall metrics, challenger rankings, and full subscriber submission ledgers with AI scores.
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-bold rounded-lg shrink-0">
                    .JSON Format
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                  <span className="text-[11px] font-mono text-slate-400">Full channel & submission backup</span>
                  <button
                    onClick={() => {
                      downloadFullJSONReport();
                      setShowReportModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full JSON</span>
                  </button>
                </div>
              </div>

              {/* Option 3: Submissions Ledger CSV */}
              <div className="bg-slate-900 border border-slate-800 hover:border-red-500/40 p-5 rounded-2xl space-y-3 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 text-red-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">3. Subscriber Proof Submissions Ledger (CSV)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Detailed log of every subscriber proof upload, referral code, subscriber handle, date, verification status, and rejection reasons.
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-red-500/10 text-red-300 border border-red-500/20 text-[10px] font-mono font-bold rounded-lg shrink-0">
                    .CSV Format
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                  <span className="text-[11px] font-mono text-slate-400">{submissions.length} subscriber proof logs</span>
                  <button
                    onClick={() => {
                      downloadSubmissionsCSV();
                      setShowReportModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Submissions CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider"
              >
                Close Report Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
