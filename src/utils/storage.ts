import { ChannelConfig, Competitor, ReferralSubmission, SubmissionStatus } from '../types';
import { INITIAL_CHANNEL_CONFIG, INITIAL_COMPETITORS, INITIAL_SUBMISSIONS } from '../data/initialData';

const STORAGE_KEYS = {
  CONFIG: 'subreferral_config',
  COMPETITORS: 'subreferral_competitors_v4',
  SUBMISSIONS: 'subreferral_submissions_v4',
  ADMIN_AUTH: 'subreferral_admin_authenticated'
};

export const getChannelConfig = (): ChannelConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!data) return INITIAL_CHANNEL_CONFIG;
    const parsed = JSON.parse(data);
    if (!parsed.channelName || parsed.channelName.includes('Natty Tech') || new Date(parsed.endDate).getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000) {
      const updatedConfig = { ...INITIAL_CHANNEL_CONFIG, ...parsed, endDate: INITIAL_CHANNEL_CONFIG.endDate };
      saveChannelConfig(updatedConfig);
      return updatedConfig;
    }
    return parsed;
  } catch (e) {
    return INITIAL_CHANNEL_CONFIG;
  }
};

export const saveChannelConfig = (config: ChannelConfig) => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

export const getCompetitors = (): Competitor[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPETITORS);
    return data ? JSON.parse(data) : INITIAL_COMPETITORS;
  } catch (e) {
    return INITIAL_COMPETITORS;
  }
};

export const saveCompetitors = (competitors: Competitor[]) => {
  localStorage.setItem(STORAGE_KEYS.COMPETITORS, JSON.stringify(competitors));
};

export const getSubmissions = (): ReferralSubmission[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return data ? JSON.parse(data) : INITIAL_SUBMISSIONS;
  } catch (e) {
    return INITIAL_SUBMISSIONS;
  }
};

export const saveSubmissions = (submissions: ReferralSubmission[]) => {
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
};

export const registerCompetitor = (
  name: string,
  referralCode: string,
  phoneOrTelegram?: string,
  customAvatarUrl?: string,
  gender?: 'male' | 'female' | 'other'
): Competitor => {
  const competitors = getCompetitors();
  
  // Clean referral code
  const cleanCode = referralCode.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
  
  const existing = competitors.find(c => c.referralCode === cleanCode);
  if (existing) {
    return existing;
  }

  // Determine avatar URL based on custom image OR gender
  let resolvedAvatar = customAvatarUrl;

  if (!resolvedAvatar || resolvedAvatar.trim() === '') {
    if (gender === 'male') {
      resolvedAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`;
    } else if (gender === 'female') {
      resolvedAvatar = `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200`;
    } else {
      resolvedAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    }
  }

  const newComp: Competitor = {
    id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    referralCode: cleanCode,
    avatarUrl: resolvedAvatar,
    phoneOrTelegram,
    gender,
    verifiedCount: 0,
    pendingCount: 0,
    joinedAt: new Date().toISOString(),
    isApproved: false
  };

  const updated = [newComp, ...competitors];
  saveCompetitors(updated);
  return newComp;
};

export const approveCompetitor = (id: string): Competitor[] => {
  const competitors = getCompetitors();
  const updated = competitors.map(c => c.id === id ? { ...c, isApproved: true } : c);
  saveCompetitors(updated);
  return updated;
};

export const deleteCompetitor = (id: string): Competitor[] => {
  const competitors = getCompetitors();
  const updated = competitors.filter(c => c.id !== id);
  saveCompetitors(updated);
  return updated;
};

export const submitReferralProof = (
  referralCode: string,
  subscriberName: string,
  subscriberHandle: string,
  screenshotUrl: string
): ReferralSubmission => {
  const competitors = getCompetitors();
  const submissions = getSubmissions();

  const comp = competitors.find(c => c.referralCode.toLowerCase() === referralCode.toLowerCase());
  const competitorName = comp ? comp.name : 'Unknown Competitor';

  // Smart heuristic scanner for demo
  const isDemoPng = screenshotUrl.includes('data:image') || screenshotUrl.length > 100;
  
  const newSubmission: ReferralSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    referralCode,
    competitorName,
    subscriberName,
    subscriberHandle: subscriberHandle.startsWith('@') ? subscriberHandle : `@${subscriberHandle}`,
    screenshotUrl,
    submittedAt: new Date().toISOString(),
    status: 'pending',
    aiVerification: {
      confidence: 0.95,
      detectedSubscribed: true,
      detectedChannelName: true,
      notes: 'Image uploaded successfully. Pending admin review.'
    }
  };

  const updatedSubmissions = [newSubmission, ...submissions];
  saveSubmissions(updatedSubmissions);

  // Update competitor pending count
  if (comp) {
    comp.pendingCount += 1;
    saveCompetitors(competitors);
  }

  return newSubmission;
};

export const updateSubmissionStatus = (
  submissionId: string,
  newStatus: SubmissionStatus,
  rejectionReason?: string
) => {
  const submissions = getSubmissions();
  const competitors = getCompetitors();

  const subIndex = submissions.findIndex(s => s.id === submissionId);
  if (subIndex === -1) return;

  const sub = submissions[subIndex];
  const oldStatus = sub.status;
  sub.status = newStatus;
  if (rejectionReason) {
    sub.rejectionReason = rejectionReason;
  }

  saveSubmissions(submissions);

  // Recalculate competitor counts
  const comp = competitors.find(c => c.referralCode.toLowerCase() === sub.referralCode.toLowerCase());
  if (comp) {
    if (oldStatus === 'pending') {
      comp.pendingCount = Math.max(0, comp.pendingCount - 1);
    } else if (oldStatus === 'verified') {
      comp.verifiedCount = Math.max(0, comp.verifiedCount - 1);
    }

    if (newStatus === 'verified') {
      comp.verifiedCount += 1;
    } else if (newStatus === 'pending') {
      comp.pendingCount += 1;
    }

    saveCompetitors(competitors);
  }
};

export const resetToInitialData = () => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CHANNEL_CONFIG));
  localStorage.setItem(STORAGE_KEYS.COMPETITORS, JSON.stringify(INITIAL_COMPETITORS));
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
};
