import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LeaderboardView } from './components/LeaderboardView';
import { ReferralLander } from './components/ReferralLander';
import { CompetitorDashboard } from './components/CompetitorDashboard';
import { AdminPortal } from './components/AdminPortal';
import { RulesAndFAQ } from './components/RulesAndFAQ';
import { ScreenshotModal } from './components/ScreenshotModal';
import { ChannelConfig, Competitor, ReferralSubmission, SubmissionStatus } from './types';
import {
  getChannelConfig,
  getCompetitors,
  getSubmissions,
  registerCompetitor,
  approveCompetitor,
  deleteCompetitor,
  saveChannelConfig,
  submitReferralProof,
  updateSubmissionStatus,
  resetToInitialData
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'referral' | 'dashboard' | 'admin' | 'rules'>('leaderboard');
  const [config, setConfig] = useState<ChannelConfig>(getChannelConfig());
  const [competitors, setCompetitors] = useState<Competitor[]>(getCompetitors());
  const [submissions, setSubmissions] = useState<ReferralSubmission[]>(getSubmissions());
  const [selectedReferralCode, setSelectedReferralCode] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [inspectScreenshotUrl, setInspectScreenshotUrl] = useState<string | null>(null);
  const [autoOpenRegister, setAutoOpenRegister] = useState<boolean>(false);

  // Parse URL query parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    const actionParam = params.get('action');
    const registerParam = params.get('register');
    const inviteParam = params.get('invite');

    if (refParam) {
      setSelectedReferralCode(refParam);
      setActiveTab('referral');
    } else if (actionParam === 'register' || registerParam === 'true' || inviteParam) {
      setActiveTab('dashboard');
      setAutoOpenRegister(true);
    }
  }, []);

  const handleSelectReferralCode = (code: string) => {
    setSelectedReferralCode(code);
    setActiveTab('referral');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterCompetitor = (
    name: string,
    code: string,
    contact?: string,
    avatarUrl?: string,
    gender?: 'male' | 'female' | 'other'
  ) => {
    const newComp = registerCompetitor(name, code, contact, avatarUrl, gender);
    setCompetitors(getCompetitors());
    setSelectedReferralCode(newComp.referralCode);
    return newComp;
  };

  const handleSubmitProof = (
    refCode: string,
    subName: string,
    subHandle: string,
    screenshotDataUrl: string
  ) => {
    submitReferralProof(refCode, subName, subHandle, screenshotDataUrl);
    setSubmissions(getSubmissions());
    setCompetitors(getCompetitors());
  };

  const handleUpdateStatus = (
    submissionId: string,
    status: SubmissionStatus,
    reason?: string
  ) => {
    updateSubmissionStatus(submissionId, status, reason);
    setSubmissions(getSubmissions());
    setCompetitors(getCompetitors());
  };

  const handleSaveConfig = (newConfig: ChannelConfig) => {
    saveChannelConfig(newConfig);
    setConfig(newConfig);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data back to demo defaults?')) {
      resetToInitialData();
      setConfig(getChannelConfig());
      setCompetitors(getCompetitors());
      setSubmissions(getSubmissions());
    }
  };

  const handleApproveCompetitor = (id: string) => {
    approveCompetitor(id);
    setCompetitors(getCompetitors());
  };

  const handleDeleteCompetitor = (id: string) => {
    deleteCompetitor(id);
    setCompetitors(getCompetitors());
  };

  const pendingSubmissionsCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        selectedReferralCode={selectedReferralCode}
        isAdmin={isAdminAuthenticated}
        setIsAdmin={setIsAdminAuthenticated}
        pendingCount={pendingSubmissionsCount}
      />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            competitors={competitors}
            config={config}
            onSelectReferralCode={handleSelectReferralCode}
            onGoToDashboard={() => setActiveTab('dashboard')}
            totalPending={pendingSubmissionsCount}
          />
        )}

        {activeTab === 'referral' && (
          <ReferralLander
            referralCode={selectedReferralCode}
            competitors={competitors}
            config={config}
            onSubmitProof={handleSubmitProof}
            onGoToLeaderboard={() => setActiveTab('leaderboard')}
          />
        )}

        {activeTab === 'dashboard' && (
          <CompetitorDashboard
            competitors={competitors}
            submissions={submissions}
            config={config}
            onRegister={handleRegisterCompetitor}
            onGoToLeaderboard={() => setActiveTab('leaderboard')}
            autoOpenRegister={autoOpenRegister}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            submissions={submissions}
            competitors={competitors}
            config={config}
            onUpdateStatus={handleUpdateStatus}
            onSaveConfig={handleSaveConfig}
            onResetData={handleResetData}
            onViewScreenshot={(url) => setInspectScreenshotUrl(url)}
            isAdminAuthenticated={isAdminAuthenticated}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
            onApproveCompetitor={handleApproveCompetitor}
            onDeleteCompetitor={handleDeleteCompetitor}
            onAddCompetitor={(name, code, contact, avatarUrl, gender) => {
              const comp = handleRegisterCompetitor(name, code, contact, avatarUrl, gender);
              if (comp) {
                handleApproveCompetitor(comp.id);
              }
            }}
          />
        )}

        {activeTab === 'rules' && (
          <RulesAndFAQ
            config={config}
            onGoToDashboard={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* High-Res Screenshot Inspection Modal */}
      <ScreenshotModal
        imageUrl={inspectScreenshotUrl}
        onClose={() => setInspectScreenshotUrl(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 space-y-4">
        <p>
          SubReferral • YouTube Referral & Screenshot Verification Platform for <strong className="text-amber-400">100,000 Birr</strong> Subscriber Challenge
        </p>

        {/* Organizer Admin Portal Access in Footer */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => {
              setActiveTab('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'admin'
                ? 'bg-red-600/30 text-red-300 border-red-500/50 shadow-lg shadow-red-950/80'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${pendingSubmissionsCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Organizer Admin Portal</span>
            {pendingSubmissionsCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-slate-950">
                {pendingSubmissionsCount} Pending
              </span>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-600">
          Created for YouTube creators & friends competition • Powered by Google AI Studio
        </p>
      </footer>
    </div>
  );
}
