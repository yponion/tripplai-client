"use client";

import { getReviewById, getReviews } from "@/services/reviewService";
import ReviewDetail from "@/components/reviews/ReviewDetail";
import ReviewCard from "@/components/reviews/ReviewCard";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { FaCamera, FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Review, ReviewListResponse } from "@/types/review";

export default function ReviewPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [review, setReview] = useState<Review | null>(null);
  const [otherReviews, setOtherReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReview() {
      try {
        setLoading(true);
        
        if (!id) {
          setError("리뷰 ID가 없습니다.");
          setLoading(false);
          return;
        }
        
        const [reviewData, otherReviewsData] = await Promise.all([
          getReviewById(parseInt(id)),
          getReviews({ page: 0, size: 4 })
        ]);

        if (!reviewData) {
          setError("리뷰를 찾을 수 없습니다.");
          return;
        }

        setReview(reviewData);
        
        // 현재 리뷰를 제외한 다른 리뷰들
        const filteredOtherReviews = otherReviewsData.content.filter(
          (r) => r.receiptReviewId !== reviewData.receiptReviewId
        ).slice(0, 3);
        
        setOtherReviews(filteredOtherReviews);
      } catch (err) {
        console.error("리뷰를 불러올 수 없습니다:", err);
        setError("리뷰를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    loadReview();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">리뷰를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || "리뷰를 찾을 수 없습니다."}</p>
          <Link 
            href="/reviews" 
            className="text-pink-500 hover:text-pink-600 transition-colors"
          >
            ← 리뷰 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

    return (
      <div className="min-h-screen bg-white">
        {/* 네비게이션 바 */}
        <div className="sticky top-0 z-40 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link 
                href="/reviews" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft />
                <span className="hidden sm:inline">모든 리뷰</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ReviewDetail review={review} />
          
          {/* 다른 리뷰 추천 섹션 */}
          {otherReviews.length > 0 && (
            <div className="mt-16 pt-16 border-t">
              <h2 className="text-2xl font-semibold mb-8">다른 여행 리뷰도 둘러보세요</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {otherReviews.map((otherReview) => (
                  <Link 
                    key={otherReview.receiptReviewId} 
                    href={`/reviews/${otherReview.receiptReviewId}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
                      {/* 이미지 */}
                      {otherReview.images && otherReview.images.length > 0 ? (
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://3.34.52.239:8080').replace(/\/$/, '')}${otherReview.images[0].imageUrl.startsWith('http') ? '' : (otherReview.images[0].imageUrl.startsWith('/') ? '' : '/image/')}${otherReview.images[0].imageUrl}`}
                            alt={otherReview.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                          <FaCamera className="text-gray-400 text-3xl" />
                        </div>
                      )}
                      
                      {/* 컨텐츠 */}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-pink-500 transition-colors">
                          {otherReview.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {otherReview.content}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400" />
                            <span className="font-medium">{otherReview.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-500">
                            {formatDate(otherReview.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Link 
                  href="/reviews"
                  className="inline-flex items-center gap-2 px-6 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  더 많은 리뷰 보기
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
}

// 날짜 포맷 함수
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return '오늘';
  } else if (diffInDays === 1) {
    return '어제';
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  } else if (diffInDays < 30) {
    return `${Math.floor(diffInDays / 7)}주 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
