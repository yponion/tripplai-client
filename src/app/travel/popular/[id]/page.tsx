"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Image,
  Badge,
  Button,
  SimpleGrid,
  Icon,
  Spinner,
  VStack,
  HStack,
  List,
  ListItem,
  ListIcon,
  useDisclosure,
  IconButton,
} from "@chakra-ui/react";
import { useRouter, useParams } from "next/navigation";
import {
  FaMapMarkerAlt,
  FaClock,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaChevronLeft,
  FaBus,
  FaWallet,
  FaCheckCircle,
  FaStar,
  FaCalendarAlt,
  FaInfoCircle,
  FaBed,
  FaUtensils,
  FaTicketAlt,
  FaMoneyBill,
  FaUmbrella,
  FaCar,
  FaCloudSun,
  FaRestroom,
  FaHome,
  FaWonSign,
  FaPlane,
  FaLandmark,
  FaTree,
  FaPrayingHands,
  FaWater,
  FaMountain,
} from "react-icons/fa";
import Script from "next/script";
import NavSection from "@/components/common/NavSection";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import NextImage from "next/image";
import { getBestTravelSeason, getShortTermForecast, SeasonalInfo, WeatherData } from '@/services/weatherService';
import { courseApi } from '@/services/courseService';

// API 응답 타입 정의
interface CourseDetail {
  courseID: number;
  title: string;
  overview: string;
  spots: SpotDetail[];
}

interface SpotDetail {
  contentId: string;
  description: string;
  order: number;
  title: string;
  address: string;
  imageUrl: string;
  day?: number;
  timeSlot?: "오전" | "오후" | "저녁";
  category?: "attraction" | "restaurant" | "activity";
  visitDuration?: string;
}

interface WeatherInfo {
  isLoading: boolean;
  seasonalInfo: SeasonalInfo | null;
  forecast: WeatherData[];
}

// 시간대에 맞는 색상 반환 함수
const getTimeSlotColor = (timeSlot: "오전" | "오후" | "저녁") => {
  switch (timeSlot) {
    case "오전":
      return { bg: "#FFB6C1", text: "black" }; // 밝은 핑크색
    case "오후":
      return { bg: "#FF69B4", text: "white" }; // 핫 핑크색
    case "저녁":
      return { bg: "#DB7093", text: "white" }; // 진한 핑크색
    default:
      return { bg: "#FFDEEB", text: "black" };
  }
};

export default function TravelCourseDetail() {
  // params를 useParams로 직접 가져오기
  const params = useParams();
  const courseId = params?.id as string;
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const cardsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [hoverStyles, setHoverStyles] = useState("");
  const router = useRouter();

  // 애니메이션 관련 상태
  const [visibleCards, setVisibleCards] = useState<string[]>([]);
  const [visibleInfoSection, setVisibleInfoSection] = useState(true);
  const [visibleTipsSection, setVisibleTipsSection] = useState(false);

  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo>({
    isLoading: true,
    seasonalInfo: null,
    forecast: []
  });

  // 데이터 로드
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        
        // API 호출 상태 확인을 위한 로깅 추가
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://3.34.52.239:8080';
        console.log(`코스 데이터 요청 시작: ${baseUrl}/api/course/${courseId}`);
        
        // 백엔드 서버로 직접 API 호출
        const response = await fetch(`${baseUrl}/api/course/${courseId}`, {
          mode: "cors",
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          console.error(`API 오류: ${response.status} - ${response.statusText}`);
          throw new Error('코스 상세 정보를 불러오는 중 오류가 발생했습니다');
        }
        
        // 응답 내용 확인
        const responseText = await response.text();
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          console.error('서버 응답:', responseText.substring(0, 200) + '...');
          throw new Error('서버 응답이 유효한 JSON 형식이 아닙니다');
        }
        
        // 데이터 가공 - 스팟에 가상의 day, timeSlot 등 추가
        const processedSpots = data.spots.map((spot: SpotDetail, index: number) => {
          // 임시로 day와 timeSlot 할당 (실제로는 API에서 제공되지 않을 수 있음)
          const day = Math.floor(index / 3) + 1;
          
          let timeSlot: "오전" | "오후" | "저녁";
          if (index % 3 === 0) timeSlot = "오전";
          else if (index % 3 === 1) timeSlot = "오후";
          else timeSlot = "저녁";
          
          const category = index % 3 === 2 ? "restaurant" : "attraction";
          const visitDuration = "약 2시간";
          
          return {
            ...spot,
            day,
            timeSlot,
            category,
            visitDuration
          };
        });
        
        const processedData = {
          ...data,
          spots: processedSpots
        };
        
        setCourseDetail(processedData);
        setIsLoading(false);
      } catch (err) {
        console.error("여행 코스 데이터 가져오기 실패:", err);
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  // 초기 찜 상태 조회
  useEffect(() => {
    const init = async () => {
      try {
        if (!courseId) return;
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
        if (!token) return;
        const liked = await courseApi.isLiked(courseId);
        setIsLiked(liked);
      } catch (e) {
        // 무시 (비로그인/네트워크 등)
      }
    };
    init();
  }, [courseId]);

  // 날씨 데이터 및 추천 시기 로드
  useEffect(() => {
    const loadWeatherData = async () => {
      if (!courseDetail) return;
      
      try {
        // 첫 번째 장소의 주소로 지역 판단
        const firstSpot = courseDetail.spots[0];
        if (!firstSpot || !firstSpot.address) {
          console.error('여행지 주소 정보가 없습니다.');
          setWeatherInfo(prev => ({ ...prev, isLoading: false }));
          return;
        }
        
        const addressParts = firstSpot.address.split(' ');
        // 시/도 + 시/군/구 조합으로 더 정확한 지역명 구성
        const regionName = addressParts.length >= 2 
          ? `${addressParts[0]} ${addressParts[1]}` 
          : addressParts[0];
        
        console.log(`날씨 조회를 위한 지역명: "${regionName}"`);
        
        // 계절 정보 가져오기
        const seasonalInfo = getBestTravelSeason(
          `${firstSpot.address} ${courseDetail.title}`, 
          courseDetail.overview
        );
        
        console.log(`계절 정보 결과:`, seasonalInfo);
        
        // 날씨 예보 가져오기 (실패해도 계속 진행)
        let forecast: WeatherData[] = [];
        try {
          console.log(`${regionName} 지역의 날씨 예보 요청 중...`);
          forecast = await getShortTermForecast(regionName);
          
          if (forecast.length > 0) {
            console.log(`날씨 예보 데이터 수신 완료: ${forecast.length}개 항목`);
            console.log(`현재/가장 빠른 예보: ${forecast[0].sky}, ${forecast[0].tmp}°C, 강수확률 ${forecast[0].pop}%`);
          } else {
            console.warn('받아온 날씨 예보 데이터가 없습니다.');
          }
        } catch (forecastError) {
          console.error('날씨 예보 가져오기 실패:', forecastError);
        }
        
        // 결과 설정
        setWeatherInfo({
          isLoading: false,
          seasonalInfo,
          forecast
        });
        
      } catch (error) {
        console.error('날씨 정보 로드 실패:', error);
        setWeatherInfo(prev => ({ ...prev, isLoading: false }));
      }
    };

    if (courseDetail) {
      loadWeatherData();
    }
  }, [courseDetail]);

  // 인터섹션 옵저버 설정
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.2,
    };

    // 관광 명소 카드 관찰
    const spotObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // ID에서 'spot-' 접두사를 제거하고 저장
          const spotId = entry.target.id.replace("spot-", "");
          setVisibleCards((prev) => {
            if (!prev.includes(spotId)) {
              return [...prev, spotId];
            }
            return prev;
          });
        }
      });
    }, observerOptions);

    // 여행 정보 섹션 관찰
    const infoSectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleInfoSection(true);
        }
      });
    }, observerOptions);

    // 여행 팁 섹션 관찰
    const tipsSectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleTipsSection(true);
        }
      });
    }, observerOptions);

    // DOM 요소들에 옵저버 적용
    if (courseDetail && courseDetail.spots) {
      courseDetail.spots.forEach((spot) => {
        const element = document.getElementById(`spot-${spot.contentId}`);
        if (element) spotObserver.observe(element);
      });

      const infoSection = document.getElementById("travel-info-section");
      if (infoSection) infoSectionObserver.observe(infoSection);

      const tipsSection = document.getElementById("travel-tips-section");
      if (tipsSection) tipsSectionObserver.observe(tipsSection);
    }

    return () => {
      spotObserver.disconnect();
      infoSectionObserver.disconnect();
      tipsSectionObserver.disconnect();
    };
  }, [courseDetail]);

  // 카드 호버 효과 핸들러
  const handleCardMouseMove = (e: React.MouseEvent, cardId: string) => {
    if (!cardsRef.current[cardId]) return;

    const $card = cardsRef.current[cardId];
    if (!$card) return;

    // 마우스 위치 계산
    const rect = $card.getBoundingClientRect();
    const l = e.clientX - rect.left;
    const t = e.clientY - rect.top;
    const h = rect.height;
    const w = rect.width;

    const px = Math.abs(Math.floor((100 / w) * l) - 100);
    const py = Math.abs(Math.floor((100 / h) * t) - 100);

    // 그라데이션 위치 계산
    const lp = 50 + (px - 50) / 1.5;
    const tp = 50 + (py - 50) / 1.5;
    const px_spark = 50 + (px - 50) / 7;
    const py_spark = 50 + (py - 50) / 7;
    const p_opc = 20 + Math.abs(50 - px + (50 - py)) * 1.5;
    const ty = ((tp - 50) / 2) * -1;
    const tx = ((lp - 50) / 1.5) * 0.5;

    // CSS 스타일 적용
    const gradPos = `background-position: ${lp}% ${tp}%`;
    const sparkPos = `background-position: ${px_spark}% ${py_spark}%`;
    const opc = `opacity: ${p_opc / 100}`;
    const transform = `transform: rotateX(${ty}deg) rotateY(${tx}deg)`;

    $card.style.cssText = transform;

    // 가상 요소에 적용할 스타일
    const style = `
      .travel-card[data-id="${cardId}"]:before { ${gradPos} }
      .travel-card[data-id="${cardId}"]:after { ${sparkPos} ${opc} }
    `;

    setHoveredCardId(cardId);
    setHoverStyles(style);
  };

  const handleCardMouseLeave = (cardId: string) => {
    if (!cardsRef.current[cardId]) return;

    const $card = cardsRef.current[cardId];
    if (!$card) return;

    $card.style.cssText = "";
    setHoveredCardId(null);
    setHoverStyles("");
  };

  const handleLikeToggle = async () => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('accessToken')) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      if (isLiked) {
        await courseApi.unlikeCourse(courseId);
        setIsLiked(false);
      } else {
        await courseApi.courseLike(String(courseId));
        setIsLiked(true);
      }
    } catch (e) {
      alert('찜하기 처리 중 오류가 발생했습니다.');
    }
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator
        .share({
          title: courseDetail?.title,
          text: `${courseDetail?.title} - 여행 코스`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 클립보드에 복사되었습니다.");
    }
  };

  // CSS 애니메이션 스타일
  const fadeInUpAnimation = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .fade-in-up {
      animation: fadeInUp 0.7s ease forwards;
    }
    
    .delay-1 {
      animation-delay: 0.2s;
    }
    
    .delay-2 {
      animation-delay: 0.4s;
    }
    
    .delay-3 {
      animation-delay: 0.6s;
    }
    
    .delay-4 {
      animation-delay: 0.8s;
    }
    
    .delay-5 {
      animation-delay: 1s;
    }
  `;

  // 로딩 상태
  if (isLoading) {
    return (
      <>
        <NavSection />
        <Flex h="100vh" justify="center" align="center" bg="white">
          <Spinner size="xl" color="pink.400" />
        </Flex>
        <Footer />
      </>
    );
  }

  // 데이터 없음 상태
  if (!courseDetail) {
    return (
      <>
        <NavSection />
        <Box minH="100vh" py={8} bg="white">
          <Container maxW="container.md">
            <Flex direction="column" align="center" justify="center" py={20}>
              <Heading mb={6} color="gray.700">
                여행 코스를 찾을 수 없습니다
              </Heading>
              <Button
                leftIcon={<FaChevronLeft />}
                onClick={() => router.push("/popular-courses")}
                colorScheme="pink"
                borderRadius="md"
              >
                모든 코스 보기
              </Button>
            </Flex>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  // 여행 코스 평점과 리뷰 수 (API에서 제공되지 않으므로 임시 데이터)
  const rating = 4.7;
  const reviewCount = 120;

  const recommendedTimes = weatherInfo.seasonalInfo 
    ? `${weatherInfo.seasonalInfo.months}에 방문 추천` 
    : "오전 10시~오후 2시 방문 추천";

  return (
    <>
      <NavSection />
      <Box backgroundColor="white" minH="100vh" pt="150px">
        {/* 스타일 주입 */}
        <style jsx global>{`
          ${fadeInUpAnimation}

          :root {
            --color1: #ff69b4;
            --color2: #ffb6c1;
          }

          .travel-card {
            width: 280px;
            height: 380px;
            position: relative;
            overflow: hidden;
            margin: 12px;
            z-index: 10;
            touch-action: none;
            border-radius: 16px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            background-color: #f8f9fa;
            background-size: cover;
            background-repeat: no-repeat;
            background-position: 50% 50%;
            transform-origin: center;
            will-change: transform;
          }

          .travel-card:hover {
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          }

          .travel-card:before {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            top: 0;
            background-repeat: no-repeat;
            background-position: 50% 50%;
            background-size: 300% 300%;
            background-image: linear-gradient(
              115deg,
              transparent 0%,
              var(--color1) 25%,
              transparent 47%,
              transparent 53%,
              var(--color2) 75%,
              transparent 100%
            );
            opacity: 0.3;
            z-index: 1;
            transition: opacity 0.3s ease;
          }

          .travel-card:hover:before {
            opacity: 0.5;
          }

          .card-container {
            perspective: 1000px;
          }

          .detail-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(60, 60, 70, 0.85);
            color: white;
            padding: 20px;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            z-index: 3;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
          }

          .travel-card:hover .detail-overlay {
            transform: translateY(0);
          }

          .day-badge {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.9);
            color: #333;
            border-radius: 20px;
            padding: 0;
            font-size: 15px;
            font-weight: bold;
            z-index: 4;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 105, 180, 0.4);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            min-width: unset;
            width: auto;
            line-height: 1;
            height: 24px;
          }

          .day-badge > span {
            margin-top: 0;
            padding: 0 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .time-badge {
            position: absolute;
            top: 10px;
            right: 12px;
            padding: 0px 10px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 4;
            backdrop-filter: blur(2px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            line-height: 1;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .address-text {
            font-size: 13px;
            line-height: 1.5;
            opacity: 0.9;
            margin-bottom: 12px;
            color: #e8e8e8;
            padding-left: 2px;
            display: flex;
            align-items: flex-start;
          }

          .address-text svg {
            margin-right: 5px;
            margin-top: 3px;
            flex-shrink: 0;
          }

          .desc-text {
            font-size: 14px;
            line-height: 1.6;
            font-weight: 400;
            letter-spacing: 0.3px;
            color: #ffffff;
            max-height: 110px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 5;
            -webkit-box-orient: vertical;
            text-overflow: ellipsis;
          }

          .duration-text {
            background: rgba(255, 105, 180, 0.25);
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            margin-top: 10px;
            color: #ffdeeb;
            border: 1px solid rgba(255, 105, 180, 0.3);
          }

          .duration-text svg {
            margin-right: 5px;
          }

          .duration-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background: rgba(255, 182, 193, 0.9);
            color: #333;
            margin-top: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.4);
            width: fit-content;
            position: relative;
            list-style-type: none;
          }

          .duration-badge::before {
            content: none !important;
          }

          .duration-badge svg {
            margin-right: 6px;
          }

          .spot-title {
            font-size: 19px;
            font-weight: 600;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #ffb6c1;
          }

          .course-overview {
            background: #f9f9f9;
            border-radius: 16px;
            padding: 20px 25px;
            margin-bottom: 30px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(255, 105, 180, 0.2);
            position: relative;
          }

          .course-overview:before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(to right, #ff69b4, #ffb6c1);
            border-radius: 16px 16px 0 0;
          }

          .overview-icon {
            position: absolute;
            top: -15px;
            right: 20px;
            background: white;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            border: 2px solid #ffb6c1;
            color: #ff69b4;
          }

          /* 가격표 스타일 카드 */
          .price-card {
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 360px;
          }

          .price-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
          }

          .price-card-header {
            padding: 18px;
            color: white;
            text-align: center;
            flex-shrink: 0;
          }

          .price-card-body {
            padding: 24px;
            background: white;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .price-card-price {
            font-size: 3rem;
            font-weight: 700;
            color: white;
            text-align: center;
            margin-bottom: 10px;
          }

          .price-card-description {
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
            font-size: 0.9rem;
          }

          .price-card-feature {
            display: flex;
            align-items: center;
            margin-bottom: 14px;
          }

          /* 팁 카드 스타일 */
          .tip-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .tip-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
          }

          .tip-card-header {
            padding: 18px;
            background: #ffb3c1;
            color: white;
            text-align: center;
          }

          .tip-card-body {
            padding: 20px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
          }

          .tip-list-item {
            display: flex;
            align-items: flex-start;
            padding: 12px;
            margin-bottom: 10px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 3px solid #ffb3c1;
          }

          .tip-list-item:last-child {
            margin-bottom: 0;
          }
        `}</style>

        <Container maxW={{ base: "95%", md: "container.xl" }} py={8} mt={4}>
          {/* 여행 코스 제목 및 기본 정보 */}
          <Box textAlign="center" color="gray.700" mb={8} mx="auto" maxW="840px" p={3} pt={8}>
            <Heading
              as="h1"
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              fontWeight="800"
              mb={5}
              color="pink.500"
              lineHeight="1.3"
              px={2}
              wordBreak="keep-all"
            >
              {courseDetail.title}
            </Heading>

            {/* 찜하기 버튼 */}
            <Flex justify="center" align="center" mt={2}>
              <IconButton
                aria-label={isLiked ? '찜 해제' : '찜하기'}
                icon={<Icon as={isLiked ? FaHeart : FaRegHeart} color={isLiked ? 'pink.500' : 'gray.500'} />}
                onClick={handleLikeToggle}
                variant="ghost"
                size="lg"
              />
            </Flex>

            <Flex justify="center" align="center" mb={4} wrap="wrap" gap={6}>
              <Flex align="center" bg="pink.50" px={4} py={2} borderRadius="full" boxShadow="sm">
                <Image src="/images/popular/Time.png" alt="시간" boxSize="26px" mr={2} />
                <Text fontWeight="600">{`${Math.ceil(courseDetail.spots.length / 3)}일 코스`}</Text>
              </Flex>

              <Flex align="center" bg="pink.50" px={4} py={2} borderRadius="full" boxShadow="sm">
                <Image src="/images/popular/star.png" alt="별점" boxSize="26px" mr={2} />
                <Text fontWeight="600">
                  {rating} ({reviewCount})
                </Text>
              </Flex>
            </Flex>
          </Box>

          {/* 코스 개요 */}
          <Box className="course-overview" mb={10} mx="auto" maxW="850px">
            <div className="overview-icon">
              <Icon as={FaInfoCircle} boxSize={5} />
            </div>

            <Text
              color="gray.700"
              fontSize={{ base: "md", md: "lg" }}
              lineHeight="1.8"
              letterSpacing="0.2px"
              fontWeight="400"
            >
              {courseDetail.overview}
            </Text>

            <Flex wrap="wrap" justify="center" gap={2} mt={4}>
              {["자연경관", "인생샷", "드라이브", "여행", "힐링"].map((tag) => (
                <Badge key={tag} colorScheme="pink" variant="subtle" px={3} py={1} borderRadius="full">
                  {tag}
                </Badge>
              ))}
            </Flex>
          </Box>

          {/* 홀로그램 카드 섹션 */}
          <Heading as="h2" fontSize="xl" fontWeight="bold" mb={8} color="pink.500" textAlign="center">
            주요 관광 명소
          </Heading>

          <Flex flexWrap="wrap" justify="center" align="stretch" mx="auto" gap={4} mb={12}>
            {courseDetail?.spots.map((spot, index) => {
              const timeSlot = spot.timeSlot || "오전";
              const timeColors = getTimeSlotColor(timeSlot);
              const isVisible = visibleCards.includes(spot.contentId);

              return (
                <Box
                  key={spot.contentId}
                  id={`spot-${spot.contentId}`}
                  className={`card-container fade-in-up ${isVisible ? "visible" : ""}`}
                  position="relative"
                  style={{
                    transitionDelay: `${index * 2}s`,
                  }}
                >
                  <Box
                    ref={(el: HTMLDivElement | null) => {
                      cardsRef.current[spot.contentId] = el;
                    }}
                    className="travel-card"
                    data-id={spot.contentId}
                    position="relative"
                    onMouseMove={(e) => handleCardMouseMove(e, spot.contentId)}
                    onMouseLeave={() => handleCardMouseLeave(spot.contentId)}
                    sx={{
                      backgroundColor: !spot.imageUrl ? '#f5f5f5' : undefined,
                      display: 'flex',
                      alignItems: !spot.imageUrl ? 'center' : undefined,
                      justifyContent: !spot.imageUrl ? 'center' : undefined,
                      overflow: 'hidden',
                    }}
                  >
                    {/* 이미지가 있는 경우 Next.js Image 컴포넌트 사용 */}
                    {spot.imageUrl ? (
                      <Box position="absolute" top="0" left="0" width="100%" height="100%" overflow="hidden">
                        <NextImage
                          src={spot.imageUrl}
                          alt={spot.title || '관광 명소 이미지'}
                          width={800}
                          height={600}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{
                            objectFit: 'cover',
                            objectPosition: 'center',
                            width: '100%',
                            height: '100%',
                            transition: 'transform 0.3s ease',
                          }}
                          quality={100}
                          priority={index < 6}
                        />
                      </Box>
                    ) : (
                      /* 이미지가 없는 경우 적절한 아이콘 표시 */
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        height="100%"
                        width="100%"
                        p={4}
                      >
                        <Icon 
                          as={
                            spot.title?.includes('박물관') || spot.title?.includes('전시관') || spot.title?.includes('기념관') ? 
                              FaLandmark : 
                            spot.title?.includes('공원') || spot.title?.includes('정원') ? 
                              FaTree : 
                            spot.title?.includes('사찰') || spot.title?.includes('절') || spot.title?.includes('성당') ? 
                              FaPrayingHands : 
                            spot.title?.includes('바다') || spot.title?.includes('해변') || spot.title?.includes('해수욕장') ? 
                              FaWater : 
                            spot.title?.includes('산') || spot.title?.includes('봉') ? 
                              FaMountain : 
                            FaMapMarkerAlt
                          } 
                          boxSize={16} 
                          color="pink.400" 
                          mb={4}
                          opacity={0.8}
                        />
                        <Text
                          fontWeight="bold"
                          fontSize="xl"
                          textAlign="center"
                          color="gray.700"
                          wordBreak="keep-all"
                          noOfLines={2}
                        >
                          {spot.title}
                        </Text>
                      </Flex>
                    )}

                    {/* Day 뱃지 */}
                    <Flex className="day-badge">
                      <span>Day {spot.day || Math.floor(index / 3) + 1}</span>
                    </Flex>

                    {/* 시간대 뱃지 */}
                    <Flex className="time-badge" bg={timeColors.bg} color={timeColors.text}>
                      {timeSlot}
                    </Flex>

                    {/* 호버 시 상세 정보 */}
                    <Box className="detail-overlay">
                      <Flex align="center" justify="space-between" mb={2}>
                        <Text className="spot-title" flex="1" mr={2} isTruncated>
                          {spot.title}
                        </Text>
                        <Text
                          color="#FFB6C1"
                          fontSize="14px"
                          fontWeight="500"
                          display="flex"
                          alignItems="center"
                          flexShrink={0}
                        >
                          <Image src="/images/popular/Time.png" alt="소요시간" width="24px" height="24px" mr={2} />
                          {spot.visitDuration || "약 2시간"}
                        </Text>
                      </Flex>

                      <Flex className="address-text">
                        <Image
                          src="/images/popular/map_pin.png"
                          alt="위치"
                          width="22px"
                          height="22px"
                          mr={2}
                          mt="2px"
                        />
                        <Text>{spot.address}</Text>
                      </Flex>

                      <Text className="desc-text">
                        {spot.description.length > 150 ? `${spot.description.substring(0, 140)}...` : spot.description}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Flex>

          {/* 여행 정보 섹션 헤더 */}
          <Box mb={8} id="travel-info-section">
            <Flex align="center" justify="center">
              <Box h="1px" bg="gray.200" flex="1" maxW="300px" />
              <Heading as="h2" fontSize="xl" fontWeight="bold" mx={4} color="pink.500" textAlign="center">
                여행 정보
              </Heading>
              <Box h="1px" bg="gray.200" flex="1" maxW="300px" />
            </Flex>
          </Box>

          {/* 여행 정보 섹션 - 가격표 스타일 */}
          <Box mx="auto" maxW="1300px" mb={5} px={{ base: 4, md: 0 }}>
            <Flex
              flexWrap={{ base: "wrap", lg: "nowrap" }}
              justify="space-evenly"
              align="flex-start"
              mx="auto"
              gap={{ base: 30, lg: 10 }}
              position="relative"
            >
              {/* 교통 정보 카드 */}
              <Box
                className="price-card fade-in-up delay-1"
                width={{ base: "100%", sm: "45%", lg: "19%" }}
                maxWidth={{ base: "260px", lg: "210px" }}
                height="390px"
                flexShrink={0}
                display="flex"
                flexDirection="column"
              >
                <Box 
                  className="price-card-header" 
                  bg="#8dd3c7" 
                  pt={6} 
                  pb={5} 
                  px={3}
                  height="155px"
                >
                  <Heading size="md" mb={4}>
                    교통 정보
                  </Heading>
                  <Box className="price-card-price">
                    <Flex align="center" justify="center">
                      <NextImage 
                        src="/images/popular/cash.png" 
                        alt="비용" 
                        width={64} 
                        height={64} 
                        quality={100}
                        style={{ marginRight: '12px' }}
                      />
                      <Text>
                        {courseDetail.spots.some(spot => spot.address?.includes('섬') || spot.address?.includes('도')) 
                          ? '80,000' 
                          : courseDetail.spots.length > 4 
                            ? (70000).toLocaleString() 
                            : (50000).toLocaleString()}
                      </Text>
                    </Flex>
                  </Box>
                  <Text className="price-card-description">예상 교통비용</Text>
                </Box>

                <Box 
                  className="price-card-body" 
                  p={4} 
                  flex="1" 
                  display="flex" 
                  flexDirection="column"
                  justifyContent="space-between"
                  height="229px"
                >
                  <VStack spacing={5} align="stretch">
                    <Box className="price-card-feature">
                      <Icon as={FaCar} color="#8dd3c7" boxSize={5} mr={3} />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          렌터카
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {courseDetail.overview.includes('증도') ? '대교가 있어 차량 이동 가능' : '주요 관광지 자유롭게 이동'}
                        </Text>
                      </Box>
                    </Box>

                    <Box className="price-card-feature">
                      <Icon as={FaBus} color="#8dd3c7" boxSize={5} mr={3} />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          대중교통
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {courseDetail.spots.some(spot => spot.address?.includes('신안')) ? '버스 + 선박 조합 가능' : '버스 + 택시 이용 가능'}
                        </Text>
                      </Box>
                    </Box>

                    <Box className="price-card-feature">
                      <Icon as={FaPlane} color="#8dd3c7" boxSize={5} mr={3} />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          접근성
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {courseDetail.spots.length > 0 && courseDetail.spots[0].address
                            ? `${courseDetail.spots[0].address.split(' ')[0]} ${courseDetail.spots[0].address.split(' ')[1]} 위치`
                            : '주변 공항/기차역에서 접근'}
                        </Text>
                      </Box>
                    </Box>
                  </VStack>
                </Box>
              </Box>

              {/* 예산 정보 카드 */}
              <Box
                className="price-card fade-in-up delay-2"
                width={{ base: "100%", sm: "45%", lg: "19%" }}
                maxWidth={{ base: "260px", lg: "210px" }}
                height="384px"
                flexShrink={0}
                display="flex"
                flexDirection="column"
              >
                <Box 
                  className="price-card-header" 
                  bg="#80b1d3" 
                  pt={6} 
                  pb={5} 
                  px={3}
                  height="155px"
                >
                  <Heading size="md" mb={4}>
                    예산 정보
                  </Heading>
                  <Box className="price-card-price">
                    <Flex align="center" justify="center">
                      <NextImage 
                        src="/images/popular/cash.png" 
                        alt="비용" 
                        width={64} 
                        height={64} 
                        quality={100}
                        style={{ marginRight: '12px' }}
                      />
                      <Text>
                        {(() => {
                          // 지역 특성에 따른 계수
                          const isExpensiveArea = courseDetail.spots.some(spot => 
                            spot.address?.includes('서울') || 
                            spot.address?.includes('제주') || 
                            courseDetail.title?.includes('제주'));
                          
                          const spotCount = courseDetail.spots.length;
                          const days = Math.ceil(spotCount / 3);
                          
                          // 기본 비용 = 숙박 + 식비 + 교통 + 입장료
                          const baseCost = isExpensiveArea ? 120000 : 80000;
                          const totalCost = baseCost * days * 1.5;
                          
                          return Math.round(totalCost / 10000) * 10000; // 1만원 단위로 반올림
                        })().toLocaleString()}
                      </Text>
                    </Flex>
                  </Box>
                  <Text className="price-card-description">1인 기준 총 비용</Text>
                </Box>

                <Box 
                  className="price-card-body" 
                  p={4} 
                  flex="1" 
                  display="flex" 
                  flexDirection="column"
                  justifyContent="space-between"
                  height="229px"
                >
                  <VStack spacing={5} align="stretch">
                    <Box className="price-card-feature">
                      <Icon as={FaBed} color="#80b1d3" boxSize={5} mr={3} />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          숙박비
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {(() => {
                            const days = Math.ceil(courseDetail.spots.length / 3);
                            const isExpensiveArea = courseDetail.spots.some(spot => 
                              spot.address?.includes('서울') || 
                              spot.address?.includes('제주') || 
                              courseDetail.title?.includes('제주'));
                              
                            const dailyRate = isExpensiveArea ? 120000 : 80000;
                            return `${days}박 평균 ${(days * dailyRate).toLocaleString()}원`;
                          })()}
                        </Text>
                      </Box>
                    </Box>

                    <Box className="price-card-feature">
                      <Icon as={FaUtensils} color="#80b1d3" boxSize={5} mr={3} />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          식비
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {(() => {
                            const days = Math.ceil(courseDetail.spots.length / 3);
                            const isExpensiveArea = courseDetail.spots.some(spot => 
                              spot.address?.includes('서울') || 
                              spot.address?.includes('제주') || 
                              courseDetail.title?.includes('제주'));
                              
                            const mealRate = isExpensiveArea ? 15000 : 12000;
                            const totalMealCost = days * 3 * mealRate; // 하루 3끼 기준
                            return `하루 평균 ${(totalMealCost / days).toLocaleString()}원`;
                          })()}
                        </Text>
                      </Box>
                    </Box>

                    <Box className="price-card-feature">
                      <Icon as={FaTicketAlt} color="#80b1d3" boxSize={5} mr={3} />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          입장료
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {(() => {
                            // 명소별 입장료 계산
                            const avgTicketPrice = courseDetail.spots.some(spot => 
                              spot.title?.includes('박물관') || 
                              spot.title?.includes('미술관') || 
                              spot.title?.includes('테마파크') || 
                              spot.title?.includes('랜드'))
                              ? 15000 
                              : 8000;
                              
                            const totalTickets = Math.min(courseDetail.spots.length, 5); // 최대 5곳 방문 가정
                            return `주요 명소 약 ${(totalTickets * avgTicketPrice).toLocaleString()}원`;
                          })()}
                        </Text>
                      </Box>
                    </Box>
                  </VStack>
                </Box>
              </Box>

              {/* 추천 시기 카드 */}
              <Box
                className="price-card fade-in-up delay-3"
                width={{ base: "100%", sm: "45%", lg: "19%" }}
                maxWidth={{ base: "260px", lg: "210px" }}
                height="384px"
                flexShrink={0}
                display="flex"
                flexDirection="column"
              >
                <Box 
                  className="price-card-header" 
                  bg="#fb8072" 
                  pt={6} 
                  pb={5} 
                  px={3}
                  height="155px"
                >
                  <Heading size="md" mb={4}>
                    추천 시기
                  </Heading>
                  <Box className="price-card-price">
                    <Flex align="center" justify="center">
                      <NextImage 
                        src="/images/popular/Weather.png" 
                        alt="날씨" 
                        width={64} 
                        height={64}
                        quality={100}
                        style={{ marginRight: '12px' }}
                      />
                      <Text>
                        {weatherInfo.seasonalInfo ? weatherInfo.seasonalInfo.bestSeason : 
                         courseDetail.overview.includes('해변') || courseDetail.overview.includes('바다') 
                         ? '여름' : '봄/가을'}
                      </Text>
                    </Flex>
                  </Box>
                  <Text className="price-card-description">
                    {weatherInfo.seasonalInfo ? weatherInfo.seasonalInfo.months : 
                     courseDetail.overview.includes('해변') || courseDetail.overview.includes('바다') 
                     ? '6-8월 추천' : '3-5월, 9-10월 추천'}
                  </Text>
                </Box>

                <Box 
                  className="price-card-body" 
                  p={4} 
                  flex="1" 
                  display="flex" 
                  flexDirection="column"
                  justifyContent="space-between"
                  height="229px"
                >
                  <VStack spacing={5} align="stretch">
                    <Box className="price-card-feature">
                      <Icon as={FaCloudSun} color="#fb8072" boxSize={5} mr={3} />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          최적 날씨
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {weatherInfo.seasonalInfo ? weatherInfo.seasonalInfo.conditions :
                           courseDetail.overview.includes('눈') ? '겨울 설경' : 
                           courseDetail.overview.includes('해변') ? '여름 바다' : '맑은 날씨, 쾌적한 기온'}
                        </Text>
                      </Box>
                    </Box>

                    <Box className="price-card-feature">
                      <Icon as={FaUmbrella} color="#fb8072" boxSize={5} mr={3} />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm">
                          대비 사항
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {weatherInfo.seasonalInfo ? weatherInfo.seasonalInfo.preparation :
                           courseDetail.overview.includes('등산') ? '등산복, 등산화 준비' : 
                           courseDetail.overview.includes('해변') ? '자외선 차단제, 물놀이용품' : '방수 의류와 우산 준비'}
                        </Text>
                      </Box>
                    </Box>

                    {weatherInfo.forecast.length > 0 ? (
                      <Box className="price-card-feature">
                        <Icon as={FaCalendarAlt} color="#fb8072" boxSize={5} mr={3} />
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">
                            {courseDetail.spots[0]?.address.split(' ')[0]} 현재 날씨
                          </Text>
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {`${weatherInfo.forecast[0].sky}, ${weatherInfo.forecast[0].tmp}°C (강수확률 ${weatherInfo.forecast[0].pop}%, 습도 ${weatherInfo.forecast[0].reh}%)`}
                          </Text>
                        </Box>
                      </Box>
                    ) : (
                      <Box className="price-card-feature">
                        <Icon as={FaCalendarAlt} color="#fb8072" boxSize={5} mr={3} />
                        <Box>
                          <Text fontWeight="bold" fontSize="sm">
                            방문 기간
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            최소 {Math.max(1, Math.ceil(courseDetail.spots.length / 3))}박 {Math.max(2, Math.ceil(courseDetail.spots.length / 3) + 1)}일 권장
                          </Text>
                        </Box>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </Box>

              {/* 알아두면 좋은 팁 카드 */}
              <Box
                className="price-card fade-in-up delay-4"
                width={{ base: "100%", sm: "45%", lg: "19%" }}
                maxWidth={{ base: "260px", lg: "210px" }}
                height="384px"
                flexShrink={0}
                display="flex"
                flexDirection="column"
              >
                <Box 
                  className="price-card-header" 
                  bg="#ffb3c1" 
                  pt={6} 
                  pb={5} 
                  px={3}
                  height="155px"
                >
                  <Heading size="md" mb={4}>
                    알아두면 좋은 팁
                  </Heading>
                  <Box className="price-card-price">
                    <Flex justify="center">
                      <NextImage 
                        src="/images/popular/info.png" 
                        alt="정보" 
                        width={64} 
                        height={64}
                        quality={100}
                      />
                    </Flex>
                  </Box>
                  <Text className="price-card-description">여행의 편의를 위한 정보</Text>
                </Box>

                <Box 
                  className="price-card-body" 
                  p={4} 
                  flex="1" 
                  display="flex" 
                  flexDirection="column"
                  justifyContent="space-between"
                  height="229px"
                >
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" mb={1}>방문 일정</Text>
                      <Text fontSize="xs" color="gray.600" ml={2}>• {recommendedTimes}</Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" mb={1}>추천 코스</Text>
                      <Text fontSize="xs" color="gray.600" ml={2}>• {courseDetail.spots.length > 1 ? 
                        `${courseDetail.spots[0].title} → ${courseDetail.spots.length > 2 ? 
                        courseDetail.spots[1].title : ''} 등` : 
                        '주요 관광지 순서대로 방문'}</Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" mb={1}>여행 준비물</Text>
                      <Text fontSize="xs" color="gray.600" ml={2}>• {weatherInfo.seasonalInfo 
                          ? weatherInfo.seasonalInfo.preparation 
                          : courseDetail.overview.includes('해변') 
                            ? '등산화, 편한 옷, 무릎, 물, 스틱' 
                            : '편안한 신발, 모자, 물, 카메라'}</Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" mb={1}>현지 즐기기</Text>
                      <Text fontSize="xs" color="gray.600" ml={2}>• {courseDetail.spots.length > 0 && courseDetail.spots[0].address ? 
                        `${courseDetail.spots[0].address.split(' ')[1] || ''} 지역 특산물 맛보기` : 
                        '현지 음식 맛보기'}</Text>
                    </Box>
                  </VStack>
                </Box>
              </Box>
            </Flex>

            {/* 추천 코스 목록으로 버튼 */}
            <Box textAlign="center" mt={10} mb={5} className="fade-in-up delay-5">
              <Link href="/popular-courses">
                <Button
                  bg="#F472B6" /* Airbnb Rausch Pink */
                  color="white"
                  size="lg"
                  px={8}
                  py={6}
                  fontWeight="600"
                  fontSize="md"
                  leftIcon={<FaChevronLeft />}
                  boxShadow="0 4px 14px rgba(255, 90, 95, 0.35)"
                  transition="all 0.3s ease"
                  border="none"
                  borderRadius="10px"
                  _hover={{
                    bg: "#FF7478" /* 살짝 밝은 핑크 */,
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 18px rgba(255, 90, 95, 0.45)",
                    border: "none",
                  }}
                  _active={{
                    bg: "#E04852",
                    transform: "translateY(0)",
                    boxShadow: "0 2px 6px rgba(255, 90, 95, 0.45)",
                    border: "none",
                  }}
                  h="auto"
                >
                  추천 코스 목록으로
                </Button>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
