import { NextRequest, NextResponse } from "next/server";

// Spring Boot 서버 URL (HTTPS 필수!)
const API_URL = "https://tripplanner.p-e.kr";

// GET /api/group/:id - 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = request.headers.get("authorization");
    const cookies = request.headers.get("cookie");

    console.log(`[Proxy GET] /api/group/${id} 요청`);
    console.log("[Proxy GET] accessToken:", accessToken ? "있음" : "없음");
    console.log("[Proxy GET] cookies:", cookies ? "있음" : "없음");

    const response = await fetch(`${API_URL}/api/group/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: accessToken }),
        ...(cookies && { Cookie: cookies }),
      },
      credentials: "include",
      redirect: "manual",
    });

    console.log("[Proxy GET] Response status:", response.status);

    if (response.status === 302 || response.status === 301) {
      console.error("[Proxy GET] 인증 실패 - 302 리다이렉트");
      const location = response.headers.get("location");
      console.error("[Proxy GET] Redirect to:", location);
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

// PUT /api/group/:id - 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const accessToken = request.headers.get("authorization");
    const cookies = request.headers.get("cookie");

    const response = await fetch(`${API_URL}/api/group/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: accessToken }),
        ...(cookies && { Cookie: cookies }),
      },
      body: JSON.stringify(body),
      credentials: "include",
      redirect: "manual",
    });

    if (response.status === 302 || response.status === 301) {
      console.error("[Proxy PUT] 인증 실패 - 302 리다이렉트");
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

// DELETE /api/group/:id - 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = request.headers.get("authorization");
    const cookies = request.headers.get("cookie");

    const response = await fetch(`${API_URL}/api/group/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: accessToken }),
        ...(cookies && { Cookie: cookies }),
      },
      credentials: "include",
      redirect: "manual",
    });

    if (response.status === 302 || response.status === 301) {
      console.error("[Proxy DELETE] 인증 실패 - 302 리다이렉트");
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

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("프록시 오류:", error);
    return NextResponse.json(
      { error: "서버 연결에 실패했습니다." },
      { status: 500 }
    );
  }
}
