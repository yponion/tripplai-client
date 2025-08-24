"use client";

import { useState, useEffect } from "react";
import { FaTwitter, FaFacebook, FaLink } from "@/components/common/icons";
import KakaoScript from "@/components/KakaoScript";
import { getImagesByKeyword, getDefaultImage } from "@/services/tourImageService";
import Image from "next/image";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  location?: string;
}

// 외부에서 접근 가능한 도메인 (실제 배포된 도메인으로 변경 필요)
const PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_BASE_URL || "https://tripplanner-ai.vercel.app";

// 위치별 이미지 경로 (로컬 파일)
const LOCATION_IMAGES: Record<string, string> = {
  제주도: "/images/locations/jeju/jeju1.jpg",
  서울: "/images/locations/seoul/seoul1.jpg",
  부산: "/images/locations/busan/busan1.jpg",
  경주: "/images/locations/gyeongju/gyeongju1.jpg",
  전주: "/images/locations/jeonju/jeonju1.jpg",
  강원도: "/images/locations/gangwon/gangwon1.jpg",
};

export default function ShareButtons({ url, title, description, location }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [shareImageUrl, setShareImageUrl] = useState("");

  // 공유에 사용할 이미지 설정
  useEffect(() => {
    const locationFromTitle = extractLocationFromTitle(title);
    const locationToUse = location || locationFromTitle;

    const fetchLocalImage = async () => {
      try {
        setIsImageLoading(true);

        // 위치에 맞는 로컬 이미지 경로 사용
        if (locationToUse && LOCATION_IMAGES[locationToUse]) {
          const imagePath = LOCATION_IMAGES[locationToUse];
          // 외부에서 접근 가능한 URL 생성
          const fullImageUrl = PUBLIC_DOMAIN + imagePath;
          setShareImageUrl(fullImageUrl);
          return;
        }

        // 위치를 찾지 못한 경우 태그 기반으로 이미지 찾기
        if (locationToUse) {
          const keywords = extractKeywordsFromTitle(title);
          const images = await getImagesByKeyword(locationToUse, keywords, keywords);
          if (images.length > 0) {
            // 전체 URL로 변환
            const fullImageUrl = PUBLIC_DOMAIN + images[0];
            setShareImageUrl(fullImageUrl);
            return;
          }
        }

        // 기본 이미지 사용
        const defaultImagePath = getDefaultImage(locationToUse || title);
        const fallbackImageUrl = PUBLIC_DOMAIN + defaultImagePath;
        setShareImageUrl(fallbackImageUrl);
      } catch (error) {
        console.error("공유 이미지 가져오기 실패:", error);
        // 오류 시 기본 이미지 사용
        const fallbackImageUrl = PUBLIC_DOMAIN + "/images/reviews-og.jpg";
        setShareImageUrl(fallbackImageUrl);
      } finally {
        setIsImageLoading(false);
      }
    };

    fetchLocalImage();
  }, [title, location]);

  // 제목에서 위치를 추출하는 함수
  const extractLocationFromTitle = (title: string): string => {
    let location = "";
    if (title.includes("제주")) location = "제주도";
    else if (title.includes("서울")) location = "서울";
    else if (title.includes("부산")) location = "부산";
    else if (title.includes("경주")) location = "경주";
    else if (title.includes("전주")) location = "전주";
    else if (title.includes("강원") || title.includes("양양")) location = "강원도";

    return location;
  };

  // 제목에서 키워드를 추출하는 함수
  const extractKeywordsFromTitle = (title: string): string => {
    const keywordsList = ["음식", "자연", "바다", "산", "카페", "문화", "공원", "여행", "휴가", "축제"];

    // 제목에 포함된 키워드 찾기
    for (const keyword of keywordsList) {
      if (title.includes(keyword)) {
        return keyword;
      }
    }

    return "";
  };

  const handleCopyLink = async () => {
    try {
      // 외부에서 접근 가능한 URL로 변환
      const publicUrl = getPublicUrl(url);
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      // 복사 성공 표시
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("링크 복사 실패:", error);
      alert("링크 복사에 실패했습니다. 직접 복사해주세요.");
    }
  };

  // URL을 외부에서 접근 가능한 형태로 변환
  const getPublicUrl = (localUrl: string): string => {
    if (localUrl.startsWith("http")) return localUrl;

    // localhost 부분을 공개 도메인으로 변경
    if (localUrl.includes("localhost")) {
      return localUrl.replace(/http:\/\/localhost:\d+/, PUBLIC_DOMAIN);
    }

    // 상대 경로인 경우 절대 경로로 변환
    if (localUrl.startsWith("/")) {
      return PUBLIC_DOMAIN + localUrl;
    }

    return PUBLIC_DOMAIN + "/" + localUrl;
  };

  const shareToTwitter = () => {
    try {
      const text = `${title} ${description ? `- ${description}` : ""}`;
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
        getPublicUrl(url)
      )}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("트위터 공유 실패:", error);
      alert("트위터 공유에 실패했습니다.");
    }
  };

  const shareToFacebook = () => {
    try {
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPublicUrl(url))}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("페이스북 공유 실패:", error);
      alert("페이스북 공유에 실패했습니다.");
    }
  };

  const shareToKakao = () => {
    try {
      if (!window.Kakao) {
        alert("카카오톡 SDK가 로드되지 않았습니다. 페이지를 새로고침 후 다시 시도해주세요.");
        return;
      }

      if (!window.Kakao.isInitialized()) {
        if (process.env.NEXT_PUBLIC_KAKAO_APP_KEY) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_APP_KEY);
        } else {
          console.error("카카오 API 키가 설정되지 않았습니다.");
        }
      }

      if (!window.Kakao.Share) {
        alert("카카오톡 공유 기능을 사용할 수 없습니다. 최신 브라우저에서 시도해주세요.");
        return;
      }

      // 공유할 URL이 외부에서 접근 가능한지 확인
      const publicUrl = getPublicUrl(url);

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: title,
          description: description || "",
          imageUrl: shareImageUrl, // 공유 이미지 URL
          link: {
            mobileWebUrl: publicUrl,
            webUrl: publicUrl,
          },
        },
        buttons: [
          {
            title: "웹으로 보기",
            link: {
              mobileWebUrl: publicUrl,
              webUrl: publicUrl,
            },
          },
        ],
        serverCallbackArgs: {
          shared: "true",
          reviewId: publicUrl.split("/").pop() || "",
        },
      });
    } catch (error) {
      console.error("카카오톡 공유 실패:", error);
      alert("카카오톡 공유에 실패했습니다. 네트워크 연결을 확인해주세요.");
    }
  };

  return (
    <>
      <KakaoScript />
      <div className="flex space-x-4">
        <button
          onClick={shareToTwitter}
          className="flex items-center border-0 justify-center w-10 h-10 rounded-full bg-[#1DA1F2] text-white hover:opacity-90 transition-opacity"
          aria-label="트위터에 공유하기"
        >
          <FaTwitter size={18} />
        </button>

        <button
          onClick={shareToFacebook}
          className="flex items-center border-0 justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white hover:bg-opacity-90"
          aria-label="페이스북에 공유하기"
        >
          <FaFacebook size={18} />
        </button>

        <button
          onClick={shareToKakao}
          className="flex items-center border-0 justify-center w-10 h-10 rounded-full bg-[#FEE500] text-black hover:bg-opacity-90"
          aria-label="카카오톡으로 공유하기"
          disabled={isImageLoading}
        >
          <Image
            src="/icons/kakao-talk.png"
            alt="카카오톡 공유"
            width={40}
            height={40}
            className={`cursor-pointer hover:opacity-70 transition-opacity ${isImageLoading ? "opacity-50" : ""}`}
            unoptimized={true}
          />
        </button>

        <button
          onClick={handleCopyLink}
          className={`flex items-center border-0 justify-center w-10 h-10 rounded-full ${
            copied ? "bg-green-500" : "bg-gray-700"
          } text-white hover:bg-opacity-90 transition-colors`}
          aria-label="링크 복사하기"
        >
          <FaLink size={18} />
        </button>

        {copied && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 py-2 px-4 bg-green-500 text-white rounded-lg shadow-lg">
            링크가 복사되었습니다!
          </div>
        )}
      </div>
    </>
  );
}
