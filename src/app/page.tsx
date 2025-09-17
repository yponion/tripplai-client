"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import RegionSection from "@/components/home/RegionSection";
import FeatureSection from "@/components/home/FeatureSection";
import FestivalSection from "@/components/home/FestivalSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import Head from "next/head";

export default function Home() {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [budget, setBudget] = useState(500000);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);

  // 필터 버튼 클릭 핸들러
  const handleFilterClick = () => {
    setIsOpen(true);
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setIsOpen(false);
  };

  // 초기화 핸들러
  const handleReset = () => {
    setBudget(500000);
    setSelectedStyles([]);
    // 다른 상태들도 초기화
  };

  // 여행 스타일 토글 핸들러
  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  // 예산 범위 변경 핸들러
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBudget(value);
  };

  // 드래그 시작 핸들러 (슬라이더 ref에서 직접 사용)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleDrag(e);
  };

  // 드래그 핸들러
  const handleDrag = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = sliderRect.width;
    const offsetX = e.clientX - sliderRect.left;

    // 슬라이더 범위 내로 제한
    const clampedOffset = Math.max(0, Math.min(offsetX, sliderWidth));

    // 위치를 예산 값으로 변환
    const percentage = clampedOffset / sliderWidth;
    const newBudget =
      Math.round((percentage * 900000 + 100000) / 10000) * 10000; // 1만원 단위로 반올림

    setBudget(newBudget);
  };

  // 드래그 종료 핸들러
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 마우스 이벤트 리스너
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // 모달 열릴 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // 로그인 에러 처리
  useEffect(() => {
    const loginError = searchParams.get("loginError");
    if (loginError) {
      let message = "";
      switch (loginError) {
        case "oauth_failed":
          message = "소셜 로그인에 실패했습니다. 다시 시도해주세요.";
          break;
        case "processing_failed":
          message = "로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.";
          break;
        default:
          message = "로그인 중 오류가 발생했습니다.";
      }
      setErrorMessage(message);
      setShowErrorAlert(true);

      // URL에서 에러 파라미터 제거
      const url = new URL(window.location.href);
      url.searchParams.delete("loginError");
      window.history.replaceState({}, "", url.toString());

      // 5초 후 알림 자동 닫기
      setTimeout(() => {
        setShowErrorAlert(false);
      }, 5000);
    }
  }, [searchParams]);

  // 예산 포맷팅 함수
  const formatBudget = (value: number) => {
    return new Intl.NumberFormat("ko-KR").format(value);
  };

  return (
    <Layout>
      <Head>
        <title>Tripplai - AI로 계획하는 당신만의 특별한 여행</title>
        <meta
          name="description"
          content="목적지와 일정만 입력하면 AI가 당신만을 위한 최적의 여행 코스를 즉시 해 드립니다"
        />
        <meta
          property="og:title"
          content="Tripplai - AI로 계획하는 당신만의 특별한 여행"
        />
        <meta
          property="og:description"
          content="목적지와 일정만 입력하면 AI가 당신만을 위한 최적의 여행 코스를 즉시 추천해 드립니다"
        />
        <meta property="og:image" content="/images/hero-background.jpg" />
      </Head>

      {/* 로그인 에러 알림 */}
      {showErrorAlert && (
        <div className="fixed top-4 right-4 z-[10000] max-w-sm">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">
                  {errorMessage}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  className="inline-flex text-red-400 hover:text-red-600 focus:outline-none"
                  onClick={() => setShowErrorAlert(false)}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <HeroSection />
      <RegionSection onFilterClick={handleFilterClick} />
      <FeatureSection />

      {/* 여행 리뷰 섹션 */}
      <ReviewsSection />

      {/* 추천 인기 여행 코스 섹션 */}
      <FestivalSection />

      {/* 필터 모달 - Tailwind CSS 사용 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleClose}
          ></div>

          {/* 모달 콘텐츠 */}
          <div
            className="relative w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="relative border-b border-gray-200 py-5 bg-gradient-to-r from-pink-50 to-purple-50">
              <h2 className="text-2xl font-bold text-center text-gray-800">
                나만의 여행 계획 만들기
              </h2>
              <button
                className="absolute border-none left-4 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
                onClick={handleClose}
                aria-label="닫기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="p-8">
              <div className="space-y-10">
                {/* 여행지 */}
                <div className="transition-all duration-300 hover:shadow-md p-6 rounded-xl border border-gray-100 hover:border-pink-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <svg
                      className="h-6 w-6 text-pink-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    여행지
                  </h3>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-pink-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="어디로 여행가세요?"
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* 여행 일정 */}
                <div className="transition-all duration-300 hover:shadow-md p-6 rounded-xl border border-gray-100 hover:border-pink-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <svg
                      className="h-6 w-6 text-pink-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    여행 일정
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        출발일
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-pink-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="date"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        도착일
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-pink-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="date"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 여행 스타일 */}
                <div className="transition-all duration-300 hover:shadow-md p-6 rounded-xl border border-gray-100 hover:border-pink-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <svg
                      className="h-6 w-6 text-pink-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    여행 스타일
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      { id: "nature", name: "자연 경관", icon: "🏞️" },
                      { id: "history", name: "역사 유적", icon: "🏛️" },
                      { id: "food", name: "맛집 탐방", icon: "🍽️" },
                      { id: "culture", name: "문화 체험", icon: "🎭" },
                      { id: "activity", name: "액티비티", icon: "🏄‍♂️" },
                      { id: "shopping", name: "쇼핑", icon: "🛍️" },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => toggleStyle(style.id)}
                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                          selectedStyles.includes(style.id)
                            ? "border-pink-400 bg-pink-50 text-pink-700"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-xl mr-2">{style.icon}</span>
                        <span className="font-medium">{style.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 예산 범위 */}
                <div className="transition-all duration-300 hover:shadow-md p-6 rounded-xl border border-gray-100 hover:border-pink-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <svg
                      className="h-6 w-6 text-pink-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    예산 범위
                  </h3>
                  <p className="text-sm mb-4 text-gray-600">
                    1인당 예상 여행 경비 (교통, 숙박, 식사, 관광 포함)
                  </p>

                  <div className="py-6 px-4">
                    <div className="relative">
                      {/* 슬라이더 트랙 */}
                      <div
                        className="h-2 bg-gray-200 rounded-full overflow-hidden"
                        ref={sliderRef}
                        onMouseDown={handleDragStart}
                      >
                        {/* 채워진 부분 */}
                        <div
                          className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                          style={{
                            width: `${((budget - 100000) / 900000) * 100}%`,
                          }}
                        ></div>
                      </div>

                      {/* 슬라이더 핸들 */}
                      <div
                        className="absolute top-1/2 w-5 h-5 bg-white border-2 border-pink-500 rounded-full shadow-md -mt-[10px] -ml-[10px] cursor-grab active:cursor-grabbing"
                        style={{
                          left: `${((budget - 100000) / 900000) * 100}%`,
                        }}
                      ></div>

                      {/* 슬라이더 입력 (투명하게 처리) */}
                      <input
                        type="range"
                        min="100000"
                        max="1000000"
                        step="10000"
                        value={budget}
                        onChange={handleBudgetChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <div className="border border-gray-200 rounded-full py-2 px-4 bg-white shadow-sm">
                      <span className="text-gray-700">
                        ₩{formatBudget(100000)}
                      </span>
                    </div>
                    <div className="border border-gray-200 rounded-full py-2 px-4 bg-white shadow-sm">
                      <span className="text-gray-700">
                        ₩{formatBudget(budget)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 추가 요청사항 */}
                <div className="transition-all duration-300 hover:shadow-md p-6 rounded-xl border border-gray-100 hover:border-pink-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <svg
                      className="h-6 w-6 text-pink-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    추가 요청사항
                  </h3>
                  <textarea
                    placeholder="특별히 원하는 장소나 활동이 있다면 자유롭게 작성해주세요. (예: 아이와 함께하는 여행, 인스타그램 명소 위주로, 대중교통만 이용 등)"
                    className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="border-t border-gray-200 p-6 flex justify-between items-center bg-gray-50 rounded-b-2xl">
              <button
                className="flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-md hover:shadow-lg transition-all border-0 outline-none"
                onClick={handleReset}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                초기화
              </button>
              <button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-pink-600 hover:to-pink-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border-0 outline-none">
                여행 계획 생성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
