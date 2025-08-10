import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error('NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.');
}

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// FastAPI 클라이언트
const fastapiClient = axios.create({
  baseURL: FASTAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('FastAPI URL:', FASTAPI_URL);

// Request interceptor for adding auth token
api.interceptors.request.use(async (config) => {
  const accessToken = sessionStorage.getItem('accessToken')
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// TravelRecommendation 타입 정의
interface TravelPlanData {
  destination: string;
  startDate: string;
  endDate: string;
  travelStyle: string;
  duration: number;
  schedule: Record<string, {
    spots: Array<{
      name: string;
      addr1: string;
      addr2?: string;
      category_name?: string;
      category_code?: string;
      type?: string;
      latitude?: number;
      longitude?: number;
    }>;
    accommodation?: {
      name: string;
      addr1: string;
      addr2?: string;
    };
  }>;
  message?: string;
}

// 여행 추천 API
export const recommendationApi = {
  getTravelRecommendations: (areaCode: string, sigunguCode: string, categories: string[], days: number) => {
    console.log('Sending recommendation request:', {
      area_code: areaCode,
      sigungu_code: sigunguCode,
      category_codes: categories,
      days: days
    });
    return fastapiClient.post('/api/v1/recommendations/', {
      area_code: areaCode,
      sigungu_code: sigunguCode,
      category_codes: categories,
      days: days
    });
  },

  // 추천 결과 저장 API
  saveTravelRecommendation: (data: TravelPlanData, proofImage?: File) => {
    console.log('Saving travel recommendation:', data);

    const formData = new FormData();

    // JSON 데이터를 FormData에 추가
    formData.append('data', JSON.stringify(data));

    // 증명 이미지가 있으면 추가
    if (proofImage) {
      formData.append('proofImage', proofImage);
    }

    return api.post('/api/recommend/save', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const authApi = {
  /** 일반 로그인 */
  login: async (email: string, password: string) => {
    try {
      console.log("🌐 로그인 API 호출 (직접 서버):", { email, password });

      // 직접 서버로 호출
      const res = await api.post('/auth/login', {
        email,
        password,
      });

      console.log("📨 서버 응답:", res.data);
      return res.data;
    } catch (error: any) {
      console.error("❌ 로그인 API 호출 중 에러:", error);
      console.error("❌ 에러 상태:", error.response?.status);
      console.error("❌ 에러 응답:", error.response?.data);
      console.error("❌ 네트워크 에러:", error.message);

      // 서버에서 응답이 온 경우 (401, 400 등)
      if (error.response && error.response.data) {
        return {
          code: error.response.data.code || "F",
          message: error.response.data.message || "로그인에 실패했습니다.",
          accessToken: null
        };
      }

      // 네트워크 에러인 경우
      return {
        code: "NETWORK_ERROR",
        message: "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.",
        accessToken: null
      };
    }
  },

  /** refresh token 삭제 */
  logout: async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/initializeToken`, {}, { withCredentials: true })
      return res.data
    } catch (error) {
      console.log("로그아웃 API 호출 중 에러: ", error)
    }
  },

  /** 회원가입 */
  signUp: async (nickname: string, email: string, password: string, phoneNumber: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/sign-up`, {
        nickname, email, password, phoneNumber
      })
      return res.data
    } catch (error) {
      console.error("회원가입 API 호출 중 에러: ", error);
    }
  },

  /** 이메일 중복 확인 */
  emailCheck: async (email: string) => {
    try {
      const res = await axios.post(`${API_URL}/email-check`, {
        email
      })
      return res.data
    } catch (error) {
      console.error("이메일 중복 확인 API 호출 중 에러: ", error);
    }
  },

  /** 인증 번호 요청 */
  certification: async (email: string, clientId: string) => {
    try {
      const res = await axios.post(`${API_URL}/certification`, {
        email,
        clientId
      })
      return res.data
    } catch (error) {
      console.error("인증 번호 요청 API 호출 중 에러: ", error);
    }
  },

  /** 인증 번호 확인 */
  checkCertification: async (email: string, certification: string) => {
    try {
      const res = await fetch(`${API_URL}/check-certification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, certification }),
      });
      const res_json = await res.json()
      return res_json;
    } catch (error) {
      console.error("인증 번호 확인 API 호출 중 에러: ", error);
    }
  }

};

export const infoApi = {
  /** 회원 정보 가져오기 */
  getInfo: async () => {
    const res = await api.get('/member');
    return res.data
  },

  /** 회원 정보 수정하기 */
  updateInfo: () => {

  },
}

export const paymentApi = {
  /** 결제 임시 저장 */
  payTempStore: async (orderId: string, amount: string) => {
    try {
      const res = await api.post('/api/temp', {
        orderId,
        amount
      })
      return res.data
    } catch (error) {
      console.error("결제 임시 저장 API 호출 중 에러: ", error);
    }
  },

  /** 결제 임시 저장 확인 */
  payTempCheck: async (orderId: string, amount: string) => {
    try {
      const res = await api.post('/api/temp/check', {
        orderId,
        amount
      })
      return res.data
    } catch (error) {
      console.error("결제 임시 저장 확인 API 호출 중 에러: ", error);
    }
  },

  /** 결제 확인 */
  payConfirm: async (paymentKey: string, orderId: string, amount: string, uuid: string) => {
    try {
      const res = await api.post('/api/confirm', {
        paymentKey,
        orderId,
        amount
      }, {
        headers: {
          "Idempotency-Key": uuid,
        }
      })
      return res.data
    } catch (error) {
      console.error("결제 확인 API 호출 중 에러: ", error);
    }
  },
}