import React from 'react';
import { HelpCircle, CheckCircle2, AlertTriangle, Trophy, ShieldCheck, FileText, Youtube, Share2, ExternalLink } from 'lucide-react';
import { ChannelConfig } from '../types';

interface RulesAndFAQProps {
  config: ChannelConfig;
  onGoToDashboard: () => void;
}

export const RulesAndFAQ: React.FC<RulesAndFAQProps> = ({ config, onGoToDashboard }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex items-center gap-4">
        <div className="p-3 bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl">
          <HelpCircle className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Challenge Rules & FAQ</h2>
          <p className="text-xs text-slate-300">
            Official rules for competing in the {config.prizeAmount.toLocaleString()} {config.prizeCurrency} YouTube Subscriber Challenge.
          </p>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          <span>Official Contest Rules</span>
        </h3>

        <div className="space-y-4">
          {config.rules.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="w-6 h-6 rounded-xl bg-red-600/20 text-red-400 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-red-500/30">
                {idx + 1}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verification & Anti-Fraud Policy */}
      <div className="bg-[#0F1218] border border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-400" />
          <span>Screenshot Verification & Anti-Fraud System</span>
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">
          To ensure fairness for all competitors, every uploaded screenshot is checked through our AI Assistant scan and reviewed manually by the channel admin team.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-500/20 space-y-2">
            <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Valid Submissions Include:</span>
            </span>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>Clear YouTube screenshot on mobile or desktop</li>
              <li>Visible "Subscribed" button active</li>
              <li>Target channel name visible in screenshot</li>
              <li>Real YouTube account handle</li>
            </ul>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-red-500/20 space-y-2">
            <span className="font-bold text-red-400 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Disqualification Triggers:</span>
            </span>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>Photoshopped or edited screenshots</li>
              <li>Unsubscribing after taking screenshot</li>
              <li>Submitting the same screenshot multiple times</li>
              <li>Fake YouTube accounts created in bulk</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Prize Payout Methods */}
      <div className="bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Prize Payout & Winner Announcement</span>
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">
          The competitor ranked #1 at the end of the challenge countdown will be contacted directly via Telebirr, Telegram, or phone to receive the <strong className="text-amber-400">100,000 Ethiopian Birr</strong> cash prize.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-amber-300 font-bold">
            💳 Telebirr Transfer
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-amber-300 font-bold">
            🏦 CBE Birr (Commercial Bank of Ethiopia)
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-amber-300 font-bold">
            🤝 In-Person Cash / Video Award
          </span>
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={onGoToDashboard}
            className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-red-900/40 hover:scale-[1.02] transition-transform"
          >
            Get Your Referral Link & Start Competing Now!
          </button>
        </div>
      </div>
    </div>
  );
};
