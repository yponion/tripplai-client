"use client";

import usePaymentStore from "@/stores/payment";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY;

export default function CheckoutPage() {
  const { amount: a, orderName, customerKey } = usePaymentStore();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      router.back();
      return;
    }
    setUser(JSON.parse(jwtDecode(accessToken!).sub as string));
  }, []);

  const [amount, setAmount] = useState({
    currency: "KRW",
    value: a,
  });

  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      // ------  결제위젯 초기화 ------
      if (!clientKey) throw new Error("환경변수 NEXT_PUBLIC_CLIENT_KEY가 설정되지 않았습니다.");

      const tossPayments = await loadTossPayments(clientKey);
      // 회원 결제
      const widgets = tossPayments.widgets({
        customerKey,
      });

      setWidgets(widgets);
    }

    fetchPaymentWidgets();
  }, [clientKey, customerKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) {
        return;
      }
      // ------ 주문의 결제 금액 설정 ------
      await widgets.setAmount(amount);

      await Promise.all([
        // ------  결제 UI 렌더링 ------
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        // ------  이용약관 UI 렌더링 ------
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets]);

  useEffect(() => {
    if (widgets == null) {
      return;
    }

    widgets.setAmount(amount);
  }, [widgets, amount]);

  return (
    <div>
      {/* 결제 UI */}
      <div id="payment-method" />
      {/* 이용약관 UI */}
      <div id="agreement" />
      {/* 결제하기 버튼 */}
      <div className="w-full px-4">
        <button
          className="mt-6 w-full py-3 px-6 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition disabled:opacity-50 border-none"
          disabled={!ready}
          onClick={async () => {
            try {
              // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
              // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
              // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
              if (!widgets) return;
              await widgets.requestPayment({
                orderId: customerKey,
                orderName,
                successUrl: window.location.origin + "/pay/success",
                failUrl: window.location.origin + "/pay/fail",
                // @ts-ignore
                customerEmail: user?.email,
                // @ts-ignore
                customerName: user?.nickname,
                customerMobilePhone: "01012341234",
              });
            } catch (error) {
              // 에러 처리하기
              console.error(error);
            }
          }}
        >
          {amount.value.toLocaleString()}원 결제하기
        </button>
      </div>
    </div>
  );
}
