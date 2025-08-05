import { NextRequest, NextResponse } from 'next/server';

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!SERVER_BASE_URL) {
  console.error('NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.');
}

// GET 요청 처리 - 특정 리뷰 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: '리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const serverUrl = `${SERVER_BASE_URL}/api/receiptReview/reviews/${id}`;
    console.log(`🔍 리뷰 상세 조회 - 서버 API 호출: ${serverUrl}`);

    // 요청 헤더 설정
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Authorization 헤더 추가 (쿠키에서 가져오기)
    const authorization = request.headers.get('Authorization');
    if (authorization) {
      headers['Authorization'] = authorization;
      console.log('✅ Authorization 헤더 전달');
    } else {
      console.log('⚠️ Authorization 헤더 없음');
    }

    const response = await fetch(serverUrl, {
      method: 'GET',
      headers,
    });

    console.log(`📡 서버 응답 상태: ${response.status} ${response.statusText}`);
    console.log(`📋 응답 헤더 Content-Type: ${response.headers.get('content-type')}`);

    if (!response.ok) {
      // 응답 내용을 텍스트로 확인
      const responseText = await response.text();
      console.error(`❌ 서버 API 오류: ${response.status} ${response.statusText}`);
      console.error(`❌ 응답 내용: ${responseText.substring(0, 200)}...`);
      
      // 401 또는 404 오류인 경우 null 반환 (임시 처리)
      if (response.status === 401 || response.status === 404) {
        return NextResponse.json(null);
      }
      
      return NextResponse.json(
        { error: '서버에서 리뷰를 가져오는 중 오류가 발생했습니다.' },
        { status: response.status }
      );
    }

    // 응답 내용을 먼저 텍스트로 확인
    const responseText = await response.text();
    console.log(`✅ 서버 응답 내용 (처음 200자): ${responseText.substring(0, 200)}...`);
    
    try {
      const data = JSON.parse(responseText);
      console.log(`✅ JSON 파싱 성공`);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error(`❌ JSON 파싱 실패:`, parseError);
      console.error(`❌ 파싱 실패한 응답: ${responseText.substring(0, 500)}...`);
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error('💥 리뷰 상세 API 프록시 오류:', error);
    
    // 오류 발생 시 null 반환 (임시 처리)
    return NextResponse.json(null);
  }
}

// PUT 요청 처리 - 리뷰 수정 (서버 API 프록시)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: '리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 헤더에서 Authorization 토큰 가져오기
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // FormData 그대로 서버로 전달
    const formData = await request.formData();
    
    const serverUrl = `${SERVER_BASE_URL}/api/receiptReview/reviews/${id}`;
    console.log(`리뷰 수정 서버 API 호출: ${serverUrl}`);

    const response = await fetch(serverUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authorization,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`서버 API 오류: ${response.status} ${response.statusText}`, errorText);
      
      // 401 오류인 경우 로그인 필요 메시지 반환
      if (response.status === 401) {
        return NextResponse.json(
          { error: '로그인이 필요합니다.' },
          { status: 401 }
        );
      }
      
      // 403 오류인 경우 권한 없음 메시지 반환
      if (response.status === 403) {
        return NextResponse.json(
          { error: '리뷰 수정 권한이 없습니다.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: '서버에서 리뷰 수정 중 오류가 발생했습니다.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('리뷰 수정 API 프록시 오류:', error);
    return NextResponse.json(
      { error: '리뷰 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE 요청 처리 - 리뷰 삭제 (서버 API 프록시)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: '리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 헤더에서 Authorization 토큰 가져오기
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const serverUrl = `${SERVER_BASE_URL}/api/receiptReview/reviews/${id}`;
    console.log(`리뷰 삭제 서버 API 호출: ${serverUrl}`);

    const response = await fetch(serverUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`서버 API 오류: ${response.status} ${response.statusText}`, errorText);
      
      // 401 오류인 경우 로그인 필요 메시지 반환
      if (response.status === 401) {
        return NextResponse.json(
          { error: '로그인이 필요합니다.' },
          { status: 401 }
        );
      }
      
      // 403 오류인 경우 권한 없음 메시지 반환
      if (response.status === 403) {
        return NextResponse.json(
          { error: '리뷰 삭제 권한이 없습니다.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: '서버에서 리뷰 삭제 중 오류가 발생했습니다.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('리뷰 삭제 API 프록시 오류:', error);
    return NextResponse.json(
      { error: '리뷰 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
