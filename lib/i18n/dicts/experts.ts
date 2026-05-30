import type { AreaDict } from '../types';

const bn = {
  // Listing page (page.tsx)
  'experts.metaTitle': 'বিশেষজ্ঞ খুঁজুন',
  'experts.metaDescription': 'বাংলাদেশের সেরা বিশেষজ্ঞদের সাথে পরামর্শ করুন।',
  'experts.pageTitle': 'বিশেষজ্ঞ খুঁজুন',
  'experts.pageSubtitle': 'আপনার প্রয়োজন অনুযায়ী বিশেষজ্ঞ বেছে নিন',

  // Listing client filters
  'experts.category': 'বিভাগ',
  'experts.allCategories': 'সকল বিভাগ',
  'experts.minRating': 'ন্যূনতম রেটিং',
  'experts.all': 'সকল',
  'experts.ratingAndAbove': '★ ও তার উপরে',
  'experts.onlineExpertsOnly': 'শুধু অনলাইন বিশেষজ্ঞ',
  'experts.searchPlaceholder': 'নাম, বিষয় বা ক্যাটাগরি দিয়ে খুঁজুন...',
  'experts.sortBestRating': 'সেরা রেটিং',
  'experts.sortPriceAsc': 'মূল্য: কম থেকে বেশি',
  'experts.sortPriceDesc': 'মূল্য: বেশি থেকে কম',
  'experts.sortMostSessions': 'সর্বাধিক সেশন',
  'experts.filter': 'ফিল্টার',
  'experts.onlineOnlyBadge': 'শুধু অনলাইন',
  'experts.resultsCountSuffix': 'জন বিশেষজ্ঞ পাওয়া গেছে',
  'experts.emptyTitle': 'কোনো বিশেষজ্ঞ পাওয়া যায়নি',
  'experts.emptyDescription': 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।',
  'experts.clearAllFilters': 'সকল ফিল্টার মুছুন',

  // Expert card
  'experts.online': 'অনলাইন',
  'experts.reviewsLabel': 'রিভিউ',
  'experts.sessionsLabel': 'সেশন',
  'experts.startsFrom': 'শুরু হয়',
  'experts.perTwentyMin': '/২০ মিনিট',
  'experts.viewProfile': 'প্রোফাইল দেখুন',
  'experts.fallbackName': 'বিশেষজ্ঞ',

  // Profile page metadata (server)
  'experts.notFoundTitle': 'বিশেষজ্ঞ পাওয়া যায়নি',
  'experts.expertProfileSuffix': '-এর বিশেষজ্ঞ প্রোফাইল',

  // Profile client
  'experts.onlineWithDot': '● অনলাইন',
  'experts.offline': 'অফলাইন',
  'experts.avgRating': 'গড় রেটিং',
  'experts.responseRate': 'রেসপন্স রেট',
  'experts.memberSince': 'সদস্য',
  'experts.tabAbout': 'সম্পর্কে',
  'experts.tabReviews': 'রিভিউ',
  'experts.bioHeading': 'পরিচয়',
  'experts.skillsHeading': 'দক্ষতা',
  'experts.packagesHeading': 'প্যাকেজসমূহ',
  'experts.noPackages': 'কোনো প্যাকেজ নেই',

  // Package card
  'experts.youEarn': 'আপনি পাবেন:',
  'experts.minutes': 'মিনিট',
  'experts.bookNow': 'এখন বুক করুন',
  'experts.sessionChat': 'চ্যাট',
  'experts.sessionVoice': 'ভয়েস',
  'experts.sessionVideo': 'ভিডিও',
};

const en = {
  // Listing page (page.tsx)
  'experts.metaTitle': 'Find an Expert',
  'experts.metaDescription': 'Consult with the best experts in Bangladesh.',
  'experts.pageTitle': 'Find an Expert',
  'experts.pageSubtitle': 'Choose an expert based on your needs',

  // Listing client filters
  'experts.category': 'Category',
  'experts.allCategories': 'All Categories',
  'experts.minRating': 'Minimum Rating',
  'experts.all': 'All',
  'experts.ratingAndAbove': '★ & above',
  'experts.onlineExpertsOnly': 'Online experts only',
  'experts.searchPlaceholder': 'Search by name, topic or category...',
  'experts.sortBestRating': 'Top Rated',
  'experts.sortPriceAsc': 'Price: Low to High',
  'experts.sortPriceDesc': 'Price: High to Low',
  'experts.sortMostSessions': 'Most Sessions',
  'experts.filter': 'Filter',
  'experts.onlineOnlyBadge': 'Online only',
  'experts.resultsCountSuffix': 'experts found',
  'experts.emptyTitle': 'No experts found',
  'experts.emptyDescription': 'Try changing the filters and search again.',
  'experts.clearAllFilters': 'Clear all filters',

  // Expert card
  'experts.online': 'Online',
  'experts.reviewsLabel': 'reviews',
  'experts.sessionsLabel': 'sessions',
  'experts.startsFrom': 'Starts from',
  'experts.perTwentyMin': '/20 min',
  'experts.viewProfile': 'View Profile',
  'experts.fallbackName': 'Expert',

  // Profile page metadata (server)
  'experts.notFoundTitle': 'Expert not found',
  'experts.expertProfileSuffix': "'s expert profile",

  // Profile client
  'experts.onlineWithDot': '● Online',
  'experts.offline': 'Offline',
  'experts.avgRating': 'Avg. Rating',
  'experts.responseRate': 'Response Rate',
  'experts.memberSince': 'Member since',
  'experts.tabAbout': 'About',
  'experts.tabReviews': 'Reviews',
  'experts.bioHeading': 'About',
  'experts.skillsHeading': 'Skills',
  'experts.packagesHeading': 'Packages',
  'experts.noPackages': 'No packages available',

  // Package card
  'experts.youEarn': 'You earn:',
  'experts.minutes': 'min',
  'experts.bookNow': 'Book Now',
  'experts.sessionChat': 'Chat',
  'experts.sessionVoice': 'Voice',
  'experts.sessionVideo': 'Video',
};

export const experts: AreaDict = { bn, en };
