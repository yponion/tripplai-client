"use client";

import Script from "next/script";

// Kakao 타입 정의
type KakaoType = {
  init: (apiKey: string) => void;
  isInitialized: () => boolean;
};

export default function KakaoScript() {
  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        // Kakao SDK 초기화
        const kakao = (window as { Kakao?: KakaoType }).Kakao;
        if (kakao) {
          if (!kakao.isInitialized()) {
            kakao.init(process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "");
          }
        }
      }}
    />
  );
}
