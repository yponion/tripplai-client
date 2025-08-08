"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Image,
  HStack,
  Icon,
  useToast,
  useColorModeValue,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaThumbsUp } from "react-icons/fa";
import { BsArrowUpRight } from "react-icons/bs";
import NavSection from "@/components/common/NavSection";
import Footer from "@/components/common/Footer";
import useThemeMode from "@/hooks/useDarkMode";
import { courseApi } from "@/services/courseService";

// 정확히 표시할 코스 개수
const COURSE_COUNT = 16;

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

// 성능 최적화를 위해 이미지 선검증을 제거하고, 렌더 단계에서 fallback 이미지를 사용합니다.

// API에서 코스 데이터를 가져오는 함수
async function fetchCourseData(page = 0, limit = 50) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://3.34.52.239:8080';
  const response = await fetch(`${baseUrl}/api/course?page=${page}&limit=${limit}`, {
    mode: "cors",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("코스 데이터를 불러오는 중 오류가 발생했습니다");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// 단순히 첫 페이지에서 받아온 데이터 중 상위 N개만 사용합니다.
async function fetchFirstPageCourses(threshold = COURSE_COUNT) {
  const firstPage = await fetchCourseData(0, 50);
  return firstPage.slice(0, threshold);
}

export default function PopularCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [likedCourses, setLikedCourses] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { themeMode } = useThemeMode();

  // 색상 변수 - 테마 모드에 따라 결정
  const bgColor = themeMode === "dark" ? "black" : "white";
  const cardBg = themeMode === "dark" ? "gray.800" : "white";
  const textColor = themeMode === "dark" ? "white" : themeMode === "original" ? "pink.500" : "black";
  const subTextColor = themeMode === "dark" ? "gray.300" : themeMode === "original" ? "pink.400" : "gray.700";
  const borderColor = themeMode === "dark" ? "white" : themeMode === "original" ? "pink.100" : "gray.200";
  const shadowColor = themeMode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
  const badgeBg = themeMode === "original" ? "pink.500" : themeMode === "dark" ? "cyan.500" : "blue.500";
  const actionBg = themeMode === "original" ? "pink.50" : themeMode === "dark" ? "cyan.500" : "gray.50";
  const actionHoverBg = themeMode === "original" ? "pink.100" : themeMode === "dark" ? "cyan.600" : "gray.100";
  const likesBg = themeMode === "original" ? "pink.50" : themeMode === "dark" ? "cyan.500" : "gray.100";
  const accentColor = themeMode === "original" ? "pink.500" : themeMode === "dark" ? "cyan.400" : "blue.500";
  const locationColor = themeMode === "original" ? "pink.500" : themeMode === "dark" ? "cyan.400" : "blue.600";
  const buttonHoverBg = themeMode === "original" ? "pink.600" : themeMode === "dark" ? "cyan.400" : "blue.600";

  // 코스 데이터 가져오기 (간소화: 1회 요청)
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const list = await fetchFirstPageCourses(COURSE_COUNT);
        setCourses(list);

        setIsLoading(false);
      } catch (err) {
        console.error("API 요청 오류:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  // 찜 목록 불러오기 (로그인 시 서버, 비로그인 시 로컬)
  useEffect(() => {
    const initLikes = async () => {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
      if (token) {
        try {
          const liked = await courseApi.getLikedCourses();
          setLikedCourses(liked.map((c) => c.courseId));
          return;
        } catch (e) {
          // 서버 실패 시 로컬로 폴백
        }
      }
      const savedLikes = typeof window !== "undefined" ? localStorage.getItem("likedCourses") : null;
      if (savedLikes) setLikedCourses(JSON.parse(savedLikes));
    };
    initLikes();
  }, []);

  // 찜하기 토글 (로그인 시 서버, 비로그인 시 로컬)
  const toggleLike = async (courseId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
    if (token) {
      try {
        if (likedCourses.includes(courseId)) {
          await courseApi.unlikeCourse(courseId);
          setLikedCourses((prev) => prev.filter((id) => id !== courseId));
          toast({ title: "찜 목록에서 제거되었습니다", status: "info", duration: 1500, isClosable: true });
        } else {
          await courseApi.courseLike(String(courseId));
          setLikedCourses((prev) => [...prev, courseId]);
          toast({ title: "찜 목록에 추가되었습니다", status: "success", duration: 1500, isClosable: true });
        }
      } catch (err) {
        toast({ title: "찜하기 처리 중 오류가 발생했습니다", status: "error", duration: 2000, isClosable: true });
      }
      return;
    }

    // 비로그인: 로컬 스토리지로만 관리
    let newLikedCourses;
    if (likedCourses.includes(courseId)) {
      newLikedCourses = likedCourses.filter((id) => id !== courseId);
      toast({ title: "찜 목록에서 제거되었습니다", status: "info", duration: 1500, isClosable: true });
    } else {
      newLikedCourses = [...likedCourses, courseId];
      toast({ title: "찜 목록에 추가되었습니다", status: "success", duration: 1500, isClosable: true });
    }
    setLikedCourses(newLikedCourses);
    if (typeof window !== "undefined") {
      localStorage.setItem("likedCourses", JSON.stringify(newLikedCourses));
    }
  };

  useEffect(() => {
    // 테마 변경 이벤트를 감지하는 함수
    const handleThemeChange = () => {
      // 테마 모드 확인 (DOM에서 직접 확인)
      const isDarkMode = document.body.classList.contains("dark-mode");
      const isPinkMode = !isDarkMode && document.querySelector(".text-pink-500") !== null;

      // 배경 요소
      const mainBg = document.querySelector(".main-content-bg");
      if (mainBg) {
        if (isDarkMode) {
          (mainBg as HTMLElement).style.backgroundColor = "#000000";
        } else if (isPinkMode) {
          (mainBg as HTMLElement).style.backgroundColor = "#FFFFFF";
        } else {
          (mainBg as HTMLElement).style.backgroundColor = "#FFFFFF";
        }
      }

      // 카드 컨테이너 요소들 찾기
      const cardElements = document.querySelectorAll(".festival-card");
      const badgeElements = document.querySelectorAll(".location-badge");
      const textElements = document.querySelectorAll(".card-text");

      // 테마에 따라 직접 스타일 적용
      cardElements.forEach((card) => {
        if (isDarkMode) {
          (card as HTMLElement).style.backgroundColor = "#1A202C"; // gray.800
          (card as HTMLElement).style.borderColor = "#FFFFFF"; // 흰색 테두리
          (card as HTMLElement).style.boxShadow = "0 4px 12px rgba(255,255,255,0.15)"; // 흰색 그림자
        } else if (isPinkMode) {
          (card as HTMLElement).style.backgroundColor = "#FFFFFF";
          (card as HTMLElement).style.borderColor = "#FED7E2"; // pink.100
          (card as HTMLElement).style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
        } else {
          (card as HTMLElement).style.backgroundColor = "#FFFFFF";
          (card as HTMLElement).style.borderColor = "#E2E8F0"; // gray.200
          (card as HTMLElement).style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
        }
      });

      // 텍스트 요소 색상 적용
      textElements.forEach((text) => {
        if (isDarkMode) {
          (text as HTMLElement).style.color = "#FFFFFF"; // 흰색
        } else if (isPinkMode) {
          (text as HTMLElement).style.color = "#ED64A6"; // pink.500
        } else {
          (text as HTMLElement).style.color = "#000000"; // 검은색
        }
      });

      // 배지 요소 스타일 적용
      badgeElements.forEach((badge) => {
        if (isDarkMode) {
          (badge as HTMLElement).style.backgroundColor = "#00B5D8"; // cyan.500
          (badge as HTMLElement).style.color = "#FFFFFF";
        } else if (isPinkMode) {
          (badge as HTMLElement).style.backgroundColor = "#ED64A6"; // pink.500
          (badge as HTMLElement).style.color = "#FFFFFF";
        } else {
          (badge as HTMLElement).style.backgroundColor = "#3182CE"; // blue.500
          (badge as HTMLElement).style.color = "#FFFFFF";
        }
      });
    };

    // 초기 적용
    setTimeout(handleThemeChange, 100);

    // 문서 변경 감지를 위한 MutationObserver 설정
    const observer = new MutationObserver((mutations) => {
      // body 클래스 변경을 감지하여 테마 변경 적용
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class" && mutation.target === document.body) {
          handleThemeChange();
        }
      });
    });

    // body의 클래스 변경 감지 시작
    observer.observe(document.body, { attributes: true });

    // 컴포넌트 언마운트 시 옵저버 해제
    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <>
        <NavSection />
        <Box bg={bgColor} pt="100px" pb="50px" minH="100vh">
          <Container maxW="container.xl">
            <Center my={10}>
              <Spinner size="xl" />
            </Center>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavSection />
        <Box bg={bgColor} pt="100px" pb="50px" minH="100vh">
          <Container maxW="container.xl">
            <Center my={10}>
              <Text color="red.500">{error}</Text>
            </Center>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavSection />

      {/* 메인 콘텐츠 영역 - 상단에 넉넉한 여백 */}
      <Box bg={bgColor} pt="120px" pb="50px" minH="100vh" className="main-content-bg">
        <Container maxW="container.xl" px={0}>
          {/* 상단 여백 */}
          <Box h="100px" />

          {/* 여행 코스 카드 그리드 - 정사각형 카드로 가로 배열 */}
          <Flex
            overflowX="visible"
            overflowY="visible"
            pb={6}
            width="100%"
            maxW="100%"
            flexWrap="wrap"
            gap="28px"
            pl="200px"
            pr="20px"
          >
            {courses.slice(0, COURSE_COUNT).map((course) => (
              <Box
                key={course.courseId}
                position="relative"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                bg={cardBg}
                boxShadow={`0 4px 10px ${shadowColor}`}
                display="flex"
                flexDirection="column"
                overflow="hidden"
                flex="0 0 235px"
                minW="235px"
                h="354px"
                mb={4}
                transition="all 0.3s ease-in-out"
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: `0 8px 15px ${shadowColor}`,
                  zIndex: 1,
                  cursor: "pointer",
                }}
                onClick={() => (window.location.href = `/travel/popular/${course.courseId}`)}
                className="festival-card"
              >
                {/* 이미지 영역 - 비율 조정 */}
                <Box position="relative" height="52%" overflow="hidden">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                    fallbackSrc="/images/popular/map_pin.png"
                  />
                  {/* 지역 뱃지 - 이미지 위에 배치 */}
                  <Box
                    position="absolute"
                    top="12px"
                    left="12px"
                    bg={badgeBg}
                    color="white"
                    fontSize="0.8rem"
                    fontWeight="semibold"
                    px={2.5}
                    py={1}
                    borderRadius="sm"
                    letterSpacing="0.5px"
                    className="location-badge"
                  >
                    {course.area.split(" ")[0]?.toUpperCase() || course.area}
                  </Box>
                </Box>

                {/* 콘텐츠 영역 - 비율 조정 */}
                <Flex direction="column" height="48%" p={5} justify="center" position="relative">
                  {/* 제목 - 상단 배치 */}
                  <Box
                    position="absolute"
                    top="15%"
                    left="50%"
                    transform="translateX(-50%)"
                    width="90%"
                    textAlign="center"
                    zIndex="1"
                    mb={3}
                  >
                    <Heading
                      as="h3"
                      fontSize="1.2rem"
                      fontWeight="bold"
                      noOfLines={2}
                      color={textColor}
                      letterSpacing="-0.3px"
                      className="card-text"
                    >
                      {course.title}
                    </Heading>
                  </Box>

                  {/* 지역 정보와 좋아요 수를 한 줄에 표시 - 중앙 배치 */}
                  <Flex
                    width="100%"
                    justifyContent="center"
                    alignItems="center"
                    gap={4}
                    position="absolute"
                    top="55%"
                    left="0"
                    px={5}
                    transform="translateY(-50%)"
                  >
                    {/* 지역 정보 */}
                    <Flex alignItems="center">
                      <Icon as={FaMapMarkerAlt} mr={1.5} color={locationColor} />
                      <Text fontSize="0.95rem" fontWeight="500" color={textColor} opacity={0.9} className="card-text">
                        {course.area}
                      </Text>
                    </Flex>

                    {/* 좋아요 수 */}
                    <Flex alignItems="center" borderRadius="full" py={1} px={3} className="likes-badge">
                      <Icon as={FaThumbsUp} color={accentColor} mr={1.5} fontSize="1rem" />
                      <Text fontSize="0.9rem" fontWeight="bold" color={textColor} className="card-text">
                        {course.likeCount}
                      </Text>
                    </Flex>
                  </Flex>

                  {/* 하단 액션 영역 */}
                  <HStack
                    borderTop="1px solid"
                    borderColor={borderColor}
                    spacing={0}
                    position="absolute"
                    bottom="0"
                    left="0"
                    width="100%"
                  >
                    <Flex
                      p={3}
                      alignItems="center"
                      justifyContent="space-between"
                      flexGrow={1}
                      _hover={{ bg: "transparent" }}
                      className="action-area"
                    >
                      <Text
                        fontSize="1rem"
                        fontWeight="bold"
                        color={textColor}
                        letterSpacing="-0.2px"
                        className="card-text"
                      >
                        자세히 보기
                      </Text>
                      <Icon as={BsArrowUpRight} color={textColor} boxSize={4} />
                    </Flex>

                    <Flex
                      p={3}
                      alignItems="center"
                      justifyContent="center"
                      borderLeft="1px solid"
                      borderColor={borderColor}
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // 이벤트 전파 중지
                        toggleLike(course.courseId, e);
                      }}
                      _hover={{ bg: actionHoverBg }}
                      w="50px"
                      bg={themeMode === "dark" ? badgeBg : "transparent"}
                    >
                      <Icon
                        as={likedCourses.includes(course.courseId) ? FaHeart : FaRegHeart}
                        color={likedCourses.includes(course.courseId) ? accentColor : "gray.500"}
                        fontSize="1.3rem"
                      />
                    </Flex>
                  </HStack>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
