import { Review, ReviewListResponse, CreateReviewRequest } from '@/types/review';

interface GetReviewsParams {
  page?: number;
  size?: number;
}

// 토큰 디버깅 함수
function debugToken() {
  if (typeof window !== 'undefined') {
    const accessToken = sessionStorage.getItem('accessToken');
    const refreshToken = sessionStorage.getItem('refreshToken');
    const nickname = sessionStorage.getItem('nickname');
    
    console.log('=== 토큰 디버깅 ===');
    console.log('accessToken:', accessToken ? `있음 (${accessToken.substring(0, 30)}...)` : '없음');
    console.log('refreshToken:', refreshToken ? `있음 (${refreshToken.substring(0, 30)}...)` : '없음');
    console.log('nickname:', nickname || '없음');
    
    // 토큰 만료 시간 확인
    if (accessToken) {
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const exp = payload.exp;
          const now = Math.floor(Date.now() / 1000);
          const remainingTime = exp - now;
          
          console.log('토큰 만료 시간:', new Date(exp * 1000).toLocaleString());
          console.log('현재 시간:', new Date(now * 1000).toLocaleString());
          console.log('남은 시간(초):', remainingTime);
          console.log('토큰 상태:', remainingTime > 0 ? '유효' : '만료됨');
        }
      } catch (error) {
        console.log('토큰 파싱 오류:', error);
      }
    }
    
    console.log('==================');
    
    return !!accessToken;
  }
  return false;
}

// 절대 URL 생성 함수
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드 - 현재 포트 자동 감지
    const origin = window.location.origin;
    console.log('클라이언트 기본 URL:', origin);
    return origin;
  }
  // 서버 사이드
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export async function getReviews({
  page = 0,
  size = 10,
}: GetReviewsParams = {}): Promise<ReviewListResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // 절대 URL 사용
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/reviews?page=${page}&size=${size}`;
    console.log(`API 호출 URL: ${url}`);

    // 공개 엔드포인트: Authorization 헤더 없이 요청
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`API 응답 오류: ${response.status} ${response.statusText}`);
      throw new Error(`API 응답 오류: ${response.status}`);
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data);
    
    return data;
  } catch (error) {
    console.error('리뷰 가져오기 오류:', error);
    throw error;
  }
}

export async function getReviewById(id: number): Promise<Review | null> {
  if (!id) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // 절대 URL 사용
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/reviews/${id}`;
    console.log(`API 호출 URL: ${url}`);

    // 공개 엔드포인트: Authorization 헤더 없이 요청
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`API 응답 오류: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log('리뷰 상세 데이터:', data);
    
    return data;
  } catch (error) {
    console.error('리뷰 상세 가져오기 오류:', error);
    return null;
  }
}

export async function createReview(
  reviewData: CreateReviewRequest,
  images: File[]
): Promise<boolean> {
  try {
    // 브라우저 환경 체크
    if (typeof window === 'undefined') {
      throw new Error('클라이언트 사이드에서만 실행 가능합니다.');
    }
    
    // 토큰 상태 디버깅
    const hasToken = debugToken();
    
    // 서버 직접 테스트 함수
    const testDirectServerConnection = async () => {
      const token = sessionStorage.getItem('accessToken');
      console.log('=== 서버 직접 연결 테스트 ===');
      
      try {
        const response = await fetch('http://localhost:8080/api/receiptReview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            title: '테스트',
            content: '테스트',
            address: '테스트',
            rating: 5
          })
        });
        
        console.log('서버 직접 응답 상태:', response.status);
        const responseText = await response.text();
        console.log('서버 직접 응답 내용:', responseText);
      } catch (error) {
        console.log('서버 직접 연결 오류:', error);
      }
      
      console.log('====================');
    };
    
    // 직접 테스트 실행
    await testDirectServerConnection();
    
    const token = sessionStorage.getItem('accessToken');
    console.log('리뷰 생성 - 토큰 확인:', token ? `있음 (${token.substring(0, 20)}...)` : '없음');
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const formData = new FormData();
    
    // 리뷰 데이터를 JSON으로 추가 (Blob으로 감싸 Content-Type 지정)
    const reviewBlob = new Blob([JSON.stringify(reviewData)], { type: 'application/json' });
    formData.append('review', reviewBlob);
    console.log('리뷰 데이터:', reviewData);
    
    // 이미지 파일들 추가
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append('images', image);
        console.log(`이미지 ${index + 1}:`, image.name, image.size);
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // 절대 URL 사용
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/reviews/create`;
    console.log(`리뷰 생성 API 호출: ${url}`);
    console.log('Authorization 헤더:', `Bearer ${token.substring(0, 30)}...`);

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`리뷰 생성 오류: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`리뷰 생성 실패: ${response.status}`);
    }

    console.log('리뷰 생성 성공');
    return true;
  } catch (error) {
    console.error('리뷰 생성 오류:', error);
    throw error;
  }
}

export async function updateReview(
  id: number,
  reviewData: CreateReviewRequest,
  images?: File[]
): Promise<boolean> {
  try {
    // 브라우저 환경 체크
    if (typeof window === 'undefined') {
      throw new Error('클라이언트 사이드에서만 실행 가능합니다.');
    }
    
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const formData = new FormData();
    
    // 리뷰 데이터를 JSON으로 추가 (Blob으로 감싸 Content-Type 지정)
    const reviewBlob = new Blob([JSON.stringify(reviewData)], { type: 'application/json' });
    formData.append('review', reviewBlob);
    
    // 이미지 파일들 추가
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // 절대 URL 사용
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/reviews/${id}`;
    console.log(`리뷰 수정 API 호출: ${url}`);

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`리뷰 수정 오류: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`리뷰 수정 실패: ${response.status}`);
    }

    console.log('리뷰 수정 성공');
    return true;
  } catch (error) {
    console.error('리뷰 수정 오류:', error);
    throw error;
  }
}

export async function deleteReview(id: number): Promise<boolean> {
  try {
    // 브라우저 환경 체크
    if (typeof window === 'undefined') {
      throw new Error('클라이언트 사이드에서만 실행 가능합니다.');
    }
    
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // 절대 URL 사용
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/reviews/${id}`;
    console.log(`리뷰 삭제 API 호출: ${url}`);

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`리뷰 삭제 오류: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`리뷰 삭제 실패: ${response.status}`);
    }

    console.log('리뷰 삭제 성공');
    return true;
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    throw error;
  }
}