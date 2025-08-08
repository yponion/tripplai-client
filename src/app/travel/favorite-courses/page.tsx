"use client";

import React, { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import Script from "next/script";
import { useRouter } from "next/navigation";
import BannerSlider from "./_components/BannerSlider";
import { SimpleGrid, Flex, IconButton, useToast, Box } from "@chakra-ui/react";
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
      <SimpleGrid
        columns={[1, 2, 3]}
        spacingX={{ base: 6, md: 12, lg: 20 }}
        spacingY={{ base: 8, md: 12, lg: 16 }}
        flex="1"
      >
        {visibleCourses.map((course) => {
          const dest = destinations.find(
            (d) => d.destinationContentId === course.contentId
          );
          return dest ? (
            <Box key={course.courseId} mx={{ base: 3, md: 4, lg: 5 }} mb={{ base: 6, md: 8 }}>
              <CourseCard
                course={course}
                destination={dest}
                onClick={() => {
                  window.location.href = `/travel/popular/${course.courseId}`;
                }}
              />
            </Box>
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

  // 지도 표시를 위한 좌표 준비
  useEffect(() => {
    if (!sdkReady || !destinations.length) return;
    if (!window.kakao || !window.kakao.maps) return;

    const container = document.getElementById('liked-courses-map');
    if (!container) return;

    window.kakao.maps.load(() => {
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 7,
      };
      const map = new window.kakao.maps.Map(container, options);

      const bounds = new window.kakao.maps.LatLngBounds();
      destinations.forEach((d) => {
        const latlng = new window.kakao.maps.LatLng(
          Number(d.destinationLatitude),
          Number(d.destinationLongitude)
        );

        // 해당 목적지와 매칭되는 코스 찾기 (contentId 기준)
        const matchedCourse = likedCourses.find(
          (c) => String(c.contentId) === String(d.destinationContentId)
        );

        const marker = new window.kakao.maps.Marker({
          map,
          position: latlng,
          title: matchedCourse?.title || d.destinationName || '찜한 코스',
        });

        // 마커 클릭 시 코스 상세 페이지로 이동
        if (matchedCourse) {
          window.kakao.maps.event.addListener(marker, 'click', () => {
            window.location.href = `/travel/popular/${matchedCourse.courseId}`;
          });
        }

        bounds.extend(latlng);
      });

      if (!bounds.isEmpty()) {
        map.setBounds(bounds);
      }
    });
  }, [sdkReady, destinations, likedCourses]);

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

  const handleKakaoShare = () => {
    try {
      const kakao: any = (window as any).Kakao;
      const pageUrl = window.location.href;
      const titles = likedCourses.slice(0, 3).map((c) => c.title).join(', ');
      const imageUrl = destinations[0]?.destinationThumbnailImageUrl || `${window.location.origin}/images/popular/map_pin.png`;

      if (kakao && kakao.isInitialized && kakao.isInitialized()) {
        kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '나의 찜한 코스',
            description: titles
              ? `${titles}${likedCourses.length > 3 ? ` 외 ${likedCourses.length - 3}개` : ''}`
              : '찜한 코스를 공유합니다',
            imageUrl,
            link: {
              mobileWebUrl: pageUrl,
              webUrl: pageUrl,
            },
          },
          buttons: [
            {
              title: '목록 보러가기',
              link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
            },
          ],
        });
      } else if (navigator.share) {
        navigator.share({ title: '나의 찜한 코스', text: '내가 찜한 여행 코스', url: pageUrl }).catch(() => {});
      } else {
        navigator.clipboard.writeText(pageUrl).then(() => {
          toast({ title: '링크가 복사되었습니다', status: 'success', duration: 1500, isClosable: true });
        });
      }
    } catch (e) {
      toast({ title: '공유 중 오류가 발생했습니다', status: 'error', duration: 1500, isClosable: true });
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-[80px]">
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
          <Flex gap={8}>
            <button
              className="px-4 py-2 rounded-full border bg-yellow-100 text-base text-yellow-700 hover:bg-yellow-200 font-bold"
              onClick={handleKakaoShare}
            >
              카카오톡으로 공유
            </button>
          </Flex>
        </Flex>
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">나의 찜한 코스</h2>
            <div className="hidden md:flex gap-2 text-sm text-gray-500">
              <span className="px-3 py-1 rounded-full bg-gray-100">총 {likedCourses.length}개</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            <LikedCoursesList
              courses={likedCourses}
              destinations={destinations}
            />
          </div>
        </section>
        <Flex my={12} borderBottom="1px solid #eee" />
        <section style={{ position: "relative" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">찜한 코스 위치</h2>
            <div className="text-sm text-gray-500">마커를 클릭하면 해당 여행 정보로 이동합니다</div>
          </div>
          <div
            id="liked-courses-map"
            style={{ width: '100%', height: '460px', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
          />
        </section>
      </div>
    </Layout>
  );
}
