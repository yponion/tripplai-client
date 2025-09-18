"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import usePerformance from "@/hooks/usePerformance";
import { recommendationApi } from "@/services/api";

// 여행지 정보 타입
type AreaInfo = {
  area: string;
  sigungu: string;
};

// 여행 계획 응답 타입
interface TravelSpot {
  name: string;
  addr1: string;
  addr2?: string;
  category_name: string;
  category_code: string;
  type: string;
  latitude: number;
  longitude: number;
}

interface Accommodation {
  name: string;
  addr1: string;
  addr2?: string;
}

interface DaySchedule {
  spots: TravelSpot[];
  accommodation?: Accommodation;
}

interface TravelRecommendation {
  schedule: {
    [key: string]: DaySchedule;
  };
  message: string;
}

// 지역 코드 매핑 (간단한 예시)
const AREA_CODES: Record<string, AreaInfo> = {
  제주도: { area: "39", sigungu: "4" },
  강릉: { area: "32", sigungu: "1" },
  부산: { area: "6", sigungu: "16" },
  여수: { area: "38", sigungu: "11" },
  경주: { area: "35", sigungu: "2" },
  전주: { area: "37", sigungu: "12" },
  속초: { area: "32", sigungu: "5" },
  울산: { area: "7", sigungu: "1" },
};

// 여행 스타일별 카테고리 코드 매핑
const TRAVEL_STYLE_CATEGORIES: Record<string, string[]> = {
  relax: ["A02", "A05"], // 자연 + 음식
  nature: ["A01", "A02"], // 자연 + 명소
  food: ["A05", "A04"], // 음식 + 쇼핑
  activity: ["A03", "A01"], // 액티비티 + 명소
};

export default function CreateTravelPlan() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);

  // 필수 정보 관리
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 추천 결과
  const [recommendation, setRecommendation] =
    useState<TravelRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // URL 파라미터에서 초기값 설정
  useEffect(() => {
    const locationParam = searchParams.get("location");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (locationParam) {
      setDestination(locationParam);
    }

    if (startDateParam) {
      setStartDate(startDateParam);
    }

    if (endDateParam) {
      setEndDate(endDateParam);
    }
  }, [searchParams]);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 2 || !destination || !startDate || !endDate || !travelStyle) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setLoading(true);
    setError("");

    try {
      // 지역 코드 가져오기
      const areaInfo = AREA_CODES[destination];
      if (!areaInfo) {
        throw new Error("지원하지 않는 여행지입니다.");
      }

      // 날짜 계산
      const days = calculateDays();

      // 카테고리 코드 가져오기
      const categories = TRAVEL_STYLE_CATEGORIES[travelStyle];

      // API 호출
      const { data } = await recommendationApi.getTravelRecommendations(
        areaInfo.area,
        areaInfo.sigungu,
        categories,
        days,
        startDate,
        endDate
      );

      setRecommendation(data as TravelRecommendation);
    } catch (err: unknown) {
      console.error("여행 계획 생성 오류:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "여행 계획을 생성하는 중 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // 여행 스타일 선택 옵션
  const travelStyles = [
    { value: "relax", label: "휴양/힐링", desc: "여유롭게 쉬는 여행" },
    { value: "nature", label: "자연/풍경", desc: "자연과 함께하는 여행" },
    { value: "food", label: "맛집 여행", desc: "맛있는 음식을 찾아서" },
    { value: "activity", label: "액티비티", desc: "활동적인 체험 여행" },
  ];

  // 국내 인기 여행지
  const popularDestinations = [
    "제주도",
    "강릉",
    "부산",
    "여수",
    "경주",
    "전주",
    "속초",
    "울산",
  ];

  const canProgress = () => {
    switch (step) {
      case 0:
        return !!destination;
      case 1:
        return !!startDate && !!endDate;
      case 2:
        return !!travelStyle;
      default:
        return false;
    }
  };

  const isComplete = () => {
    return !!destination && !!startDate && !!endDate && !!travelStyle;
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();

    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      console.error("Invalid date format:", { startDate, endDate });
      return 1;
    }

    const daysDiff = Math.ceil(
      (endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24) + 1
    );
    return Math.max(1, daysDiff); // 최소 1일로 보장
  };

  // 더미 광고 컴포넌트 - 실제 이미지 사용
  const DummyAd = ({
    width,
    height,
    type = "default",
  }: {
    width: string;
    height: string;
    type?: string;
  }) => {
    // 랜덤 색상을 미리 정의 (매번 바뀌지 않도록)
    const colors = ["#e9f5ff", "#fff2e8", "#f0f9e8", "#ffeaf5", "#f2f2ff"];
    const bgColor = colors[0]; // 항상 첫 번째 색상 사용

    // 고정된 광고 텍스트 (랜덤 사용 안함)
    const adContent = {
      title: "특가 항공권",
      desc: "국내 여행 최저가 보장",
    };

    return (
      <div
        className="flex flex-col items-center justify-center rounded-md overflow-hidden shadow-sm"
        style={{ width, height }}
      >
        {type === "image" ? (
          // 이미지 더미 광고
          <div className="relative w-full h-full">
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: bgColor,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
              }}
            >
              <div className="text-sm font-bold mb-2 text-gray-800">
                {adContent.title}
              </div>
              <div className="text-xs text-gray-600">{adContent.desc}</div>
              <div className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                더 알아보기
              </div>
              <div className="absolute bottom-1 right-1 text-[8px] text-gray-400">
                광고
              </div>
            </div>
          </div>
        ) : (
          // 텍스트 더미 광고
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: bgColor,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "8px",
            }}
          >
            <span className="text-xs text-center font-medium text-gray-700 mb-1">
              광고 영역
            </span>
            <span className="text-[9px] text-gray-500">
              {width}x{height}
            </span>
          </div>
        )}
      </div>
    );
  };

  // 여행 계획 결과 렌더링
  const renderTravelPlan = () => {
    if (loading) {
      return (
        <div className="my-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>여행 계획 생성 중...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="my-8 p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-medium">오류가 발생했습니다</p>
          <p className="text-sm mt-2">{error}</p>
          <button
            onClick={() => setError("")}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md"
          >
            다시 시도하기
          </button>
        </div>
      );
    }

    if (!recommendation) {
      return null;
    }

    return (
      <div className="my-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          여행 계획이 준비되었습니다!
        </h3>

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          {Object.entries(recommendation.schedule).map(([day, data]) => (
            <div key={day} className="border-b border-gray-200 last:border-0">
              <div className="bg-blue-50 px-4 py-2 font-medium">
                {day.replace("day_", "일차")}
              </div>
              <div className="p-4">
                <h4 className="font-medium mb-2">방문할 장소</h4>
                <ul className="space-y-3">
                  {data.spots.map((spot, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs mr-2">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{spot.name}</p>
                        <p className="text-sm text-gray-600">
                          {spot.addr1} {spot.addr2}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {spot.category_name}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                {data.accommodation && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-medium mb-2">숙소 추천</h4>
                    <div className="p-3 bg-yellow-50 rounded-md">
                      <p className="font-medium">{data.accommodation.name}</p>
                      <p className="text-sm text-gray-600">
                        {data.accommodation.addr1} {data.accommodation.addr2}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setRecommendation(null)}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md border-none"
          >
            다시 계획하기
          </button>
          <button
            onClick={saveTravelPlan}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md border-none"
          >
            저장하고 종료하기
          </button>
        </div>
      </div>
    );
  };

  // 여행 계획 저장 함수
  const saveTravelPlan = async () => {
    if (
      !recommendation ||
      !destination ||
      !startDate ||
      !endDate ||
      !travelStyle
    ) {
      alert("여행 계획 정보가 완성되지 않았습니다.");
      return;
    }

    try {
      setLoading(true);

      // 서버에 저장할 데이터 구성
      const planData = {
        destination,
        startDate,
        endDate,
        travelStyle,
        duration: calculateDays(),
        schedule: recommendation.schedule,
        // 기타 필요한 정보
        message: recommendation.message,
      };

      // API 호출하여 서버에 저장
      const response = await recommendationApi.saveTravelRecommendation(
        planData
      );

      // localStorage에서 기존 계획 가져오기
      const existingPlansJSON = localStorage.getItem("travelPlans");
      const existingPlans = existingPlansJSON
        ? JSON.parse(existingPlansJSON)
        : [];

      // 새 여행 계획 객체 생성
      const newPlan = {
        id: response.data.id || Date.now().toString(), // 서버에서 반환한 ID 사용
        destination,
        startDate,
        endDate,
        travelStyle,
        duration: `${calculateDays()}일`,
        image: getDestinationImage(destination),
        recommendations: recommendation,
        createdAt: new Date().toISOString(),
      };

      // 새 계획을 기존 계획 배열에 추가
      const updatedPlans = [newPlan, ...existingPlans];

      // localStorage에 저장
      localStorage.setItem("travelPlans", JSON.stringify(updatedPlans));

      // 저장 성공 메시지
      alert("여행 계획이 저장되었습니다!");

      // 대시보드로 이동
      router.push("/dashboard");
    } catch (error) {
      console.error("여행 계획 저장 오류:", error);
      alert("여행 계획 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 여행지별 대표 이미지 URL 반환 함수
  const getDestinationImage = (dest: string) => {
    const imageMap: { [key: string]: string } = {
      제주도: "https://images.unsplash.com/photo-1579169825453-8d2d3f2a1bca",
      강릉: "https://images.unsplash.com/photo-1597738409790-4fb5db420531",
      부산: "https://images.unsplash.com/photo-1601684563124-a7b282a2851b",
      여수: "https://images.unsplash.com/photo-1627800256672-cc6e7485abd8",
      경주: "https://images.unsplash.com/photo-1605605233033-23278f46a641",
      전주: "https://images.unsplash.com/photo-1667474613835-a8320a325bf6",
      속초: "https://images.unsplash.com/photo-1596407714781-c7d033d2764f",
      울산: "https://images.unsplash.com/photo-1591604129954-6c77099226ad",
    };

    return (
      imageMap[dest] ||
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26"
    );
  };

  usePerformance("CreateTravelPlan");

  return (
    <Layout>
      {/* 상단 여백 및 전체 레이아웃 컨테이너 */}
      <div className="mt-20 mb-10">
        {/* 3단 레이아웃: 왼쪽 광고 - 중앙 콘텐츠 - 오른쪽 광고 */}
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-start">
          {/* 왼쪽 광고 영역 */}
          <div className="hidden lg:block mr-8 sticky top-24 space-y-4">
            <DummyAd width="160px" height="600px" type="image" />
            <p className="text-xs text-center text-gray-500 mt-1">
              향후 실제 광고로 대체됩니다
            </p>
          </div>

          {/* 중앙 콘텐츠 */}
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  국내 여행 계획 만들기
                </h1>

                {/* 단계 표시 */}
                <div className="flex mb-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex-1">
                      <div
                        className={`h-2 ${
                          i <= step ? "bg-blue-500" : "bg-gray-200"
                        }`}
                      ></div>
                      <p className="text-xs mt-1 text-center">
                        {i === 0 ? "여행지" : i === 1 ? "일정" : "스타일"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 추천 결과가 있으면 표시, 없으면 폼 표시 */}
                {recommendation ? (
                  renderTravelPlan()
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* 스텝 1: 여행지 */}
                    {step === 0 && (
                      <div>
                        <h2 className="text-lg font-medium text-gray-700 mb-4">
                          어디로 떠나시나요?
                        </h2>
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="여행지를 입력하세요"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">
                            인기 국내 여행지:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {popularDestinations.map((place) => (
                              <button
                                key={place}
                                type="button"
                                onClick={() => setDestination(place)}
                                className={`px-3 py-1 text-sm rounded-full ${
                                  destination === place
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {place}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 스텝 2: 여행 기간 */}
                    {step === 1 && (
                      <div>
                        <h2 className="text-lg font-medium text-gray-700 mb-4">
                          언제 여행하시나요?
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              출발일
                            </label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              도착일
                            </label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {startDate &&
                          endDate &&
                          new Date(startDate) <= new Date(endDate) && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-700 text-sm">
                              {calculateDays()}일 여행을 계획 중이시네요!
                            </div>
                          )}
                      </div>
                    )}

                    {/* 스텝 3: 여행 스타일 */}
                    {step === 2 && (
                      <div>
                        <h2 className="text-lg font-medium text-gray-700 mb-4">
                          어떤 여행을 원하시나요?
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                          {travelStyles.map((style) => (
                            <div
                              key={style.value}
                              onClick={() => setTravelStyle(style.value)}
                              className={`p-3 border rounded-md cursor-pointer ${
                                travelStyle === style.value
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="font-medium">{style.label}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {style.desc}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 버튼 영역 */}
                    <div className="mt-8 flex justify-between">
                      <button
                        type="button"
                        onClick={handlePrev}
                        disabled={step === 0}
                        className={`px-6 py-2 rounded-md border-none ${
                          step === 0
                            ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-500"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        이전
                      </button>
                      {step < 2 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!canProgress()}
                          className={`px-6 py-2 rounded-md border-none ${
                            canProgress()
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "opacity-50 cursor-not-allowed bg-blue-300 text-white"
                          }`}
                        >
                          다음
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={submitting || !isComplete()}
                          className={`px-6 py-2 rounded-md border-none ${
                            submitting || !isComplete()
                              ? "opacity-50 cursor-not-allowed bg-blue-300 text-white"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                        >
                          {submitting ? "처리 중..." : "여행 계획 생성하기"}
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽 광고 영역 */}
          <div className="hidden lg:flex flex-col ml-8 sticky top-24 space-y-4">
            <DummyAd width="300px" height="250px" type="image" />
            <DummyAd width="300px" height="250px" type="image" />
            <p className="text-xs text-center text-gray-500 mt-1">
              향후 실제 광고로 대체됩니다
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
