"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBed,
  FaUtensils,
  FaWalking,
  FaHeart,
  FaRegHeart,
  FaEdit,
  FaShareAlt,
  FaTrash,
  FaCoffee,
  FaMoon,
  FaSun,
  FaChevronLeft,
  FaChevronRight,
  FaRoute,
  FaCog,
  FaCar,
  FaBus,
} from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Layout from "../../../components/Layout";
import { getCityImage } from "@/utils/imageUtils";
import { getAllRoutes, AllRouteInfo } from "@/utils/kakaoMapUtils";
import RouteInfo from "@/components/RouteInfo";
import DepartureModal from "@/components/DepartureModal";

interface TravelPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  travelStyle: string;
  image?: string;
  recommendations?: {
    schedule: Record<
      string,
      {
        date?: string;
        spots: Array<{
          id: string;
          title?: string;
          name?: string;
          addr1?: string;
          addr2?: string;
          address?: string;
          category_name?: string;
          image?: string;
          description?: string;
        }>;
        accommodation?: {
          name: string;
          addr1: string;
          addr2?: string;
        };
      }
    >;
    overview?: string;
  };
  departurePoint?: string; // 사용자 출발지
}

// 날짜 포맷 함수
const formatDateKorean = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 날짜 차이 계산 함수
const getDaysDifference = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

// 장소에 맞는 From/To 멘트 생성 함수
const getFromToMessages = (spot: any, index: number) => {
  const category = spot.category_name?.toLowerCase() || "";
  const title = (spot.title || spot.name || "").substring(0, 10); // 이름이 너무 길면 자르기

  // 카테고리에 따른 다양한 메시지
  let fromMessages = ["설레는 시작", "여행의 발걸음", "호기심 가득", "새로운 발견", "기대감 충만"];

  let toMessages = ["특별한 경험", "행복한 순간", "추억 만들기", "완벽한 시간", "멋진 발견"];

  // 카테고리별 특화 메시지
  if (category.includes("식당") || category.includes("음식") || category.includes("카페")) {
    fromMessages = ["출출한 발걸음", "미각의 여정", "식도락 탐험", "맛의 기대감", "허기진 여행자"];
    toMessages = ["맛의 천국", "미식의 즐거움", "행복한 한 끼", "맛있는 경험", "식도락의 기쁨"];
  } else if (
    category.includes("관광") ||
    category.includes("명소") ||
    category.includes("문화") ||
    category.includes("박물관")
  ) {
    fromMessages = ["호기심 가득", "문화 탐험", "지식의 갈증", "역사의 문턱", "새로운 시각"];
    toMessages = ["지식의 확장", "문화적 충만", "시야의 확대", "감동의 순간", "역사의 숨결"];
  } else if (
    category.includes("자연") ||
    category.includes("공원") ||
    category.includes("바다") ||
    category.includes("산")
  ) {
    fromMessages = ["도시의 한계", "일상의 피로", "자연의 부름", "휴식의 갈망", "맑은 공기 찾아"];
    toMessages = ["자연의 품", "위로의 풍경", "마음의 휴식", "치유의 시간", "풍경의 감동"];
  }

  // 숙소용 특별 메시지
  if (category.includes("숙소") || category.includes("호텔")) {
    fromMessages = ["하루의 피로", "여행의 걸음", "휴식이 필요한", "지친 발걸음", "망중한을 찾아"];
    toMessages = ["편안한 안식처", "완벽한 휴식", "달콤한 꿈나라", "재충전의 시간", "아늑한 공간"];
  }

  // 인덱스를 활용한 의사 랜덤 메시지 선택
  const fromIdx = (index * 3 + title.length) % fromMessages.length;
  const toIdx = (index * 7 + title.length * 2) % toMessages.length;

  return {
    from: fromMessages[fromIdx],
    to: toMessages[toIdx],
  };
};

// 여행객을 위한 다양한 행복 메시지 랜덤 선택 함수
const getRandomHappyMessage = () => {
  const messages = [
    "너의행복",
    "설렘가득",
    "좋은여행",
    "행복한날",
    "멋진경험",
    "여행의묘미",
    "즐거운시간",
    "특별한순간",
    "아름다운기억",
    "행복한여정",
    "좋은날들",
    "소중한추억",
    "특별한날",
    "마음의쉼표",
    "기분좋은날",
    "완벽한날",
    "여행의발견",
    "좋은날씨",
    "행복한시간",
    "최고의순간",
  ];

  // 실제 랜덤으로 메시지 선택
  return messages[Math.floor(Math.random() * messages.length)];
};

export default function TravelPlanDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string>("1");
  const [isFavorite, setIsFavorite] = useState(false);
  const [colorMode, setColorMode] = useState<"light" | "dark" | "neutral">("light");
  const [currentSpotIndex, setCurrentSpotIndex] = useState(0);
  const ticketRef = useRef<HTMLDivElement>(null);

  // 경로 계산 관련 상태
  const [departurePoint, setDeparturePoint] = useState<string>("");
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [routeInfo, setRouteInfo] = useState<AllRouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [spotRoutes, setSpotRoutes] = useState<Record<string, Record<string, AllRouteInfo>>>({});

  // 현재 사용 중인 출발지 (두 번째 이상 코스에서 변경될 수 있음)
  const [currentDeparturePoint, setCurrentDeparturePoint] = useState<string>("");

  // 모달 관련 상태
  const [isDepartureModalOpen, setIsDepartureModalOpen] = useState(false);

  // 일정 데이터 키 생성 함수
  const getScheduleKey = (day: string) => {
    if (plan?.recommendations?.schedule && Object.keys(plan.recommendations.schedule)[0]?.includes("day_")) {
      return `day_${day}`;
    }
    return day;
  };

  // 현재 일정 데이터
  const scheduleKey = plan ? getScheduleKey(activeDay) : "";
  const currentDaySchedule = plan?.recommendations?.schedule?.[scheduleKey];
  const spotsList = currentDaySchedule?.spots || [];
  const accommodation = currentDaySchedule?.accommodation;

  // 현재 선택된 장소
  const currentSpot = spotsList[currentSpotIndex];

  // 이전 장소 (경로 계산용)
  const previousSpot = currentSpotIndex > 0 ? spotsList[currentSpotIndex - 1] : null;

  // 카테고리별 아이콘
  const getCategoryIcon = (category?: string) => {
    if (!category) return <FaMapMarkerAlt size={24} className="text-rose-500" />;

    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("식당") || lowerCategory.includes("음식")) {
      return <FaUtensils size={24} className="text-orange-500" />;
    } else if (lowerCategory.includes("카페") || lowerCategory.includes("커피")) {
      return <FaCoffee size={24} className="text-amber-700" />;
    } else if (lowerCategory.includes("숙소") || category.includes("호텔")) {
      return <FaBed size={24} className="text-blue-500" />;
    }

    return <FaWalking size={24} className="text-teal-500" />;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPlans = localStorage.getItem("travelPlans");
        if (savedPlans) {
          const plans = JSON.parse(savedPlans);
          const currentPlan = plans.find((p: TravelPlan) => p.id === id);

          if (currentPlan) {
            setPlan(currentPlan);
            // 저장된 출발지 불러오기
            if (currentPlan.departurePoint) {
              setDeparturePoint(currentPlan.departurePoint);
              setCurrentDeparturePoint(currentPlan.departurePoint);
            }

            if (currentPlan.recommendations?.schedule) {
              const scheduleKeys = Object.keys(currentPlan.recommendations.schedule);
              if (scheduleKeys.length > 0) {
                const firstDayKey = scheduleKeys[0].includes("day_")
                  ? scheduleKeys[0].replace("day_", "")
                  : scheduleKeys[0];
                setActiveDay(firstDayKey);
              }
            }
          }
        }
      } catch (error) {
        console.error("여행 계획 로드 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);

  // 출발지 변경 시 저장
  const saveDeparturePoint = (newDeparture: string) => {
    if (!newDeparture.trim() || !plan) return;

    try {
      const savedPlans = localStorage.getItem("travelPlans");
      if (savedPlans) {
        const plans = JSON.parse(savedPlans);
        const updatedPlans = plans.map((p: TravelPlan) => {
          if (p.id === id) {
            return { ...p, departurePoint: newDeparture };
          }
          return p;
        });

        localStorage.setItem("travelPlans", JSON.stringify(updatedPlans));
        // 상태 업데이트
        setDeparturePoint(newDeparture);
        setPlan({ ...plan, departurePoint: newDeparture });

        // 현재 코스가 첫번째 코스일 경우
        if (currentSpotIndex === 0 && spotsList.length > 0) {
          // 기존 경로 정보 삭제
          const firstSpot = spotsList[0];
          const spotId = getSpotId(firstSpot, 0);
          const newSpotRoutes = { ...spotRoutes };
          if (newSpotRoutes[activeDay] && newSpotRoutes[activeDay][spotId]) {
            delete newSpotRoutes[activeDay][spotId];
            setSpotRoutes(newSpotRoutes);
          }

          // 현재 사용 중인 출발지 업데이트
          setCurrentDeparturePoint(newDeparture);

          // 상태 업데이트 후 경로 계산이 실행되도록 setTimeout 사용
          setTimeout(() => {
            const destination = firstSpot.addr1 || firstSpot.address || "";
            calculateRouteBetween(newDeparture, destination, spotId, true); // 강제 재계산 플래그
          }, 100);
        }
        // 현재 코스가 두번째 이상인 경우
        else if (currentSpotIndex > 0 && spotsList.length > 0) {
          // 기존 경로 정보 삭제
          const currentSpot = spotsList[currentSpotIndex];
          const spotId = getSpotId(currentSpot, currentSpotIndex);
          const newSpotRoutes = { ...spotRoutes };
          if (newSpotRoutes[activeDay] && newSpotRoutes[activeDay][spotId]) {
            delete newSpotRoutes[activeDay][spotId];
            setSpotRoutes(newSpotRoutes);
          }

          // 현재 사용 중인 출발지 업데이트
          setCurrentDeparturePoint(newDeparture);

          setTimeout(() => {
            const destination = currentSpot.addr1 || currentSpot.address || "";
            calculateRouteBetween(newDeparture, destination, spotId, true); // 강제 재계산 플래그
          }, 100);
        }
      }
    } catch (error) {
      console.error("출발지 저장 중 오류 발생:", error);
    }
  };

  // 두 지점 간 경로 계산 (범용 함수)
  const calculateRouteBetween = async (
    origin: string,
    destination: string,
    spotId: string,
    forceRecalculate: boolean = false
  ) => {
    if (!origin || !destination) {
      return;
    }

    setIsCalculatingRoute(true);
    setRouteError(null);

    try {
      // 이미 계산된 경로가 있는지 확인 (강제 재계산 플래그가 아닐 때만)
      if (!forceRecalculate && spotRoutes[activeDay]?.[spotId]) {
        setRouteInfo(spotRoutes[activeDay][spotId]);
        setShowRouteInfo(true);
        return;
      }

      // 경로 계산
      const result = await getAllRoutes(origin, destination);

      // 결과 저장
      const newSpotRoutes = { ...spotRoutes };
      if (!newSpotRoutes[activeDay]) {
        newSpotRoutes[activeDay] = {};
      }
      newSpotRoutes[activeDay][spotId] = result;
      setSpotRoutes(newSpotRoutes);

      setRouteInfo(result);
      setShowRouteInfo(true);
    } catch (error) {
      console.error("경로 계산 오류:", error);
      setRouteError(error instanceof Error ? error.message : "경로 계산 중 오류가 발생했습니다.");
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // 장소의 고유 식별자 생성 (ID가 없는 경우 인덱스 기반으로 생성)
  const getSpotId = (spot: any, index: number): string => {
    // 이미 ID가 있으면 사용
    if (spot.id) return spot.id;

    // 주소 정보를 기반으로 유니크 ID 생성
    const address = spot.addr1 || spot.address || "";
    const title = spot.title || spot.name || "";

    // 일차_인덱스_주소해시 형태로 ID 생성
    return `day${activeDay}_spot${index}_${encodeURIComponent(title).substring(0, 10)}`;
  };

  // 장소 변경 시 경로 정보 업데이트 (통합 처리)
  useEffect(() => {
    if (!spotsList || spotsList.length === 0) {
      setShowRouteInfo(false);
      setRouteInfo(null);
      return;
    }

    const currentSpot = spotsList[currentSpotIndex];
    if (!currentSpot) {
      setShowRouteInfo(false);
      setRouteInfo(null);
      return;
    }

    // 장소 고유 ID 생성
    const spotId = getSpotId(currentSpot, currentSpotIndex);

    // 저장된 경로 정보가 있는지 확인
    if (spotRoutes[activeDay]?.[spotId]) {
      setRouteInfo(spotRoutes[activeDay][spotId]);
      setShowRouteInfo(true);
      return;
    }

    // 첫 번째 장소 (출발지 → 첫번째 장소)
    if (currentSpotIndex === 0) {
      if (departurePoint) {
        const destination = currentSpot.addr1 || currentSpot.address || "";
        calculateRouteBetween(departurePoint, destination, spotId);
      } else {
        setShowRouteInfo(false);
        setRouteInfo(null);
      }
    }
    // 두 번째 이후 장소 (이전 장소 → 현재 장소)
    else if (currentSpotIndex > 0) {
      const previousSpot = spotsList[currentSpotIndex - 1];
      if (previousSpot) {
        const origin = previousSpot.addr1 || previousSpot.address || "";
        const destination = currentSpot.addr1 || currentSpot.address || "";
        calculateRouteBetween(origin, destination, spotId);
      }
    }
  }, [currentSpotIndex, activeDay, spotsList]);

  // 일차 변경 시 루트 정보 초기화
  useEffect(() => {
    setShowRouteInfo(false);
    setRouteInfo(null);
    setCurrentSpotIndex(0); // 일차 변경 시 첫번째 장소로 리셋
  }, [activeDay]);

  // 다음 또는 이전 카드로 이동하는 함수
  const goToNextSpot = () => {
    if (spotsList && currentSpotIndex < spotsList.length - 1) {
      const nextIndex = currentSpotIndex + 1;
      setCurrentSpotIndex(nextIndex);

      // 다음 장소 경로 정보 업데이트
      if (nextIndex < spotsList.length) {
        const nextSpot = spotsList[nextIndex];
        const spotId = getSpotId(nextSpot, nextIndex);

        // 저장된 경로 정보가 있으면 사용
        if (spotRoutes[activeDay]?.[spotId]) {
          setRouteInfo(spotRoutes[activeDay][spotId]);
          setShowRouteInfo(true);
        }
      }
    }
  };

  const goToPrevSpot = () => {
    if (currentSpotIndex > 0) {
      const prevIndex = currentSpotIndex - 1;
      setCurrentSpotIndex(prevIndex);

      // 이전 장소 경로 정보 업데이트
      if (prevIndex >= 0) {
        const prevSpot = spotsList[prevIndex];
        const spotId = getSpotId(prevSpot, prevIndex);

        // 저장된 경로 정보가 있으면 사용
        if (spotRoutes[activeDay]?.[spotId]) {
          setRouteInfo(spotRoutes[activeDay][spotId]);
          setShowRouteInfo(true);
        }
      }
    }
  };

  // 일차 변경 시 현재 스팟 인덱스 초기화
  useEffect(() => {
    setCurrentSpotIndex(0);
  }, [activeDay]);

  // 티켓 3D 회전 효과
  useEffect(() => {
    const ticketElm = ticketRef.current;
    if (!ticketElm) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { x, y, width, height } = ticketElm.getBoundingClientRect();
      const centerPoint = { x: x + width / 2, y: y + height / 2 };

      const degreeX = (e.clientY - centerPoint.y) * 0.008;
      const degreeY = (e.clientX - centerPoint.x) * -0.008;

      ticketElm.style.transform = `perspective(1000px) rotateX(${degreeX}deg) rotateY(${degreeY}deg)`;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [ticketRef.current, currentSpotIndex]);

  // 메시지 가져오기
  const messages =
    spotsList.length > 0
      ? getFromToMessages(spotsList[currentSpotIndex], currentSpotIndex)
      : { from: "여행의 시작", to: "특별한 경험" };

  if (isLoading) {
    return (
      <Layout>
        <div
          className={`py-6 ${
            colorMode === "dark" ? "bg-gray-900" : colorMode === "neutral" ? "bg-[#f0f4f8] text-[#334155]" : "bg-white"
          } min-h-screen`}
        >
          <div className={`py-6 ${colorMode === "dark" ? "bg-gray-900" : "bg-white"} min-h-screen`}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="animate-pulse space-y-8">
                <div className={`h-64 w-full ${colorMode === "dark" ? "bg-gray-800" : "bg-gray-200"} rounded-xl`}></div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex-shrink-0 w-[600px] h-72 ${
                        colorMode === "dark" ? "bg-gray-800" : "bg-gray-200"
                      } rounded-xl`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout>
        <div className="py-10 bg-white min-h-screen">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="py-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">여행 계획을 찾을 수 없습니다</h1>
              <p className="text-gray-500 mb-8">요청하신 여행 계획이 존재하지 않거나 삭제되었습니다.</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors"
              >
                여행 계획 목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 여행 일수 계산
  const totalDays = getDaysDifference(plan.startDate, plan.endDate);

  // 그리고 버튼 스타일을 다음과 같이 변경
  const buttonStyle =
    colorMode === "dark"
      ? "bg-[#e7d155] text-black hover:bg-[#f0e080]" // 다크모드
      : colorMode === "neutral"
      ? "bg-[#8b5cf6] text-white hover:bg-[#7c3aed]" // 네츄럴모드
      : "bg-[#3b82f6] text-white hover:bg-[#2563eb]"; // 라이트모드

  // 여기에 함수 정의 - 컴포넌트 안에 위치
  const getButtonStyle = (isPrimary = false) => {
    if (isPrimary) {
      switch (colorMode) {
        case "dark":
          return "bg-blue-600 hover:bg-blue-700 text-white";
        case "neutral":
          return "bg-[#7c3aed] hover:bg-[#6d28d9] text-white";
        default:
          return "bg-blue-500 hover:bg-blue-600 text-white";
      }
    } else {
      switch (colorMode) {
        case "dark":
          return "bg-gray-700 hover:bg-gray-600 text-gray-300";
        case "neutral":
          return "bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#475569]";
        default:
          return "bg-gray-100 hover:bg-gray-200 text-gray-700";
      }
    }
  };

  const getSlideButtonStyle = () => {
    if (colorMode === "dark") {
      return "bg-yellow-400 text-black hover:bg-yellow-300"; // 다크모드
    }

    return "bg-blue-500 text-white hover:bg-blue-400"; // 라이트모드
  };

  const getIndicatorStyle = (isActive = false) => {
    if (isActive) {
      switch (colorMode) {
        case "dark":
          return "bg-yellow-400";
        case "neutral":
          return "bg-teal-500";
        default:
          return "bg-blue-500";
      }
    } else {
      switch (colorMode) {
        case "dark":
          return "bg-gray-600";
        case "neutral":
          return "bg-gray-400";
        default:
          return "bg-gray-300";
      }
    }
  };

  const getIconWrapperStyle = () => {
    switch (colorMode) {
      case "dark":
        return "bg-gray-800";
      case "neutral":
        return "bg-gray-300";
      default:
        return "bg-gray-100";
    }
  };

  const getBorderStyle = () => {
    switch (colorMode) {
      case "dark":
        return "border-gray-700";
      case "neutral":
        return "border-gray-400";
      default:
        return "border-gray-300";
    }
  };

  // 컬러모드에 따른 입력 스타일
  const getInputStyle = () => {
    switch (colorMode) {
      case "dark":
        return "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500";
      case "neutral":
        return "bg-[#f1f5f9] border-[#cbd5e1] text-[#334155] focus:border-[#7c3aed]";
      default:
        return "bg-white border-gray-300 text-gray-900 focus:border-blue-500";
    }
  };

  return (
    <Layout>
      <div
        className={`${
          colorMode === "dark"
            ? "bg-black text-white"
            : colorMode === "neutral"
            ? "bg-[#f0f4f8] text-[#334155]"
            : "bg-white text-gray-800"
        } min-h-screen`}
      >
        {/* 상단 내비게이션 */}
        <div
          className={`sticky top-0 z-10 ${
            colorMode === "dark" ? "bg-black" : colorMode === "neutral" ? "bg-[#f0f4f8]" : "bg-white"
          } shadow-sm`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard")}
              className={`flex items-center text-base ${
                colorMode === "dark"
                  ? "text-gray-300 hover:text-white"
                  : colorMode === "neutral"
                  ? "text-slate-700 hover:text-slate-900"
                  : "text-gray-600 hover:text-gray-900"
              } transition-opacity`}
            >
              <FaArrowLeft className="mr-2" />
              <span>여행 계획 목록</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setColorMode(colorMode === "dark" ? "light" : colorMode === "neutral" ? "dark" : "neutral")
                }
                className={`p-2 rounded-full ${
                  colorMode === "dark"
                    ? "hover:bg-gray-700"
                    : colorMode === "neutral"
                    ? "hover:bg-slate-200"
                    : "hover:bg-gray-100"
                } transition-colors border-0`}
                aria-label="모드 변경"
              >
                {colorMode === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full ${
                  colorMode === "dark"
                    ? "hover:bg-gray-700"
                    : colorMode === "neutral"
                    ? "hover:bg-slate-200"
                    : "hover:bg-gray-100"
                } transition-colors border-0`}
                aria-label="좋아요"
              >
                {isFavorite ? (
                  <FaHeart size={16} className="text-rose-500" />
                ) : (
                  <FaRegHeart
                    size={16}
                    className={`${
                      colorMode === "dark"
                        ? "text-gray-400"
                        : colorMode === "neutral"
                        ? "text-slate-600"
                        : "text-gray-500"
                    }`}
                  />
                )}
              </button>
              <button
                onClick={() => router.push(`/travel/edit/${id}`)}
                className={`p-2 rounded-full ${
                  colorMode === "dark"
                    ? "hover:bg-gray-700"
                    : colorMode === "neutral"
                    ? "hover:bg-slate-200"
                    : "hover:bg-gray-100"
                } transition-colors border-0`}
                aria-label="수정"
              >
                <FaEdit
                  size={16}
                  className={`${
                    colorMode === "dark"
                      ? "text-gray-400"
                      : colorMode === "neutral"
                      ? "text-slate-600"
                      : "text-gray-500"
                  }`}
                />
              </button>
              <button
                className={`p-2 rounded-full ${
                  colorMode === "dark"
                    ? "hover:bg-gray-700"
                    : colorMode === "neutral"
                    ? "hover:bg-slate-200"
                    : "hover:bg-gray-100"
                } transition-colors border-0`}
                aria-label="공유"
              >
                <FaShareAlt
                  size={16}
                  className={`${
                    colorMode === "dark"
                      ? "text-gray-400"
                      : colorMode === "neutral"
                      ? "text-slate-600"
                      : "text-gray-500"
                  }`}
                />
              </button>
              <button
                onClick={() => {
                  if (confirm("이 여행 계획을 삭제하시겠습니까?")) {
                    const savedPlans = localStorage.getItem("travelPlans");
                    if (savedPlans) {
                      localStorage.setItem(
                        "travelPlans",
                        JSON.stringify(JSON.parse(savedPlans).filter((p: any) => p.id !== id))
                      );
                      router.push("/dashboard");
                    }
                  }
                }}
                className={`p-2 rounded-full ${
                  colorMode === "dark"
                    ? "hover:bg-gray-700"
                    : colorMode === "neutral"
                    ? "hover:bg-slate-200"
                    : "hover:bg-gray-100"
                } transition-colors border-0`}
                aria-label="삭제"
              >
                <FaTrash
                  size={16}
                  className={`${
                    colorMode === "dark"
                      ? "text-gray-400"
                      : colorMode === "neutral"
                      ? "text-slate-600"
                      : "text-gray-500"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 헤더 섹션 */}
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4">
            {/* 타이틀과 태그 */}
            <div className="flex flex-wrap items-center justify-between mb-2">
              <h1
                className={`text-3xl font-bold ${
                  colorMode === "dark" ? "text-white" : colorMode === "neutral" ? "text-slate-900" : "text-gray-900"
                }`}
              >
                {plan.destination}
              </h1>
              <span className="px-3 py-1 bg-[#d25778] text-white rounded-full text-sm font-medium ml-2">
                {plan.travelStyle || "nature"}
              </span>
            </div>

            {/* 날짜 정보 */}
            <div
              className={`flex items-center text-base ${
                colorMode === "dark" ? "text-gray-300" : colorMode === "neutral" ? "text-slate-600" : "text-gray-600"
              }`}
            >
              <FaCalendarAlt className="mr-2 text-[#56a8c6]" />
              <span>
                {formatDateKorean(plan.startDate)} - {formatDateKorean(plan.endDate)}
              </span>
            </div>

            {/* 일자 선택 탭 */}
            <div className="flex mt-4 gap-2 overflow-x-auto pb-2">
              {Array.from({ length: totalDays }, (_, i) => {
                const dayKey = (i + 1).toString();
                // Determine button style based on colorMode and active state
                let dayButtonStyle = "";
                if (activeDay === dayKey) {
                  dayButtonStyle = "bg-[#d25778] text-white"; // Active style
                } else {
                  switch (colorMode) {
                    case "dark":
                      dayButtonStyle = "bg-gray-700 text-white hover:bg-gray-600";
                      break;
                    case "neutral":
                      dayButtonStyle = "bg-[#cbd5e1] text-[#334155] hover:bg-[#94a3b8]";
                      break;
                    default:
                      dayButtonStyle = "bg-gray-200 text-gray-800 hover:bg-gray-300"; // Light mode
                  }
                }
                return (
                  <button
                    key={dayKey}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all border-0 outline-none ${dayButtonStyle}`}
                    onClick={() => setActiveDay(dayKey)}
                  >
                    {i + 1}일차
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* 일정 섹션 */}
          <div className="mb-8">
            <h2
              className={`text-2xl font-bold mb-6 ${
                colorMode === "dark" ? "text-white" : colorMode === "neutral" ? "text-slate-900" : "text-gray-900"
              }`}
            >
              일정
            </h2>

            {/* 출발지 설정/변경 버튼 (모든 코스에 표시) */}
            {spotsList.length > 0 && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => {
                    setIsDepartureModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-lg text-base font-medium bg-[#FEE500] text-black hover:bg-[#F6D800] border-0 outline-none flex items-center justify-center gap-2 shadow-md transition-colors"
                  type="button"
                >
                  <FaMapMarkerAlt className="text-[#000000]" />
                  <span className="flex items-center">
                    {currentSpotIndex === 0 ? "출발지 설정" : "출발지 변경"}
                    <span className="ml-1 text-xs font-normal opacity-75">by Kakao</span>
                  </span>
                </button>
              </div>
            )}

            {/* 티켓 디자인 슬라이더 */}
            <div className="relative">
              {spotsList.length > 0 ? (
                <div className="relative">
                  {/* 현재 활성화된 카드만 보여줌 */}
                  <div className="flex items-center justify-center w-full">
                    {/* 티켓 카드 */}
                    <div
                      ref={ticketRef}
                      className="w-[650px] h-[340px] relative transition-all duration-300 rounded-[20px] p-[5px] my-[40px] overflow-hidden"
                      style={{
                        background: "linear-gradient(to right, #d25778, #ec585c, #e7d155, #56a8c6)",
                      }}
                    >
                      <div
                        className={`w-full h-full relative ${
                          colorMode === "dark" ? "bg-black" : "bg-white"
                        } rounded-[15px] flex flex-col`}
                      >
                        {/* 상단 영역: 장소 정보 */}
                        <div className="flex-1 flex pt-[30px] px-[10px] overflow-hidden">
                          {/* 왼쪽 티켓 섹션 */}
                          <div className="w-[70%] pl-[35px] pr-[10px] flex flex-col min-h-0">
                            {/* 상단: 장소명 및 주소 */}
                            <div className="flex items-start mb-3">
                              <div
                                className={`w-[60px] h-[60px] rounded-full ${
                                  colorMode === "dark" ? "bg-[#333]" : "bg-gray-100"
                                } flex items-center justify-center mr-4 flex-shrink-0`}
                              >
                                <FaMapMarkerAlt size={28} className="text-[#56a8c6]" />
                              </div>
                              <div className="min-w-0 overflow-hidden">
                                <h3
                                  className={`text-[28px] font-bold ${
                                    colorMode === "dark" ? "text-white" : "text-gray-900"
                                  } leading-tight truncate`}
                                >
                                  {spotsList[currentSpotIndex].title || spotsList[currentSpotIndex].name}
                                </h3>
                                <p
                                  className={`${
                                    colorMode === "dark" ? "text-gray-400" : "text-gray-600"
                                  } text-sm flex items-center mt-1 truncate`}
                                >
                                  <FaMapMarkerAlt className="mr-1 flex-shrink-0" size={12} />
                                  <span className="truncate">
                                    {spotsList[currentSpotIndex].addr1 ||
                                      spotsList[currentSpotIndex].address ||
                                      "여행지"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* 정보 섹션 전체 재구성 */}
                            <div className="mt-2 mb-12">
                              {/* 일차와 코스 정보 - 한 줄에 배치 */}
                              <div className="flex items-center mb-3">
                                <p
                                  className={`${
                                    colorMode === "dark" ? "text-white" : "text-gray-900"
                                  } text-[26px] font-bold mr-8`}
                                >
                                  {activeDay}일차
                                </p>

                                <div className="flex items-center">
                                  <p
                                    className={`${
                                      colorMode === "dark" ? "text-gray-300" : "text-gray-500"
                                    } text-base mr-2`}
                                  >
                                    코스
                                  </p>
                                  <p
                                    className={`${
                                      colorMode === "dark" ? "text-white" : "text-gray-900"
                                    } text-[22px] font-medium`}
                                  >
                                    {currentSpotIndex + 1}
                                  </p>
                                </div>
                              </div>

                              {/* 이동수단별 시간 정보 */}
                              {routeInfo && (
                                <div className="flex gap-2 mb-3">
                                  {routeInfo.driving && (
                                    <div
                                      className={`flex items-center px-3 py-1.5 rounded-md ${
                                        colorMode === "dark"
                                          ? "bg-blue-900/40 text-blue-300"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      <FaCar size={14} className="mr-1.5" />
                                      <span className="text-sm font-medium">{routeInfo.driving.formattedDuration}</span>
                                    </div>
                                  )}
                                  {routeInfo.transit && (
                                    <div
                                      className={`flex items-center px-3 py-1.5 rounded-md ${
                                        colorMode === "dark"
                                          ? "bg-green-900/40 text-green-300"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      <FaBus size={14} className="mr-1.5" />
                                      <span className="text-sm font-medium">{routeInfo.transit.formattedDuration}</span>
                                    </div>
                                  )}
                                  {routeInfo.walking && (
                                    <div
                                      className={`flex items-center px-3 py-1.5 rounded-md ${
                                        colorMode === "dark"
                                          ? "bg-amber-900/40 text-amber-300"
                                          : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      <FaWalking size={14} className="mr-1.5" />
                                      <span className="text-sm font-medium">{routeInfo.walking.formattedDuration}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 세로 점선 구분선 - 티켓 디자인 (네모 디자인으로 변경) */}
                          <div
                            className="absolute top-0 bottom-0 h-[105%] z-20"
                            style={{
                              height: "calc(100% + 10px)",
                              top: "-5px",
                              left: "70%",
                              transform: "translateX(-50%)",
                            }}
                          >
                            {/* 점선 효과 강화 - 검은색으로 변경, 실선으로 */}
                            <div
                              className={`absolute top-0 bottom-0 left-0 border-l-2 h-full ${
                                colorMode === "dark" ? "border-black" : "border-black"
                              }`}
                            ></div>

                            {/* 티켓 절취선 네모 마크들 - 상단부터 하단까지 균일하게 배치 */}
                            {Array.from({ length: 35 }).map((_, idx) => (
                              <div
                                key={idx}
                                className={`absolute -left-[8px] w-[16px] h-[5px] ${
                                  colorMode === "dark" ? "bg-black" : "bg-black"
                                }`}
                                style={{ top: `${idx * 3}%` }}
                              ></div>
                            ))}
                          </div>

                          {/* 오른쪽 티켓 섹션 */}
                          <div className="w-[30%] pl-[20px] pr-[20px] flex flex-col justify-between">
                            {/* 상단: From */}
                            <div className="text-right">
                              <p className={`${colorMode === "dark" ? "text-gray-300" : "text-gray-500"} text-sm mb-1`}>
                                From
                              </p>
                              <p
                                className={`${
                                  colorMode === "dark" ? "text-white" : "text-gray-900"
                                } text-[22px] font-medium`}
                              >
                                {getRandomHappyMessage()}
                              </p>
                            </div>

                            {/* 중간 날짜 */}
                            <div className="text-right">
                              <p className={`${colorMode === "dark" ? "text-gray-300" : "text-gray-500"} text-sm mb-1`}>
                                여행날짜
                              </p>
                              <p className={`${colorMode === "dark" ? "text-white" : "text-gray-900"} text-[16px]`}>
                                {formatDateKorean(plan.startDate)}
                              </p>
                            </div>

                            {/* 하단: To */}
                            <div className="text-right">
                              <p className={`${colorMode === "dark" ? "text-gray-300" : "text-gray-500"} text-sm mb-1`}>
                                To
                              </p>
                              <p
                                className={`${
                                  colorMode === "dark" ? "text-white" : "text-gray-900"
                                } text-[22px] font-medium`}
                              >
                                {getRandomHappyMessage()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 하단 영역: 출발지 정보 */}
                        {(currentSpotIndex === 0 && departurePoint) || (currentSpotIndex > 0 && previousSpot) ? (
                          <div className="py-2.5 mt-auto ml-1 mr-8 mb-1 pb-2 z-10 relative">
                            <div className="flex w-[70%] pl-2 pr-6 py-0.5">
                              <div className="flex-shrink-0 w-7 flex justify-center">
                                <FaMapMarkerAlt
                                  size={15}
                                  className={`${colorMode === "dark" ? "text-blue-400" : "text-blue-500"} mt-0.5`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-sm ${
                                    colorMode === "dark" ? "text-blue-100" : "text-gray-700"
                                  } truncate`}
                                >
                                  <span className="font-medium mr-1">출발지:</span>
                                  {currentSpotIndex === 0
                                    ? departurePoint
                                    : currentDeparturePoint && currentDeparturePoint !== departurePoint
                                    ? currentDeparturePoint
                                    : previousSpot?.addr1 ||
                                      previousSpot?.address ||
                                      previousSpot?.title ||
                                      previousSpot?.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* 티켓 카드 로고 텍스트 - 카드 내부에 배치 */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "15px",
                            right: "25px",
                            zIndex: 100,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "Arial, sans-serif",
                              fontSize: "24px",
                              fontWeight: "600",
                              letterSpacing: "-0.5px",
                              color: "#D25778",
                              lineHeight: "2",
                              display: "inline-block",
                            }}
                          >
                            Tripplai
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 슬라이드 화살표 버튼 */}
                  <div className="flex justify-between w-full absolute top-1/2 transform -translate-y-1/2 px-4">
                    {/* 이전 버튼 */}
                    <button
                      onClick={goToPrevSpot}
                      disabled={currentSpotIndex === 0}
                      className={`p-4 rounded-full transition-all border-0 outline-none shadow-lg ${getSlideButtonStyle()} ${
                        currentSpotIndex === 0 ? "opacity-50 cursor-not-allowed" : "opacity-100"
                      }`}
                    >
                      <FaChevronLeft size={26} />
                    </button>

                    {/* 다음 버튼 */}
                    <button
                      onClick={goToNextSpot}
                      disabled={currentSpotIndex === spotsList.length - 1}
                      className={`p-4 rounded-full transition-all border-0 outline-none shadow-lg ${getSlideButtonStyle()} ${
                        currentSpotIndex === spotsList.length - 1 ? "opacity-50 cursor-not-allowed" : "opacity-100"
                      }`}
                    >
                      <FaChevronRight size={26} />
                    </button>
                  </div>

                  {/* 하단 인디케이터 점 */}
                  <div className="flex justify-center mt-4 gap-2">
                    {spotsList.map((_, index) => {
                      let dotStyle = "";

                      if (index === currentSpotIndex) {
                        // 활성 점
                        switch (colorMode) {
                          case "dark":
                            dotStyle = "bg-yellow-400";
                            break;
                          case "neutral":
                            dotStyle = "bg-teal-500";
                            break;
                          default:
                            dotStyle = "bg-blue-500";
                        }
                      } else {
                        // 비활성 점
                        switch (colorMode) {
                          case "dark":
                            dotStyle = "bg-gray-600";
                            break;
                          case "neutral":
                            dotStyle = "bg-gray-400";
                            break;
                          default:
                            dotStyle = "bg-gray-300";
                        }
                      }

                      return (
                        <button
                          key={index}
                          className={`w-4 h-4 rounded-full transition-all border-0 outline-none ${dotStyle}`}
                          onClick={() => setCurrentSpotIndex(index)}
                          aria-label={`카드 ${index + 1}로 이동`}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div
                  className={`text-center p-10 ${
                    colorMode === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                  } rounded-xl`}
                >
                  <p className="text-xl font-medium">{activeDay}일차 일정이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 숙소 정보 */}
          {accommodation && (
            <div className="mt-10">
              <h2
                className={`text-2xl font-bold mb-6 flex items-center ${
                  colorMode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                <FaBed className="mr-3 text-[#56a8c6]" />
                숙소 정보
              </h2>

              <div className="flex items-center justify-center w-full">
                <div
                  className="w-[650px] h-[320px] relative transition-all duration-300 rounded-[20px] p-[5px] my-[40px] overflow-hidden"
                  style={{
                    background: "linear-gradient(to right, #56a8c6, #e7d155, #ec585c, #d25778)",
                  }}
                >
                  <div
                    className={`w-full h-full relative ${
                      colorMode === "dark" ? "bg-black" : "bg-white"
                    } rounded-[15px] pt-[40px] pb-[40px] px-[10px]`}
                  >
                    {/* 내용 모드에 맞게 색상 변경 */}
                    <div className="flex h-full">
                      {/* 왼쪽 티켓 섹션 */}
                      <div className="w-[70%] pl-[35px] pr-[10px] flex flex-col justify-between">
                        {/* 상단: 숙소명 및 주소 */}
                        <div>
                          <div className="flex items-start mb-4">
                            <div
                              className={`w-[60px] h-[60px] rounded-full ${
                                colorMode === "dark" ? "bg-[#333]" : "bg-gray-100"
                              } flex items-center justify-center mr-4 flex-shrink-0`}
                            >
                              <FaBed size={28} className="text-[#e7d155]" />
                            </div>
                            <div className="min-w-0">
                              <h3
                                className={`text-[28px] font-bold ${
                                  colorMode === "dark" ? "text-white" : "text-gray-900"
                                } leading-tight`}
                              >
                                {accommodation.name}
                              </h3>
                              <p
                                className={`${
                                  colorMode === "dark" ? "text-gray-400" : "text-gray-600"
                                } text-sm flex items-center mt-1 truncate`}
                              >
                                <FaMapMarkerAlt className="mr-1 flex-shrink-0" size={12} />
                                <span className="truncate">
                                  {accommodation.addr1} {accommodation.addr2 || ""}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 하단: 체크인/아웃 정보 */}
                        <div className="flex">
                          <div className="mr-10">
                            <p className={`${colorMode === "dark" ? "text-gray-300" : "text-gray-500"} text-sm`}>
                              체크인
                            </p>
                            <p
                              className={`${colorMode === "dark" ? "text-white" : "text-gray-900"} text-xl font-medium`}
                            >
                              15:00
                            </p>
                          </div>
                          <div>
                            <p className={`${colorMode === "dark" ? "text-gray-300" : "text-gray-500"} text-sm`}>
                              체크아웃
                            </p>
                            <p
                              className={`${colorMode === "dark" ? "text-white" : "text-gray-900"} text-xl font-medium`}
                            >
                              11:00
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 세로 점선 구분선 - 티켓 디자인 (네모 디자인으로 변경) */}
                      <div
                        className="absolute top-0 bottom-0 h-[105%] z-20"
                        style={{ height: "calc(100% + 10px)", top: "-5px", left: "70%", transform: "translateX(-50%)" }}
                      >
                        {/* 점선 효과 강화 - 검은색으로 변경, 실선으로 */}
                        <div
                          className={`absolute top-0 bottom-0 left-0 border-l-2 h-full ${
                            colorMode === "dark" ? "border-black" : "border-black"
                          }`}
                        ></div>

                        {/* 티켓 절취선 네모 마크들 - 상단부터 하단까지 균일하게 배치 */}
                        {Array.from({ length: 35 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`absolute -left-[8px] w-[16px] h-[5px] ${
                              colorMode === "dark" ? "bg-black" : "bg-black"
                            }`}
                            style={{ top: `${idx * 3}%` }}
                          ></div>
                        ))}
                      </div>

                      {/* 오른쪽 티켓 섹션 */}
                      <div className="w-[30%] pl-[20px] pr-[20px] flex flex-col justify-between">
                        {/* 상단: From */}
                        <div className="text-right">
                          <p className={`${colorMode === "dark" ? "text-gray-300" : "text-gray-500"} text-sm mb-1`}>
                            From
                          </p>
                          <p
                            className={`${
                              colorMode === "dark" ? "text-white" : "text-gray-900"
                            } text-[22px] font-medium`}
                          >
                            {getRandomHappyMessage()}
                          </p>
                        </div>

                        {/* 중간 날짜 */}
                        <div className="text-right">
                          <p className={`${colorMode === "dark" ? "text-gray-300" : "text-gray-500"} text-sm mb-1`}>
                            여행날짜
                          </p>
                          <p className={`${colorMode === "dark" ? "text-white" : "text-gray-900"} text-[16px]`}>
                            {formatDateKorean(plan.startDate)}
                          </p>
                        </div>

                        {/* 하단: To */}
                        <div className="text-right">
                          <p className={`${colorMode === "dark" ? "text-gray-300" : "text-gray-500"} text-sm mb-1`}>
                            To
                          </p>
                          <p
                            className={`${
                              colorMode === "dark" ? "text-white" : "text-gray-900"
                            } text-[22px] font-medium`}
                          >
                            {getRandomHappyMessage()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 숙소 카드 로고 텍스트 */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "15px",
                        right: "25px",
                        zIndex: 100,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Arial, sans-serif",
                          fontSize: "24px",
                          fontWeight: "600",
                          letterSpacing: "-0.5px",
                          color: "#D25778",
                          lineHeight: "2",
                          display: "inline-block",
                        }}
                      >
                        Tripplai
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 출발지 설정 모달 */}
      <DepartureModal
        isOpen={isDepartureModalOpen}
        onClose={() => {
          setIsDepartureModalOpen(false);
        }}
        onSave={(newDeparture) => {
          saveDeparturePoint(newDeparture);
        }}
        currentDeparture={departurePoint}
        colorMode={colorMode}
      />
    </Layout>
  );
}
