import React from 'react';
import { X, ZoomIn, Download, CheckCircle2 } from 'lucide-react';

interface ScreenshotModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full bg-[#0F1218] border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-5 h-5 text-red-500" />
            <h3 className="font-black text-white text-base uppercase tracking-wider">Subscriber Screenshot Inspector</h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="youtube_subscription_screenshot.png"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Download Screenshot Image"
            >
              <Download className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Image Box */}
        <div className="flex-1 overflow-auto bg-slate-900 rounded-2xl border border-slate-800 p-2 flex items-center justify-center min-h-[300px]">
          <img
            src={imageUrl}
            alt="Enlarged Subscription Proof"
            className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Inspect YouTube "Subscribed" status and channel name.</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
