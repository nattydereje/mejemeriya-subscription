export type SubmissionStatus = 'pending' | 'verified' | 'rejected';

export interface Competitor {
  id: string;
  name: string;
  referralCode: string;
  avatarUrl: string;
  phoneOrTelegram?: string;
  verifiedCount: number;
  pendingCount: number;
  joinedAt: string;
}

export interface ReferralSubmission {
  id: string;
  referralCode: string;
  competitorName: string;
  subscriberName: string;
  subscriberHandle: string;
  screenshotUrl: string;
  submittedAt: string;
  status: SubmissionStatus;
  rejectionReason?: string;
  aiVerification?: {
    confidence: number;
    detectedSubscribed: boolean;
    detectedChannelName: boolean;
    notes: string;
  };
}

export interface ChannelConfig {
  channelName: string;
  channelHandle: string;
  channelUrl: string;
  prizeAmount: number;
  prizeCurrency: string;
  endDate: string;
  rules: string[];
  registrationClosed?: boolean;
}
