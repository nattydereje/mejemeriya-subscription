import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, QrCode, Trophy, Users, Sparkles, ExternalLink, MessageCircle, Send, CheckCircle2, Clock, PlusCircle, XCircle, AlertTriangle, Filter, UserCheck, ShieldAlert, TrendingUp, BarChart3, Activity, Upload, X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChannelConfig, Competitor, ReferralSubmission } from '../types';

interface CompetitorDashboardProps {
  competitors: Competitor[];
  submissions: ReferralSubmission[];
  config: ChannelConfig;
  onRegister: (name: string, code: string, contact?: string, avatarUrl?: string, gender?: 'male' | 'female' | 'other') => Competitor;
  onGoToLeaderboard: () => void;
  autoOpenRegister?: boolean;
}

export const CompetitorDashboard: React.FC<CompetitorDashboardProps> = ({
  competitors,
  submissions,
  config,
  onRegister,
  onGoToLeaderboard,
  autoOpenRegister
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(competitors[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Registration Form State
  const [isRegistering, setIsRegistering] = useState(autoOpenRegister || false);
  const [regName, setRegName] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other'>('male');
  const [regAvatarUrl, setRegAvatarUrl] = useState<string>('');

  // Status Filter for referred subscribers table
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'rejected' | 'pending'>('all');
  const [chartView, setChartView] = useState<'cumulative' | 'daily'>('cumulative');

  useEffect(() => {
    if (autoOpenRegister) {
      setIsRegistering(true);
    }
  }, [autoOpenRegister]);

  const currentCompetitor = competitors.find(c => c.id === selectedCompId) || competitors[0];

  const appUrl = window.location.origin + window.location.pathname;
  const referralLink = currentCompetitor
    ? `${appUrl}?ref=${currentCompetitor.referralCode}`
    : appUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mySubmissions = submissions.filter(
    s => s.referralCode.toLowerCase() === currentCompetitor?.referralCode.toLowerCase()
  );

  // Growth Chart Data Calculation
  const prepareChartData = () => {
    const daysMap: { [dateKey: string]: { dateLabel: string; verified: number; pending: number; total: number } } = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap[key] = { dateLabel: label, verified: 0, pending: 0, total: 0 };
    }

    mySubmissions.forEach(sub => {
      const dateKey = new Date(sub.submittedAt).toISOString().split('T')[0];
      if (!daysMap[dateKey]) {
        const label = new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        daysMap[dateKey] = { dateLabel: label, verified: 0, pending: 0, total: 0 };
      }
      daysMap[dateKey].total += 1;
      if (sub.status === 'verified') daysMap[dateKey].verified += 1;
      else if (sub.status === 'pending') daysMap[dateKey].pending += 1;
    });

    const sortedKeys = Object.keys(daysMap).sort();
    let cumulativeVerified = 0;
    let cumulativeTotal = 0;

    return sortedKeys.map(key => {
      const item = daysMap[key];
      cumulativeVerified += item.verified;
      cumulativeTotal += item.total;

      return {
        date: item.dateLabel,
        'Verified Points': cumulativeVerified,
        'Total Proofs': cumulativeTotal,
        'Daily Verified': item.verified,
        'Daily Submissions': item.total
      };
    });
  };

  const chartData = prepareChartData();

  const filteredMySubmissions = mySubmissions.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const verifiedSubCount = mySubmissions.filter(s => s.status === 'verified').length;
  const rejectedSubCount = mySubmissions.filter(s => s.status === 'rejected').length;
  const pendingSubCount = mySubmissions.filter(s => s.status === 'pending').length;

  // Sorted competitors to find rank
  const sorted = [...competitors].sort((a, b) => b.verifiedCount - a.verifiedCount);
  const myRank = currentCompetitor ? sorted.findIndex(c => c.id === currentCompetitor.id) + 1 : 1;

  const shareText = `🔥 Subscribe to ${config.channelName} on YouTube to help me win the 100,000 Birr Challenge! Click my link, subscribe, and upload screenshot proof here: ${referralLink}`;

  const handleWhatsAppShare = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleTelegramShare = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Subscribe to support me in 100k Birr Challenge!`)}`, '_blank');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regCode.trim()) {
      alert('Please enter your name and custom referral code.');
      return;
    }

    const newComp = onRegister(regName.trim(), regCode.trim(), regContact.trim(), regAvatarUrl, regGender);
    setSelectedCompId(newComp.id);
    setIsRegistering(false);
    setRegName('');
    setRegCode('');
    setRegContact('');
    setRegAvatarUrl('');
    alert('🎉 Registration submitted successfully! Your account is pending admin approval. Once approved by the contest admin, your referral code will appear on the public leaderboard.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Selector or New Registration toggle */}
      <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-red-500" />
            <span>Challenger Referral Hub</span>
          </h2>
          <p className="text-xs text-slate-400">Get your referral link, invite friends, and track your verified subscribers.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {!isRegistering ? (
            <>
              <select
                value={selectedCompId}
                onChange={(e) => setSelectedCompId(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-red-500 flex-1 md:flex-initial"
              >
                {competitors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.referralCode}) {c.isApproved === false ? '⏳ [Pending Approval]' : ''}
                  </option>
                ))}
              </select>

              {config.registrationClosed ? (
                <button
                  onClick={() => setIsRegistering(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap border border-slate-700/80 cursor-pointer uppercase tracking-wider hover:border-red-500/50 hover:text-slate-200 transition-all"
                >
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>Registration Closed</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsRegistering(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-red-900/30 uppercase tracking-wider"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Join Challenge</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => setIsRegistering(false)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Pending Admin Approval Banner */}
      {currentCompetitor && currentCompetitor.isApproved === false && !isRegistering && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-5 flex items-start gap-4 text-amber-300 shadow-xl">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0 mt-0.5">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-sm uppercase tracking-wider text-amber-400">
              Registration Pending Admin Approval
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your challenger account (<strong className="text-amber-300">{currentCompetitor.name}</strong> • code: <strong className="font-mono text-amber-400">{currentCompetitor.referralCode}</strong>) has been submitted. Once an organizer admin approves your profile, your referral code will appear on the public leaderboard.
            </p>
          </div>
        </div>
      )}

      {/* Join Challenge Form Modal/Card */}
      {isRegistering && (
        config.registrationClosed ? (
          <div className="bg-[#0F1218] border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600/20 text-red-500 rounded-2xl border border-red-500/30">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">New Challenger Registrations Are Closed</h3>
                <p className="text-xs text-slate-300">Mejemeriya TV has currently closed registration for new contestants.</p>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
              <p className="font-bold text-red-400">Notice for New Contestants:</p>
              <p className="leading-relaxed">
                New accounts cannot be created at this time. If you were invited by an existing challenger, click their referral link to submit your subscriber screenshot proof and support their entry in the 100,000 ETB challenge!
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsRegistering(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#0F1218] border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600/20 text-red-500 rounded-2xl border border-red-500/30">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Join the 100,000 Birr Challenge!</h3>
                <p className="text-xs text-slate-300">Create your custom referral code to start collecting subscriber screenshot proofs.</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yonas Alemu"
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      if (!regCode) {
                        setRegCode(e.target.value.toLowerCase().replace(/\s+/g, '') + '100k');
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Custom Referral Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. yonas100k"
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Telegram Username or Phone Number (For Prize Payout)</label>
                <input
                  type="text"
                  placeholder="e.g. @yonas_alemu or +251912345678"
                  value={regContact}
                  onChange={(e) => setRegContact(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Profile Avatar / Gender Selection */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-200">
                  Profile Picture & Avatar Customization
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Upload Custom Photo */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block">Upload Profile Picture</span>
                    <div className="flex items-center gap-3">
                      {regAvatarUrl ? (
                        <div className="relative">
                          <img src={regAvatarUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border-2 border-red-500/60 shadow-md" />
                          <button
                            type="button"
                            onClick={() => setRegAvatarUrl('')}
                            className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-full shadow"
                            title="Remove picture"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-colors border border-slate-700">
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>Choose Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  if (evt.target?.result) {
                                    setRegAvatarUrl(evt.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                      <span className="text-[10px] text-slate-500">JPG/PNG photo</span>
                    </div>
                  </div>

                  {/* Option 2: Select Gender for Avatar */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block">Or Select Gender Avatar</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRegGender('male')}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                          regGender === 'male'
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500/80 shadow-md'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Male ♂️
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegGender('female')}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                          regGender === 'female'
                            ? 'bg-pink-600/30 text-pink-300 border-pink-500/80 shadow-md'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Female ♀️
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegGender('other')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                          regGender === 'other'
                            ? 'bg-purple-600/30 text-purple-300 border-purple-500/80 shadow-md'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        ✨
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-red-900/40 hover:scale-[1.01] transition-transform"
              >
                Get My Referral Link & Enter Contest
              </button>
            </form>
          </div>
        )
      )}

      {/* Main Competitor Card */}
      {currentCompetitor && (
        <div className="space-y-6">
          {/* Profile & Rank Banner */}
          <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-4">
                <img
                  src={currentCompetitor.avatarUrl}
                  alt={currentCompetitor.name}
                  className="w-20 h-20 rounded-full border-4 border-amber-400 object-cover shadow-xl"
                />
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black border border-amber-500/30 uppercase tracking-wider mb-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Leaderboard Rank #{myRank}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{currentCompetitor.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Referral Code: <span className="text-amber-400 font-bold">{currentCompetitor.referralCode}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-center">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3">
                  <span className="block text-2xl font-black text-emerald-400">{currentCompetitor.verifiedCount}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Verified Subs</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3">
                  <span className="block text-2xl font-black text-amber-400">{currentCompetitor.pendingCount}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Pending Review</span>
                </div>
              </div>
            </div>

            {/* Referral Link & Share Tools */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                <Share2 className="w-4 h-4 text-red-500" />
                <span>Your Unique Referral Link</span>
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 focus:outline-none select-all"
                />

                <button
                  onClick={handleCopy}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instant Social Share Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  onClick={handleTelegramShare}
                  className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Share on Telegram</span>
                </button>

                <button
                  onClick={() => setShowQr(!showQr)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>{showQr ? 'Hide QR Code' : 'Show Referral QR Code'}</span>
                </button>
              </div>

              {/* Simulated QR Code */}
              {showQr && (
                <div className="p-6 bg-white rounded-2xl text-center space-y-3 max-w-xs mx-auto shadow-2xl">
                  <div className="w-48 h-48 bg-slate-900 rounded-xl mx-auto p-4 flex flex-col items-center justify-center text-white border-4 border-amber-400">
                    <QrCode className="w-28 h-28 text-amber-400 mb-2" />
                    <span className="text-[10px] font-mono text-amber-300 font-bold">{currentCompetitor.referralCode}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-bold">Scan to open {currentCompetitor.name}'s referral page</p>
                </div>
              )}
            </div>
          </div>

          {/* Referral Growth Analytics Visual Chart Card */}
          <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Referral Growth Trajectory</span>
                </h3>
                <p className="text-xs text-slate-400">Visual summary of subscriber screenshot proofs over time.</p>
              </div>

              {/* Chart Toggle View */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setChartView('cumulative')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    chartView === 'cumulative'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Cumulative Points</span>
                </button>

                <button
                  onClick={() => setChartView('daily')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    chartView === 'daily'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Daily Breakdown</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block">Verified Points</span>
                <span className="text-xl font-black text-emerald-400">{verifiedSubCount}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block">Pending Review</span>
                <span className="text-xl font-black text-amber-400">{pendingSubCount}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block">Declined Proofs</span>
                <span className="text-xl font-black text-red-400">{rejectedSubCount}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block">Total Proofs</span>
                <span className="text-xl font-black text-white">{mySubmissions.length}</span>
              </div>
            </div>

            {/* Recharts Area / Bar Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'cumulative' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="verifiedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090D14',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#FFF',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Verified Points"
                      stroke="#10B981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#verifiedGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Total Proofs"
                      stroke="#EF4444"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#totalGrad)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090D14',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#FFF',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="Daily Verified" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Daily Submissions" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Submissions Activity Table for this competitor */}
          <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <span>Your Referred Subscribers</span>
                </h3>
                <p className="text-xs text-slate-400">View approved subscribers and declined submissions with exact reasons.</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'all'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({mySubmissions.length})
                </button>

                <button
                  onClick={() => setStatusFilter('verified')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'verified'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  Approved ({verifiedSubCount})
                </button>

                <button
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'rejected'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-red-400'
                  }`}
                >
                  Declined ({rejectedSubCount})
                </button>

                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-amber-400'
                  }`}
                >
                  Pending ({pendingSubCount})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Subscriber Name</th>
                    <th className="px-4 py-3">YouTube Handle</th>
                    <th className="px-4 py-3">Submitted Date</th>
                    <th className="px-4 py-3 text-right">Verification & Decline Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMySubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-500">
                        {statusFilter === 'all'
                          ? 'No subscribers have uploaded screenshot proof with your code yet. Share your link to get started!'
                          : `No subscribers currently marked as "${statusFilter}".`}
                      </td>
                    </tr>
                  ) : (
                    filteredMySubmissions.map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/40 align-top">
                        <td className="px-4 py-4 font-bold text-white">{s.subscriberName}</td>
                        <td className="px-4 py-4 font-mono text-slate-400">{s.subscriberHandle}</td>
                        <td className="px-4 py-4 text-slate-400 whitespace-nowrap">
                          {new Date(s.submittedAt).toLocaleDateString()} {new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {s.status === 'verified' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Approved (+1 Point)</span>
                            </span>
                          ) : s.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                              <Clock className="w-4 h-4 text-amber-400" />
                              <span>Pending Admin Review</span>
                            </span>
                          ) : (
                            <div className="space-y-2 text-right inline-block max-w-sm">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold">
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span>Declined / Rejected</span>
                              </span>

                              <div className="bg-red-950/70 border border-red-800/80 rounded-2xl p-3 text-left space-y-1 shadow-lg">
                                <div className="text-[11px] font-black text-red-300 flex items-center gap-1 uppercase tracking-wider">
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                  <span>Decline Reason:</span>
                                </div>
                                <p className="text-xs text-slate-200 leading-snug">
                                  {s.rejectionReason || 'Screenshot proof did not meet subscription criteria.'}
                                </p>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
