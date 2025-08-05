"use client";

import { Suspense, use } from "react";
import { handlers } from "@/mocks/handlers";

const mockingEnabledPromise =
  typeof window !== "undefined" // 윈도우가 있을 때 즉, client
    ? import("@/mocks/browser").then(async ({ worker }) => {
        console.log("🔍 MSW 상태:", process.env.NEXT_PUBLIC_API_MOCKING);
        if (process.env.NEXT_PUBLIC_API_MOCKING !== "true") return;
        await worker.start({ onUnhandledRequest: "bypass" }); // 워커를 실행하는데 모킹되지 않은 요청은 실제 서버로 요청을 보냄
        worker.use(...handlers); // 핸드러를 덮어씌워서 변경된 것 적용
        (module as any).hot?.dispose(() => worker.stop()); // HMR 이슈 임시 코드 (https://github.com/vercel/next.js/issues/69098)
        console.log(worker.listHandlers());
      })
    : Promise.resolve(); // 즉시 성공하는(fulfilled) Promise 객체를 반환

function MSWProviderWrapper({ children }: { children: React.ReactNode }) {
  use(mockingEnabledPromise);
  return <>{children}</>;
}

export function MSWProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <MSWProviderWrapper>{children}</MSWProviderWrapper>
    </Suspense>
  );
}
