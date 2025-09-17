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
          // 성공 시 쿠키에서 토큰 가져오기
          const accessToken = Cookies.get("accessToken");
          const refreshToken = Cookies.get("refreshToken");

          if (accessToken) {
            // 세션 스토리지에 토큰 저장
            sessionStorage.setItem("accessToken", accessToken);
            if (refreshToken) {
              sessionStorage.setItem("refreshToken", refreshToken);
            }

            // 쿠키 삭제 (보안상 이유)
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");

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
