"use client";

import React, { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import Script from "next/script";
import { useRouter } from "next/navigation";
import BannerSlider from "./_components/BannerSlider";
import { SimpleGrid, Flex, IconButton, useToast } from "@chakra-ui/react";
import { Course, Destination } from "@/types";
import { courseApi } from "@/services/courseService";
import { destinationApi } from "@/services/destinationService";
import CourseCard from "./_components/CourseCard";
import arrowLeft from "@/assets/arrow-left.png";
import arrowRight from "@/assets/arrow-right.png";
import Image from "next/image";

declare global {
  interface Window {
    kakao: any;
  }
}

function LikedCoursesList({
  courses,
  destinations,
}: {
  courses: Course[];
  destinations: Destination[];
}) {
  const itemsPerPage = 3;
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const [page, setPage] = useState(0);
  console.log("코스:", courses);
  console.log("찾은 dest:", destinations);

  const visibleCourses = useMemo(
    () =>
      courses.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage),
    [page, courses]
  );

  const prev = () => setPage((p) => Math.max(p - 1, 0));
  const next = () => setPage((p) => Math.min(p + 1, totalPages - 1));

  return (
    <Flex align="center" w="100%" position="relative" alignItems="stretch">
      {/* 이전 버튼 */}
      {page > 0 && (
        <IconButton
          aria-label="이전"
          icon={
            <Image
              src={arrowLeft}
              alt="이전"
              width={35}
              height={35}
              style={{ pointerEvents: "none" }}
            />
          }
          onClick={prev}
          position="absolute"
          left="-40px"
          top="40%"
          transform="translateY(-50%)"
          bg="transparent"
          border="none"
          _hover={{ bg: "transparent" }}
          zIndex={10}
        />
      )}

      {/* 카드 리스트 */}
      <SimpleGrid columns={[1, 2, 3]} spacing={4} flex="1">
        {visibleCourses.map((course) => {
          const dest = destinations.find(
            (d) => d.destinationContentId === course.contentId
          );
          return dest ? (
            <CourseCard
              key={course.courseId}
              course={course}
              destination={dest}
            />
          ) : null;
        })}
      </SimpleGrid>

      {/* 다음 버튼 */}
      {page < totalPages - 1 && (
        <IconButton
          aria-label="다음"
          icon={
            <Image
              src={arrowRight}
              alt="다음"
              width={35}
              height={35}
              style={{ pointerEvents: "none" }}
            />
          }
          onClick={next}
          position="absolute"
          right="-40px"
          top="40%"
          transform="translateY(-50%)"
          bg="transparent"
          border="none"
          _hover={{ bg: "transparent" }}
          zIndex={10}
        />
      )}
    </Flex>
  );
}

export default function FavoriteCoursesPage() {
  const router = useRouter();
  const [likedCourses, setLikedCourses] = useState<Course[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [sdkReady, setSdkReady] = useState(false);
  const toast = useToast();
  const [locations, setLocations] = useState<
    { lat: number; lng: number; title: string }[]
  >([]);
  const [start, setStart] = useState<Destination | null>(null);

  // API가 Course[]을 반환하는 찜 목록 불러오기
  useEffect(() => {
    (async () => {
      try {
        const liked = await courseApi.getLikedCourses();
        const contentIds = liked.map((c) => c.contentId);
        const dests = contentIds.length
          ? await destinationApi.getByContentIds(contentIds)
          : [];

        const destArray = Object.values(dests);
        console.log("diqdiq", dests);
        setLikedCourses(liked);
        setDestinations(destArray);
      } catch {
        toast({ title: "데이터 로드 실패", status: "error" });
      }
    })();
  }, []);

  // Kakao SDK 로드 후 시각화 준비
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
  if (!kakaoKey) console.error("NEXT_PUBLIC_KAKAO_MAP_API_KEY undefined");
  const sdkUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services&autoload=false`;

  return (
    <Layout>
      <Script
        src={sdkUrl}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => console.error("Kakao Maps SDK 로드 실패")}
      />
      <div className="mt-[90px]">
        <BannerSlider />
      </div>
      <div className="max-w-5xl mx-auto p-6 pt-[80px]">
        <Flex
          justify="flex-end"
          align="center"
          mb={6}
          position="sticky"
          zIndex={10}
          bg="white"
          top={-20}
          py={4}
          px={2}
        >
          <Flex gap={2}>
            <button className="px-4 py-2 rounded-full border  bg-pink-100 text-base text-pink-600 hover:bg-pink-200 font-bold">
              공유하기 <span className="ml-1">🔗</span>
            </button>
          </Flex>
        </Flex>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">나의 찜한 코스</h2>
          <LikedCoursesList
            courses={likedCourses}
            destinations={destinations}
          />
        </section>
        <Flex my={12} borderBottom="1px solid #eee" />
        <section style={{ position: "relative" }}>
          <h2 className="text-2xl font-bold mb-4">찜한 코스 위치</h2>
          {/* 지도 표시 */}
        </section>
      </div>
    </Layout>
  );
}
