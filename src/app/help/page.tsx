"use client";

import Layout from "@/components/Layout";
import {
  FaEnvelope,
  FaQuestionCircle,
  FaTicketAlt,
  FaLock,
  FaUserShield,
  FaRegEdit,
  FaMapMarkedAlt,
  FaUsers,
} from "react-icons/fa";
import Link from "next/link";

export default function HelpPage() {
  const mail = "wlsntus55@gmail.comm"; // 요청된 메일 주소 그대로 사용

  const faqs = [
    {
      icon: <FaTicketAlt className="text-pink-500" />,
      q: "AI 여행 계획은 어떻게 이용하나요? 티켓은 언제 차감되나요?",
      a: "상단의 'AI 여행 계획'에서 여행지/일정/스타일을 입력하면 추천 일정을 받아볼 수 있습니다. 추천 결과 생성 시 1회당 1티켓이 차감됩니다.",
    },
    {
      icon: <FaLock className="text-pink-500" />,
      q: "결제 및 환불은 어떻게 되나요?",
      a: "'결제' 페이지에서 티켓을 구매할 수 있습니다. 결제 오류나 환불이 필요한 경우 1:1 문의로 주문번호와 함께 연락주세요.",
    },
    {
      icon: <FaRegEdit className="text-pink-500" />,
      q: "리뷰는 어떻게 작성/수정/삭제 하나요?",
      a: "'리뷰보기'에서 리뷰를 확인하고, 우측 상단의 작성 버튼으로 새로운 리뷰를 등록할 수 있습니다. 본인이 작성한 리뷰는 상세 화면에서 수정/삭제가 가능합니다.",
    },
    {
      icon: <FaMapMarkedAlt className="text-pink-500" />,
      q: "축제/여행지 정보가 실제와 달라요.",
      a: "데이터 출처 업데이트 시 시차가 생길 수 있습니다. 잘못된 정보를 발견하시면 캡처 또는 링크와 함께 1:1 문의로 보내주세요. 빠르게 반영하겠습니다.",
    },
    {
      icon: <FaUsers className="text-pink-500" />,
      q: "여행멤버 구하기 게시판 이용 시 주의사항은?",
      a: "개인정보 과다 공유를 지양하고, 금전 거래 전 상대 정보를 충분히 확인해주세요. 의심스러운 활동은 신고 부탁드립니다.",
    },
    {
      icon: <FaUserShield className="text-pink-500" />,
      q: "로그인 문제/계정 보호는 어떻게 하나요?",
      a: "로그인이 안된다면 브라우저 캐시 삭제 후 재시도, 다른 브라우저/네트워크에서도 시도해보세요. 계정 보안을 위해 주기적으로 비밀번호를 변경해 주세요.",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm mb-4">
              <FaQuestionCircle className="text-pink-500 text-2xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              고객센터
            </h1>
            <p className="text-gray-600">
              자주 묻는 질문과 1:1 문의로 더 빠르게 도와드릴게요.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2">
              <div className="space-y-3">
                {faqs.map((item, idx) => (
                  <details
                    key={idx}
                    className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                  >
                    <summary className="flex items-center gap-3 cursor-pointer list-none">
                      <div className="w-8 h-8 flex items-center justify-center bg-pink-50 rounded-lg">
                        {item.icon}
                      </div>
                      <span className="text-gray-900 font-semibold flex-1">
                        {item.q}
                      </span>
                      <span className="text-pink-500 transition-transform group-open:rotate-180">
                        ▾
                      </span>
                    </summary>
                    <div className="mt-3 pl-11 text-gray-700 leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <aside className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-max">
              <h2 className="text-xl font-bold text-gray-900 mb-2">1:1 문의</h2>
              <p className="text-sm text-gray-600 mb-5">
                답변이 필요하시면 아래 버튼을 눌러 메일을 보내주세요.
              </p>
              <a
                href={`mailto:${mail}?subject=%5B고객문의%5D%20문의합니다&body=%EC%9D%B8%ED%99%94%EB%AA%85%3A%20%0A%0A%EB%AC%B8%EC%9D%98%20%EB%82%B4%EC%9A%A9%3A%20%0A%0A%ED%99%95%EC%9D%B8%20%EA%B0%80%EB%8A%A5%ED%95%9C%20%EC%A0%95%EB%B3%B4%28%EC%A3%BC%EB%AC%B8%20%EC%95%BD%EA%B7%BC%2C%20%EC%B6%94%EA%B0%80%20%EC%A0%95%EB%B3%B4%20%EB%93%B1%29%3A%20`}
                className="inline-flex items-center justify-center w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition-colors border-none"
              >
                <FaEnvelope className="mr-2" /> 메일로 문의하기
              </a>

              <div className="mt-5 p-4 rounded-xl bg-pink-50 text-pink-700 text-sm">
                <div className="font-semibold mb-1">빠른 답변을 위해</div>
                <ul className="list-disc pl-5 space-y-1 m-0">
                  <li>사용 중 화면 캡처 또는 오류 메시지 포함</li>
                  <li>결제 관련은 주문번호/시간을 함께 기재</li>
                  <li>연락 가능한 이메일 또는 전화번호 남기기</li>
                </ul>
              </div>

              <div className="mt-4 text-xs text-gray-500 break-all">
                메일 주소:{" "}
                <span className="font-medium text-gray-700">{mail}</span>
              </div>
            </aside>
          </div>

          <div className="text-center text-sm text-gray-500">
            더 궁금하신가요?{" "}
            <Link href="/privacy" className="text-pink-600 hover:underline">
              개인정보
            </Link>{" "}
            및{" "}
            <Link href="/terms" className="text-pink-600 hover:underline">
              이용약관
            </Link>
            을 확인해 주세요.
          </div>
        </div>
      </div>
    </Layout>
  );
}
