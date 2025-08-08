import { Course } from '@/types';
import { api } from './api';


/** 코스 관련  */
export const courseApi = {
  /** 1) 단일 찜하기 추가*/
  courseLike: async (courseId: String) => {
    const res = await api.post(
      `/api/courseLike/${courseId}`,
      {},
      { withCredentials: true }
    );
    return res.data as { liked: boolean };
  },

  /** 1-1) 단일 찜하기 해제 */
  unlikeCourse: async (courseId: string | number) => {
    const res = await api.delete(`/api/courseLike/${courseId}`, { withCredentials: true });
    return res.data;
  },

  /** 1-2) 코스가 찜됐는지 여부 */
  isLiked: async (courseId: string | number): Promise<boolean> => {
    const res = await api.get(`/api/courseLike/${courseId}/liked`, { withCredentials: true });
    return res.data as boolean;
  },

  /** 2) 내 찜한 코스 전체 조회 */
  getLikedCourses: async (): Promise<Course[]> => {
    const res = await api.get(`/api/courseLike/liked`, { withCredentials: true });
    return (res.data.data as any[]).map((course) => ({
      ...course,
      // 서버 응답 필드명(areaName)을 클라이언트 타입(area)로 정규화
      area: course.areaName,
      thumbnailUrl: course.thumbnailUrl || '',
    }));
  },
}