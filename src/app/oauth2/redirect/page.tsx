"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Redirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const status = searchParams.get("status");

        if (status === "success") {
          // URL 파라미터에서 Base64 인코딩된 토큰 가져오기 (크로스 도메인 문제 해결)
          const encodedAccessToken = searchParams.get("token");
          const encodedRefreshToken = searchParams.get("refresh");

          let finalAccessToken = null;
          let finalRefreshToken = null;

          // 1순위: URL 파라미터에서 토큰 디코딩 (배포 환경)
          if (encodedAccessToken) {
            try {
              finalAccessToken = atob(encodedAccessToken); // Base64 디코딩
              console.log("🌐 URL 파라미터에서 Access Token 획득");
            } catch (e) {
              console.error("Access token 디코딩 실패:", e);
            }
          }

          if (encodedRefreshToken) {
            try {
              finalRefreshToken = atob(encodedRefreshToken); // Base64 디코딩
              console.log("🌐 URL 파라미터에서 Refresh Token 획득");
            } catch (e) {
              console.error("Refresh token 디코딩 실패:", e);
            }
          }

          // 2순위: 쿠키에서 확인 (로컬 환경 호환성)
          if (!finalAccessToken) {
            const cookieAccessToken = Cookies.get("accessToken");
            if (cookieAccessToken) {
              finalAccessToken = cookieAccessToken;
              console.log("🍪 쿠키에서 Access Token 획득");
            }
          }

          if (!finalRefreshToken) {
            const cookieRefreshToken = Cookies.get("refreshToken");
            if (cookieRefreshToken) {
              finalRefreshToken = cookieRefreshToken;
              console.log("🍪 쿠키에서 Refresh Token 획득");
            }
          }

          if (finalAccessToken) {
            console.log("✅ 토큰 처리 시작");
            console.log("🔑 Access Token 길이:", finalAccessToken.length);
            console.log("🔑 Refresh Token 존재:", !!finalRefreshToken);

            // 세션 스토리지에 토큰 저장
            sessionStorage.setItem("accessToken", finalAccessToken);
            if (finalRefreshToken) {
              sessionStorage.setItem("refreshToken", finalRefreshToken);
            }

            // 저장 확인
            const savedToken = sessionStorage.getItem("accessToken");
            console.log("💾 세션스토리지 저장 확인:", !!savedToken);

            // NavSection 컴포넌트에 로그인 상태 변경 알림
            window.dispatchEvent(new Event("sessionStorageChange"));
            console.log("📢 상태 변경 이벤트 발송 완료");

            // 쿠키 삭제 (보안상 이유)
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");

            // URL에서 토큰 파라미터 제거 (보안상 이유)
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete("token");
            cleanUrl.searchParams.delete("refresh");
            window.history.replaceState({}, "", cleanUrl.toString());

            // 성공 메시지 표시 후 홈으로 리다이렉트
            setTimeout(() => {
              router.replace("/");
            }, 1000);
          } else {
            throw new Error("토큰을 찾을 수 없습니다.");
          }
        } else if (status === "error") {
          // 에러 처리
          const errorCode = searchParams.get("errorCode");
          console.error("OAuth 로그인 실패:", errorCode);

          setTimeout(() => {
            router.replace("/?loginError=oauth_failed");
          }, 2000);
        } else {
          // 알 수 없는 상태
          throw new Error("알 수 없는 OAuth 상태입니다.");
        }
      } catch (error) {
        console.error("OAuth 처리 중 오류:", error);
        setTimeout(() => {
          router.replace("/?loginError=processing_failed");
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [router, searchParams]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            로그인 처리 중...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            잠시만 기다려주세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <p className="text-lg font-medium text-green-600 dark:text-green-400">
          로그인 완료!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          홈페이지로 이동합니다...
        </p>
      </div>
    </div>
  );
}
