"use client";

import { paymentApi } from "@/services/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = Object.fromEntries(searchParams.entries());
  const { orderId, amount, paymentKey } = params;

  // const { orderId, amount, paymentKey } = await params;

  useEffect(() => {
    async function pay() {
      const payTempCheckRes = await paymentApi.payTempCheck(orderId, amount);
      if (payTempCheckRes.code !== "SU") {
        router.push(`/pay/fail`);
        return; // 임시 저장 값이 다름
      }

      const payConfirmRes = await paymentApi.payConfirm(paymentKey, orderId, amount, uuidv4());
      if (payConfirmRes.code !== "SU") {
        // 결제 실패
        router.replace(`/pay/fail?message=${payConfirmRes.data.message || ""}&code=${payConfirmRes.data.code || ""}`);
        return;
      }
    }
    pay();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center space-y-6 border border-green-100">
        <h2 className="text-2xl font-semibold text-green-600">결제 성공</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium text-gray-900">주문번호:</span> {orderId}
          </p>
          <p>
            <span className="font-medium text-gray-900">결제 금액:</span> {Number(amount).toLocaleString()}원
          </p>
          <p>
            <span className="font-medium text-gray-900">결제 키:</span> {paymentKey}
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="inline-block mt-4 px-5 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          홈으로 이동
        </button>
      </div>
    </div>
  );
}
