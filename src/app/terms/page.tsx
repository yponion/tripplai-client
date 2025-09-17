import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">이용약관</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">제1조 (목적)</h2>
              <p className="text-gray-700 leading-relaxed">
                본 약관은 TripPlanner AI(이하 "서비스")가 제공하는 여행 계획 및 리뷰 서비스의 이용과 관련하여 
                서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">제2조 (서비스 이용)</h2>
              <p className="text-gray-700 leading-relaxed">
                1. 본 서비스는 만 14세 이상의 개인이 이용할 수 있습니다.<br/>
                2. 서비스 이용을 위해서는 소셜 로그인(카카오, 네이버, 구글)이 필요합니다.<br/>
                3. 이용자는 서비스 이용 시 타인의 권리를 침해하지 않아야 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">제3조 (리뷰 작성 및 이미지 업로드)</h2>
              <p className="text-gray-700 leading-relaxed">
                1. 리뷰 작성 시 여행 증명 이미지(영수증, 항공권 등)가 필요합니다.<br/>
                2. 증명 이미지는 목적지 정보 추출 용도로만 사용되며 저장되지 않습니다.<br/>
                3. 리뷰 이미지는 다른 사용자들에게 공개되며 AWS S3에 저장됩니다.<br/>
                4. 부적절한 내용의 리뷰나 이미지는 삭제될 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">제4조 (개인정보 보호)</h2>
              <p className="text-gray-700 leading-relaxed">
                개인정보 처리에 관한 사항은 별도의 개인정보처리방침에 따릅니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">제5조 (면책사항)</h2>
              <p className="text-gray-700 leading-relaxed">
                1. 서비스는 이용자가 작성한 리뷰의 내용에 대해 책임지지 않습니다.<br/>
                2. 외부 API(공공데이터, 날씨 정보 등)의 오류로 인한 정보 부정확성에 대해 책임지지 않습니다.<br/>
                3. 서비스 이용 중 발생하는 손해에 대해 법적 책임을 지지 않습니다.
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                시행일자: 2024년 12월 19일<br/>
                본 약관은 언제든지 변경될 수 있으며, 변경 시 공지사항을 통해 알려드립니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
