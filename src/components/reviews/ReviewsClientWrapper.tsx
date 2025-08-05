"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import ReviewCard from '@/components/reviews/ReviewCard';
import Pagination from '@/components/common/Pagination';
import useThemeMode from '@/hooks/useDarkMode';
import { ReviewListResponse } from '@/types/review';
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface ReviewsWrapperProps {
  reviewsData: ReviewListResponse;
  page: number;
  size: number;
}

export function NoReviewsFound() {
  const { themeMode } = useThemeMode();
  
  return (
    <div className="text-center py-20">
      <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">등록된 리뷰가 없습니다</h3>
      <p className="mt-4 text-gray-500 dark:text-gray-400">첫 번째 여행 리뷰를 작성해보세요!</p>
      <div className="mt-8">
        <CreateReviewButton />
      </div>
    </div>
  );
}

export function ReviewsWrapper({ reviewsData, page, size }: ReviewsWrapperProps) {
  const totalPages = reviewsData.totalPages;
  const hasNextPage = !reviewsData.last;
  const hasPrevPage = !reviewsData.first;

  // 페이지네이션 범위 계산
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);
    
    let start = Math.max(0, page - halfVisible);
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <>
      {/* 리뷰 그리드 - 에어비앤비 스타일 */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
      >
        <AnimatePresence mode="popLayout">
          {reviewsData.content.map((review, index) => (
            <motion.div
              key={review.receiptReviewId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ReviewCard review={review} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* 페이지네이션 - 에어비앤비 스타일 */}
      {totalPages > 1 && (
        <motion.nav 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center items-center space-x-2"
        >
          {/* 이전 페이지 버튼 */}
          <Link
            href={hasPrevPage ? `/reviews?page=${page - 1}&size=${size}` : '#'}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
              hasPrevPage 
                ? 'text-gray-700 hover:bg-gray-100 hover:shadow-md' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            onClick={hasPrevPage ? undefined : (e) => e.preventDefault()}
          >
            <FaChevronLeft className="text-sm" />
          </Link>

          {/* 첫 페이지 */}
          {pageNumbers[0] > 0 && (
            <>
              <Link
                href="/reviews?page=0&size=10"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-700 hover:bg-gray-100 hover:shadow-md transition-all duration-200 text-sm font-medium"
              >
                1
              </Link>
              {pageNumbers[0] > 1 && (
                <span className="text-gray-400">...</span>
              )}
            </>
          )}

          {/* 페이지 번호들 */}
          {pageNumbers.map((pageNum) => (
            <Link
              key={pageNum}
              href={`/reviews?page=${pageNum}&size=${size}`}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 text-sm font-medium ${
                pageNum === page
                  ? 'bg-pink-500 text-white shadow-lg transform scale-110'
                  : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
              }`}
            >
              {pageNum + 1}
            </Link>
          ))}

          {/* 마지막 페이지 */}
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
                <span className="text-gray-400">...</span>
              )}
              <Link
                href={`/reviews?page=${totalPages - 1}&size=${size}`}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-700 hover:bg-gray-100 hover:shadow-md transition-all duration-200 text-sm font-medium"
              >
                {totalPages}
              </Link>
            </>
          )}

          {/* 다음 페이지 버튼 */}
          <Link
            href={hasNextPage ? `/reviews?page=${page + 1}&size=${size}` : '#'}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
              hasNextPage 
                ? 'text-gray-700 hover:bg-gray-100 hover:shadow-md' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            onClick={hasNextPage ? undefined : (e) => e.preventDefault()}
          >
            <FaChevronRight className="text-sm" />
          </Link>
        </motion.nav>
      )}

      {/* 결과 정보 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8 text-sm text-gray-600"
      >
        총 {reviewsData.totalElements}개의 리뷰 중 {page * size + 1}-{Math.min((page + 1) * size, reviewsData.totalElements)}번째
      </motion.div>
    </>
  );
}

export function ReviewsError() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">리뷰를 불러올 수 없습니다</h3>
        <p className="text-gray-600 mb-6">
          잠시 후 다시 시도해주세요.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </motion.div>
  );
}

// 통합된 리뷰 작성하기 버튼 컴포넌트
export function CreateReviewButton() {
  const { themeMode } = useThemeMode();
  
  // 버튼 스타일 결정하기
  const getButtonClasses = () => {
    switch (themeMode) {
      case 'original':
        return "inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 transition-colors border-none";
      case 'light':
        return "inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900 transition-colors border-none";
      case 'dark':
        return "inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg shadow-md hover:bg-pink-700 transition-colors border-none";
      default:
        return "inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 transition-colors border-none";
    }
  };
  
  return (
    <Link
      href="/reviews/create"
      className={getButtonClasses()}
    >
      <FaPlus className="mr-2" size={16} />
      <span>리뷰 작성하기</span>
    </Link>
  );
}

export default CreateReviewButton;