import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://3.34.52.239:8080";

// GET /api/group/:id - 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = request.headers.get("authorization");

    const response = await fetch(`${API_URL}/api/group/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: accessToken }),
      },
      credentials: "include",
    });

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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const accessToken = request.headers.get("authorization");

    const response = await fetch(`${API_URL}/api/group/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: accessToken }),
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

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
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = request.headers.get("authorization");

    const response = await fetch(`${API_URL}/api/group/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: accessToken }),
      },
      credentials: "include",
    });

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
