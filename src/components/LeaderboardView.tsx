import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Search, Upload, ExternalLink, Sparkles, Clock, CheckCircle2, AlertCircle, Share2, Youtube, ArrowRight } from 'lucide-react';
import { ChannelConfig, Competitor } from '../types';

interface LeaderboardViewProps {
  competitors: Competitor[];
  config: ChannelConfig;
  onSelectReferralCode: (code: string) => void;
  onGoToDashboard: () => void;
  totalPending: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  competitors,
  config,
  onSelectReferralCode,
  onGoToDashboard,
  totalPending
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 0, minutes: 0, seconds: 0 });

  // Filter only approved competitors for public leaderboard
  const approvedCompetitors = competitors.filter(c => c.isApproved !== false);

  // Sorted competitors by verified count (descending) then pending
  const sortedCompetitors = [...approvedCompetitors].sort((a, b) => {
    if (b.verifiedCount !== a.verifiedCount) {
      return b.verifiedCount - a.verifiedCount;
    }
    return b.pendingCount - a.pendingCount;
  });

  const filteredCompetitors = sortedCompetitors.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = sortedCompetitors[0];
  const top2 = sortedCompetitors[1];
  const top3 = sortedCompetitors[2];

  const totalVerified = sortedCompetitors.reduce((acc, c) => acc + c.verifiedCount, 0);

  // Countdown timer calculation
  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = new Date(config.endDate).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [config.endDate]);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Bento Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Banner Card */}
        <div className="lg:col-span-8 bg-[#0F1218] rounded-3xl border border-slate-800/80 p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Grand Referral Competition
              </span>
              <span className="bg-slate-800/80 text-slate-300 border border-slate-700/60 text-[11px] font-semibold px-3 py-1 rounded-full">
                Verify via Screenshots
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Who Gets More Subscribers? <br />
              <span className="bg-gradient-to-r from-red-500 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                WIN {config.prizeAmount.toLocaleString()} {config.prizeCurrency}!
              </span>
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
              Invite your friends to subscribe to <strong className="text-white">{config.channelName}</strong>. 
              Subscribers upload screenshot proof using your referral code. The competitor with the most verified subscribers wins the 
              <span className="text-amber-400 font-bold"> 100,000 Birr prize</span>!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6">
            <button
              onClick={onGoToDashboard}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-red-900/40 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Get My Referral Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={config.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition-colors flex items-center gap-2"
            >
              <Youtube className="w-4 h-4 text-red-500 fill-current" />
              <span>YouTube Channel</span>
            </a>
          </div>
        </div>

        {/* Countdown Bento Card */}
        <div className="lg:col-span-4 bg-[#0F1218] rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-red-500 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Challenge Timer</span>
            </div>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          </div>

          <div className="py-6">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400">{timeLeft.days}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Days</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Hours</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Mins</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Secs</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              ⚡ Screenshots verified by Admin in real-time
            </p>
          </div>
        </div>
      </div>

      {/* Bento Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F1218] border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Verified Subs</span>
            <span className="text-3xl font-black text-white mt-1 block">{totalVerified}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0F1218] border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Active Challengers</span>
            <span className="text-3xl font-black text-white mt-1 block">{sortedCompetitors.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0F1218] border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Under Review</span>
            <span className="text-3xl font-black text-white mt-1 block">{totalPending}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Leaderboard Podium</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Top Referral Performers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 (Left on desktop) */}
          {top2 && (
            <div className="order-2 md:order-1 bg-[#0F1218] border border-slate-800 rounded-3xl p-6 relative flex flex-col items-center text-center shadow-lg">
              <span className="absolute top-4 left-4 bg-slate-800 text-slate-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-slate-700">
                2nd Place
              </span>
              <img
                src={top2.avatarUrl}
                alt={top2.name}
                className="w-20 h-20 rounded-full border-2 border-slate-600 mt-4 object-cover"
              />
              <h3 className="font-extrabold text-base text-white mt-3">{top2.name}</h3>
              <span className="text-xs font-mono text-slate-400 mt-0.5">Code: {top2.referralCode}</span>
              
              <div className="my-4 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 w-full">
                <span className="block text-2xl font-black text-white">{top2.verifiedCount}</span>
                <span className="text-[10px] text-slate-500 uppercase font-extrabold">Verified Subscribers</span>
              </div>

              <button
                onClick={() => onSelectReferralCode(top2.referralCode)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Submit Screenshot For {top2.name.split(' ')[0]}</span>
              </button>
            </div>
          )}

          {/* Rank 1 (Center - Prominent Gold) */}
          {top1 && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/40 via-[#0F1218] to-[#0F1218] border-2 border-amber-500/60 rounded-3xl p-6 relative flex flex-col items-center text-center shadow-2xl shadow-amber-950/40 transform md:-translate-y-2">
              <span className="absolute top-4 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                👑 1ST PLACE LEADER
              </span>

              <div className="relative mt-6">
                <img
                  src={top1.avatarUrl}
                  alt={top1.name}
                  className="w-24 h-24 rounded-full border-4 border-amber-400 object-cover shadow-xl"
                />
              </div>

              <h3 className="font-black text-xl text-white mt-3">{top1.name}</h3>
              <span className="text-xs font-mono text-amber-300/80">Code: {top1.referralCode}</span>

              <div className="my-4 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 w-full">
                <span className="block text-3xl font-black text-amber-400">{top1.verifiedCount}</span>
                <span className="text-[10px] text-amber-300/80 uppercase font-black">Verified Subscribers</span>
              </div>

              <button
                onClick={() => onSelectReferralCode(top1.referralCode)}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-red-900/40"
              >
                <Upload className="w-4 h-4" />
                <span>Submit Proof For {top1.name.split(' ')[0]}</span>
              </button>
            </div>
          )}

          {/* Rank 3 (Right on desktop) */}
          {top3 && (
            <div className="order-3 bg-[#0F1218] border border-slate-800 rounded-3xl p-6 relative flex flex-col items-center text-center shadow-lg">
              <span className="absolute top-4 left-4 bg-slate-800 text-slate-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-slate-700">
                3rd Place
              </span>
              <img
                src={top3.avatarUrl}
                alt={top3.name}
                className="w-20 h-20 rounded-full border-2 border-amber-700 mt-4 object-cover"
              />
              <h3 className="font-extrabold text-base text-white mt-3">{top3.name}</h3>
              <span className="text-xs font-mono text-slate-400 mt-0.5">Code: {top3.referralCode}</span>

              <div className="my-4 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 w-full">
                <span className="block text-2xl font-black text-white">{top3.verifiedCount}</span>
                <span className="text-[10px] text-slate-500 uppercase font-extrabold">Verified Subscribers</span>
              </div>

              <button
                onClick={() => onSelectReferralCode(top3.referralCode)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Submit Screenshot For {top3.name.split(' ')[0]}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* All Competitors Bento Table Container */}
      <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Full Leaderboard Rankings</h3>
            <p className="text-xs text-slate-400">All competitors ranked by total admin-approved screenshot proofs.</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search competitor name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-900/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-center w-16">Rank</th>
                <th scope="col" className="px-4 py-3">Challenger</th>
                <th scope="col" className="px-4 py-3 text-center">Referral Code</th>
                <th scope="col" className="px-4 py-3 text-center">Verified Subs</th>
                <th scope="col" className="px-4 py-3 text-center">Pending Review</th>
                <th scope="col" className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCompetitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                    No competitors found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredCompetitors.map((comp) => {
                  const rank = sortedCompetitors.findIndex(c => c.id === comp.id) + 1;

                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-center font-black">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs">1</span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-black text-xs">2</span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black text-xs">3</span>
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">#{rank}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={comp.avatarUrl}
                            alt={comp.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white block leading-snug">{comp.name}</span>
                            {comp.phoneOrTelegram && (
                              <span className="text-[10px] text-slate-500 block">{comp.phoneOrTelegram}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center font-mono text-xs text-amber-300 bg-slate-900/80 rounded-lg px-2 py-1 border border-slate-800">
                        {comp.referralCode}
                      </td>

                      <td className="px-4 py-3 text-center font-black text-base text-emerald-400">
                        {comp.verifiedCount}
                      </td>

                      <td className="px-4 py-3 text-center font-medium text-xs">
                        {comp.pendingCount > 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                            {comp.pendingCount} pending
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">0</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onSelectReferralCode(comp.referralCode)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-slate-200 font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Submit Proof</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
