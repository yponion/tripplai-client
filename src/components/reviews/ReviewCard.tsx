"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Review } from "@/types/review";
import { FaStar, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { formatDate } from "@/utils/dateUtils";
import { motion } from "framer-motion";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const { receiptReviewId, title, content, rating, createdAt, nickname, images } = review;
  const [imgError, setImgError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // 이미지 URL에 서버 주소 추가
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) {
      return imageUrl; // 이미 절대 URL인 경우
    }
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://3.34.52.239:8080').replace(/\/$/, '');
    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_API_URL이 설정되지 않았습니다.');
      return imageUrl;
    }
    // 서버는 파일명만 반환하므로 /image/{파일명}으로 보정
    if (imageUrl.startsWith('/')) {
      const finalUrl = `${apiUrl}${imageUrl}`;
      if (process.env.NODE_ENV !== 'production') console.log('[ReviewCard] imageUrl(mapped):', finalUrl);
      return finalUrl;
    }
    const finalUrl = `${apiUrl}/image/${imageUrl}`;
    if (process.env.NODE_ENV !== 'production') console.log('[ReviewCard] imageUrl(mapped):', finalUrl);
    return finalUrl;
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <FaStar
            key={index}
            className={`transition-colors ${
              index < Math.floor(rating) ? "text-yellow-400" : "text-gray-200"
            }`}
            size={16}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/reviews/${receiptReviewId}`} className="block group">
        <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl shadow-md">
          {/* 이미지 섹션 - 에어비앤비 스타일 */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse bg-gray-200 w-full h-full"></div>
              </div>
            )}
            {images && images.length > 0 ? (
              <>
                {!imgError ? (
                  <Image
                    src={getImageUrl(images[0].imageUrl)}
                    alt={title}
                    fill
                    className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onError={(e) => {
                      setImgError(true);
                      if (process.env.NODE_ENV !== 'production') console.error('[ReviewCard] image onError:', (e as any)?.currentTarget?.src);
                    }}
                    onLoad={() => setImageLoading(false)}
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-pink-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-pink-400 text-sm font-medium">여행 리뷰</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-gray-400 text-sm">이미지 없음</span>
                </div>
              </div>
            )}

            {/* 이미지 개수 표시 */}
            {images && images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                +{images.length - 1}장
              </div>
            )}

            {/* 별점 오버레이 */}
            <div className="absolute top-3 left-3">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-500 text-sm" />
                  <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 컨텐츠 섹션 */}
          <div className="p-5">
            {/* 제목 */}
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-pink-600 transition-colors">
              {title}
            </h3>

            {/* 내용 미리보기 */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
              {content}
            </p>

            {/* 메타 정보 */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              {/* 작성자 정보 */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 flex items-center justify-center text-white text-xs font-medium">
                  {nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{nickname}</p>
                  <p className="text-xs text-gray-500">{formatDate(createdAt)}</p>
                </div>
              </div>

              {/* 더보기 텍스트 */}
              <span className="text-sm text-pink-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                자세히 보기 →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
