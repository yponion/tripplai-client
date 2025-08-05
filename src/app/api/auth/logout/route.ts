import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "로그아웃 되었습니다" },
    {
      status: 200,
      headers: {
        "Set-Cookie": `refreshToken=; Path=/; HttpOnly; Max-Age=0;`,
      },
    }
  );
}