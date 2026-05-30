'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, MessageSquare, Star, Globe, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { StarRating } from '@/components/shared/StarRating';
import { PackageCard } from '@/components/expert/PackageCard';
import { BookingModal } from '@/components/booking/BookingModal';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { formatBDT } from '@/lib/utils/currency';
import type { DEMO_EXPERTS } from '@/lib/constants/demoExperts';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

interface ExpertProfileClientProps {
  expertId: string;
  demoData?: (typeof DEMO_EXPERTS)[number] | null;
}

export function ExpertProfileClient({ expertId, demoData }: ExpertProfileClientProps) {
  const [expert, setExpert] = useState<any>(demoData ?? null);
  const [profile, setProfile] = useState<any>(demoData ? { full_name: demoData.full_name, avatar_url: demoData.avatar_url, username: demoData.username } : null);
  const [packages, setPackages] = useState<any[]>(demoData?.packages ?? []);
  const [skills, setSkills] = useState<string[]>(demoData?.skills ?? []);
  const [reviews, setReviews] = useState<any[]>(
    (demoData?.reviews ?? []).map((r) => ({ ...r, profiles: { full_name: r.reviewer_name, avatar_url: null } }))
  );
  const [loading, setLoading] = useState(!demoData);
  const [bookingPackage, setBookingPackage] = useState<any>(null);
  const supabase = createClient();
  const { t, lang } = useLanguage();

  useEffect(() => {
    if (demoData) return; // skip Supabase when demo data provided
    fetchExpertData();
  }, [expertId]);

  async function fetchExpertData() {
    try {
      const [expertRes, packagesRes, skillsRes, reviewsRes] = await Promise.all([
        supabase.from('experts').select('*, profiles(*)').eq('id', expertId).single(),
        supabase.from('packages').select('*').eq('expert_id', expertId).eq('is_active', true).order('duration_minutes'),
        supabase.from('expert_skills').select('skill').eq('expert_id', expertId),
        supabase.from('reviews').select('*, profiles(full_name, avatar_url)').eq('expert_id', expertId).eq('is_hidden', false).order('created_at', { ascending: false }).limit(10),
      ]);

      if (expertRes.data) {
        setExpert(expertRes.data);
        setProfile((expertRes.data as any).profiles);
      }
      setPackages(packagesRes.data || []);
      setSkills((skillsRes.data || []).map((s: any) => s.skill));
      setReviews(reviewsRes.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!expert || !profile) return null;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    percent: reviews.length > 0 ? (reviews.filter((r: any) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary-600 to-indigo-600" />
              <div className="px-6 pb-6">
                <div className="flex items-end gap-4 -mt-10 mb-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-4 border-white shadow">
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                      <AvatarFallback className="text-2xl">{profile.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {expert.is_online && (
                      <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>
                  <div className="mb-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
                      {expert.verification_status === 'approved' && <VerifiedBadge size="lg" />}
                    </div>
                    <p className="text-gray-500">{expert.category}</p>
                  </div>
                  {expert.is_online ? (
                    <Badge variant="online" className="ml-auto">{t('experts.onlineWithDot')}</Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-auto text-gray-400">{t('experts.offline')}</Badge>
                  )}
                </div>

                {expert.tagline && (
                  <p className="text-gray-700 font-medium">{expert.tagline}</p>
                )}

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center rounded-lg bg-gray-50 p-3">
                    <p className="text-lg font-bold text-gray-900">{expert.avg_rating?.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">{t('experts.avgRating')}</p>
                  </div>
                  <div className="text-center rounded-lg bg-gray-50 p-3">
                    <p className="text-lg font-bold text-gray-900">{expert.total_reviews}</p>
                    <p className="text-xs text-gray-500">{t('experts.reviewsLabel')}</p>
                  </div>
                  <div className="text-center rounded-lg bg-gray-50 p-3">
                    <p className="text-lg font-bold text-gray-900">{expert.total_sessions}</p>
                    <p className="text-xs text-gray-500">{t('experts.sessionsLabel')}</p>
                  </div>
                  <div className="text-center rounded-lg bg-gray-50 p-3">
                    <p className="text-lg font-bold text-gray-900">{expert.response_rate}%</p>
                    <p className="text-xs text-gray-500">{t('experts.responseRate')}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>{expert.languages?.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{t('experts.memberSince')} {new Date(expert.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="about">
              <TabsList>
                <TabsTrigger value="about">{t('experts.tabAbout')}</TabsTrigger>
                <TabsTrigger value="reviews">{t('experts.tabReviews')} ({reviews.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4 mt-4">
                {expert.bio && (
                  <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3">{t('experts.bioHeading')}</h3>
                    <p className="text-gray-700 leading-relaxed">{expert.bio}</p>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3">{t('experts.skillsHeading')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-4">
                {reviews.length > 0 && (
                  <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-start gap-6 mb-6">
                      <div className="text-center">
                        <p className="text-5xl font-bold text-gray-900">{expert.avg_rating?.toFixed(1)}</p>
                        <StarRating rating={expert.avg_rating || 0} size="md" className="justify-center mt-1" />
                        <p className="text-xs text-gray-500 mt-1">{expert.total_reviews} {t('experts.reviewsLabel')}</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {ratingBreakdown.map(({ star, count, percent }) => (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-4 text-gray-500">{star}★</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="w-4 text-gray-500">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-t border-gray-100 pt-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={review.profiles?.avatar_url} />
                              <AvatarFallback className="text-sm">{review.profiles?.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm text-gray-900">{review.profiles?.full_name}</p>
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{new Date(review.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
                              {review.comment && <p className="text-sm text-gray-700 mt-1">{review.comment}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Packages (sticky) */}
          <div className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <h2 className="font-bold text-gray-900 text-lg">{t('experts.packagesHeading')}</h2>
              {packages.length === 0 ? (
                <div className="rounded-xl bg-white border border-gray-100 p-6 text-center shadow-sm">
                  <p className="text-gray-500 text-sm">{t('experts.noPackages')}</p>
                </div>
              ) : (
                packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onBook={() => setBookingPackage(pkg)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingPackage && (
        <BookingModal
          expertId={expertId}
          expertName={profile.full_name}
          selectedPackage={bookingPackage}
          onClose={() => setBookingPackage(null)}
        />
      )}
    </div>
  );
}
