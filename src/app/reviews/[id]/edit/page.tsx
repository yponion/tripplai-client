"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { FaStar, FaCamera, FaMapMarkerAlt } from "react-icons/fa";
import { updateReview, getReviewById } from "@/services/reviewService";
import { CreateReviewRequest, Review } from "@/types/review";

export default function EditReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  
  const [review, setReview] = useState<Review | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [address, setAddress] = useState("");
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 기존 리뷰 데이터 로드
  useEffect(() => {
    const loadReview = async () => {
      try {
        const reviewData = await getReviewById(id);
        if (!reviewData) {
          setError("리뷰를 찾을 수 없습니다.");
          return;
        }

        // 현재 사용자 확인
        const currentUser = sessionStorage.getItem('nickname');
        if (currentUser !== reviewData.nickname) {
          setError("리뷰 수정 권한이 없습니다.");
          return;
        }

        setReview(reviewData);
        setTitle(reviewData.title);
        setContent(reviewData.content);
        setAddress(""); // 서버 응답에 address가 없으므로 빈 값으로 시작
        setRating(reviewData.rating);
        
        // 기존 이미지 미리보기 설정
        setImagePreviews(reviewData.images.map(img => img.imageUrl));
      } catch (error) {
        console.error("리뷰 로드 오류:", error);
        setError("리뷰를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadReview();
    }
  }, [id]);

  // 이미지 업로드 처리
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // 파일 객체 저장
      setImages(prev => [...prev, ...newFiles]);
      
      // 미리보기 URL 생성
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreviews((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 이미지 제거
  const removeImage = (index: number) => {
    // 새로 추가된 이미지인지 기존 이미지인지 확인
    const originalImageCount = review?.images.length || 0;
    
    if (index < originalImageCount) {
      // 기존 이미지 제거
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // 새로 추가된 이미지 제거
      const newImageIndex = index - originalImageCount;
      setImages(prev => prev.filter((_, i) => i !== newImageIndex));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
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

      await updateReview(id, reviewData, images);

      alert("리뷰가 성공적으로 수정되었습니다!");
      router.push(`/reviews/${id}`);
    } catch (error) {
      console.error("리뷰 수정 실패:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("리뷰 수정 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인 확인
  if (!sessionStorage.getItem("accessToken")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
        <p className="text-gray-600 mb-6">리뷰를 수정하려면 먼저 로그인해주세요.</p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 border-none"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // 오류 발생
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 text-red-600">오류</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
        >
          이전 페이지로
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">여행 리뷰 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
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
            placeholder="여행 경험을 잘 표현하는 제목을 입력해주세요"
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
              placeholder="여행한 장소의 주소를 입력해주세요"
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
            placeholder="여행 경험, 추천 포인트, 팁 등을 자유롭게 작성해주세요"
            required
          />
        </div>

        {/* 여행 사진 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            여행 사진
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
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
                <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden">
                  <Image src={preview} alt={`여행 사진 ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 transition-colors"
              >
                <div className="text-center">
                  <FaCamera className="mx-auto text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-500">여행 사진 추가하기</p>
                </div>
              </button>
            </div>

            <p className="text-sm text-gray-500">여행 장소의 사진을 업로드해주세요.</p>
          </div>
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
            disabled={isSubmitting}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed border-none"
          >
            {isSubmitting ? "처리 중..." : "리뷰 수정하기"}
          </button>
        </div>
      </form>
    </div>
  );
} 