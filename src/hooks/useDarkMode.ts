import { useState, useEffect } from 'react';

// 테마 타입 정의
export type ThemeMode = 'light' | 'dark' | 'original';

// 클라이언트 사이드에서만 사용할 전역 변수
let globalTheme: ThemeMode | null = null;

const useThemeMode = () => {
  // 서버 사이드 렌더링을 위한 초기값 (항상 original 사용)
  // SSR 초기 렌더링시 항상 동일한 값을 사용하여 하이드레이션 불일치 방지
  const [themeMode, setThemeMode] = useState<ThemeMode>('original');
  const [isLoading, setIsLoading] = useState(true);

  // useEffect는 클라이언트 사이드에서만 실행됨
  useEffect(() => {
    // 실행환경이 브라우저인지 확인
    if (typeof window === 'undefined') return;

    // 이미 전역 상태가 있다면 그것을 사용
    if (globalTheme) {
      setThemeMode(globalTheme);
      setIsLoading(false);
      updateThemeClasses(globalTheme);
      return;
    }

    // localStorage에서 테마 불러오기
    const savedThemeMode = localStorage.getItem('themeMode') as ThemeMode | null;
    const initialTheme = savedThemeMode || 'original';

    // 상태 업데이트
    setThemeMode(initialTheme);
    setIsLoading(false);
    globalTheme = initialTheme;

    // HTML에 클래스 적용
    updateThemeClasses(initialTheme);

    // 스토리지 이벤트 리스너 추가 (다른 탭에서 테마 변경 시 동기화)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'themeMode') {
        const newTheme = e.newValue as ThemeMode;
        if (newTheme) {
          setThemeMode(newTheme);
          globalTheme = newTheme;
          updateThemeClasses(newTheme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // HTML 클래스 업데이트 함수
  const updateThemeClasses = (mode: ThemeMode) => {
    if (typeof document === 'undefined') return;

    const htmlElement = document.documentElement;

    // 모든 테마 클래스 제거
    htmlElement.classList.remove('dark', 'light', 'original');

    // 해당 테마 클래스 추가
    htmlElement.classList.add(mode);

    // 다크모드 특별 처리 (tailwind dark: 선택자를 위해)
    if (mode === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    // 바디에 배경색 명시적 적용
    if (mode === 'dark') {
      document.body.style.backgroundColor = '#111827'; // 더 어두운 회색
      document.body.style.color = '#ffffff';
      document.body.classList.add('dark-mode');
    } else if (mode === 'light') {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#111827';
      document.body.classList.remove('dark-mode');
    } else {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#111827';
      document.body.classList.remove('dark-mode');
    }

    // 특정 DOM 요소들의 스타일을 즉시 업데이트
    updateSpecificElements(mode);

    // 전체 앱에 테마 변경 알림 (커스텀 이벤트)
    if (typeof window !== 'undefined') {
      const themeChangeEvent = new CustomEvent('themeChange', { detail: mode });
      window.dispatchEvent(themeChangeEvent);
    }
  };

  // 특정 DOM 요소들의 스타일을 직접 업데이트하는 함수
  const updateSpecificElements = (mode: ThemeMode) => {
    try {
      // 카드 배경색 업데이트
      const cards = document.querySelectorAll('.bg-white.rounded-2xl, .bg-gray-800.rounded-2xl');
      cards.forEach(card => {
        if (mode === 'dark') {
          (card as HTMLElement).style.backgroundColor = '#1f2937';
          (card as HTMLElement).style.borderColor = '#374151';
          (card as HTMLElement).style.borderWidth = '1px';
          (card as HTMLElement).style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
        } else if (mode === 'light') {
          (card as HTMLElement).style.backgroundColor = '#ffffff';
          (card as HTMLElement).style.borderColor = '#bfdbfe'; // blue-200
          (card as HTMLElement).style.borderWidth = '2px';
          (card as HTMLElement).style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
        } else {
          (card as HTMLElement).style.backgroundColor = '#ffffff';
          (card as HTMLElement).style.borderColor = '#fbcfe8'; // pink-200
          (card as HTMLElement).style.borderWidth = '2px';
          (card as HTMLElement).style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
        }
      });

      // 하이라이트 텍스트 업데이트
      const highlightTexts = document.querySelectorAll('[class*="font-bold mb-3"]');
      highlightTexts.forEach(text => {
        if (mode === 'dark') {
          (text as HTMLElement).style.color = '#e5e7eb'; // gray-200
        } else if (mode === 'light') {
          (text as HTMLElement).style.color = '#1d4ed8'; // blue-700
        } else {
          (text as HTMLElement).style.color = '#be185d'; // pink-700
        }
      });

      // 태그 스타일 업데이트
      const tags = document.querySelectorAll('span[class*="rounded-full"]');
      tags.forEach(tag => {
        if (mode === 'dark') {
          (tag as HTMLElement).style.backgroundColor = '#134e4a'; // teal-900
          (tag as HTMLElement).style.color = '#99f6e4'; // teal-200
          (tag as HTMLElement).style.borderWidth = '0';
        } else if (mode === 'light') {
          (tag as HTMLElement).style.backgroundColor = '#eff6ff'; // blue-50
          (tag as HTMLElement).style.color = '#1d4ed8'; // blue-700
          (tag as HTMLElement).style.borderColor = '#bfdbfe'; // blue-200
          (tag as HTMLElement).style.borderWidth = '1px';
        } else {
          (tag as HTMLElement).style.backgroundColor = '#fdf2f8'; // pink-50
          (tag as HTMLElement).style.color = '#be185d'; // pink-700
          (tag as HTMLElement).style.borderColor = '#fbcfe8'; // pink-200
          (tag as HTMLElement).style.borderWidth = '1px';
        }
      });

      // 배경색 업데이트
      const bgElements = document.querySelectorAll('.bg-gray-900, .min-h-screen');
      bgElements.forEach(element => {
        if (mode === 'dark') {
          (element as HTMLElement).style.backgroundColor = '#111827';
        } else if (mode === 'light') {
          (element as HTMLElement).style.backgroundColor = '#f9fafb';
        } else {
          (element as HTMLElement).style.backgroundColor = '#ffffff';
        }
      });

      // 헤더 배경색 업데이트
      const header = document.querySelector('header');
      if (header) {
        if (mode === 'dark') {
          (header as HTMLElement).style.backgroundColor = '#111827';
        } else {
          (header as HTMLElement).style.backgroundColor = '#ffffff';
        }
      }

      // 텍스트 색상 업데이트
      const textElements = document.querySelectorAll('.text-gray-800, h1, h2, h3, h4, p');
      textElements.forEach(element => {
        if (mode === 'dark') {
          (element as HTMLElement).style.color = '#f3f4f6';
        } else {
          (element as HTMLElement).style.color = '';
        }
      });

      // 대시보드 페이지 배경 업데이트 (새로고침 없이 즉시 적용)
      const dashboardBg = document.querySelector('div[class*="py-12 bg-"]');
      if (dashboardBg) {
        if (mode === 'dark') {
          (dashboardBg as HTMLElement).style.background = 'linear-gradient(to bottom, #111827, #1f2937)';
          (dashboardBg as HTMLElement).classList.remove('from-pink-50', 'to-white', 'from-blue-50');
          (dashboardBg as HTMLElement).classList.add('from-gray-900', 'to-gray-800');
        } else if (mode === 'light') {
          (dashboardBg as HTMLElement).style.background = 'linear-gradient(to bottom, #dbeafe, #ffffff)'; // 더 진한 파란색 그라데이션
          (dashboardBg as HTMLElement).classList.remove('from-pink-50', 'to-white', 'from-gray-900', 'to-gray-800');
          (dashboardBg as HTMLElement).classList.add('from-blue-50');
        } else {
          // original
          (dashboardBg as HTMLElement).style.background = 'linear-gradient(to bottom, #fbcfe8, #ffffff)'; // 더 진한 분홍색 그라데이션
          (dashboardBg as HTMLElement).classList.remove('from-blue-50', 'from-gray-900', 'to-gray-800');
          (dashboardBg as HTMLElement).classList.add('from-pink-50', 'to-white');
        }
      }

      // 특별히 gradient 배경을 가진 요소들 처리
      const gradientBgs = document.querySelectorAll('div[class*="bg-gradient-to-b"]');
      gradientBgs.forEach(element => {
        if (mode === 'dark') {
          (element as HTMLElement).style.background = 'linear-gradient(to bottom, #111827, #1f2937)';
        } else if (mode === 'light') {
          (element as HTMLElement).style.background = 'linear-gradient(to bottom, #eff6ff, #ffffff)';
        } else {
          // original
          (element as HTMLElement).style.background = 'linear-gradient(to bottom, #fdf2f8, #ffffff)';
        }
      });

      // 전체 body 배경색 강제 업데이트
      if (mode === 'dark') {
        document.body.style.backgroundColor = '#111827';
        document.body.classList.add('dark-mode');
      } else if (mode === 'light') {
        document.body.style.backgroundColor = '#ffffff';
        document.body.classList.remove('dark-mode');
      } else {
        // original
        document.body.style.backgroundColor = '#ffffff';
        document.body.classList.remove('dark-mode');
      }
    } catch (error) {
      console.error('DOM 요소 스타일 업데이트 중 오류:', error);
    }
  };

  // 테마 변경 함수
  const changeTheme = (mode: ThemeMode) => {
    if (typeof window === 'undefined') return;

    // 먼저 DOM 상태를 업데이트 (즉시 반영)
    updateThemeClasses(mode);

    // 그 다음 React 상태 업데이트 (UI 일관성)
    setThemeMode(mode);
    globalTheme = mode;

    // localStorage에 저장
    localStorage.setItem('themeMode', mode);

  };

  // 다크모드 호환성을 위한 변수들
  const isDarkMode = themeMode === 'dark';

  // 테마 순환 함수
  const cycleTheme = () => {
    if (themeMode === 'original') {
      changeTheme('dark');
    } else if (themeMode === 'dark') {
      changeTheme('light');
    } else {
      changeTheme('original');
    }
  };

  // 기존 토글 함수도 지원 (다크모드 <-> 라이트모드)
  const toggleDarkMode = () => {
    if (themeMode === 'dark') {
      changeTheme('light');
    } else {
      changeTheme('dark');
    }
  };

  return { themeMode, changeTheme, isDarkMode, toggleDarkMode, cycleTheme, isLoading };
};

export default useThemeMode; 