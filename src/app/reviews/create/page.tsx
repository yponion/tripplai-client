"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaStar, FaCamera, FaMapMarkerAlt, FaRobot, FaSpinner } from "react-icons/fa";
import { createReview } from "@/services/reviewService";
import { CreateReviewRequest } from "@/types/review";

export default function CreateReviewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [address, setAddress] = useState("");
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [extractedInfo, setExtractedInfo] = useState<{ title?: string; address?: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 영수증 분석 (구글 비전 API)
  const analyzeReceipt = async (file: File) => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/vision", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`영수증 분석 실패: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.extractedText) {
        const text = result.extractedText;

        // 텍스트를 줄별로 분리
        const lines = text.split("\n").filter((line: string) => line.trim());

        // 1. 상호명 추출 (첫 번째 유의미한 줄)
        let extractedTitle = "";
        for (const line of lines) {
          const cleaned = line.trim();
          // 숫자나 특수문자로만 이루어진 줄은 제외
          if (cleaned.length > 1 && !/^[\d\s\-\.]+$/.test(cleaned)) {
            extractedTitle = cleaned;
            break;
          }
        }

        // 2. 지역/주소 추출 (더 스마트한 패턴)
        let extractedAddress = "";

        // 주요 도시/지역 패턴 (KTX 역명 등 포함)
        const locationPatterns = [
          /(서울|부산|대구|인천|광주|대전|울산|세종|천안|아산|천안아산|평택|수원|용산|영등포|강남|명동|홍대)/i,
          /(경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주도)/i,
          /.*주소[:\s]*(.+)/i,
          /.*(구|시|군|동|로|길).*/i,
        ];

        // 우선순위: 주요 도시명 -> 광역시/도 -> 주소 패턴 -> 기타
        for (const pattern of locationPatterns) {
          for (const line of lines) {
            const match = line.match(pattern);
            if (match) {
              let location = match[1] || match[0];
              location = location.replace(/주소[:\s]*/, "").trim();

              // 너무 긴 텍스트는 제외 (한 줄 전체가 매칭되는 경우)
              if (location.length <= 20 && location.length > 1) {
                extractedAddress = location;
                break;
              }
            }
          }
          if (extractedAddress) break;
        }

        // 3. 지역 정보만 적용 (제목은 자동 입력하지 않음)
        if (extractedAddress && !address) {
          setAddress(extractedAddress);
        }

        // 4. 추출된 정보 저장 (사진 위에 표시용)
        setExtractedInfo({
          title: extractedTitle,
          address: extractedAddress,
        });

        alert(`✅ 영수증 분석 완료!

📝 추출된 정보:
• 상호명: ${extractedTitle || "없음"}
• 지역: ${extractedAddress || "없음"}

지역 정보가 자동으로 입력되었습니다!`);
      } else {
        console.error("API 응답에 success나 extractedText가 없음:", result);
        throw new Error("텍스트 추출 실패");
      }
    } catch (error) {
      console.error("영수증 분석 상세 오류:", error);

      let errorMessage = "영수증 분석 중 오류가 발생했습니다.";

      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "Google API 키가 유효하지 않습니다.";
        } else if (error.message.includes("403")) {
          errorMessage = "Google Vision API 접근 권한이 없습니다.";
        } else if (error.message.includes("429")) {
          errorMessage = "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMessage = error.message;
        }
      }

      alert(`❌ ${errorMessage}\n\n수동으로 정보를 입력해주세요.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // 파일 객체 저장
      setImages((prev) => [...prev, ...newFiles]);

      // 미리보기 URL 생성
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviews((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);

        // 첫 번째 이미지가 업로드되면 자동으로 영수증 분석
        if (images.length === 0 && newFiles[0]) {
          analyzeReceipt(newFiles[0]);
        }
      });
    }
  };

  // 이미지 제거
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    // 첫 번째 이미지 제거 시 추출된 정보와 지역 정보도 초기화
    if (index === 0) {
      setExtractedInfo({});
      setAddress(""); // 지역 정보도 함께 초기화
    }
  };

  // 영수증 다시 분석
  const reAnalyzeReceipt = () => {
    if (images.length > 0) {
      // 기존 추출 정보 초기화
      setExtractedInfo({});
      setAddress("");
      analyzeReceipt(images[0]);
    } else {
      alert("분석할 이미지를 먼저 업로드해주세요.");
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!title || !content || !address || rating === 0) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const reviewData: CreateReviewRequest = {
        title,
        content,
        address,
        rating,
      };

      await createReview(reviewData, images);

      alert("리뷰가 성공적으로 작성되었습니다!");
      router.push("/reviews");
    } catch (error) {
      console.error("리뷰 작성 실패:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("리뷰 작성 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인 확인
  if (typeof window !== "undefined" && !sessionStorage.getItem("accessToken")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
        <p className="text-gray-600 mb-6">리뷰를 작성하려면 먼저 로그인해주세요.</p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 border-none"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">여행 리뷰 작성</h1>
        <p className="text-gray-600">영수증을 업로드하면 AI가 자동으로 정보를 추출해드립니다!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 영수증 사진 업로드 (AI 분석) */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg border-2 border-dashed border-pink-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaRobot className="text-pink-500 text-2xl mr-3" />
              <div>
                <h3 className="text-lg font-semibold">AI 영수증 분석</h3>
                <p className="text-sm text-gray-600">영수증을 업로드하면 자동으로 정보를 추출합니다</p>
              </div>
            </div>
            {images.length > 0 && (
              <button
                type="button"
                onClick={reAnalyzeReceipt}
                disabled={isAnalyzing}
                className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 border-none"
              >
                {isAnalyzing ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <FaRobot className="mr-2" />
                    다시 분석
                  </>
                )}
              </button>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="flex flex-wrap gap-4 mb-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-32 h-32 rounded-md overflow-hidden border-2 border-pink-200">
                <Image src={preview} alt={`영수증 ${index + 1}`} fill className="object-cover" />

                {/* 첫 번째 이미지에만 분석 결과 표시 */}
                {index === 0 && (extractedInfo.title || extractedInfo.address) && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-white bg-opacity-95 p-2 rounded text-xs text-center max-w-full">
                      {extractedInfo.title && (
                        <p className="font-semibold text-pink-600 truncate">📍 {extractedInfo.title}</p>
                      )}
                      {extractedInfo.address && (
                        <p className="text-gray-700 mt-1 truncate">🗺️ {extractedInfo.address}</p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-pink-300 rounded-lg hover:border-pink-500 transition-colors disabled:opacity-50"
            >
              <div className="text-center">
                {isAnalyzing ? (
                  <FaSpinner className="animate-spin text-pink-500 text-xl mb-1" />
                ) : (
                  <FaCamera className="text-pink-400 text-xl mb-1" />
                )}
                <p className="text-xs text-gray-500">{isAnalyzing ? "분석중" : "사진 추가"}</p>
              </div>
            </button>
          </div>

          {isAnalyzing && (
            <div className="text-center p-4 bg-white rounded-lg">
              <FaSpinner className="animate-spin text-pink-500 text-2xl mx-auto mb-2" />
              <p className="text-gray-600">AI가 영수증을 분석하고 있습니다...</p>
            </div>
          )}
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="여행 경험을 잘 표현하는 제목을 입력해주세요 (AI가 자동 추출)"
            required
          />
        </div>

        {/* 주소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            방문 장소 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="여행한 장소의 주소를 입력해주세요 (AI가 자동 추출)"
              required
            />
          </div>
        </div>

        {/* 별점 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            평점 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none border-none"
              >
                <FaStar className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`} />
              </button>
            ))}
            <span className="ml-2 text-gray-600">{rating > 0 ? `${rating}.0/5.0` : "평점을 선택해주세요"}</span>
          </div>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            리뷰 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="여행 경험, 추천 포인트, 팁 등을 자유롭게 작성해주세요 (AI가 기본 내용 생성)"
            required
          />
        </div>

        {/* 오류 메시지 */}
        {error && <div className="p-3 bg-red-50 text-red-500 rounded-md">{error}</div>}

        {/* 제출 버튼 */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            취소
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isAnalyzing}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed border-none"
          >
            {isSubmitting ? "처리 중..." : "리뷰 작성하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
