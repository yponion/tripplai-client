import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://3.34.52.239:8080";

const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
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
  const accessToken = sessionStorage.getItem("accessToken");
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

    return api.get("/api/recommend", { params });
  },

  // 추천 결과 저장 API
  saveTravelRecommendation: (data: TravelPlanData, proofImage?: File) => {
    const formData = new FormData();

    // JSON 데이터를 FormData에 추가
    formData.append("data", JSON.stringify(data));

    // 증명 이미지가 있으면 추가
    if (proofImage) {
      formData.append("proofImage", proofImage);
    }

    return api.post("/api/recommend/save", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
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
