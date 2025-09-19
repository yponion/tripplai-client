import { api } from "./api";
import axios from "axios";

// 아까 성공했던 방식: 직접 서버 API 호출
const gatheringApi = api;
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
    startDate?: string;
    endDate?: string;
    location?: string;
    budget?: string;
    category?: string;
    tags?: string[];
  }): Promise<GatheringPost> {
    console.log("=== 🚀 그룹 생성 디버깅 시작 ===");
    console.log(
      "[GatheringService] 📋 입력받은 모든 데이터:",
      JSON.stringify(data, null, 2)
    );
    console.log("[GatheringService] 📅 원본 시작일:", data.startDate);
    console.log("[GatheringService] 📅 원본 종료일:", data.endDate);
    console.log("[GatheringService] 👥 최대 인원:", data.maxCount);
    console.log("[GatheringService] 📍 위치:", data.location);
    console.log("[GatheringService] 💰 예산:", data.budget);

    // 날짜 형식 변환 (YYYY-MM-DD → ISO String)
    const formatDateToISO = (dateStr: string) => {
      console.log("[GatheringService] 🔄 날짜 변환 시도:", dateStr);
      if (!dateStr) {
        console.log("[GatheringService] ⚠️ 빈 날짜 문자열입니다!");
        return null;
      }
      const date = new Date(dateStr);
      const isoString = date.toISOString();
      console.log("[GatheringService] ✅ 변환 완료:", dateStr, "→", isoString);
      return isoString;
    };

    const finalStartDate =
      formatDateToISO(data.startDate!) || new Date().toISOString();
    const finalEndDate =
      formatDateToISO(data.endDate!) ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const requestPayload = {
      title: data.title,
      description: data.content, // 서버는 description을 받음
      startDate: finalStartDate,
      endDate: finalEndDate,
      maxCount: data.maxCount ?? 10,
    };

    console.log(
      "[GatheringService] 📤 서버로 전송할 최종 데이터:",
      JSON.stringify(requestPayload, null, 2)
    );
    console.log(
      "[GatheringService] 🌐 요청 URL: POST /api/group?destinationId=1"
    );
    console.log("[GatheringService] ⏰ 요청 시간:", new Date().toISOString());

    // 서버 API 명세에 맞게 수정
    const res = await gatheringApi.post(
      "/api/group?destinationId=1",
      requestPayload
    );
    console.log("=== 📥 서버 응답 디버깅 ===");
    console.log("[GatheringService] ✅ 요청 성공! 상태코드:", res.status);
    console.log(
      "[GatheringService] 📋 응답 전체 데이터:",
      JSON.stringify(res.data, null, 2)
    );
    console.log("[GatheringService] 🔑 응답 필드들:", Object.keys(res.data));

    const r = res.data;
    console.log(
      "[GatheringService] 🆔 생성된 그룹 ID:",
      r.id || r.groupId || r.postId || "ID 없음"
    );
    console.log(
      "[GatheringService] 📝 응답 메시지:",
      r.message || r.msg || "메시지 없음"
    );
    console.log("=== ✅ 그룹 생성 디버깅 완료 ===");

    return {
      id: r.id || r.groupId || r.postId || r.boardId,
      title: data.title,
      content: data.content,
      author: r.authorNickname || r.authorEmail,
      authorId: r.authorId,
      authorEmail: r.authorEmail,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
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
