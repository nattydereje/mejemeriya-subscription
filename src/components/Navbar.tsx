import React from 'react';
import { Trophy, Users, Upload, ShieldCheck, HelpCircle, Youtube, ExternalLink, Lock } from 'lucide-react';
import { ChannelConfig } from '../types';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  activeTab: 'leaderboard' | 'referral' | 'dashboard' | 'admin' | 'rules';
  setActiveTab: (tab: 'leaderboard' | 'referral' | 'dashboard' | 'admin' | 'rules') => void;
  config: ChannelConfig;
  selectedReferralCode?: string;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  selectedReferralCode,
  isAdmin,
  setIsAdmin,
  pendingCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0C10]/95 backdrop-blur-md border-b border-slate-800/80 text-white">
      {/* Top Banner for Prize & Live Event Badge */}
      <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-950 text-slate-200 py-2 px-4 text-xs text-center border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="font-semibold text-slate-300">Live Challenge Event</span>
          </div>
          <a 
            href={config.channelUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hidden sm:inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <Youtube className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>{config.channelName}</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>

        <div className="flex items-center gap-2 mx-auto sm:mx-0 font-bold">
          <span className="bg-red-600 px-3 py-1 rounded-full text-[11px] font-black tracking-wider text-white uppercase shadow-md shadow-red-900/40">
            {config.prizeAmount.toLocaleString()} {config.prizeCurrency} GRAND PRIZE
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('leaderboard')}
            className="cursor-pointer group py-1"
          >
            <BrandLogo size="md" />
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveTab('referral')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'referral'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Subscriber Proof</span>
              {selectedReferralCode && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Challenger Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'rules'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Rules</span>
            </button>
          </nav>

          {/* Right Actions & Admin Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('admin')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'admin' || isAdmin
                  ? 'bg-red-600/20 text-red-300 border-red-500/40 shadow-lg shadow-red-950/50'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
              title="Admin Verification Hub"
            >
              <ShieldCheck className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Verification Hub</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-slate-950">
                  {pendingCount}
                </span>
              )}
            </button>

            <a
              href={config.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-900/30"
            >
              <Youtube className="w-4 h-4 fill-current" />
              <span>YouTube Channel</span>
            </a>
          </div>
        </div>

        {/* Mobile Bottom Bar Navigation */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl ${
              activeTab === 'leaderboard' ? 'text-red-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('referral')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl relative ${
              activeTab === 'referral' ? 'text-red-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Submit Proof</span>
            {selectedReferralCode && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl ${
              activeTab === 'dashboard' ? 'text-red-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>My Link</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl relative ${
              activeTab === 'admin' ? 'text-red-400 font-bold' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin ({pendingCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
