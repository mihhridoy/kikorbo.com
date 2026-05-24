'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ExpertCard } from '@/components/expert/ExpertCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExpertCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CATEGORIES } from '@/lib/constants/platform';
import { DEMO_EXPERTS } from '@/lib/constants/demoExperts';
import { Users } from 'lucide-react';

interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  onlineOnly: boolean;
  q: string;
  sort: 'rating' | 'price_asc' | 'price_desc' | 'sessions';
}

export function ExpertListingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    minPrice: 300,
    maxPrice: 5000,
    minRating: 0,
    onlineOnly: false,
    q: searchParams.get('q') || '',
    sort: (searchParams.get('sort') as FilterState['sort']) || 'rating',
  });

  useEffect(() => {
    fetchExperts();
  }, [filters]);

  async function fetchExperts() {
    setLoading(true);
    try {
      let query = supabase
        .from('experts')
        .select(`
          *,
          profiles!inner(full_name, username, avatar_url),
          packages(price_bdt, is_active)
        `)
        .eq('verification_status', 'approved');

      if (filters.category) query = query.eq('category', filters.category);
      if (filters.onlineOnly) query = query.eq('is_online', true);
      if (filters.minRating > 0) query = query.gte('avg_rating', filters.minRating);

      if (filters.sort === 'rating') query = query.order('avg_rating', { ascending: false });
      else if (filters.sort === 'sessions') query = query.order('total_sessions', { ascending: false });

      const { data, error } = await query.limit(12);

      const source = (!error && data && data.length > 0) ? data.map((expert: any) => {
        const activePrices = (expert.packages || [])
          .filter((p: any) => p.is_active)
          .map((p: any) => p.price_bdt);
        const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : 300;
        return {
          id: expert.id,
          username: expert.profiles?.username,
          full_name: expert.profiles?.full_name || 'বিশেষজ্ঞ',
          avatar_url: expert.profiles?.avatar_url,
          tagline: expert.tagline,
          category: expert.category,
          avg_rating: expert.avg_rating || 0,
          total_reviews: expert.total_reviews || 0,
          total_sessions: expert.total_sessions || 0,
          is_online: expert.is_online,
          verification_status: expert.verification_status,
          min_price: minPrice,
        };
      }) : DEMO_EXPERTS;

      const enriched = source.filter((e: any) => {
        if (filters.category && e.category !== filters.category) return false;
        if (filters.onlineOnly && !e.is_online) return false;
        if (filters.minRating > 0 && e.avg_rating < filters.minRating) return false;
        if (filters.minPrice && e.min_price < filters.minPrice) return false;
        if (filters.maxPrice && e.min_price > filters.maxPrice) return false;
        if (filters.q) {
          const q = filters.q.toLowerCase();
          return e.full_name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.tagline || '').toLowerCase().includes(q);
        }
        return true;
      });

      if (filters.sort === 'rating') enriched.sort((a: any, b: any) => b.avg_rating - a.avg_rating);
      if (filters.sort === 'price_asc') enriched.sort((a: any, b: any) => a.min_price - b.min_price);
      if (filters.sort === 'price_desc') enriched.sort((a: any, b: any) => b.min_price - a.min_price);
      if (filters.sort === 'sessions') enriched.sort((a: any, b: any) => b.total_sessions - a.total_sessions);

      setExperts(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex gap-6">
      {/* Filter Sidebar */}
      <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-64 shrink-0`}>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sticky top-24 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">বিভাগ</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!filters.category} onChange={() => updateFilter('category', '')} className="text-primary-600" />
                <span className="text-sm text-gray-700">সকল বিভাগ</span>
              </label>
              {CATEGORIES.map((cat) => (
                <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={filters.category === cat.slug} onChange={() => updateFilter('category', cat.slug)} className="text-primary-600" />
                  <span className="text-sm text-gray-700">{cat.icon} {cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">ন্যূনতম রেটিং</h3>
            <div className="space-y-2">
              {[0, 3, 4].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={filters.minRating === r} onChange={() => updateFilter('minRating', r)} className="text-primary-600" />
                  <span className="text-sm text-gray-700">{r === 0 ? 'সকল' : `${r}★ ও তার উপরে`}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filters.onlineOnly} onChange={(e) => updateFilter('onlineOnly', e.target.checked)} className="text-primary-600 rounded" />
              <span className="text-sm font-medium text-gray-700">শুধু অনলাইন বিশেষজ্ঞ</span>
            </label>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="নাম, বিষয় বা ক্যাটাগরি দিয়ে খুঁজুন..."
              className="pl-9"
              value={filters.q}
              onChange={(e) => updateFilter('q', e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
          >
            <option value="rating">সেরা রেটিং</option>
            <option value="price_asc">মূল্য: কম থেকে বেশি</option>
            <option value="price_desc">মূল্য: বেশি থেকে কম</option>
            <option value="sessions">সর্বাধিক সেশন</option>
          </select>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
            <SlidersHorizontal className="h-4 w-4 mr-2" /> ফিল্টার
          </Button>
        </div>

        {/* Active Filters */}
        {(filters.category || filters.onlineOnly || filters.q) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.category && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('category', '')}>
                {CATEGORIES.find((c) => c.slug === filters.category)?.label} ✕
              </Badge>
            )}
            {filters.onlineOnly && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('onlineOnly', false)}>
                শুধু অনলাইন ✕
              </Badge>
            )}
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">{experts.length} জন বিশেষজ্ঞ পাওয়া গেছে</p>
        )}

        {/* Expert Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ExpertCardSkeleton key={i} />)}
          </div>
        ) : experts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="কোনো বিশেষজ্ঞ পাওয়া যায়নি"
            description="ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
            actionLabel="সকল ফিল্টার মুছুন"
            onAction={() => setFilters({ category: '', minPrice: 300, maxPrice: 5000, minRating: 0, onlineOnly: false, q: '', sort: 'rating' })}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {experts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
