"use client";

import {
  FaUserCircle,
  FaMapMarkedAlt,
  FaSearch,
  FaSun,
  FaMoon,
  FaPalette,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import useThemeMode from "@/hooks/useDarkMode";
import dynamic from "next/dynamic";
import clsx from "clsx"; //디자인 추가
import { jwtDecode } from "jwt-decode";
import { authApi } from "@/services/api";
import Login from "@/components/login/Login";

const logo = process.env.NEXT_PUBLIC_SERVICE_NAME;

// 클라이언트 전용 컴포넌트
const NavSection = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isFestivalMenuOpen, setIsFestivalMenuOpen] = useState(false);
  const [isPlanMenuOpen, setIsPlanMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { themeMode, cycleTheme, isLoading } = useThemeMode();

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 테마 변경 핸들러
  const handleThemeChange = () => {
    // DOM 깜빡임 방지를 위한 클래스 추가
    document.documentElement.classList.add("no-transition");

    // 현재 테마 확인
    const nextTheme =
      themeMode === "original"
        ? "dark"
        : themeMode === "dark"
        ? "light"
        : "original";

    // 대시보드 페이지 배경 즉시 업데이트
    const dashboardBg = document.querySelector('div[class*="py-12 bg-"]');
    if (dashboardBg) {
      if (nextTheme === "dark") {
        (dashboardBg as HTMLElement).style.background =
          "linear-gradient(to bottom, #111827, #1f2937)";
        (dashboardBg as HTMLElement).classList.remove(
          "from-pink-50",
          "to-white",
          "from-blue-50"
        );
        (dashboardBg as HTMLElement).classList.add(
          "from-gray-900",
          "to-gray-800"
        );
      } else if (nextTheme === "light") {
        (dashboardBg as HTMLElement).style.background =
          "linear-gradient(to bottom, #eff6ff, #ffffff)";
        (dashboardBg as HTMLElement).classList.remove(
          "from-pink-50",
          "to-white",
          "from-gray-900",
          "to-gray-800"
        );
        (dashboardBg as HTMLElement).classList.add("from-blue-50");
      } else {
        (dashboardBg as HTMLElement).style.background =
          "linear-gradient(to bottom, #fdf2f8, #ffffff)";
        (dashboardBg as HTMLElement).classList.remove(
          "from-blue-50",
          "from-gray-900",
          "to-gray-800"
        );
        (dashboardBg as HTMLElement).classList.add("from-pink-50", "to-white");
      }
    }

    // 배경 그라데이션 요소들 즉시 업데이트
    const gradientBgs = document.querySelectorAll(
      'div[class*="bg-gradient-to-b"]'
    );
    gradientBgs.forEach((element) => {
      if (nextTheme === "dark") {
        (element as HTMLElement).style.background =
          "linear-gradient(to bottom, #111827, #1f2937)";
      } else if (nextTheme === "light") {
        (element as HTMLElement).style.background =
          "linear-gradient(to bottom, #eff6ff, #ffffff)";
      } else {
        (element as HTMLElement).style.background =
          "linear-gradient(to bottom, #fdf2f8, #ffffff)";
      }
    });

    // 헤더 즉시 업데이트
    const header = document.querySelector("header");
    if (header) {
      if (nextTheme === "dark") {
        (header as HTMLElement).style.backgroundColor = "#111827";
      } else {
        (header as HTMLElement).style.backgroundColor = "#ffffff";
      }
    }

    // body 배경색 즉시 업데이트
    if (nextTheme === "dark") {
      document.body.style.backgroundColor = "#111827";
      document.body.classList.add("dark-mode");
    } else {
      document.body.style.backgroundColor = "#ffffff";
      document.body.classList.remove("dark-mode");
    }

    // 테마 변경 함수 호출
    cycleTheme();

    // 애니메이션 적용을 위한 타이머 설정 (DOM 업데이트 후)
    setTimeout(() => {
      document.documentElement.classList.remove("no-transition");
    }, 50);
  };

  // 로딩 중일 때는 기본 스타일을 반환
  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-white z-50 transition-all duration-300 py-5">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <FaMapMarkedAlt className="text-rose-500 text-3xl mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              {logo}
            </span>
          </Link>
          <div className="flex items-center gap-1 md:gap-3"></div>
        </div>
      </header>
    );
  }

  // 테마에 따른 아이콘과 색상 결정
  const getThemeIcon = () => {
    switch (themeMode) {
      case "dark":
        return <FaMoon className="text-white text-lg" />;
      case "light":
        return <FaSun className="text-yellow-500 text-lg" />;
      default: // original
        return <FaPalette className="text-pink-500 text-lg" />;
    }
  };

  const handleLoginClick = () => {
    setOpenModal(!openModal);
  };

  const handleInfoClick = () => {
    router.push("/info");
  };

  const handleLogoutClick = () => {
    sessionStorage.removeItem("accessToken");
    authApi.logout();
    window.location.reload();
  };

  // 현재 테마에 따라 헤더 스타일 변경
  const getHeaderClasses = () => {
    switch (themeMode) {
      case "original":
        return `fixed top-0 left-0 right-0 bg-white z-50 transition-all duration-300 ${
          scrolled ? "shadow-md py-3" : "py-5"
        }`;
      case "light":
        return `fixed top-0 left-0 right-0 bg-white z-50 transition-all duration-300 ${
          scrolled ? "shadow-md py-3" : "py-5"
        }`;
      case "dark":
        return `fixed top-0 left-0 right-0 bg-black z-50 transition-all duration-300 ${
          scrolled ? "shadow-md py-3" : "py-5"
        }`;
      default:
        return `fixed top-0 left-0 right-0 bg-white z-50 transition-all duration-300 ${
          scrolled ? "shadow-md py-3" : "py-5"
        }`;
    }
  };

  // 현재 테마에 따라 링크 스타일 변경
  const getLinkClasses = () => {
    switch (themeMode) {
      case "original":
        return "hidden md:block text-pink-500 text-sm font-medium hover:text-pink-600 px-3 py-2 rounded-full hover:bg-pink-50 transition-colors";
      case "light":
        return "hidden md:block text-gray-700 text-sm font-medium hover:text-gray-900 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors";
      case "dark":
        return "hidden md:block text-white text-sm font-medium hover:text-gray-300 px-3 py-2 rounded-full hover:bg-gray-800 transition-colors";
      default:
        return "hidden md:block text-pink-500 text-sm font-medium hover:text-pink-600 px-3 py-2 rounded-full hover:bg-pink-50 transition-colors";
    }
  };

  // 현재 테마에 따라 검색창 스타일 변경
  const getSearchInputClasses = () => {
    switch (themeMode) {
      case "original":
        return "flex items-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden pl-5 pr-2 py-2 border border-pink-200";
      case "light":
        return "flex items-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden pl-5 pr-2 py-2 border border-gray-200";
      case "dark":
        return "flex items-center rounded-full bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden pl-5 pr-2 py-2";
      default:
        return "flex items-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden pl-5 pr-2 py-2 border border-pink-200";
    }
  };

  const getInputTextClasses = () => {
    switch (themeMode) {
      case "original":
        return "w-full text-sm focus:outline-none border-none bg-transparent text-pink-500";
      case "light":
        return "w-full text-sm focus:outline-none border-none bg-transparent text-gray-700";
      case "dark":
        return "w-full text-sm focus:outline-none border-none bg-transparent text-white";
      default:
        return "w-full text-sm focus:outline-none border-none bg-transparent text-pink-500";
    }
  };

  // 테마에 따른 아이콘 색상 결정
  const getUserIconClasses = () => {
    switch (themeMode) {
      case "original":
        return "text-pink-500";
      case "light":
        return "text-black";
      case "dark":
        return "text-white";
      default:
        return "text-pink-500";
    }
  };

  // 테마에 따른 텍스트 스타일 추가
  const getDashboardTextClass = () => {
    switch (themeMode) {
      case "original":
        return "text-pink-500";
      case "light":
        return "text-gray-700";
      case "dark":
        return "text-white";
      default:
        return "text-pink-500";
    }
  };

  return (
    <header className={getHeaderClasses()} suppressHydrationWarning>
      <div className="relative container mx-auto px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <FaMapMarkedAlt className="text-rose-500 text-3xl mr-2 transition-transform group-hover:scale-110 duration-300" />
          <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
            {logo}
          </span>
        </Link>

        <div className="hidden md:flex items-center justify-center max-w-md w-full mx-4">
          <div className="relative w-full">
            <div className={getSearchInputClasses()}>
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="어디로 여행가세요?"
                  className={getInputTextClasses()}
                />
              </div>
              <Button variant="primary" size="sm" className="ml-2 rounded-full">
                <FaSearch className="text-sm" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <Link href="/pricing" className={getLinkClasses()}>
            결제
          </Link>

          <Link href="/week" className={getLinkClasses()}>
            주간 여행지
          </Link>

          {/* ✅ 축제 드롭다운 메뉴 */}
          <div
            className="relative hidden md:block"
            onMouseEnter={() => setIsFestivalMenuOpen(true)}
            onMouseLeave={() => setIsFestivalMenuOpen(false)}
          >
            <Link href="/festival/list" className={getLinkClasses()}>
              축제
            </Link>

            {isFestivalMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md z-50">
                <Link
                  href="/festival/list"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-white"
                >
                  축제 리스트
                </Link>
                <Link
                  href="/festival/map"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-white"
                >
                  축제 지도
                </Link>
                <Link
                  href="/festival/calendar"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-white"
                >
                  축제 달력
                </Link>
              </div>
            )}
          </div>

          <Link href="/popular-courses" className={getLinkClasses()}>
            추천 인기 여행코스
          </Link>
          <Link href="/destinations" className={getLinkClasses()}>
            인기 여행지
          </Link>
          <Link href="/reviews" className={getLinkClasses()}>
            리뷰보기
          </Link>

          <Link href="/help" className={getLinkClasses()}>
            고객센터
          </Link>

          <Link href="/gathering" className={getLinkClasses()}>
            여행멤버 구하기
          </Link>

          {/* AI 여행 계획 드롭다운 메뉴 */}
          <div
            className="relative hidden md:block"
            onMouseEnter={() => setIsPlanMenuOpen(true)}
            onMouseLeave={() => setIsPlanMenuOpen(false)}
          >
            <Link href="/travel/create" className="block">
              <Button
                variant="outline"
                size="sm"
                className={`font-medium font-semibold ${getDashboardTextClass()}`}
              >
                <span>AI 여행 계획</span>
              </Button>
            </Link>

            {isPlanMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md z-50">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-white"
                >
                  AI 여행 계획 보관함
                </Link>
                <Link
                  href="/travel/favorite-courses"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-white"
                >
                  내가 찜한 인기여행코스
                </Link>
              </div>
            )}
          </div>
          {!sessionStorage.getItem("accessToken") ? (
            <Button
              variant="outline"
              size="sm"
              className="ml-1 flex items-center gap-2"
              onClick={() => setIsLoginModalOpen(true)}
              aria-label="로그인"
            >
              <FaUserCircle className={getUserIconClasses()} />
              <span
                className={`hidden md:block text-sm font-semibold ${getDashboardTextClass()}`}
              >
                로그인
              </span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="ml-1 flex items-center gap-2"
              onClick={handleLoginClick}
              aria-label={
                JSON.parse(
                  jwtDecode(sessionStorage.getItem("accessToken")!).sub!
                ).nickname
              }
            >
              <FaUserCircle className={getUserIconClasses()} />
              <span
                className={`hidden md:block text-sm font-semibold ${getDashboardTextClass()}`}
              >
                {
                  JSON.parse(
                    jwtDecode(sessionStorage.getItem("accessToken")!).sub!
                  ).nickname
                }
              </span>
            </Button>
          )}

          <button
            className="ml-1 p-2 bg-transparent rounded-full hover:bg-transparent focus:outline-none"
            onClick={handleThemeChange}
            aria-label="테마 변경"
            style={{ border: "none", boxShadow: "none" }}
          >
            {getThemeIcon()}
          </button>
        </div>

        {openModal ? (
          <div className="absolute right-16 top-10 w-40 h-20 bg-white rounded-lg shadow-sm overflow-hidden">
            <div
              className="pl-3 h-1/2 leading-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleInfoClick}
            >
              내정보
            </div>
            <div
              className="pl-3 h-1/2 leading-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleLogoutClick}
            >
              로그아웃
            </div>
          </div>
        ) : null}
      </div>

      {/* 로그인 모달 */}
      {isLoginModalOpen && (
        <>
          {/* 어두운 배경 */}
          <div
            className="fixed top-0 w-dvw h-dvh bg-black opacity-50 z-[9999]"
            onClick={() => setIsLoginModalOpen(false)}
          />
          {/* 중앙 정렬 모달 컨테이너 */}
          <div className="fixed top-0 w-dvw h-dvh flex items-center justify-center z-[9999]">
            <div onClick={(e) => e.stopPropagation()}>
              <Login onLoginSuccess={() => setIsLoginModalOpen(false)} />
            </div>
          </div>
        </>
      )}
    </header>
  );
};

// 클라이언트 전용으로 내보내기
export default dynamic(() => Promise.resolve(NavSection), { ssr: false });
