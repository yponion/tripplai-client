"use client";

import { Container, Heading, Box, Text } from "@chakra-ui/react";
import Link from "next/link";
import { getReviews } from "@/services/reviewService";
import ReviewCard from "@/components/reviews/ReviewCard";
import Button from "@/components/common/Button";
import { useEffect, useState, useCallback } from "react";
import { ReviewListResponse } from "@/types/review";

export default function ReviewsSection() {
  const [reviewsData, setReviewsData] = useState<ReviewListResponse>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 3,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetchReviews 함수를 useCallback으로 정의하여 재사용
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getReviews({ page: 0, size: 3 });

      if (!data || data.content.length === 0) {
        console.warn("가져온 리뷰 데이터가 없습니다");
        setReviewsData({
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 3,
          numberOfElements: 0,
          first: true,
          last: true,
          empty: true,
        });
      } else {
        setReviewsData(data);
      }
    } catch (error) {
      console.error("리뷰를 가져오는 중 오류 발생:", error);
      setError("리뷰를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
      setReviewsData({
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 3,
        numberOfElements: 0,
        first: true,
        last: true,
        empty: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 리뷰 데이터 가져오기
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <Box as="section" className="section" bg="white">
      <Container className="section-container">
        <Heading as="h2" className="section-title" textAlign="center">
          여행 리뷰
        </Heading>
        <Text className="section-subtitle" textAlign="center" mx="auto" mb={10}>
          다른 여행자들의 생생한 여행 후기를 만나보세요
        </Text>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Text color="red.500" fontSize="lg" mb={4}>
              {error}
            </Text>
            <Button onClick={fetchReviews} variant="outline" size="md" className="hover:bg-pink-100">
              다시 시도
            </Button>
          </div>
        ) : (
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewsData.content.length > 0 ? (
              reviewsData.content.map((review) => (
                <Box key={review.receiptReviewId} className="relative">
                  <ReviewCard review={review} />
                </Box>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <Text fontSize="lg" color="gray.500">
                  표시할 리뷰가 없습니다.
                </Text>
              </div>
            )}
          </Box>
        )}

        <Box textAlign="center" mt={8}>
          <Link href="/reviews" passHref>
            <Button variant="primary" size="lg" className="ml-2 hover:bg-pink-600">
              더 많은 리뷰 보기
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
