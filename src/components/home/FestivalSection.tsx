"use client";

import { Box, Container, Heading, Image as ChakraImage, Text, Spinner, Center } from "@chakra-ui/react";
import { FaMapMarkerAlt, FaClock } from "react-icons/fa";
import Link from "next/link";
import Button from "@/components/common/Button";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// API 응답 타입 정의
interface Course {
  courseId: number;
  contentId: string;
  thumbnailUrl: string;
  title: string;
  area: string;
  likeCount: number;
  rating?: number;
}

// 정확히 표시할 코스 개수
const COURSE_COUNT = 8;

// 이미지 크기 확인 함수
function isImageLargeEnough(url: string) {
  return new Promise<boolean>((resolve) => {
    // HTMLImageElement 사용으로 타입 문제 해결
    const img = document.createElement("img");
    img.onload = () => {
      if (img.width >= 300 && img.height >= 300) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// 유효한 이미지를 가진 코스만 필터링하는 함수
async function filterValidImages(courses: Course[]) {
  const filtered = [];
  const imageUrls = new Set(); // 이미지 URL 중복 체크를 위한 Set

  for (const course of courses) {
    // 이미지 URL이 이미 사용되었는지 확인
    if (imageUrls.has(course.thumbnailUrl)) {
      continue;
    }

    const valid = await isImageLargeEnough(course.thumbnailUrl);
    if (valid) {
      filtered.push(course);
      imageUrls.add(course.thumbnailUrl); // 사용된 이미지 URL 추가
    }
  }

  return filtered;
}

// API에서 코스 데이터를 가져오는 함수
async function fetchCourseData(page = 0, limit = 50) {
  const response = await fetch(`${API_URL}/api/course?page=${page}&limit=${limit}`, {
    mode: "cors",
    cache: "no-store",
  });

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// 필요한 갯수만큼 유효한 코스를 가져오는 함수
async function fetchValidCoursesUntilThreshold(threshold = COURSE_COUNT, maxAttempts = 20) {
  let validCourses: Course[] = [];
  let page = 0;
  let attempts = 0;

  // 유효한 코스가 threshold에 도달하거나 최대 시도 횟수에 도달할 때까지 반복
  while (validCourses.length < threshold && attempts < maxAttempts) {
    const newCourses = await fetchCourseData(page, 50);

    if (newCourses.length === 0) {
      if (validCourses.length < threshold) {
        // 더 많은 시도를 위해 페이지를 초기화하고 다시 시작
        page = 0;
      }
      attempts++;
      continue;
    }

    // 새로 가져온 코스에서 유효한 이미지만 필터링 (중복 제거)
    const newValidCourses = await filterValidImages(newCourses);

    // 누적된 유효한 코스에 추가 (중복 체크)
    for (const course of newValidCourses) {
      // 이미 같은 코스 ID가 있는지 확인
      if (!validCourses.some((c) => c.courseId === course.courseId)) {
        validCourses.push(course);
        if (validCourses.length >= threshold) {
          break; // 목표 개수 달성
        }
      }
    }

    page++;
    attempts++;

    // 페이지가 너무 많이 증가하면 다시 처음부터 시작
    if (page > 10) {
      page = 0;
    }
  }

  if (validCourses.length < threshold) {
    console.warn(
      `최대 시도 횟수(${maxAttempts})에 도달했지만 ${threshold}개를 채우지 못했습니다. 현재 ${validCourses.length}개`
    );
  }

  // 정확히 threshold 개수만큼만 반환
  const result = validCourses.slice(0, threshold);
  return result;
}

export default function RecommendedCoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const validCourses = await fetchValidCoursesUntilThreshold(COURSE_COUNT);

        // 정확히 COURSE_COUNT개만 설정
        setCourses(validCourses.slice(0, COURSE_COUNT));

        setIsLoading(false);
      } catch (err) {
        console.error("API 요청 오류:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (isLoading) {
    return (
      <Box as="section" className="section" id="recommended-courses">
        <Container className="section-container">
          <Heading as="h2" className="section-title">
            추천 인기 여행 코스
          </Heading>
          <Center my={10}>
            <Spinner size="xl" />
          </Center>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box as="section" className="section" id="recommended-courses">
        <Container className="section-container">
          <Heading as="h2" className="section-title">
            추천 인기 여행 코스
          </Heading>
          <Center my={10}>
            <Text color="red.500">{error}</Text>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box as="section" className="section" id="recommended-courses">
      <Container className="section-container">
        <Heading as="h2" className="section-title">
          추천 인기 여행 코스
        </Heading>

        <Box textAlign="center" mt={4} mb={6}>
          <Link href="/popular-courses" passHref>
            <Button variant="primary" size="lg" className="ml-2 hover:bg-pink-600">
              더 많은 코스 보기
            </Button>
          </Link>
        </Box>

        <Box
          className="festival-grid"
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
          gap={6}
        >
          {courses.slice(0, COURSE_COUNT).map((course) => (
            <Link key={course.courseId} href={`/travel/popular/${course.courseId}`} style={{ textDecoration: "none" }}>
              <Box
                className="festival-card"
                cursor="pointer"
                _hover={{ transform: "translateY(-5px)", transition: "transform 0.3s ease" }}
              >
                <Box className="festival-image" height="200px" overflow="hidden">
                  <ChakraImage
                    src={course.thumbnailUrl}
                    alt={course.title}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                </Box>
                <Box className="festival-content" p={4}>
                  <Text className="festival-title" fontWeight="600" fontSize="lg" mb={2} noOfLines={1}>
                    {course.title}
                  </Text>
                  <Box className="festival-date" display="flex" alignItems="center" mb={2}>
                    <Box as={FaClock} mr={2} color="gray.500" />
                    <Text fontSize="sm" color="gray.600">
                      {course.rating ? `평점: ${course.rating}` : "새로운 코스"}
                    </Text>
                  </Box>
                  <Box className="festival-location" display="flex" alignItems="center">
                    <Box as={FaMapMarkerAlt} mr={2} color="gray.500" />
                    <Text fontSize="sm" color="gray.600">
                      {course.area}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Link>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

// 기존 이름과의 호환성을 위한 별칭
export { RecommendedCoursesSection as FestivalSection };
