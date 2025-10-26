"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

// 모달 외부 영역을 어둡게 처리하고 클릭시 뒤로가기
export default function Layout({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.back();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <>
      {/* 어두운 배경 */}
      <div className="fixed top-0 w-dvw h-dvh bg-black opacity-50 z-[9999]" />
      {/* 중앙 정렬 모달 컨테이너 */}
      <div
        className="fixed top-0 w-dvw h-dvh flex items-center justify-center z-[9999]"
        onClick={() => router.back()} // 배경 클릭 시 뒤로 가기
      >
        {/* 자식에서 발생하는 클릭이벤트 전파 방지 */}
        <div onClick={(e) => e.stopPropagation()}>{children}</div>
      </div>
    </>
  );
}
