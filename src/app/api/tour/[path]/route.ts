import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {

  const { path } = await params
  const url = new URL(`${process.env.NEXT_PUBLIC_TOUR_API_BASE_URL}/${path}`);
  const { searchParams } = request.nextUrl;

  const res = await fetch(`${url.toString()}?${searchParams.toString()}`);
  const data = await res.json()

  return Response.json(data)
} 