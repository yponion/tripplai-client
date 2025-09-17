import { NextRequest, NextResponse } from "next/server";

// 파일 업로드 크기 제한 설정 (50MB)
export const maxDuration = 60; // 60초 타임아웃
export const runtime = "nodejs";

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!SERVER_BASE_URL) {
  console.error("NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.");
}

// POST 요청 처리 - 새 리뷰 생성
export async function POST(request: NextRequest) {
  console.log("🔥 Next.js API 라우트 진입: /api/reviews/create");

  try {
    // 헤더에서 Authorization 토큰 가져오기
    const authorization = request.headers.get("authorization");
    console.log(
      "프록시 - Authorization 헤더:",
      authorization ? `있음 (${authorization.substring(0, 30)}...)` : "없음"
    );

    if (!authorization) {
      console.log("프록시 - Authorization 헤더 없음, 401 반환");
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // FormData 그대로 서버로 전달
    const formData = await request.formData();
    console.log("프록시 - FormData 필드들:", Array.from(formData.keys()));

    const serverUrl = `${SERVER_BASE_URL}/api/receiptReview`;
    console.log(`🚀 서버 API 호출 시작: ${serverUrl}`);
    console.log(
      `서버로 전달할 Authorization: ${authorization.substring(0, 30)}...`
    );

    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        Authorization: authorization,
      },
      body: formData,
    });

    console.log(`📡 서버 응답 받음: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ 서버 API 오류: ${response.status} ${response.statusText}`,
        errorText
      );

      // 401 오류인 경우 로그인 필요 메시지 반환
      if (response.status === 401) {
        return NextResponse.json(
          { error: "로그인이 필요합니다." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "서버에서 리뷰 생성 중 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    // 서버가 정확히 201을 반환했을 때만 성공으로 처리
    if (response.status === 201) {
      console.log("✅ 프록시 성공 - 201 응답 반환");
      return NextResponse.json({ success: true }, { status: 201 });
    } else {
      console.log(`⚠️ 서버가 예상치 못한 상태 코드 반환: ${response.status}`);
      return NextResponse.json(
        { error: "서버가 예상치 못한 응답을 반환했습니다." },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("💥 리뷰 생성 API 프록시 오류:", error);
    return NextResponse.json(
      { error: "리뷰 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
