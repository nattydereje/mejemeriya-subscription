import { ChannelConfig, Competitor, ReferralSubmission } from '../types';

export const INITIAL_CHANNEL_CONFIG: ChannelConfig = {
  channelName: 'Mejemeriya TV',
  channelHandle: '@mejemeriyatv',
  channelUrl: 'https://www.youtube.com/@mejemeriyatv',
  prizeAmount: 100000,
  prizeCurrency: 'ETB (Birr)',
  endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months (180 days) from now
  registrationClosed: false,
  rules: [
    'Each subscriber must click the referral link and subscribe to the YouTube channel.',
    'Subscribers must take a clear screenshot showing the "Subscribed" button active on YouTube.',
    'Upload the screenshot proof with your YouTube username or handle.',
    'Admin reviews every screenshot to verify genuine subscriptions.',
    'Fake or duplicate screenshot submissions will lead to competitor disqualification.',
    'The competitor with the highest number of VERIFIED subscribers wins 100,000 Birr!',
    'Prize payout will be conducted via Telebirr or Commercial Bank of Ethiopia (CBE).'
  ]
};

// Generate clean SVG placeholder screenshots for demo
const createMockScreenshot = (channelName: string, subName: string, isSubscribed: boolean = true) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
    <rect width="600" height="400" fill="#0F0F0F"/>
    <!-- Top Bar -->
    <rect width="600" height="50" fill="#212121"/>
    <circle cx="40" cy="25" r="12" fill="#FF0000"/>
    <text x="60" y="30" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="16">YouTube</text>
    <rect x="180" y="12" width="240" height="26" rx="13" fill="#121212" stroke="#303030"/>
    <text x="200" y="29" fill="#AAAAAA" font-family="sans-serif" font-size="12">Search ${channelName}</text>
    
    <!-- Video Player Simulation -->
    <rect x="40" y="70" width="520" height="200" rx="8" fill="#1C1C1C"/>
    <polygon points="280,150 330,170 280,190" fill="#FFFFFF" opacity="0.8"/>
    <text x="50" y="250" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="16">How to win 100,000 Birr Referral Challenge! 🔥</text>
    <text x="50" y="265" fill="#AAAAAA" font-family="sans-serif" font-size="12">12.5K views • 2 hours ago</text>
    
    <!-- Channel Bar -->
    <rect x="40" y="290" width="520" height="80" rx="8" fill="#272727"/>
    <circle cx="80" cy="330" r="22" fill="#3EA6FF"/>
    <text x="80" y="335" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">N</text>
    
    <text x="115" y="325" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="15">${channelName}</text>
    <text x="115" y="342" fill="#AAAAAA" font-family="sans-serif" font-size="12">45.2K subscribers</text>

    <!-- Subscribed Button -->
    ${isSubscribed ? `
      <rect x="420" y="310" width="120" height="38" rx="19" fill="#272727" stroke="#3EA6FF" stroke-width="1.5"/>
      <path d="M442 329 L449 335 L462 322" stroke="#3EA6FF" stroke-width="2" stroke-linecap="round"/>
      <text x="470" y="334" fill="#3EA6FF" font-family="sans-serif" font-weight="bold" font-size="13">Subscribed</text>
    ` : `
      <rect x="430" y="310" width="110" height="38" rx="19" fill="#CC0000"/>
      <text x="450" y="334" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="13">Subscribe</text>
    `}

    <text x="40" y="388" fill="#606060" font-family="sans-serif" font-size="10">User Proof: ${subName} • ${new Date().toLocaleDateString()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_COMPETITORS: Competitor[] = [];

export const INITIAL_SUBMISSIONS: ReferralSubmission[] = [];
