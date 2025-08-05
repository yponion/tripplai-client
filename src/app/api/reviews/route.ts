import { NextRequest, NextResponse } from 'next/server';

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!SERVER_BASE_URL) {
  console.error('NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.');
}

// GET 요청 처리 - 리뷰 목록 가져오기 (서버 API 프록시)
export async function GET(request: NextRequest) {
  try {
    console.log('API 라우트 호출됨:', request.url);
    
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';

    const serverUrl = `${SERVER_BASE_URL}/api/receiptReview/reviews?page=${page}&size=${size}`;
    console.log(`서버 API 호출 시도: ${serverUrl}`);

    // 클라이언트에서 전달된 헤더 가져오기
    const authorization = request.headers.get('authorization');
    console.log('Authorization 헤더:', authorization ? '있음' : '없음');

    // 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // 헤더 구성
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Authorization 헤더가 있으면 추가
    if (authorization) {
      headers['Authorization'] = authorization;
    }

    const response = await fetch(serverUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`서버 응답 상태: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`서버 API 오류: ${response.status} ${response.statusText}`, errorText);
      
      // 401 오류인 경우 빈 데이터 반환 (임시 처리)
      if (response.status === 401) {
        console.log('401 오류 - 빈 데이터 반환');
        return NextResponse.json({
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: parseInt(page),
          size: parseInt(size),
          numberOfElements: 0,
          first: true,
          last: true,
          empty: true,
        });
      }
      
      return NextResponse.json(
        { error: '서버에서 리뷰 목록을 가져오는 중 오류가 발생했습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('서버 응답 데이터:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('리뷰 목록 API 프록시 오류:', error);
    
    // 상세한 오류 정보 제공
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('오류 상세:', errorMessage);
    
    // 오류 발생 시에도 빈 데이터 반환 (임시 처리)
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';
    
    return NextResponse.json({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: parseInt(page),
      size: parseInt(size),
      numberOfElements: 0,
      first: true,
      last: true,
      empty: true,
    });
  }
} 