import { api } from "./api";
import axios from "axios";

// HTTPS 환경에서는 프록시 사용
const isHttps =
  typeof window !== "undefined" && window.location.protocol === "https:";
const gatheringApi = isHttps
  ? axios.create({
      headers: {
        "Content-Type": "application/json",
      },
    })
  : api;

// Request interceptor for adding auth token (프록시 사용 시)
if (isHttps) {
  gatheringApi.interceptors.request.use(async (config) => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });
}

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
        content: g.description,
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
      content: g.description,
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
    const res = await gatheringApi.post("/api/group", {
      title: data.title,
      description: data.content,
      maxCount: data.maxCount ?? 10,
    });
    const r = res.data;
    return { id: r.groupId, title: data.title, content: data.content };
  },

  async update(
    id: number,
    data: { title: string; content: string; maxCount?: number }
  ): Promise<GatheringPost> {
    const res = await gatheringApi.put(`/api/group/${id}`, {
      title: data.title,
      description: data.content,
      maxCount: data.maxCount ?? 10,
    });
    void res;
    return { id, title: data.title, content: data.content };
  },

  async remove(id: number): Promise<void> {
    await gatheringApi.delete(`/api/group/${id}`);
  },
};
