import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            홈으로 돌아가기
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            TripPlanner AI 소개
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              TripPlanner AI는 인공지능 기술을 활용한 스마트 여행 계획
              서비스입니다.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              주요 기능
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>AI 기반 맞춤형 여행 코스 추천</li>
              <li>실시간 날씨 정보 및 최적 여행 시기 안내</li>
              <li>사용자 리뷰 및 평점 시스템</li>
              <li>축제 및 이벤트 정보 제공</li>
              <li>소셜 로그인 (카카오, 네이버, 구글)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              기술 스택
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">프론트엔드</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Next.js 14</li>
                  <li>React 18</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">백엔드</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Spring Boot</li>
                  <li>PostgreSQL</li>
                  <li>AWS S3</li>
                  <li>Google Vision API</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
