-- =============================================================
-- Poramorshoo — Demo Seed Data (10 Expert Profiles + 3 demo login accounts)
-- Run this AFTER 001_schema.sql in Supabase SQL Editor
-- Safe to re-run: uses ON CONFLICT DO NOTHING
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- DEMO LOGIN ACCOUNTS (password: demo1234)
-- These match the "ডেমো অ্যাকাউন্ট" buttons on the login page
-- ─────────────────────────────────────────────────────────────
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, is_super_admin
)
VALUES
  ('00000000-demo-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'user@demo.poramorshoo.com',
   crypt('demo1234', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo User"}',
   NOW(), NOW(), false),
  ('00000000-demo-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'expert@demo.poramorshoo.com',
   crypt('demo1234', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Expert"}',
   NOW(), NOW(), false),
  ('00000000-demo-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'admin@demo.poramorshoo.com',
   crypt('demo1234', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Admin"}',
   NOW(), NOW(), false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, full_name, username, email, role, is_banned)
VALUES
  ('00000000-demo-0000-0000-000000000001', 'Demo User',   'demo_user',   'user@demo.poramorshoo.com',   'user',   false),
  ('00000000-demo-0000-0000-000000000002', 'Demo Expert', 'demo_expert', 'expert@demo.poramorshoo.com', 'expert', false),
  ('00000000-demo-0000-0000-000000000003', 'Demo Admin',  'demo_admin',  'admin@demo.poramorshoo.com',  'admin',  false)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- AUTH USERS (required because profiles.id FK → auth.users.id)
-- These are demo-only accounts with no real password/login
-- ─────────────────────────────────────────────────────────────
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, is_super_admin
)
VALUES
  ('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rafiqul@demo.poramorshoo.com', '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rafiqul Islam"}', NOW(), NOW(), false),
  ('11111111-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nusrat@demo.poramorshoo.com',   '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nusrat Jahan"}',   NOW(), NOW(), false),
  ('11111111-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tanvir@demo.poramorshoo.com',   '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tanvir Ahmed"}',   NOW(), NOW(), false),
  ('11111111-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sumaiya@demo.poramorshoo.com',  '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sumaiya Khatun"}', NOW(), NOW(), false),
  ('11111111-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'arif@demo.poramorshoo.com',     '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Arif Hossain"}',   NOW(), NOW(), false),
  ('11111111-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fatema@demo.poramorshoo.com',   '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fatema Begum"}',   NOW(), NOW(), false),
  ('11111111-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sabbir@demo.poramorshoo.com',   '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sabbir Rahman"}',  NOW(), NOW(), false),
  ('11111111-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mehrin@demo.poramorshoo.com',   '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mehrin Akter"}',   NOW(), NOW(), false),
  ('11111111-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'imran@demo.poramorshoo.com',    '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Imran Khan"}',     NOW(), NOW(), false),
  ('11111111-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'roksana@demo.poramorshoo.com',  '', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Roksana Parvin"}', NOW(), NOW(), false)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- PROFILES (role = expert)
-- ─────────────────────────────────────────────────────────────
INSERT INTO profiles (id, full_name, username, email, phone, avatar_url, role, is_banned)
VALUES
  -- 1: Rafiqul Islam — Freelancing
  ('11111111-0000-0000-0000-000000000001',
   'Rafiqul Islam', 'rafiqul_islam',
   'rafiqul@demo.poramorshoo.com', '01711234567',
   'https://ui-avatars.com/api/?name=Rafiqul+Islam&background=1a56db&color=fff&size=200&bold=true',
   'expert', false),

  -- 2: Nusrat Jahan — Study Abroad
  ('11111111-0000-0000-0000-000000000002',
   'Nusrat Jahan', 'nusrat_jahan',
   'nusrat@demo.poramorshoo.com', '01812345678',
   'https://ui-avatars.com/api/?name=Nusrat+Jahan&background=0e9f6e&color=fff&size=200&bold=true',
   'expert', false),

  -- 3: Tanvir Ahmed — Software Career
  ('11111111-0000-0000-0000-000000000003',
   'Tanvir Ahmed', 'tanvir_ahmed',
   'tanvir@demo.poramorshoo.com', '01912345678',
   'https://ui-avatars.com/api/?name=Tanvir+Ahmed&background=7e3af2&color=fff&size=200&bold=true',
   'expert', false),

  -- 4: Sumaiya Khatun — BCS
  ('11111111-0000-0000-0000-000000000004',
   'Sumaiya Khatun', 'sumaiya_khatun',
   'sumaiya@demo.poramorshoo.com', '01611234567',
   'https://ui-avatars.com/api/?name=Sumaiya+Khatun&background=e3a008&color=fff&size=200&bold=true',
   'expert', false),

  -- 5: Arif Hossain — Business
  ('11111111-0000-0000-0000-000000000005',
   'Arif Hossain', 'arif_hossain',
   'arif@demo.poramorshoo.com', '01511234567',
   'https://ui-avatars.com/api/?name=Arif+Hossain&background=e74694&color=fff&size=200&bold=true',
   'expert', false),

  -- 6: Fatema Begum — Legal
  ('11111111-0000-0000-0000-000000000006',
   'Fatema Begum', 'fatema_begum',
   'fatema@demo.poramorshoo.com', '01712345678',
   'https://ui-avatars.com/api/?name=Fatema+Begum&background=1c64f2&color=fff&size=200&bold=true',
   'expert', false),

  -- 7: Sabbir Rahman — Freelancing
  ('11111111-0000-0000-0000-000000000007',
   'Sabbir Rahman', 'sabbir_rahman',
   'sabbir@demo.poramorshoo.com', '01811234567',
   'https://ui-avatars.com/api/?name=Sabbir+Rahman&background=057a55&color=fff&size=200&bold=true',
   'expert', false),

  -- 8: Mehrin Akter — Study Abroad
  ('11111111-0000-0000-0000-000000000008',
   'Mehrin Akter', 'mehrin_akter',
   'mehrin@demo.poramorshoo.com', '01911234567',
   'https://ui-avatars.com/api/?name=Mehrin+Akter&background=c81e1e&color=fff&size=200&bold=true',
   'expert', false),

  -- 9: Imran Khan — Software Career
  ('11111111-0000-0000-0000-000000000009',
   'Imran Khan', 'imran_khan',
   'imran@demo.poramorshoo.com', '01612345678',
   'https://ui-avatars.com/api/?name=Imran+Khan&background=6875f5&color=fff&size=200&bold=true',
   'expert', false),

  -- 10: Roksana Parvin — BCS
  ('11111111-0000-0000-0000-000000000010',
   'Roksana Parvin', 'roksana_parvin',
   'roksana@demo.poramorshoo.com', '01512345678',
   'https://ui-avatars.com/api/?name=Roksana+Parvin&background=0694a2&color=fff&size=200&bold=true',
   'expert', false)

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- EXPERTS
-- ─────────────────────────────────────────────────────────────
INSERT INTO experts (id, user_id, tagline, bio, category, subcategory, languages,
  total_sessions, avg_rating, total_reviews, response_rate,
  verification_status, nid_verified, certificate_verified, is_featured, is_online)
VALUES
  -- 1: Rafiqul Islam
  ('22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001',
   'Fiverr Top Rated Seller | ৳৫ লক্ষ+ আয়ের অভিজ্ঞতা',
   'আমি ৭ বছর ধরে Fiverr এ কাজ করছি এবং ১,২০০+ সফল প্রজেক্ট সম্পন্ন করেছি। গ্রাফিক ডিজাইন, লোগো, এবং ব্র্যান্ড আইডেন্টিটিতে বিশেষজ্ঞ। আমার সাথে সেশনে আপনি শিখবেন কীভাবে প্রথম অর্ডার পাবেন, প্রোফাইল অপ্টিমাইজ করবেন এবং আন্তর্জাতিক ক্লায়েন্টের সাথে যোগাযোগ করবেন।',
   'freelancing', 'Fiverr',
   ARRAY['Bengali', 'English'],
   245, 4.92, 198, 98,
   'approved', true, true, true, true),

  -- 2: Nusrat Jahan
  ('22222222-0000-0000-0000-000000000002',
   '11111111-0000-0000-0000-000000000002',
   'IELTS 8.5 | কানাডা পিআর ধারক | Study Abroad গাইড',
   'আমি ২০১৯ সালে IELTS-এ ৮.৫ স্কোর করে কানাডার University of Toronto তে স্কলারশিপ পাই। বর্তমানে কানাডা পিআর ধারক। আমার কাছ থেকে IELTS Speaking ও Writing টিপস, SOP লেখার কৌশল এবং স্কলারশিপ আবেদনের সম্পূর্ণ গাইড পাবেন।',
   'study-abroad', 'IELTS Speaking',
   ARRAY['Bengali', 'English'],
   183, 4.87, 156, 96,
   'approved', true, true, true, false),

  -- 3: Tanvir Ahmed
  ('22222222-0000-0000-0000-000000000003',
   '11111111-0000-0000-0000-000000000003',
   'Senior SWE @ FAANG | LeetCode Top 5% | BUET CSE',
   'BUET CSE থেকে পাশ করে বর্তমানে একটি শীর্ষ মার্কিন টেক কোম্পানিতে Senior Software Engineer হিসেবে কর্মরত। আমি ৩০০+ জনকে সফটওয়্যার ক্যারিয়ারে সাহায্য করেছি — রোডম্যাপ তৈরি থেকে শুরু করে FAANG ইন্টারভিউ প্রস্তুতি পর্যন্ত। LeetCode-এ ২,০০০+ প্রবলেম সমাধান করেছি।',
   'software-career', 'Interview Prep',
   ARRAY['Bengali', 'English'],
   312, 4.95, 267, 99,
   'approved', true, true, true, true),

  -- 4: Sumaiya Khatun
  ('22222222-0000-0000-0000-000000000004',
   '11111111-0000-0000-0000-000000000004',
   '৩৭তম BCS (পররাষ্ট্র ক্যাডার) | প্রিলি থেকে ভাইভা গাইড',
   '৩৭তম BCS-এ পররাষ্ট্র ক্যাডারে উত্তীর্ণ হয়ে বর্তমানে সরকারি চাকরিতে আছি। আমার কাছে BCS প্রিলিমিনারি কৌশল, রিটেন প্রস্তুতি এবং ভাইভা গাইডেন্স পাবেন। বিশেষত বাংলাদেশ বিষয়াবলী এবং আন্তর্জাতিক বিষয়াবলীতে আমি বিশেষজ্ঞ।',
   'bcs-govt-jobs', 'BCS Preparation',
   ARRAY['Bengali'],
   97, 4.78, 82, 94,
   'approved', true, true, false, false),

  -- 5: Arif Hossain
  ('22222222-0000-0000-0000-000000000005',
   '11111111-0000-0000-0000-000000000005',
   'Serial Entrepreneur | ৩টি সফল স্টার্টআপ | VC ফান্ডেড',
   'আমি গত ১০ বছরে ৩টি স্টার্টআপ প্রতিষ্ঠা করেছি, যার মধ্যে ২টি সফলভাবে বিক্রি করেছি। বর্তমান উদ্যোগটি VC থেকে $২ মিলিয়ন ফান্ডিং পেয়েছে। বিজনেস প্ল্যান, মার্কেট রিসার্চ, ফান্ডিং স্ট্র্যাটেজি এবং টিম ম্যানেজমেন্টে গাইডেন্স দিতে পারি।',
   'business', 'Startup Guidance',
   ARRAY['Bengali', 'English'],
   156, 4.83, 129, 97,
   'approved', true, true, true, true),

  -- 6: Fatema Begum
  ('22222222-0000-0000-0000-000000000006',
   '11111111-0000-0000-0000-000000000006',
   'আইনজীবী (বাংলাদেশ সুপ্রিম কোর্ট) | ১৫ বছরের অভিজ্ঞতা',
   'বাংলাদেশ সুপ্রিম কোর্টের এনরোলড আইনজীবী হিসেবে ১৫ বছর ধরে চুক্তি আইন, ব্যবসায়িক আইন এবং পারিবারিক আইনে প্র্যাকটিস করছি। আমার সেশনে আপনি ব্যবসায়িক চুক্তি পর্যালোচনা, বিরোধ নিষ্পত্তি পরামর্শ এবং আইনি ঝুঁকি মূল্যায়ন করতে পারবেন।',
   'legal', 'Business Law',
   ARRAY['Bengali', 'English'],
   64, 4.71, 51, 92,
   'approved', true, true, false, false),

  -- 7: Sabbir Rahman
  ('22222222-0000-0000-0000-000000000007',
   '11111111-0000-0000-0000-000000000007',
   'Upwork Top Rated Plus | ওয়েব ডেভেলপমেন্টে $৫০k+ আয়',
   'Upwork-এ Top Rated Plus ব্যাজ ধারী ওয়েব ডেভেলপার। React, Node.js এবং WordPress-এ বিশেষজ্ঞ। আমার সাথে সেশনে শিখবেন কীভাবে Upwork প্রোফাইল তৈরি করতে হয়, প্রপোজাল লিখতে হয় এবং বিদেশী ক্লায়েন্টের সাথে দীর্ঘমেয়াদী সম্পর্ক তৈরি করতে হয়।',
   'freelancing', 'Upwork',
   ARRAY['Bengali', 'English'],
   78, 4.65, 61, 91,
   'approved', true, false, false, true),

  -- 8: Mehrin Akter
  ('22222222-0000-0000-0000-000000000008',
   '11111111-0000-0000-0000-000000000008',
   'অস্ট্রেলিয়া PR | Monash University গ্র্যাজুয়েট | ভিসা গাইড',
   'অস্ট্রেলিয়ার Monash University থেকে Masters সম্পন্ন করে স্থায়ী বাসিন্দা। Student Visa থেকে PR পর্যন্ত পুরো প্রক্রিয়া নিজে পার করেছি। IELTS Academic, অস্ট্রেলিয়া/কানাডা ভিসা আবেদন এবং বৃত্তির সুযোগ নিয়ে বিস্তারিত পরামর্শ দিতে পারি।',
   'study-abroad', 'Application Guidance',
   ARRAY['Bengali', 'English'],
   142, 4.80, 118, 95,
   'approved', true, true, false, false),

  -- 9: Imran Khan
  ('22222222-0000-0000-0000-000000000009',
   '11111111-0000-0000-0000-000000000009',
   'Full Stack Developer | React & Python বিশেষজ্ঞ | ৫+ বছর',
   'ঢাকার একটি লিডিং টেক কোম্পানিতে Lead Developer হিসেবে কাজ করছি। React, Python/Django, PostgreSQL এবং AWS-এ দক্ষ। জুনিয়র ডেভেলপারদের রোডম্যাপ তৈরি, পোর্টফোলিও রিভিউ এবং লোকাল ও রিমোট জব ইন্টারভিউ প্রস্তুতিতে সাহায্য করি।',
   'software-career', 'Programming Roadmap',
   ARRAY['Bengali', 'English'],
   201, 4.88, 172, 97,
   'approved', true, true, false, true),

  -- 10: Roksana Parvin
  ('22222222-0000-0000-0000-000000000010',
   '11111111-0000-0000-0000-000000000010',
   '৪১তম BCS (প্রশাসন ক্যাডার) | ভাইভা বোর্ড অভিজ্ঞতা সম্পন্ন',
   '৪১তম BCS-এ প্রশাসন ক্যাডারে উত্তীর্ণ। ৪র্থ প্রচেষ্টায় সফল হয়েছি — তাই জানি কোথায় ভুল হয় এবং কীভাবে ঘুরে দাঁড়াতে হয়। BCS ভাইভা বোর্ডের প্রশ্নের ধরন, মানসিক প্রস্তুতি এবং সময় ব্যবস্থাপনায় আমার বিশেষ দক্ষতা আছে।',
   'bcs-govt-jobs', 'Viva Guidance',
   ARRAY['Bengali'],
   289, 4.91, 241, 99,
   'approved', true, true, true, false)

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- EXPERT SKILLS
-- ─────────────────────────────────────────────────────────────
INSERT INTO expert_skills (id, expert_id, skill) VALUES
  -- Rafiqul Islam (freelancing)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'Fiverr Profile Optimization'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'গ্রাফিক ডিজাইন'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'Logo Design'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'Client Communication'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'Proposal Writing'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'Pricing Strategy'),

  -- Nusrat Jahan (study-abroad)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'IELTS Speaking'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'IELTS Writing'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'SOP Writing'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'Canada PR'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'Scholarship Application'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'University Selection'),

  -- Tanvir Ahmed (software-career)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'Data Structures & Algorithms'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'System Design'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'LeetCode Strategy'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'FAANG Interview Prep'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'Career Roadmap'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'Resume Review'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'Mock Interview'),

  -- Sumaiya Khatun (bcs)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000004', 'BCS Preliminary'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000004', 'BCS Written'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000004', 'বাংলাদেশ বিষয়াবলী'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000004', 'আন্তর্জাতিক বিষয়াবলী'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000004', 'Study Planning'),

  -- Arif Hossain (business)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000005', 'Business Plan'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000005', 'Startup Strategy'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000005', 'VC Fundraising'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000005', 'Market Research'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000005', 'Digital Marketing'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000005', 'Team Building'),

  -- Fatema Begum (legal)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000006', 'Contract Review'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000006', 'Business Law'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000006', 'Civil Law'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000006', 'Family Law'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000006', 'Dispute Resolution'),

  -- Sabbir Rahman (freelancing)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000007', 'Upwork Profile'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000007', 'React.js'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000007', 'Node.js'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000007', 'WordPress'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000007', 'Proposal Writing'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000007', 'Client Retention'),

  -- Mehrin Akter (study-abroad)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000008', 'Australia PR'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000008', 'Student Visa'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000008', 'IELTS Academic'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000008', 'Scholarship'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000008', 'University Shortlisting'),

  -- Imran Khan (software-career)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000009', 'React.js'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000009', 'Python / Django'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000009', 'PostgreSQL'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000009', 'AWS'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000009', 'Portfolio Review'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000009', 'Job Interview Prep'),

  -- Roksana Parvin (bcs)
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000010', 'BCS Viva'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000010', 'BCS Preliminary'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000010', 'সাধারণ জ্ঞান'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000010', 'মানসিক প্রস্তুতি'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000010', 'Time Management'),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000010', 'Mock Viva')

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- PACKAGES (2–3 per expert; duration: 20 | 30 | 40 min)
-- ─────────────────────────────────────────────────────────────
INSERT INTO packages (id, expert_id, title, description, duration_minutes, price_bdt, session_type, is_active)
VALUES
  -- Rafiqul Islam
  ('33333333-0000-0000-0000-000000000101', '22222222-0000-0000-0000-000000000001',
   'Fiverr প্রোফাইল রিভিউ', 'আপনার Fiverr প্রোফাইল, গিগ ট্যাগ ও প্রাইসিং বিশ্লেষণ করে উন্নতির পরামর্শ দেব।',
   20, 800, ARRAY['video'], true),
  ('33333333-0000-0000-0000-000000000102', '22222222-0000-0000-0000-000000000001',
   'ফ্রিল্যান্সিং রোডম্যাপ সেশন', 'শূন্য থেকে শুরু করে প্রথম অর্ডার পাওয়া পর্যন্ত সম্পূর্ণ গাইড।',
   40, 1800, ARRAY['video', 'voice'], true),

  -- Nusrat Jahan
  ('33333333-0000-0000-0000-000000000201', '22222222-0000-0000-0000-000000000002',
   'IELTS Speaking মক টেস্ট', 'রিয়েল পরীক্ষার মতো Speaking মক টেস্ট + বিস্তারিত ফিডব্যাক।',
   20, 600, ARRAY['video'], true),
  ('33333333-0000-0000-0000-000000000202', '22222222-0000-0000-0000-000000000002',
   'স্কলারশিপ আবেদন গাইড', 'SOP লেখা, রেফারেন্স লেটার এবং বিশ্ববিদ্যালয় বাছাই নিয়ে বিস্তারিত আলোচনা।',
   40, 1400, ARRAY['video'], true),

  -- Tanvir Ahmed
  ('33333333-0000-0000-0000-000000000301', '22222222-0000-0000-0000-000000000003',
   'LeetCode স্ট্র্যাটেজি সেশন', 'কোন টপিক কোন ক্রমে করবেন, সময় বাঁচানোর কৌশল এবং প্যাটার্ন চেনার উপায়।',
   20, 1000, ARRAY['video'], true),
  ('33333333-0000-0000-0000-000000000302', '22222222-0000-0000-0000-000000000003',
   'FAANG ইন্টারভিউ প্রস্তুতি', 'System Design + Coding + Behavioral — তিনটি রাউন্ডের জন্য সম্পূর্ণ প্রস্তুতি।',
   40, 2500, ARRAY['video', 'voice'], true),
  ('33333333-0000-0000-0000-000000000303', '22222222-0000-0000-0000-000000000003',
   'ক্যারিয়ার রোডম্যাপ রিভিউ', 'আপনার বর্তমান অবস্থান মূল্যায়ন করে ৬ মাসের অ্যাকশন প্ল্যান তৈরি।',
   30, 1500, ARRAY['video'], true),

  -- Sumaiya Khatun
  ('33333333-0000-0000-0000-000000000401', '22222222-0000-0000-0000-000000000004',
   'BCS প্রিলি কৌশল', 'সিলেবাস বিশ্লেষণ, গুরুত্বপূর্ণ টপিক এবং সময় ব্যবস্থাপনা নিয়ে আলোচনা।',
   30, 500, ARRAY['video', 'voice'], true),
  ('33333333-0000-0000-0000-000000000402', '22222222-0000-0000-0000-000000000004',
   'BCS ভাইভা প্র্যাকটিস', 'মক ভাইভা সেশন — ভাইভা বোর্ডের সম্ভাব্য প্রশ্নোত্তর অনুশীলন।',
   40, 1200, ARRAY['video'], true),

  -- Arif Hossain
  ('33333333-0000-0000-0000-000000000501', '22222222-0000-0000-0000-000000000005',
   'বিজনেস আইডিয়া ভ্যালিডেশন', 'আপনার বিজনেস আইডিয়া কতটা বাস্তবসম্মত তা মূল্যায়ন করব এবং উন্নতির পরামর্শ দেব।',
   20, 1200, ARRAY['video'], true),
  ('33333333-0000-0000-0000-000000000502', '22222222-0000-0000-0000-000000000005',
   'স্টার্টআপ স্ট্র্যাটেজি সেশন', 'বিজনেস মডেল, মার্কেটিং প্ল্যান এবং ফান্ডিং রোডম্যাপ নিয়ে গভীর আলোচনা।',
   40, 3000, ARRAY['video', 'voice'], true),

  -- Fatema Begum
  ('33333333-0000-0000-0000-000000000601', '22222222-0000-0000-0000-000000000006',
   'চুক্তি পর্যালোচনা পরামর্শ', 'আপনার ব্যবসায়িক চুক্তির আইনি ঝুঁকি মূল্যায়ন ও পরামর্শ।',
   30, 800, ARRAY['video', 'voice'], true),
  ('33333333-0000-0000-0000-000000000602', '22222222-0000-0000-0000-000000000006',
   'আইনি পরামর্শ সেশন', 'আপনার নির্দিষ্ট আইনি সমস্যা নিয়ে বিস্তারিত আলোচনা ও সমাধানের পথ।',
   40, 2000, ARRAY['video'], true),

  -- Sabbir Rahman
  ('33333333-0000-0000-0000-000000000701', '22222222-0000-0000-0000-000000000007',
   'Upwork প্রোফাইল অপ্টিমাইজেশন', 'প্রোফাইল, পোর্টফোলিও এবং প্রথম প্রপোজাল লেখার গাইড।',
   20, 500, ARRAY['video'], true),
  ('33333333-0000-0000-0000-000000000702', '22222222-0000-0000-0000-000000000007',
   'ওয়েব ডেভেলপমেন্ট ক্যারিয়ার গাইড', 'স্কিল রোডম্যাপ, ফ্রিল্যান্স vs চাকরি এবং প্রথম ক্লায়েন্ট পাওয়ার কৌশল।',
   30, 1000, ARRAY['video', 'voice'], true),

  -- Mehrin Akter
  ('33333333-0000-0000-0000-000000000801', '22222222-0000-0000-0000-000000000008',
   'অস্ট্রেলিয়া স্টুডেন্ট ভিসা গাইড', 'ভিসা আবেদন প্রক্রিয়া, প্রয়োজনীয় কাগজপত্র এবং সাধারণ ভুল এড়ানোর উপায়।',
   30, 700, ARRAY['video'], true),
  ('33333333-0000-0000-0000-000000000802', '22222222-0000-0000-0000-000000000008',
   'স্টাডি অ্যাব্রোড সম্পূর্ণ প্যাকেজ', 'বিশ্ববিদ্যালয় বাছাই থেকে ভিসা পাওয়া পর্যন্ত সম্পূর্ণ গাইড।',
   40, 1600, ARRAY['video'], true),

  -- Imran Khan
  ('33333333-0000-0000-0000-000000000901', '22222222-0000-0000-0000-000000000009',
   'প্রোগ্রামিং রোডম্যাপ', 'আপনার দক্ষতা মূল্যায়ন করে পরবর্তী ৩–৬ মাসের শেখার পরিকল্পনা তৈরি।',
   20, 900, ARRAY['video', 'voice'], true),
  ('33333333-0000-0000-0000-000000000902', '22222222-0000-0000-0000-000000000009',
   'পোর্টফোলিও ও রেজিউমি রিভিউ', 'GitHub প্রোজেক্ট, পোর্টফোলিও সাইট এবং রেজিউমি পর্যালোচনা ও উন্নতির পরামর্শ।',
   30, 1400, ARRAY['video'], true),
  ('33333333-0000-0000-0000-000000000903', '22222222-0000-0000-0000-000000000009',
   'জব ইন্টারভিউ প্র্যাকটিস', 'টেকনিক্যাল ও HR ইন্টারভিউ মক সেশন সহ বিস্তারিত ফিডব্যাক।',
   40, 2200, ARRAY['video'], true),

  -- Roksana Parvin
  ('33333333-0000-0000-0000-000000000a01', '22222222-0000-0000-0000-000000000010',
   'BCS ভাইভা মক সেশন', 'বাস্তব ভাইভা বোর্ডের মতো প্র্যাকটিস — প্রশ্নোত্তর ও ফিডব্যাক।',
   30, 600, ARRAY['video'], true),
  ('33333333-0000-0000-0000-000000000a02', '22222222-0000-0000-0000-000000000010',
   'BCS সম্পূর্ণ কৌশল সেশন', 'প্রিলি থেকে ভাইভা — সম্পূর্ণ প্রস্তুতির রোডম্যাপ এবং মানসিক প্রস্তুতি।',
   40, 1500, ARRAY['video', 'voice'], true)

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- EXPERT WALLETS
-- ─────────────────────────────────────────────────────────────
INSERT INTO expert_wallets (id, expert_id, available_balance, pending_balance, total_earned, total_withdrawn)
VALUES
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 12400, 3280,  98400,  82720),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 8200,  1640,  74400,  64560),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 18600, 4920, 142000, 118480),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000004', 3200,   820,  38800,  34780),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000005', 9840,  2460,  72000,  59700),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000006', 2460,   820,  28000,  24720),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000007', 2868,   656,  30000,  26476),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000008', 6560,  1640,  58000,  49800),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000009', 9840,  2460,  88000,  75700),
  (gen_random_uuid(), '22222222-0000-0000-0000-000000000010', 14760, 3280, 124000, 105960)

ON CONFLICT (expert_id) DO NOTHING;
