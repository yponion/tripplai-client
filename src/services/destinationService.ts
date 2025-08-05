import { Destination } from '@/types';
import { api } from './api';


export interface ResponseDto<T> {
  code: string;
  message: string;
  data: T;
}

export const destinationApi = {
  /** 1) 단일 destination 조회 */
  getDestination: async (destinationId: string) => {
    const res = await api.get(`/api/destination/${destinationId}`, { withCredentials: true });
    return res.data;
  },

  /** 2) contentId 배열로 여러 destination 조회 */
  getByContentIds: async (contentIds: string[]): Promise<Record<string, Destination>> => {
    const res = await api.post<ResponseDto<Record<string, Destination>>>(
      '/api/destination/search',
      { contentIdList: contentIds },
      { withCredentials: true }
    );
    console.log('des date', res.data.data);
    return res.data.data;

  },
}