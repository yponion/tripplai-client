import { NextRequest, NextResponse } from "next/server";

// Spring Boot 서버 URL (HTTPS 필수!)
const API_URL = "https://tripplanner.p-e.kr";

// GET /api/group - 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = request.headers.get("authorization");
    const cookies = request.headers.get("cookie");

    const response = await fetch(`${API_URL}/api/group?${searchParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: accessToken }),
        ...(cookies && { Cookie: cookies }),
      },
      credentials: "include",
      redirect: "manual", // 302 리다이렉트 수동 처리
    });

    // 302 리다이렉트는 인증 실패를 의미
    if (response.status === 302 || response.status === 301) {
      console.error("[Proxy] 인증 실패 - 302 리다이렉트");
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API 오류:", response.status, errorText);
      return NextResponse.json(
        { error: "API 서버 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("프록시 오류:", error);
    return NextResponse.json(
      { error: "서버 연결에 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/group - 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = request.headers.get("authorization");
    const cookies = request.headers.get("cookie");

    // 디버깅: 토큰 확인
    console.log("[Proxy] accessToken:", accessToken ? "있음" : "없음");
    console.log("[Proxy] cookies:", cookies ? "있음" : "없음");

    // 요청 헤더 설정
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // accessToken이 있으면 추가
    if (accessToken) {
      headers.Authorization = accessToken;
    }

    // 쿠키가 있으면 추가 (refreshToken 포함)
    if (cookies) {
      headers.Cookie = cookies;
    }

    const response = await fetch(`${API_URL}/api/group`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: "include",
      redirect: "manual", // 302 리다이렉트 수동 처리
    });

    // 응답 상태 로그
    console.log("[Proxy] Response status:", response.status);

    // 302 리다이렉트는 인증 실패를 의미
    if (response.status === 302 || response.status === 301) {
      console.error("[Proxy] 인증 실패 - 302 리다이렉트");
      const location = response.headers.get("location");
      console.error("[Proxy] Redirect to:", location);
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API 오류:", response.status, errorText);
      return NextResponse.json(
        { error: "API 서버 오류가 발생했습니다." },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("프록시 오류:", error);
    return NextResponse.json(
      { error: "서버 연결에 실패했습니다." },
      { status: 500 }
    );
  }
}
