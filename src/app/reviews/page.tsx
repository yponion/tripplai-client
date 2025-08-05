"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getReviews } from "@/services/reviewService";
import { ReviewListResponse, Review } from "@/types/review";
import Link from "next/link";
import CreateReviewButton from "@/components/reviews/CreateReviewButton";
import { ReviewsWrapper, ReviewsError } from "@/components/reviews/ReviewsClientWrapper";
import { FaSearch, FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaFilter, FaTimes } from "react-icons/fa";
import { MdFilterList, MdClose } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

// 지역 아이콘 컴포넌트
const LocationIcon = ({ location }: { location: string }) => {
  const icons: { [key: string]: string } = {
    서울: "🏙️",
    인천: "✈️",
    대전: "🏛️",
    부산: "🌊",
    울산: "⚓",
    대구: "🍎",
    전체: "🗺️",
  };
  return <span className="text-2xl">{icons[location] || "📍"}</span>;
};

// 지역 목록
const LOCATIONS = ["전체", "서울", "인천", "대전", "부산", "울산", "대구"];

// 리뷰 목록을 가져오는 클라이언트 컴포넌트
function ReviewsList({
  page,
  size,
  searchQuery,
  sortBy,
  locationFilter,
  ratingFilter,
}: {
  page: number;
  size: number;
  searchQuery: string;
  sortBy: string;
  locationFilter: string;
  ratingFilter: number | null;
}) {
  const [reviewsData, setReviewsData] = useState<ReviewListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getReviews({ page, size });
        setReviewsData(data);
        setError(false);
      } catch (err) {
        console.error("리뷰 목록 가져오기 실패:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [page, size]);

  // 필터링 및 정렬 로직
  const filteredAndSortedReviews = useMemo(() => {
    if (!reviewsData?.content) return null;

    let filtered = [...reviewsData.content];

    // 검색어 필터링
    if (searchQuery) {
      filtered = filtered.filter(
        (review) =>
          review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 위치 필터링 - 일단 제목이나 내용에서 지역명 검색
    if (locationFilter && locationFilter !== "전체") {
      filtered = filtered.filter(
        (review) => review.title.includes(locationFilter) || review.content.includes(locationFilter)
      );
    }

    // 별점 필터링
    if (ratingFilter !== null) {
      filtered = filtered.filter((review) => review.rating >= ratingFilter);
    }

    // 정렬
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "latest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return {
      ...reviewsData,
      content: filtered,
      totalElements: filtered.length,
    };
  }, [reviewsData, searchQuery, sortBy, locationFilter, ratingFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-100"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent absolute top-0 left-0"></div>
        </motion.div>
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="ml-4 text-gray-600 font-medium"
        >
          멋진 리뷰들을 불러오는 중...
        </motion.span>
      </div>
    );
  }

  if (error || !filteredAndSortedReviews) {
    return <ReviewsError />;
  }

  // 검색 결과가 없을 때
  if (filteredAndSortedReviews.content.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaSearch className="text-4xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-600 mb-6">다른 검색어나 필터를 시도해보세요.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors border-none"
          >
            필터 초기화
          </button>
        </div>
      </motion.div>
    );
  }

  return <ReviewsWrapper reviewsData={filteredAndSortedReviews} page={page} size={size} />;
}

interface ReviewsPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ReviewsPage() {
  // URL 파라미터를 클라이언트에서 처리
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [locationFilter, setLocationFilter] = useState("전체");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 애니메이션을 위한 state
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get("page");
      const sizeParam = urlParams.get("size");

      setPage(parseInt(pageParam || "0"));
      setSize(parseInt(sizeParam || "10"));
    }
  }, []);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSortBy("latest");
    setLocationFilter("전체");
    setRatingFilter(null);
  }, []);

  // 활성 필터 개수
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (sortBy !== "latest") count++;
    if (locationFilter !== "전체") count++;
    if (ratingFilter !== null) count++;
    return count;
  }, [searchQuery, sortBy, locationFilter, ratingFilter]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 왼쪽 지역 필터 사이드바 */}
      <aside className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-white rounded-r-3xl shadow-2xl p-4">
        <div className="flex flex-col space-y-2">
          {LOCATIONS.map((location) => (
            <motion.button
              key={location}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLocationFilter(location)}
              className={`
                group relative flex items-center justify-between px-3 py-3 rounded-2xl
                transition-all duration-300 focus:outline-none focus:ring-0 border-none
                ${
                  locationFilter === location
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg"
                    : "bg-gray-50 hover:bg-gray-100"
                }
              `}
            >
              <div
                className={`
                transition-all duration-300 mr-3
                ${locationFilter === location ? "scale-110" : "group-hover:scale-110"}
              `}
              >
                <LocationIcon location={location} />
              </div>

              <span
                className={`
                text-sm font-medium transition-all duration-300
                ${locationFilter === location ? "text-white" : "text-gray-700 group-hover:text-gray-900"}
              `}
              >
                {location}
              </span>
            </motion.button>
          ))}
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <div className="flex-1">
        {/* 고정 헤더 */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent"
                >
                  TripReviews
                </motion.div>
              </Link>

              {/* 데스크톱 검색바 */}
              <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                <motion.div
                  className={`relative w-full transition-all duration-300 ${isSearchFocused ? "scale-105" : ""}`}
                >
                  <FaSearch
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                      isSearchFocused ? "text-pink-500" : "text-gray-400"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="여행지, 제목으로 리뷰 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-12 pr-4 py-3 rounded-full focus:ring-0 focus:outline-none bg-gray-50 hover:bg-gray-100 transition-all duration-300 text-gray-900 placeholder-gray-500 border-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none border-none"
                    >
                      <FaTimes />
                    </button>
                  )}
                </motion.div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="relative p-3 text-gray-600 hover:text-pink-600 transition-colors focus:outline-none focus:ring-0 border-none rounded-xl hover:bg-pink-50"
                >
                  <FaFilter className="text-xl" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </motion.button>
                <CreateReviewButton />
              </div>
            </div>

            {/* 모바일 검색바 */}
            <div className="lg:hidden py-3">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full focus:ring-0 focus:outline-none bg-gray-50 hover:bg-gray-100 transition-all duration-300 border-none"
                />
              </div>
            </div>
          </div>
        </header>

        {/* 필터 패널 */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 bg-black z-40"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">필터</h2>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-0 border-none"
                    >
                      <MdClose className="text-2xl" />
                    </button>
                  </div>

                  {/* 정렬 옵션 */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">정렬</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "latest", label: "최신순" },
                        { value: "oldest", label: "오래된순" },
                        { value: "rating", label: "별점순" },
                      ].map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSortBy(option.value)}
                          className={`px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 border-none ${
                            sortBy === option.value ? "bg-pink-50 text-pink-600" : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* 별점 필터 */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">최소 별점</h3>
                    <div className="space-y-3">
                      {[5, 4, 3, null].map((rating) => (
                        <motion.button
                          key={rating || "all"}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setRatingFilter(rating)}
                          className={`w-full px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between focus:outline-none focus:ring-0 border-none ${
                            ratingFilter === rating ? "bg-pink-50 text-pink-600" : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <span>{rating ? `${rating}점 이상` : "모든 별점"}</span>
                          <div className="flex items-center">
                            {rating &&
                              Array.from({ length: rating }).map((_, i) => (
                                <FaStar key={i} className="text-yellow-500 text-sm" />
                              ))}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* 필터 초기화 버튼 */}
                  <div className="flex space-x-3">
                    <button
                      onClick={resetFilters}
                      className="flex-1 px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium focus:outline-none focus:ring-0 border-none"
                    >
                      초기화
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors font-medium focus:outline-none focus:ring-0 border-none"
                    >
                      적용하기
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 활성 필터 표시 */}
        {activeFilterCount > 0 && (
          <div className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">활성 필터:</span>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-700 border-none"
                    >
                      검색: {searchQuery}
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-2 text-pink-500 hover:text-pink-700 focus:outline-none border-none bg-transparent"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </motion.span>
                  )}
                  {sortBy !== "latest" && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-700 border-none"
                    >
                      정렬: {sortBy === "rating" ? "별점순" : "오래된순"}
                      <button
                        onClick={() => setSortBy("latest")}
                        className="ml-2 text-pink-500 hover:text-pink-700 focus:outline-none border-none bg-transparent"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </motion.span>
                  )}
                  {locationFilter !== "전체" && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-700 border-none"
                    >
                      위치: {locationFilter}
                      <button
                        onClick={() => setLocationFilter("전체")}
                        className="ml-2 text-pink-500 hover:text-pink-700 focus:outline-none border-none bg-transparent"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </motion.span>
                  )}
                  {ratingFilter !== null && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-700 border-none"
                    >
                      별점: {ratingFilter}점 이상
                      <button
                        onClick={() => setRatingFilter(null)}
                        className="ml-2 text-pink-500 hover:text-pink-700 focus:outline-none border-none bg-transparent"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </motion.span>
                  )}
                </div>
                <button
                  onClick={resetFilters}
                  className="ml-auto text-sm text-pink-600 hover:text-pink-700 font-medium focus:outline-none border-none bg-transparent"
                >
                  모두 지우기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* 페이지 타이틀 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {locationFilter === "전체" ? "여행 리뷰" : `${locationFilter} 여행 리뷰`}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">실제 여행자들의 생생한 경험을 만나보세요</p>
          </motion.div>

          {/* 리뷰 목록 */}
          <ReviewsList
            page={page}
            size={size}
            searchQuery={searchQuery}
            sortBy={sortBy}
            locationFilter={locationFilter}
            ratingFilter={ratingFilter}
          />
        </main>
      </div>
    </div>
  );
}
