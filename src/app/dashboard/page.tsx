"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { FaCalendarAlt, FaMapMarkerAlt, FaTrash, FaEdit, FaPlus } from "react-icons/fa";

interface TravelPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: string;
  travelStyle: string;
  image?: string;
  createdAt: string;
  recommendations?: {
    schedule: Record<
      string,
      {
        spots: Array<{
          image?: string;
          thumbnail?: string;
        }>;
      }
    >;
  };
}

// 날짜 포맷 함수
const formatDateKorean = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
};

// 여행 스타일 한글 변환
const getTravelStyleLabel = (style: string) => {
  const styleMap: Record<string, string> = {
    relax: "휴양/힐링",
    nature: "자연/풍경",
    food: "맛집 여행",
    activity: "액티비티",
  };
  return styleMap[style] || style;
};

// 기본 이미지 URL - 여행 계획에서 첫 번째 스팟 이미지 가져오기
const getTravelImage = (plan: TravelPlan) => {
  // 외부 URL(http로 시작하는 이미지)은 건너뛰고 바로 로컬 썸네일 사용

  // 기본 썸네일 이미지 사용
  const imageMap: Record<string, string> = {
    제주도: "/images/thumbnails/jeju.png",
    제주: "/images/thumbnails/jeju.png",
    강릉: "/images/thumbnails/gangneung.png",
    부산: "/images/thumbnails/busan.png",
    여수: "/images/thumbnails/yeosu.png",
    경주: "/images/thumbnails/gyeongju.png",
    전주: "/images/thumbnails/jeonju.png",
    속초: "/images/thumbnails/sokcho.png",
    울산: "/images/thumbnails/ulsan.png",
    서울: "/images/thumbnails/seoul.png",
  };

  // 도시명에 맞는 이미지가 있으면 사용, 없으면 강릉 이미지를 기본으로 사용
  const imagePath = imageMap[plan.destination] || "/images/thumbnails/gangneung.png";
  return imagePath;
};

export default function Dashboard() {
  const router = useRouter();
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 여행 계획 불러오기
    try {
      const savedPlans = localStorage.getItem("travelPlans");
      if (savedPlans) {
        const plans = JSON.parse(savedPlans);
        // 최신순으로 정렬
        const sortedPlans = plans.sort((a: TravelPlan, b: TravelPlan) => {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setTravelPlans(sortedPlans);
      }
    } catch (error) {
      console.error("여행 계획 로드 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 여행 계획 삭제
  const handleDelete = (id: string) => {
    if (confirm("이 여행 계획을 삭제하시겠습니까?")) {
      const updatedPlans = travelPlans.filter((plan) => plan.id !== id);
      setTravelPlans(updatedPlans);
      localStorage.setItem("travelPlans", JSON.stringify(updatedPlans));
    }
  };

  // 여행 계획 상세 보기
  const handleViewPlan = (id: string) => {
    router.push(`/travel/${id}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-16 bg-white min-h-screen">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-1/4 mb-12"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[320px] bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 pb-16 bg-white min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="mb-12">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">저장된 여행 계획을 확인하고 관리하세요</h1>
          </div>

          {/* 여행 계획 목록 */}
          {travelPlans.length === 0 ? (
            <div className="text-center py-24">
              <div className="mb-6">
                <FaMapMarkerAlt className="mx-auto text-5xl text-gray-300" />
              </div>
              <h2 className="text-xl font-medium text-gray-700 mb-2">아직 여행 계획이 없습니다</h2>
              <p className="text-gray-500 mb-8">새로운 여행을 계획해보세요!</p>
              <button
                onClick={() => router.push("/travel/create")}
                className="px-6 py-3 bg-[#FF385C] text-white rounded-lg font-medium hover:bg-[#E61E4D] transition-colors border-0 outline-none"
              >
                여행 계획 만들기
              </button>
            </div>
          ) : (
            <>
              {/* 새 여행 계획 버튼 */}
              <div className="mb-8">
                <button
                  onClick={() => router.push("/travel/create")}
                  className="px-5 py-3 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm border-0 outline-none"
                >
                  <FaPlus size={14} />새 여행 계획
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {travelPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleViewPlan(plan.id)}
                  >
                    {/* 이미지 */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                      <img
                        src={getTravelImage(plan)}
                        alt={plan.destination}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.error("이미지 로드 실패:", e.currentTarget.src);
                          e.currentTarget.src = "/images/thumbnails/gangneung.png";
                        }}
                      />

                      {/* 액션 버튼 - 이미지 위에 오버레이 */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/travel/edit/${plan.id}`);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-gray-900 transition-colors rounded-full shadow-sm border-0 outline-none"
                          aria-label="수정"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(plan.id);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-500 transition-colors rounded-full shadow-sm border-0 outline-none"
                          aria-label="삭제"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 내용 */}
                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{plan.destination}</h3>
                        <p className="text-sm text-gray-500 mt-1">{getTravelStyleLabel(plan.travelStyle)}</p>
                      </div>

                      <div className="text-sm text-gray-600">
                        {formatDateKorean(plan.startDate)} - {formatDateKorean(plan.endDate)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{plan.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
