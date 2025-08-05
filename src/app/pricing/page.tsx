"use client";

import NavSection from "@/components/common/NavSection";
import { paymentApi } from "@/services/api";
import usePaymentStore from "@/stores/payment";
import { Icon } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FaStar, FaTicketAlt } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

const plans = [
  {
    tiket: 5,
    price: 1000,
    originalPrice: null,
    recommended: false,
    description: "스타터 추천",
  },
  {
    tiket: 50,
    price: 9000,
    originalPrice: 10000,
    recommended: true,
    description: "가장 인기 있는!",
  },
  {
    tiket: 500,
    price: 80000,
    originalPrice: 100000,
    recommended: false,
    description: "대용량 사용자 추천",
  },
];

export default function Pricing() {
  const { setAmount, setOrderName, setCustomerKey } = usePaymentStore();
  const router = useRouter();

  const pay = (price: number, point: number) => {
    const key = uuidv4();
    setCustomerKey(key);
    setAmount(price);
    setOrderName("티켓 " + point.toLocaleString() + "개");
    paymentApi.payTempStore(key, price.toString());
    router.push("/pay/checkout");
  };

  return (
    <>
      <NavSection />
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-48 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2 text-gray-800">티켓 구매</h2>
          <p className="text-gray-500 text-lg">원하는 티켓팩을 구매해보세요</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 bg-white shadow-md hover:shadow-2xl transition-transform hover:-translate-y-2 duration-300 ${
                plan.recommended ? "border-2 border-pink-500" : ""
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 -right-3 bg-pink-500 text-white rounded-full p-2 shadow-md">
                  <FaStar className="text-lg" />
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
                  <FaTicketAlt className="text-pink-600" />
                  {plan.tiket.toLocaleString()}개
                </h3>
                <div className="mt-2 text-lg">
                  {plan.originalPrice ? (
                    <div className="space-x-2">
                      <span className="line-through text-gray-400">{plan.originalPrice.toLocaleString()}원</span>
                      <span className="text-pink-600 font-bold">{plan.price.toLocaleString()}원</span>
                    </div>
                  ) : (
                    <span className="text-gray-700 font-semibold">{plan.price.toLocaleString()}원</span>
                  )}
                </div>
                <span className="inline-block mt-4 px-4 py-1 text-sm font-medium text-pink-600 bg-pink-100 rounded-full">
                  {plan.description}
                </span>
              </div>

              <button
                className="w-full bg-pink-500 text-white font-bold py-3 rounded-xl hover:bg-pink-600 transition border-none"
                onClick={() => pay(plan.price, plan.tiket)}
              >
                구매하기
              </button>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto mt-20 bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
          <p className="text-gray-600 text-sm m-0">
            💡 <span className="font-semibold text-pink-600">여행지 AI 추천 서비스</span> 이용 시{" "}
            <span className="font-semibold text-pink-600">1회당 1티켓</span>이 차감됩니다.
          </p>
        </div>
      </div>
    </>
  );
}
