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

    const response = await fetch(`${API_URL}/api/group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: accessToken }),
        ...(cookies && { Cookie: cookies }),
      },
      body: JSON.stringify(body),
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
