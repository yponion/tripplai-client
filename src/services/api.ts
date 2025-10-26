import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tripplanner.p-e.kr";

const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    // 배열 파라미터를 Spring Boot가 인식할 수 있는 형식으로 변환
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (Array.isArray(value)) {
        // 배열의 경우 key=value1&key=value2 형식으로 변환
        value.forEach((v) => searchParams.append(key, v));
      } else {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },
});

// FastAPI 클라이언트
const fastapiClient = axios.create({
  baseURL: FASTAPI_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(async (config) => {
  console.log("[API] 인터셉터 실행됨");

  // 여러 방법으로 토큰 가져오기 시도
  const accessToken1 = sessionStorage.getItem("accessToken");
  const accessToken2 = window.sessionStorage.getItem("accessToken");

  console.log("[API] sessionStorage.getItem:", accessToken1);
  console.log("[API] window.sessionStorage.getItem:", accessToken2);
  console.log("[API] sessionStorage 직접 접근:", sessionStorage.accessToken);

  const finalToken = accessToken1 || accessToken2 || sessionStorage.accessToken;

  if (finalToken) {
    config.headers.Authorization = `Bearer ${finalToken}`;
    console.log(
      "[API] ✅ 토큰 설정됨:",
      `Bearer ${finalToken.substring(0, 20)}...`
    );
  } else {
    console.log("[API] ❌ 모든 방법으로 토큰을 찾을 수 없음!");
    console.log("[API] sessionStorage 키들:", Object.keys(sessionStorage));
  }
  return config;
});

// Response interceptor for handling 302 redirects and 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러 처리 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("[API] 401 에러 감지 - 토큰 갱신 시도");
      console.log("[API] 현재 URL:", originalRequest.url);
      console.log("[API] refreshToken 쿠키 확인:", document.cookie);
      
      try {
        // refresh token으로 새 access token 요청
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log("[API] Refresh 응답:", response.data);
        const newAccessToken = response.data.accessToken;
        
        if (newAccessToken) {
          sessionStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log("[API] ✅ 토큰 갱신 성공, 요청 재시도");
          
          // FormData 재생성 (FormData는 한 번 읽으면 소진됨)
          if (originalRequest._formDataCreator) {
            console.log("[API] 🔄 FormData 재생성");
            originalRequest.data = originalRequest._formDataCreator();
          }
          
          return api(originalRequest);
        } else {
          console.log("[API] ⚠️ 응답에 accessToken이 없음");
          throw new Error("No access token in refresh response");
        }
      } catch (refreshError: any) {
        console.log("[API] ❌ 토큰 갱신 실패:", refreshError.response?.status, refreshError.message);
        
        // 로그인 페이지를 제외한 경우만 리다이렉트
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          sessionStorage.removeItem("accessToken");
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    
    // 302 리다이렉트는 인증 실패로 처리
    if (error.response?.status === 302) {
      console.log("[API] 302 리다이렉트 감지 - 인증 만료");
      sessionStorage.removeItem("accessToken");
      if (typeof window !== "undefined") {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

// TravelRecommendation 타입 정의
interface TravelPlanData {
  destination: string;
  startDate: string;
  endDate: string;
  travelStyle: string;
  duration: number;
  schedule: Record<
    string,
    {
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
    }
  >;
  message?: string;
}

// 여행 추천 API
export const recommendationApi = {
  getTravelRecommendations: (
    areaCode: string,
    sigunguCode: string,
    categories: string[],
    days: number,
    startDate?: string,
    endDate?: string
  ) => {
    // Spring Boot를 통해 FastAPI 호출
    const params: any = {
      areaCode: areaCode,
      sigunguCode: sigunguCode,
      categoryCodes: categories, // 배열로 전달
    };

    // 날짜가 있으면 추가
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    } else {
      // 날짜가 없으면 오늘부터 days만큼 계산
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + days - 1);
      params.startDate = start.toISOString().split("T")[0];
      params.endDate = end.toISOString().split("T")[0];
    }

    return api.post("/api/recommend", params);
  },

  // 추천 결과 저장 API
  saveTravelRecommendation: (data: TravelPlanData, proofImage?: File) => {
    // JSON 데이터를 문자열로 변환
    const jsonString = JSON.stringify(data);
    console.log("📤 [SAVE] 저장할 데이터 (JSON string):");
    console.log(jsonString);
    console.log("📤 [SAVE] 저장할 데이터 (객체):");
    console.log(data);
    
    // FormData 생성 함수 (retry 시 재생성을 위해)
    const createFormData = () => {
      const formData = new FormData();
      formData.append("data", jsonString);
      if (proofImage) {
        formData.append("proofImage", proofImage);
      }
      return formData;
    };

    const formData = createFormData();

    console.log("📤 [SAVE] FormData 내용:");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, typeof value === 'string' ? value : value);
    }

    if (proofImage) {
      console.log("📤 [SAVE] 이미지 포함:", proofImage.name);
    }

    // config에 FormData 생성자 저장 (retry를 위해)
    return api.post("/api/recommend/save", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // @ts-ignore - 커스텀 필드
      _formDataCreator: createFormData,
    });
  },
};

export const authApi = {
  /** 일반 로그인 */
  login: async (email: string, password: string) => {
    try {
      // 직접 서버로 호출
      const res = await api.post("/auth/login", {
        email,
        password,
      });

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
          accessToken: null,
        };
      }

      // 네트워크 에러인 경우
      return {
        code: "NETWORK_ERROR",
        message: "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.",
        accessToken: null,
      };
    }
  },

  /** refresh token 삭제 */
  logout: async () => {
    try {
      const res = await axios.post(
        `${API_URL}/auth/initializeToken`,
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {}
  },

  /** 회원가입 */
  signUp: async (
    nickname: string,
    email: string,
    password: string,
    phoneNumber: string
  ) => {
    try {
      const res = await axios.post(`${API_URL}/auth/sign-up`, {
        nickname,
        email,
        password,
        phoneNumber,
      });
      return res.data;
    } catch (error) {
      console.error("회원가입 API 호출 중 에러: ", error);
    }
  },

  /** 이메일 중복 확인 */
  emailCheck: async (email: string) => {
    try {
      const res = await axios.post(`${API_URL}/email-check`, {
        email,
      });
      return res.data;
    } catch (error) {
      console.error("이메일 중복 확인 API 호출 중 에러: ", error);
    }
  },

  /** 인증 번호 요청 */
  certification: async (email: string, clientId: string) => {
    try {
      const res = await axios.post(`${API_URL}/certification`, {
        email,
        clientId,
      });
      return res.data;
    } catch (error) {
      console.error("인증 번호 요청 API 호출 중 에러: ", error);
    }
  },

  /** 인증 번호 확인 */
  checkCertification: async (email: string, certification: string) => {
    try {
      const res = await fetch(`${API_URL}/check-certification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, certification }),
      });
      const res_json = await res.json();
      return res_json;
    } catch (error) {
      console.error("인증 번호 확인 API 호출 중 에러: ", error);
    }
  },
};

// 채팅/모집 관련 API
export const chatApi = {
  // 채팅방 생성 (모집글 기준)
  createRoom: async (gatheringId: number, roomName: string) => {
    const url = `/api/chat/gathering/${gatheringId}/chat`;
    const res = await api.post(url, null, { params: { roomName } });
    return res.data as { code: string; message: string; id: number };
  },

  // 채팅방 참가
  attendRoom: async (gatheringId: number, chatId: number) => {
    const url = `/api/chat/gathering/${gatheringId}/chat/${chatId}/attend`;
    const res = await api.post(url, null, { params: { chatId } });
    return res.data as { code: string; message: string };
  },

  // 내 채팅방 목록 (모집글 기준)
  getMyRooms: async (gatheringId: number, pageNum = 0) => {
    const url = `/api/chat/gathering/${gatheringId}/my/chats`;
    const res = await api.get(url, { params: { pageNum } });
    return res.data as {
      code: string;
      message: string;
      content: {
        id: number;
        name: string;
        count: number;
        createdBy: string;
        status: boolean;
        unReadCount: number;
      }[];
      hasNext: boolean;
    };
  },

  // 채팅방 목록 (모집글 기준)
  getRooms: async (gatheringId: number, pageNum = 0) => {
    const url = `/api/chat/gathering/${gatheringId}/chats`;
    const res = await api.get(url, { params: { pageNum } });
    return res.data as {
      code: string;
      message: string;
      content: {
        id: number;
        name: string;
        count: number;
        email: string;
        status: boolean;
      }[];
      hasNext: boolean;
    };
  },

  // 채팅방 메시지 조회
  getMessages: async (chatId: number) => {
    const url = `/api/chat/messages/${chatId}`;
    const res = await api.get(url);
    return res.data as {
      code: string;
      message: string;
      content: {
        roomId: number;
        content: string;
        email: string;
        status: boolean;
      }[];
    };
  },

  // 메시지 읽음 처리
  readMessages: async (chatId: number) => {
    const url = `/api/chat/chat/${chatId}`;
    const res = await api.post(url);
    return res.data as { code: string; message: string };
  },

  // 채팅방 나가기
  leaveRoom: async (chatId: number) => {
    const url = `/api/chat/chat/${chatId}`;
    const res = await api.delete(url);
    return res.data as { code: string; message: string };
  },
};

export const infoApi = {
  /** 회원 정보 가져오기 */
  getInfo: async () => {
    const res = await api.get("/member");
    return res.data;
  },

  /** 회원 정보 수정하기 */
  updateInfo: () => {},
};

export const paymentApi = {
  /** 결제 임시 저장 */
  payTempStore: async (orderId: string, amount: string) => {
    try {
      const res = await api.post("/api/temp", {
        orderId,
        amount,
      });
      return res.data;
    } catch (error) {
      console.error("결제 임시 저장 API 호출 중 에러: ", error);
    }
  },

  /** 결제 임시 저장 확인 */
  payTempCheck: async (orderId: string, amount: string) => {
    try {
      const res = await api.post("/api/temp/check", {
        orderId,
        amount,
      });
      return res.data;
    } catch (error) {
      console.error("결제 임시 저장 확인 API 호출 중 에러: ", error);
    }
  },

  /** 결제 확인 */
  payConfirm: async (
    paymentKey: string,
    orderId: string,
    amount: string,
    uuid: string
  ) => {
    try {
      const res = await api.post(
        "/api/confirm",
        {
          paymentKey,
          orderId,
          amount,
        },
        {
          headers: {
            "Idempotency-Key": uuid,
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error("결제 확인 API 호출 중 에러: ", error);
    }
  },
};
