"use client";

import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/home.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";
import { MSWProvider } from "@/components/providers/MSWProvider";
import dynamic from "next/dynamic";
import RQProvider from "@/components/providers/RQProvider";
import { ThemeMode } from "@/hooks/useDarkMode";

const KakaoScript = dynamic(() => import("../components/KakaoScript"), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_MOCKING === "true") {
  import("@/mocks/node").then(({ server }) => {
    server.listen();
  });
}

// 다크모드 초기화 및 관리 컴포넌트 (클라이언트 전용)
const ThemeInitializer = dynamic(
  () =>
    Promise.resolve(() => {
      const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        if (typeof window !== "undefined") {
          return (localStorage.getItem("themeMode") as ThemeMode) || "original";
        }
        return "original";
      });

      const [isInitialized, setIsInitialized] = useState(false);

      useEffect(() => {
        if (typeof window === "undefined") return;

        // 페이지 로드 시 localStorage에서 테마 설정을 가져와 적용
        const savedThemeMode = localStorage.getItem("themeMode") as ThemeMode | null;
        const initialTheme = savedThemeMode || "original";

        // 초기화 시에도 상태를 설정합니다
        if (initialTheme !== themeMode) {
          setThemeMode(initialTheme);
        }

        // HTML에 클래스 적용
        updateThemeClasses(initialTheme);
        setIsInitialized(true);

        // 테마 변경 이벤트 감지
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === "themeMode") {
            const currentTheme = e.newValue as ThemeMode | null;
            if (currentTheme && currentTheme !== themeMode) {
              setThemeMode(currentTheme);
              updateThemeClasses(currentTheme);
            }
          }
        };

        window.addEventListener("storage", handleStorageChange);

        // 커스텀 이벤트 리스너 추가
        const handleThemeChange = (e: CustomEvent) => {
          const newTheme = e.detail as ThemeMode;
          if (newTheme !== themeMode) {
            setThemeMode(newTheme);
            updateThemeClasses(newTheme);
          }
        };

        window.addEventListener("themeChange", handleThemeChange as EventListener);

        // 페이지 가시성 변경 이벤트 처리 (탭 전환 시 테마 동기화)
        const handleVisibilityChange = () => {
          if (document.visibilityState === "visible") {
            const currentTheme = localStorage.getItem("themeMode") as ThemeMode | null;
            if (currentTheme && currentTheme !== themeMode) {
              setThemeMode(currentTheme);
              updateThemeClasses(currentTheme);
            }
          }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
          window.removeEventListener("storage", handleStorageChange);
          window.removeEventListener("themeChange", handleThemeChange as EventListener);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
      }, [themeMode]);

      const updateThemeClasses = (mode: ThemeMode) => {
        if (typeof document === "undefined") return;

        const htmlElement = document.documentElement;

        // 모든 테마 클래스 제거
        htmlElement.classList.remove("dark", "light", "original");

        // 해당 테마 클래스 추가
        htmlElement.classList.add(mode);

        // 다크모드 특별 처리 (tailwind dark: 선택자를 위해)
        if (mode === "dark") {
          htmlElement.classList.add("dark");
          document.body.style.backgroundColor = "#000000";
          document.body.style.color = "#ffffff";
        } else if (mode === "light") {
          document.body.style.backgroundColor = "#ffffff";
          document.body.style.color = "#111827";
        } else {
          document.body.style.backgroundColor = "#ffffff";
          document.body.style.color = "#111827";
        }
      };

      return null;
    }),
  { ssr: false }
);

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 메타데이터를 head 태그 안에 직접 추가 */}
        <title>Travel Planner</title>
        <meta name="description" content="Plan your travel easily" />
        {/* 카카오맵 API */}
        <script
          type="text/javascript"
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`}
          async
        ></script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeInitializer />
        <KakaoScript />
        <MSWProvider>
          <RQProvider>
            {React.Children.map(children, (child, i) =>
              React.isValidElement(child) ? React.cloneElement(child, { key: `child-${i}` }) : child
            )}
            {React.Children.map(modal, (child, i) =>
              React.isValidElement(child) ? React.cloneElement(child, { key: `modal-${i}` }) : child
            )}
            <ToastContainer />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  style: {
                    background: "#10b981",
                  },
                },
                error: {
                  style: {
                    background: "#ef4444",
                  },
                },
              }}
            />
          </RQProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
