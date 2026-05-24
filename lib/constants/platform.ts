export const PLATFORM = {
  name: 'Poramorshoo',
  nameBn: 'পরামর্শ ডট কম',
  tagline: 'বিশ্বস্ত বিশেষজ্ঞের সাথে পরামর্শ করুন',
  taglineEn: 'Book trusted experts instantly',
  commissionRate: 0.18,
  currency: 'BDT',
  currencySymbol: '৳',
  minPackagePrice: 300,
  maxPackagePrice: 10000,
  sessionHoldDays: 3,
  maxSkillsPerExpert: 10,
  preConsultationMessageLimit: 5,
};

export const PACKAGE_DURATIONS = [
  { minutes: 20, label: 'Basic', description: 'Quick consultation' },
  { minutes: 30, label: 'Standard', description: 'Detailed guidance' },
  { minutes: 40, label: 'Premium', description: 'In-depth session' },
];

export const CATEGORIES = [
  {
    slug: 'freelancing',
    label: 'Freelancing Mentorship',
    labelBn: 'ফ্রিল্যান্সিং মেন্টরশিপ',
    icon: '💼',
    subcategories: ['Fiverr', 'Upwork', 'Profile Review', 'Client Communication'],
  },
  {
    slug: 'bcs-govt-jobs',
    label: 'BCS & Govt Job Guidance',
    labelBn: 'বিসিএস ও সরকারি চাকরি',
    icon: '🏛️',
    subcategories: ['BCS Preparation', 'Viva Guidance', 'Strategy Session'],
  },
  {
    slug: 'study-abroad',
    label: 'Study Abroad & IELTS',
    labelBn: 'বিদেশে পড়াশোনা ও আইইএলটিএস',
    icon: '✈️',
    subcategories: ['IELTS Speaking', 'Application Guidance', 'Scholarship'],
  },
  {
    slug: 'software-career',
    label: 'Software Career',
    labelBn: 'সফটওয়্যার ক্যারিয়ার',
    icon: '💻',
    subcategories: ['Programming Roadmap', 'Interview Prep', 'Portfolio Review'],
  },
  {
    slug: 'business',
    label: 'Business & Startup',
    labelBn: 'ব্যবসা ও স্টার্টআপ',
    icon: '🚀',
    subcategories: ['Business Plan', 'Startup Guidance', 'Marketing Strategy'],
  },
  {
    slug: 'legal',
    label: 'Legal Consultation',
    labelBn: 'আইনি পরামর্শ',
    icon: '⚖️',
    subcategories: ['Civil Law', 'Business Law', 'Contract Review'],
  },
];

export const SESSION_TYPES = ['chat', 'voice', 'video'] as const;

export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'paid',
  'in_progress',
  'completed',
  'cancelled',
  'disputed',
] as const;
