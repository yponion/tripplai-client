import { api } from "./api";
import axios from "axios";

// HTTPS 환경에서는 프록시 사용
const isHttps =
  typeof window !== "undefined" && window.location.protocol === "https:";
const gatheringApi = isHttps
  ? axios.create({
      baseURL: "", // 현재 도메인 사용 (프록시는 같은 도메인)
      headers: {
        "Content-Type": "application/json",
      },
    })
  : api;

// Request interceptor for adding auth token (모든 환경에서 동작)
gatheringApi.interceptors.request.use(async (config) => {
  const accessToken = sessionStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    console.log(
      "[GatheringService] Token 추가됨:",
      accessToken.substring(0, 20) + "..."
    );
  } else {
    console.log("[GatheringService] Token 없음!");
    // HTTPS 환경에서만 로그인 페이지로 리다이렉트 (프록시 사용 시)
    if (isHttps && typeof window !== "undefined") {
      alert("로그인이 필요합니다.");
      window.location.href = "/login";
      return Promise.reject(new Error("로그인이 필요합니다."));
    }
  }
  return config;
});

export interface GatheringPost {
  id: number;
  title: string;
  content: string;
  author?: string;
  authorId?: number;
  authorEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  thumbnailUrl?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  hasNext?: boolean;
}

export const gatheringService = {
  async list(page = 0, size = 10): Promise<PageResponse<GatheringPost>> {
    const res = await gatheringApi.get("/api/group", {
      params: { page, size },
    });
    const data = res.data;
    return {
      content: (data.content || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        content: g.content || g.description, // content 우선, description 폴백
        author: g.authorNickname || g.authorEmail,
        authorId: g.authorId,
        authorEmail: g.authorEmail,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
        thumbnailUrl: g.thumbnailUrl,
      })),
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      hasNext: (data.number || 0) + 1 < (data.totalPages || 0),
    };
  },

  async get(id: number): Promise<GatheringPost> {
    const res = await gatheringApi.get(`/api/group/${id}`);
    const g = res.data;
    return {
      id: g.id,
      title: g.title,
      content: g.content || g.description, // content 우선, description 폴백
      author: g.authorNickname || g.authorEmail,
      authorId: g.authorId,
      authorEmail: g.authorEmail,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      thumbnailUrl: g.thumbnailUrl,
    };
  },

  async create(data: {
    title: string;
    content: string;
    maxCount?: number;
  }): Promise<GatheringPost> {
    console.log("[GatheringService] 생성 요청 데이터:", data);
    const res = await gatheringApi.post("/api/group", {
      title: data.title,
      content: data.content, // description이 아닌 content로 변경
      maxCount: data.maxCount ?? 10,
    });
    console.log("[GatheringService] 생성 응답:", res.data);
    const r = res.data;
    return { id: r.id || r.groupId, title: data.title, content: data.content };
  },

  async update(
    id: number,
    data: { title: string; content: string; maxCount?: number }
  ): Promise<GatheringPost> {
    const res = await gatheringApi.put(`/api/group/${id}`, {
      title: data.title,
      content: data.content, // description이 아닌 content로 변경
      maxCount: data.maxCount ?? 10,
    });
    void res;
    return { id, title: data.title, content: data.content };
  },

  async remove(id: number): Promise<void> {
    await gatheringApi.delete(`/api/group/${id}`);
  },

  // 그룹 참가
  async participate(id: number): Promise<void> {
    await gatheringApi.put(`/api/group/${id}/participate`);
  },

  // 그룹 허가
  async permit(id: number, enrollId?: number): Promise<void> {
    const url = enrollId
      ? `/api/group/${id}/permit?enrollId=${enrollId}`
      : `/api/group/${id}/permit`;
    await gatheringApi.put(url);
  },

  // 그룹 탈퇴
  async leave(id: number): Promise<void> {
    await gatheringApi.put(`/api/group/${id}/leave`);
  },

  // 그룹 참여인원 조회
  async getParticipants(id: number): Promise<any[]> {
    const res = await gatheringApi.get(`/api/group/${id}/participate`);
    return res.data;
  },

  // 그룹 신청인원 조회
  async getApplicants(id: number): Promise<any[]> {
    const res = await gatheringApi.get(`/api/group/${id}/apply`);
    return res.data;
  },

  // 그룹 좋아요
  async like(id: number): Promise<void> {
    await gatheringApi.post(`/api/group/${id}/like`);
  },

  // 그룹 좋아요 취소
  async unlike(id: number): Promise<void> {
    await gatheringApi.delete(`/api/group/${id}/like`);
  },
};
