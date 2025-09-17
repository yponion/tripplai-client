"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import CreateReviewModal from "@/components/reviews/CreateReviewModal";

export default function CreateReviewButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (
    reviewData: any,
    proofImage?: File | null,
    reviewImages?: File[]
  ) => {
    try {
      // FormData 생성 (이미지 파일 포함)
      const formData = new FormData();

      // 리뷰 데이터를 JSON으로 추가 - Blob으로 감싸서 Content-Type 명시
      const reviewJson = {
        title: reviewData.title,
        content: reviewData.content,
        rating: reviewData.rating,
        address: reviewData.location || "",
      };

      // 리뷰 이미지만 S3에 업로드 (증명 이미지는 업로드하지 않음)
      if (reviewImages && reviewImages.length > 0) {
        reviewImages.forEach((image, index) => {
          formData.append("images", image);
        });
      }

      // JSON을 Blob으로 감싸서 Content-Type을 application/json으로 설정
      const reviewBlob = new Blob([JSON.stringify(reviewJson)], {
        type: "application/json",
      });
      formData.append("review", reviewBlob);

      // FormData 내용 디버깅 (리뷰 이미지만)
      let reviewImageCount = 0;

      for (let [key, value] of formData.entries()) {
        if (key === "images") {
          reviewImageCount++;
        }
      }

      console.log(`📸 S3 업로드할 리뷰 이미지: ${reviewImageCount}개`);
      console.log(
        `💡 증명 이미지는 S3에 업로드하지 않음 (Google Vision API로 목적지만 추출)`
      );

      if (reviewImageCount === 0) {
        console.log(
          "ℹ️ S3에 업로드할 리뷰 이미지가 없습니다. (증명 이미지만 있는 경우)"
        );
        console.log("💡 Vision API 성공 여부와 관계없이 리뷰는 등록됩니다.");
      }

      // 인증 토큰 가져오기
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      // API 호출
      const response = await fetch("/api/reviews/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        // 응답 본문이 있다면 확인
        const responseText = await response.text();

        alert("리뷰가 성공적으로 등록되었습니다!");
        // 약간의 지연을 주어 서버의 트랜잭션이 완료되도록 함
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const errorData = await response.json();
        console.error("❌ 서버 응답 오류:", errorData);
        alert(
          `리뷰 등록에 실패했습니다: ${errorData.error || "알 수 없는 오류"}`
        );
      }
    } catch (error) {
      console.error("💥 리뷰 등록 실패:", error);
      alert("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:-translate-y-0.5 font-semibold focus:outline-none focus:ring-0 border-none"
      >
        <div className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full mr-3 group-hover:bg-white/30 transition-colors">
          <FaPlus className="text-sm" />
        </div>
        <span>리뷰 작성하기</span>
      </button>

      <CreateReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
