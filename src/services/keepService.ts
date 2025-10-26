import { api } from "./api";

export const keepService = {
  /** 찜하기 */
  keep: async (contentId: string) => api.post(`/api/destination/${contentId}/create`),

  /** 찜하기 해제 */
  unkeep: async (contentId: string) => api.post(`/api/destination/${contentId}/delete`),

  /** 찜한 목록 조회 */
  keepList: async () => api.get(`/api/destination/keeps`),

  /** 찜 상세 */
  keepDetail: async (contentId: string) => api.get(`/api/destination/${contentId}/keep`),
};