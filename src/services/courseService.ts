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

  /** 2) 내 찜한 코스 전체 조회 */
  getLikedCourses: async (): Promise<Course[]> => {
    const res = await api.get(`/api/courseLike/liked`, { withCredentials: true });
    return (res.data.data as any[]).map(course => ({
      ...course,
      area: course.areaname,
    }));
  },
}